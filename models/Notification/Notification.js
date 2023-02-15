import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import {
	isEmpty
} from 'lodash';
import generateMailParams from '../../utils/generateMailParams';
import {
	NOTIFICATION_TYPE,
	NOTIFICATION_REMINDER_TYPE,
	SOCKET_NAMESPACE,
	SOCKET_EVENT,
	EMAIL_SERVICE_TYPE,
	isProd,
	isUat
} from '../../utils/constants';

const keystone = require('keystone');
const { sqs } = require('../../utils/aws');
const { logger } = require('../../utils/logger');

const Types = keystone.Field.Types;

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Notification Model
 * =============
 */

const Notification = new keystone.List('Notification', {
	autokey: { from: 'name', path: 'key', unique: true },
	defaultSort: '-createdAt'
});

Notification.add(
	{
		type: {
			type: Types.Select,
			options: Object.values(NOTIFICATION_TYPE),
			initial: true,
			required: true
		},
		reminderType: {
			type: Types.Select,
			initial: true,
			options: Object.values(NOTIFICATION_REMINDER_TYPE),
			dependsOn: { type: NOTIFICATION_TYPE.REMINDER }
		},
		read: { type: Boolean, label: '已读', default: false},
		sender: { type: Types.Relationship, ref: 'User'},
		user: { type: Types.Relationship, ref: 'User', index: true, initial: true },
		createdAt: { type: Date, default: Date.now }
	},
	'Lesson Reminder',
	{
		lesson: {
			type: Types.Relationship,
			ref: 'Lesson',
			initial: true,
			dependsOn: { reminderType: NOTIFICATION_REMINDER_TYPE.LESSON }
		},
		program: {
			type: Types.Relationship,
			ref: 'Program',
			initial: true,
			dependsOn: { reminderType: NOTIFICATION_REMINDER_TYPE.LESSON }
		}
	}
);

Notification.schema.pre('save', async function (next) {
	this.wasNew = this.isNew;
	next();
});

Notification.schema.post('save', async function (doc, next) {
	if (this.wasNew && this.user) {
		// Data Preparation
		switch(this.type) {
			case NOTIFICATION_TYPE.REMINDER: {
				switch(this.reminderType) {
					case NOTIFICATION_REMINDER_TYPE.LESSON: {
						if (this.lesson && this.program) {
							// Get program and lesson info
							const Program = keystone.list('Program');
							const Lesson = keystone.list('Lesson');

							const lesson = await Lesson.model
								.findById(this.lesson)
								.select('title commenceDate');
							if (!lesson.commenceDate) {
								throw new Error('The lesson commenceDate is missing.');
							}
							const program = await Program.model.findById(this.program).select('name');

							doc.program = program;
							doc.lesson = lesson;
						}
						break;
					};
					default:
						break;
				};
				break;
			};
			default:
				break;
		};

		// Emit message via socket
		const io = keystone.get('io');
		if (io) {
			// The type of sockets is Map
			for (const [id, socket] of io.of(`/${SOCKET_NAMESPACE.LEARN}`).sockets) {
				if (socket.user.id === this.user?.toString()) {
					socket.emit(SOCKET_EVENT.NOTIFICATION, doc);
					break;
				}
			}
		}

		// Send email
		// Only on uat or prod, it will trigger to send a notification email
		if (isProd || isUat) {
			this.sendNotificationEmailToUser();
		}
	}
	next();
});

Notification.schema.methods.sendNotificationEmailToUser = async function () {
	const User = keystone.list('User');
	try {
		// Get user info
		const user = await User.model.findById(this.user);
		if (!user.email || !user.enableEmailNotification) return;

		let mailParams = {};
		switch(this.type) {
			case NOTIFICATION_TYPE.REMINDER: {
				if (this.lesson && this.program) {
					// Get program and lesson info
					const Program = keystone.list('Program');
					const Lesson = keystone.list('Lesson');

					const lesson = await Lesson.model.findById(this.lesson);
					if (!lesson.commenceDate) {
						throw new Error('Notification email sending failed. The lesson commenceDate is missing.');
					}
					const program = await Program.model.findById(this.program);

					// Set mail configuration
					const commenceDate = dayjs(lesson.commenceDate).tz('Australia/Brisbane').format('DD MMM HH:mm');
					mailParams = generateMailParams(
						EMAIL_SERVICE_TYPE.LESSON_COMMENCEMENT_REMINDER,
						user.email,
						'lesson-commencement-reminder.js',
						JSON.stringify({
							name: `${user.name.first || ''} ${user.name.last || ''}`,
							programName: program.name || '',
							lessonName: lesson.title || '',
							commenceDate: `${commenceDate}(Brisbane)`
						}),
						'Lesson Commencement Reminder Notification',
						`${process.env.NODE_ENV === 'uat' ? 'UAT:' : ''}开课提醒-${program.name}-${lesson.title}-澳洲匠人学院`
					);
				}
				break;
			};
			default:
				break;
		};

		if (isEmpty(mailParams)) return;

		return sqs.sendMessage(mailParams, function(err, data) {
			if (err) {
				logger.error(err);
			} else {
				logger.info(data);
			}
		});
	} catch (error) {
		logger.error(error);
	}
};

Notification.defaultColumns = 'name, type, reminderType, sender, user, read, createdAt';

Notification.register();