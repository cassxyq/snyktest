const keystone = require('keystone');
import { pickBy, isEmpty, isEqual } from 'lodash';
import dayjs from 'dayjs';
import axios from 'axios';
import { logger } from '../../utils/logger';
import {
	LEARNING_METHOD,
	ORDER_STATUS,
	ORDER_TYPE,
	ENVIRONMENT,
	PAY_METHOD,
	INVOICE_VALID_DAYS,
	TRAINING
} from '../../utils/constants';
import { MEETUP_EVENT_TYPE } from '../../miniapp/constants';
import { LAMBDA_URL } from '../../utils/urls';
import quoteTerms from '../../templates/terms/quoteTerms';
const Types = keystone.Field.Types;
const salesMail = process.env.MAIL_OF_SALES;
const salesOfMelbourne = process.env.MAIL_OF_MELBOURNE;
const salesOfSydney = process.env.MAIL_OF_SYDNEY;
const isProd =
	process.env.NODE_ENV === ENVIRONMENT.PRODUCTION ||
	process.env.NODE_ENV === ENVIRONMENT.UAT;
const {
	handleWorkshopEnrolledStudentIncrease,
	handleWorkshopEnrolledStudentDecrease
} = require('../../utils/handleWorkshopEnrollCount');
import generateMailParams from '../../utils/generateMailParams';
const { sqs } = require('../../utils/aws');
import { EMAIL_SERVICE_TYPE } from '../../utils/constants';
import generateInvoice from '../../utils/generateInvoice';
import { stripe, stripeTransactionFeeRateId } from '../../config/stripe-config';
import { enrollmentIncrement, enrollmentDecrement } from '../../services/enrolment';

/**
 * Order Model
 * For order package and service
 * =============
 */

const Order = new keystone.List('Order', {
	map: { name: 'bookId' },
	autokey: { from: 'bookId', path: 'slug', unique: true },
	defaultSort: '-createdAt',
	track: true
});

Order.add(
	{
		bookId: { type: String, noedit: true },
		orderType: {
			type: Types.Select,
			options: Object.values(ORDER_TYPE)
		},
		status: {
			type: Types.Select,
			options: `${ORDER_STATUS.PAID}, ${ORDER_STATUS.UNPAID}, ${ORDER_STATUS.PENDING}, ${ORDER_STATUS.ACTIVE}, ${ORDER_STATUS.CANCELLED}, ${ORDER_STATUS.INVALID}, ${ORDER_STATUS.REJECTED}`,
			default: `${ORDER_STATUS.UNPAID}`
		},
		user: { type: Types.Relationship, ref: 'User' },
		signatureDataUrl: { type: String },
		service: { type: Types.Relationship, ref: 'Service' },
		workshop: { type: Types.Relationship, ref: 'Workshop' },
		program: { type: Types.Relationship, ref: 'Program' },
		topNote: { type: Types.Relationship, ref: 'Note' },
		subscription: { type: Types.Relationship, ref: 'Subscription' },
		meetup: { type: Types.Relationship, ref: 'Meetup' },
		learningMethod: {
			type: Types.Select,
			options: `${LEARNING_METHOD.ONLINE}, ${LEARNING_METHOD.OFFLINE}`
		},
		feedback: { type: Types.Relationship, ref: 'UserFeedback' }
	},
	'Price',
	{
		unit: { type: String },
		packagePrice: { type: Number },
		unitPrice: { type: Number },
		tutoringLength: { type: Number, label: 'Package hours', default: 1 },
		totalPrice: { type: Number, noedit: true }
	},
	'Transaction Info',
	{
		payMethod: {
			type: Types.Select,
			options: Object.values(PAY_METHOD),
			label: '付款方式'
		},
		paymentTransactionId: { type: String, label: '交易ID' }
	},
	'Extended Information (Optional)',
	{
		course: { type: Types.Relationship, ref: 'Course' },
		tutor: { type: Types.Relationship, ref: 'Tutor' },
		teacher: { type: Types.Relationship, ref: 'Teacher' },
		sourceOfInformation: {
			type: Types.Select,
			options:
				'微信公众号,微信群,学生会,谷歌,知乎,微博,朋友,海报,贴吧,其他'
		},
		startedDate: { type: Types.Date },
		company: { type: Types.Relationship, ref: 'Company' },
		workingStatus: { type: Types.Select, options: 'Yes, No' },
		termsConfirm: { type: Types.Boolean, default: false },
		confirmed: { type: Types.Boolean, index: true },
		sendEmail: { type: Boolean, default: false },
		sendInvoice: { type: Boolean, default: false }
	},
	'Payment In Person',
	{
		isFaceToFace: { type: Boolean, label: '当面付款' },
		responsiblePerson: {
			type: Types.Relationship,
			ref: 'User',
			label: '处理人'
		},
		transferRecord: { type: Types.TextArray, label: '转账记录' },
		note: { type: String, label: '备注' }
	},
	'Invoice',
	{
		issuedDate: {
			type: Types.Date,
			noedit: true,
			note:
				'订单状态第一次更新为Active的时候后会自动更新日期，无数据时会自动显示当天'
		},
		transactionFeeRate: {
			type: Number,
			noedit: true,
			note:
				'订单状态第一次更新为Active的时候，若为stripe支付，会自动到stripe查询当前使用的费率配置并更新数值。e.g. 3.2%则为3.2'
		}
	}
);

function generateID() {
	const date = Date.now().toString();
	return 'ORD' + date.slice(-6);
}

async function getUserEmailInfo(userId) {
	const user = await keystone.list('User').model.findById(userId);
	const userData = {
		name: user.name,
		wechat: user.wechat,
		email: user.email,
		phone: user.phone,
		city: user.city,
		university: user.university
	};
	return userData;
}

// Hooks

Order.schema.pre('save', async function (next) {

	// Search for order status before the update
	const item = await keystone.list('Order').model.aggregate([
		{ $match: { _id: this._id } },
		{
			$lookup: {
				from: 'programs',
				localField: 'program',
				foreignField: '_id',
				as: 'program'
			}
		},
		{ $unwind: '$program' },
		{
			$project: {
				status: true,
				training: '$program.training'
			}
		},
	]).exec();
	// create new attribute oldStatus to be later used to verify if enrolment count needs to be increase or decrease
	this.oldStatus = item[0]?.status;
	this.training = item[0]?.training;

	if (!this.bookId) this.bookId = generateID();
	if (this.packagePrice) {
		this.totalPrice = this.packagePrice;
	} else {
		this.totalPrice = this.unitPrice * this.tutoringLength;
	}
	// Update Invoice related
	if (this.status === ORDER_STATUS.ACTIVE) {
		if (!this.issuedDate) this.issuedDate = Date.now();
		if (this.payMethod === PAY_METHOD.STRIPE && !this.transactionFeeRate) {
			const taxRate = await stripe.taxRates.retrieve(
				stripeTransactionFeeRateId
			);
			if (taxRate?.percentage) {
				this.transactionFeeRate = taxRate.percentage;
			}
		}
	}
	this.wasNew = this.isNew;
	next();
});

Order.schema.post('save', async function () {
	// If order status changes to active from non-active, increase the enrolment count by 1 
	// If order status changes to non-active from active, decrease the enrolment count by 1
	if (this.oldStatus === ORDER_STATUS.ACTIVE && this.status !== ORDER_STATUS.ACTIVE) {
		enrollmentDecrement({ itemId: this.training, tableName: TRAINING });
	} else if (this.oldStatus !== ORDER_STATUS.ACTIVE && this.status === ORDER_STATUS.ACTIVE) {
		enrollmentIncrement({ itemId: this.training, tableName: TRAINING });
	};

	// For career fair subscription specifically
	if (this.subscription && this.meetup) {
		const careerFair = await keystone.list('Meetup').model.findOne({
			_id: this.meetup,
			meetupEventType: MEETUP_EVENT_TYPE.CAREER_FAIR
		});
		if (careerFair) {
			const user = await keystone.list('User').model.findById(this.user);
			if (user && user.role === 'employer' && this.company) {
				switch (this.status) {
					case ORDER_STATUS.PAID:
					case ORDER_STATUS.PENDING:
					case ORDER_STATUS.CANCELLED:
					case ORDER_STATUS.REJECTED:
					case ORDER_STATUS.UNPAID: {
						try {
							await careerFair
								.update({
									$pull: {
										exhibitors: this.company
									}
								})
								.exec(err => logger.error(err));
						} catch (err) {
							logger.error(err);
						}
						break;
					}
					case ORDER_STATUS.ACTIVE: {
						try {
							await careerFair
								.update({
									$addToSet: {
										exhibitors: this.company
									}
								})
								.exec(err => logger.error(err));
						} catch (err) {
							logger.error(err);
						}
						break;
					}
					default:
						break;
				}
			}
		}
		return;
	}
	// For enrollment related products
	const _enrollment = {
		studentName: '',
		user: this.user,
		studentId: ''
	};
	const User = keystone.list('User');
	await User.model.findById(this.user, function (err, user) {
		_enrollment.studentName = user.name.full;
	});

	await keystone
		.list('Student')
		.model.findOne({ user: this.user }, function (err, student) {
			_enrollment.studentId = student.studentId;
		});
	const Enrollment = keystone.list('Enrollment');
	const Workshop = keystone.list('Workshop');

	switch (this.status) {
		case ORDER_STATUS.PAID:
		case ORDER_STATUS.PENDING:
		case ORDER_STATUS.UNPAID:
			try {
				const existEnrollment = await Enrollment.model
					.findOne({ user: this.user })
					.exec();
				if (!existEnrollment) {
					new Enrollment.model(_enrollment).save(err =>
						logger.error(err)
					);
					return;
				}
				await existEnrollment
					.update({
						$pull: {
							order: this._id,
							workshop: this.workshop,
							program: this.program,
							topNote: this.topNote
						}
					})
					.exec(err => logger.error(err));
			} catch (err) {
				logger.error(err);
			}

			break;
		case ORDER_STATUS.ACTIVE:
			{
				const data = {
					order: this._id,
					workshop: this.workshop,
					program: this.program,
					topNote: this.topNote,
				};

				const enroll = pickBy(data);

				try {
					await Enrollment.model
						.findOneAndUpdate(
							{ user: this.user },
							{
								$addToSet: enroll
							}
						)
						.exec(err => logger.error(err));

					if (this.workshop) {
						handleWorkshopEnrolledStudentIncrease(
							Workshop,
							this.workshop,
							Enrollment,
							logger
						);
					}
				} catch (err) {
					logger.error(err);
				}
			}
			break;
		case ORDER_STATUS.CANCELLED:
		case ORDER_STATUS.REJECTED:
			try {
				await Enrollment.model
					.findOneAndUpdate(
						{ user: this.user },
						{
							$pull: {
								order: this._id,
								workshop: this.workshop,
								program: this.program,
								topNote: this.topNote
							}
						}
					)
					.exec(err => logger.error(err));

				if (this.workshop) {
					handleWorkshopEnrolledStudentDecrease(
						Workshop,
						this.workshop,
						logger
					);
				}
			} catch (err) {
				logger.error(err);
			}
			break;
		default:
			break;
	}
	await User.model
		.findOneAndUpdate(
			{ _id: this.user },
			{ $addToSet: { order: this._id } }
		)
		.exec(err => {
			if (err) logger.error(err);
		});

	//if service existed and it's new created, send a notification email to the user
	if (
		(this.tutor ||
			this.teacher ||
			this.workshop ||
			this.program ||
			this.service ||
			this.topNote) &&
		this.confirmed &&
		!this.sendEmail &&
		this.status === ORDER_STATUS.PENDING
	) {
		//Please comment below line when development, it will send email
		this.sendNotificationEmailToCustomer();
		if (isProd) {
			this.sendNotificationEmailToSales();
		}
		await keystone
			.list('Order')
			.model.findOneAndUpdate(
				{ _id: this._id },
				{ $set: { sendEmail: true } },
				{ new: true }
			)
			.exec();
	}

	//send Program Invoice to customer, if order status turns to active
	if (
		this.program &&
		this.confirmed &&
		!this.sendInvoice &&
		this.issuedDate &&
		isEqual(this.status, ORDER_STATUS.ACTIVE) &&
		(isEqual(this.orderType, ORDER_TYPE.VIDEO) ||
			isEqual(this.orderType, ORDER_TYPE.TRAINING) ||
			isEqual(this.orderType, ORDER_TYPE.INTERNSHIP))
	) {
		this.sendInvoiceEmailToCustomer();
		await keystone
			.list('Order')
			.model.findOneAndUpdate(
				{ _id: this._id },
				{ $set: { sendInvoice: true } },
				{ new: true }
			)
			.exec();
	}
});

//if the order was deleted, update enrollment
Order.schema.post('remove', function () {
	const Enrollment = keystone.list('Enrollment');
	const User = keystone.list('User');
	Enrollment.model.findOne({ user: this.user }, function (err, enrollment) {
		if (err) return err;
		if (!enrollment) {
			new Enrollment.model({ user: this.user }).save(err => {
				if (err) logger.error(err);
			});
			return;
		}
		enrollment.save(err => {
			if (err) logger.error(err);
		});
	});
	User.model
		.findOneAndUpdate({ _id: this.user }, { $pull: { order: this._id } })
		.exec(err => {
			if (err) logger.error(err);
		});
});

Order.schema.methods.sendNotificationEmailToCustomer = async function () {
	// Gmail Account: jracademybne@gmail.com
	// Gmail Password: jracademybne2018
	//Please go to Google OAuth 2.0 Playground for the new refreshToken and accessToken
	const userData = await getUserEmailInfo(this.user);

	const orderItem = this.program
		? { id: this.program, type: 'Program' }
		: this.workshop
			? { id: this.workshop, type: 'Workshop' }
			: this.service
				? { id: this.service, type: 'Service' }
				: { id: this.topNote, type: 'Note' };

	const orderData = await keystone
		.list(orderItem.type)
		.model.findById(orderItem.id);

	const mailParams = generateMailParams(
		EMAIL_SERVICE_TYPE.ORDER_TO_CUSTOMER,
		userData.email,
		'pending-notification-email.js',
		`{
			"userName":"${userData.name.first}", 
			"id":"${this.bookId}", 
			"orderName":"${orderItem.type === 'Note' ? orderData.title : orderData.name}"
		}`,
		'Order Pending Notification'
	);

	if (this.signatureDataUrl) {
		const terms = quoteTerms(
			userData.name.full,
			this.signatureDataUrl,
			dayjs().format('DD/MM/YYYY')
		);
		const payload = {
			content: terms,
			pageSize: 'A4'
		};
		const termsPdfContent = (
			await axios.post(LAMBDA_URL.CREATE_PDF, payload)
		).data;
		const termsBuffer = Buffer.from(termsPdfContent, 'base64');

		const paramsWithAtt = {
			...mailParams,
			MessageAttributes: {
				...mailParams.MessageAttributes,
				attachment: {
					DataType: 'String',
					StringValue: termsBuffer.toString('base64')
				}
			}
		};

		sqs.sendMessage(paramsWithAtt, function (err, data) {
			if (err) {
				logger.error(err);
			} else {
				logger.info(data);
			}
		});
	}
};

Order.schema.methods.sendNotificationEmailToSales = async function () {
	let cityName = '';
	let content = '';
	const mailList = [salesMail];
	const userData = await getUserEmailInfo(this.user);

	if (!isEmpty(userData.city)) {
		await keystone
			.list('City')
			.model.findById(userData.city, function (err, city) {
				cityName = city.name;
			});
	}

	if (this.program) {
		await keystone
			.list('Program')
			.model.findById(this.program, function (err, program) {
				content = `\\n培训课程：${program.name}`;
			});
	} else if (this.service) {
		await keystone
			.list('Service')
			.model.findById(this.service, function (err, service) {
				content = `\\n服务内容：${service.name}`;
			});
	}

	if (this.workshop) {
		await keystone
			.list('University')
			.model.findById(userData.university, function (err, university) {
				content = `${content} \\n学校名称：${university.slug}`;
			});
		await keystone
			.list('Workshop')
			.model.findById(this.workshop, function (err, workshop) {
				content = `${content} \\n课程名称：${workshop.name}`;
			});
	}

	if (cityName === 'Melbourne') {
		mailList.push(salesOfMelbourne);
	}
	if (cityName === 'Sydney') {
		mailList.push(salesOfSydney);
	}

	const joinedMailList = mailList.join();

	const mailParams = generateMailParams(
		EMAIL_SERVICE_TYPE.ORDER_TO_SALES,
		joinedMailList,
		'order-to-sales.js',
		`{
			"name": "${userData.name.full}",
			"weChat": "${userData.wechat}",
			"phone": "${userData.phone}",
			"email": "${userData.email}",
			"city": "${cityName}",
			"content": "${content}"
		}`,
		'Order Notification for Sales'
	);

	return sqs.sendMessage(mailParams, function (err, data) {
		if (err) {
			logger.error(err);
		} else {
			logger.info(data);
		}
	});
};

Order.schema.methods.sendInvoiceEmailToCustomer = async function () {
	const userData = await getUserEmailInfo(this.user);
	const invoiceNo = this.bookId.slice(3, 9);
	const date = dayjs(this.issuedDate).format('DD/MM/YYYY');
	const dueDate = dayjs(date)
		.add(INVOICE_VALID_DAYS, 'days')
		.format('DD/MM/YYYY');
	const program = await keystone.list('Program').model.findById(this.program);
	const city = userData.city
		? await keystone.list('City').model.findById(userData.city)
		: null;
	const price = this.totalPrice;

	const qrCodeUrl =
		city && city.customServiceQRCode
			? city.customServiceQRCode.secure_url
			: null;

	const mailParams = generateMailParams(
		EMAIL_SERVICE_TYPE.INVOICE_TO_CUSTOMER,
		userData.email,
		'invoice-notification-email.js',
		`{
			"name": "${userData.name.first}", 
			"id": "${this.bookId}", 
			"courseName": "${program.name}", 
			"commenceCourseDate": "${program.commenceCourseDate}",
			"type": "${this.orderType}",
			"qrCodeUrl": "${qrCodeUrl}"
		}`,
		'Order Confirmation'
	);

	const invoiceOptions = {
		name: userData.name.full,
		email: userData.email,
		invoiceNo: invoiceNo,
		date: date,
		dueDate: dueDate,
		product: program.name,
		price: price,
		...(this.transactionFeeRate
			? { transactionFeeRate: this.transactionFeeRate }
			: {})
	};
	const invoiceBase64 = await generateInvoice(invoiceOptions);
	if (invoiceBase64) {
		const paramsWithAtt = {
			...mailParams,
			MessageAttributes: {
				...mailParams.MessageAttributes,
				attachment: {
					DataType: 'String',
					StringValue: invoiceBase64
				}
			}
		};

		sqs.sendMessage(paramsWithAtt, function (err, data) {
			if (err) {
				logger.error(err);
			} else {
				logger.info(data);
			}
		});
	}
};

Order.defaultColumns =
	'bookId|10%, orderType|10%, user|10%, status|10%, workshop|15%, program|25%, createdAt|10%';

Order.register();
