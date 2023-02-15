import keystone from 'keystone';
import { logger } from '../../utils/logger';
const { WORKSHOP_CLASSTYPE, WORKSHOP_TYPE } = require('../../utils/constants');

/**
 * Workshop Model
 * Classroom for University tutorials
 * =============
 */

const dayjs = require('dayjs');
const Types = keystone.Field.Types;
const _ = require('lodash');

const Workshop = new keystone.List('Workshop', {
	track: true,
	autokey: { path: 'key', from: 'name', unique: true }
});

Workshop.add(
	{
		name: {
			type: String,
			required: true,
			initial: true,
			label: '活动名称'
		},

		meta: {
			title: { type: String },
			keywords: { type: String },
			description: { type: String }
		},

		activityType: {
			type: Types.Select,
			options: '公开课, 辅导班',
			label: '活动类型',
			default: '辅导班'
		},

		activityForm: {
			type: Types.Select,
			options: '线上, 线下, 线上/线下',
			label: '活动形式',
			default: '线上/线下'
		},

		service: {
			type: Types.Relationship,
			ref: 'Service',
			filters: { type: 'Tutoring' },
			label: '辅导班类别'
		},

		serviceType: {
			type: Types.Select,
			options: [
				{ value: WORKSHOP_TYPE.LIVESTREAM, label: '直播互动' },
				{ value: WORKSHOP_TYPE.VIDEO, label: '视频课程' }
			],
			default: WORKSHOP_TYPE.LIVESTREAM, // 默认辅导班授课类型为直播互动
			label: '辅导班授课类型'
		},

		type: {
			type: Types.Select,
			options: [
				{ value: WORKSHOP_CLASSTYPE.PRECISION.name, label: '精讲班' },
				{ value: WORKSHOP_CLASSTYPE.EXAM.name, label: '考试冲刺班' },
				{
					value: WORKSHOP_CLASSTYPE.ASSIGNMENT.name,
					label: '作业无忧班'
				},
				{
					value: WORKSHOP_CLASSTYPE.OPEN_LECTURE.name,
					label: '免费公开课'
				},
				{
					value: WORKSHOP_CLASSTYPE.REVIEW_STRATEGY.name,
					label: '复习攻略'
				},
				{ value: WORKSHOP_CLASSTYPE.INTENSIVE.name, label: '护航班' }
			],
			default: WORKSHOP_CLASSTYPE.PRECISION.name,
			label: '辅导班班级类型'
		},
		location: {
			type: String,
			initial: true,
			label: '辅导班地点'
		},

		isApproval: {
			type: Boolean,
			default: false,
			note: '当isApproval是True的时候，Workshop才算通过审核'
		},

		startDate: {
			type: Types.Datetime,
			initial: true,
			index: true,
			width: 'short',
			note: 'e.g. 2014-07-15 / 6:00pm',
			label: '辅导班开始具体时间'
		},

		endDate: {
			type: Types.Datetime,
			initial: true,
			index: true,
			width: 'short',
			note: 'e.g. 2014-07-15 / 9:00pm',
			label: '辅导班结束具体时间'
		},
		length: {
			type: Number,
			initial: true,
			dependsOn: { type: WORKSHOP_CLASSTYPE.OPEN_LECTURE.name },
			label: '时长',
			note: '当辅导班类型为免费公开课时选择时长'
		},
		city: { type: Types.Relationship, ref: 'City', label: '城市' },
		tutors: {
			type: Types.Relationship,
			ref: 'Tutor',
			many: true,
			required: true,
			initial: true,
			label: '辅导班老师'
		},
		classroom: { type: Types.Relationship, ref: 'Classroom' },
		link: { type: Types.Relationship, ref: 'Link', many: true },
		reviews: {
			type: Types.Relationship,
			ref: 'Reviews',
			many: true,
			label: '补习班评价'
		},

		enrolledStudentCount: {
			type: Number,
			label: '报名人数',
			default: 0
		}
	},
	'WorkShop Basic Information',
	{
		cardDescription: {
			type: Types.Textarea,
			label: '简短描述',
			note: '显示在首页和大学学习页面下，学期计划内课程卡片的课程描述'
		},
		highlight: { type: Types.Textarea, label: '本期亮点' }
	},
	'Materials',
	{
		materials: { type: Types.Relationship, ref: 'Material', many: true },
		paidMaterialNoticeBoard: { type: String, label: '公告栏' }
	},
	'Others',
	{
		image: {
			type: Types.CloudinaryImage,
			note: 'Width:900px, height:500px',
			label: '活动图片',
			autoCleanup: true,
			select: true
		},
		hoster: { type: String, default: '匠人学院', label: '创办人' },
		packagePrice: { type: Number },
		unitPrice: { type: Number, default: 0, label: '单位收费' },
		tutoringLength: { type: Number, label: 'Package hours', default: 1 },
		totalPrice: { type: Number, noedit: true },
		promoPrice: { type: Number },
		priceLabel: { type: String, label: '价格标签' },
		promotionLabel: { type: String, label: '宣传标签' },
		place: {
			type: String,
			required: false,
			initial: true,
			width: 'medium',
			note: 'Level 10b, 144 Edward Street, Brisbane CBD',
			label: '上课地点'
		},
		description: { type: Types.Html, wysiwyg: true, label: '辅导班描述' },
		university: { type: Types.Relationship, ref: 'University' },
		course: {
			type: Types.Relationship,
			ref: 'Course',
			required: true,
			initial: true
		},
		maxRSVPs: { type: Number, default: 100 },
		totalRSVPs: { type: Number, noedit: true },
		classGroupQRCode: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			label: '班级群二维码'
		},
		keywords: {
			type: Types.TextArray,
			label: '辅导班标签'
		}
	}
);

Workshop.schema.virtual('url').get(() => {
	return '/workshop/' + this.key;
});

Workshop.schema.pre('validate', function(next) {
	const workshop = this;
	if (workshop.isApproval) {
		if (!workshop.startDate || !workshop.endDate) {
			throw Error('请确认辅导班开始和结束时间不为空');
		}
		if (dayjs(workshop.startDate).isAfter(workshop.endDate)) {
			throw Error('请确认辅导班的结速时间在开始时间之后');
		}
	}
	next();
});

// Pre Save
Workshop.schema.pre('save', function(next) {
	if (this.packagePrice) {
		this.totalPrice = this.packagePrice;
	} else {
		this.totalPrice = this.unitPrice * this.tutoringLength;
	}
	this.wasNew = this.isNew;
	next();
});

//Pre Save - Handeling classroom when create or legacy workshop data
Workshop.schema.pre('save', async function(next) {
	const Classroom = keystone.list('Classroom');
	const _workshop = {
		name: this.name,
		workshop: this._id
	};
	const existedClassroom = await Classroom.model.findOne({
		_id: this.classroom
	});
	if (_.isEmpty(this.classroom) || !existedClassroom) {
		const Classroom = keystone.list('Classroom');
		const newClassroom = await new Classroom.model(_workshop).save(err =>
			logger.error(err)
		);
		this.classroom = newClassroom._id;
		this.wasNew = this.isNew;
		next();
	}
	next();
});

Workshop.schema.set('toJSON', {
	transform: function(doc) {
		return _.pick(
			doc,
			'_id',
			'name',
			'isApproval',
			'startDate',
			'endDate',
			'place',
			'map',
			'description',
			'course',
			'city',
			'classroom',
			'university',
			'unitPrice',
			'unit',
			'tutoringLength',
			'packagePrice',
			'promoPrice',
			'totalPrice',
			'priceLabel',
			'promotionLabel',
			'service',
			'serviceType',
			'cardDescription',
			'image',
			'materials',
			'paidMaterialNoticeBoard',
			'activityForm',
			'activityType',
			'maxRSVPs',
			'tutors',
			'highlight',
			'type',
			'link',
			'reviews',
			'enrolledStudentCount',
			'classGroupQRCode',
			'location',
			'length',
			'createdAt',
			'keywords'
		);
	}
});

Workshop.defaultSort = '-startDate';
Workshop.defaultColumns =
	'name|20%, course|15%, university, type, startDate|25%, isApproval|10%';
Workshop.register();
