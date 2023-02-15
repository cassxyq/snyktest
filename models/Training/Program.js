const keystone = require('keystone');
const { logger } = require('../../utils/logger');
const { TRAINING_TYPE, LESSON_DURATION } = require('../../utils/constants');
const { MS_ACCOUNT } = require('../../utils/constants');
const Syllabus = keystone.list('Syllabus');
const Types = keystone.Field.Types;

/**
 * Classroom Model
 * =============
 */

const Program = new keystone.List('Program', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

Program.add(
	{
		name: { type: String, required: true },
		training: {
			type: Types.Relationship,
			ref: 'Training',
			required: true,
			initial: true
		},
		type: {
			type: Types.Select,
			options: Object.values(TRAINING_TYPE),
			default: TRAINING_TYPE.training,
			label: '课程类型',
			initial: true
		},
		teachers: {
			type: Types.Relationship,
			ref: 'Teacher',
			many: true,
			required: true,
			initial: true
		},
		programPhase: {
			type: Types.Number,
			default: '1',
			label: '课程期数'
		},
		studyDirection: {
			type: String,
			label: '学习方向'
		},
		city: {
			type: Types.Relationship,
			ref: 'City',
			label: '开课城市',
			required: true,
			initial: true
		},
		syllabus: { type: Types.Relationship, ref: 'Syllabus' },
		description: { type: Types.Textarea, label: '本期课程描述' },
		highlights: { type: Types.TextArray, label: '本期亮点' },
		studentCount: { type: Number, default: 0, label: '学生人数' },
		shouldShowInCourseArrangement: {
			type: Boolean,
			default: false,
			label: '是否展示在课程安排'
		},
		classGroupQRCode: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			label: '班级群二维码'
		}
	},
	'课程时间',
	{
		commenceCourseDate: {
			type: Date,
			default: Date.now,
			label: '课程开始时间'
		},
		completeDate: { type: Date, default: Date.now, label: '课程结束时间' },
		earlyBirdDueDate: {
			type: Date,
			default: Date.now,
			label: '早鸟价结束时间'
		},
		courseLength: { type: String, label: '课程小时' },
		courseAgenda: { type: String, label: '课程安排' },
		courseArrangement: { type: Types.TextArray, label: '上课安排' },
		firstLessonDate: { type: Date, label: '第一节课时间' },
		firstLessonDuration: {
			type: Types.Select,
			options: LESSON_DURATION,
			label: '第一节课时长(分钟)'
		},
		secondLessonDate: { type: Date, label: '第二节课时间' },
		secondLessonDuration: {
			type: Types.Select,
			options: LESSON_DURATION,
			label: '第二节课时长(分钟)'
		},
		avoidDates: { type: Types.DateArray, label: '排课避开时间' }
	},
	'学费',
	{
		tuition: { type: Number, label: '课程费用原价' },
		tuitionOffline: { type: Number, label: '线下原价' },
		promoTuitionOffline: { type: Number, label: '线下早鸟价' },
		tuitionOnline: { type: Number, label: '线上原价' },
		promoTuitionOnline: { type: Number, label: '线上早鸟价' }
	},
	'课程背景图',
	{
		thumbnail: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true
		},
		thumbNailAlt: { type: String }
	},
	'Microsoft Teams',
	{
		msAccount: {
			type: Types.Select,
			options: Object.values(MS_ACCOUNT),
			label: 'Microsoft账号',
		},
		teamId: { type: String, note: 'The ID of team of the microsoft account' },
		oneDriveFolderId: { type: String },
	},
	'Extended Information (Optional)',
	{
		alias: { type: String },
		enrollURL: { type: String, note: 'Optional' }
	}
);

Program.relationship({
	ref: 'Resource',
	refPath: 'program',
	path: 'resource',
	unique: true
});

Program.schema.pre('save', async function(next) {
	if (!this.thumbnail.secure_url) {
		await keystone.list('Training').model.findById(
			this.training,
			function(err, training) {
				this.thumbnail = training.thumbnail;
			}.bind(this)
		);
	}
	next();
});

Program.schema.post('save', async function() {
	const relatedSyllabus = await Syllabus.model
		.findOne({ _id: this.syllabus })
		.populate({
			path: 'lesson',
			populate: {
				path: 'aliCloudVideo',
				select: '_id, duration'
			}
		})
		.exec();
	const programTotalVideoDuration =
		this.syllabus &&
		relatedSyllabus.lesson.reduce((prev, cur) => {
			const relatedAliCloudVideos = cur.aliCloudVideo;
			const lessonTotalDuration = relatedAliCloudVideos.reduce(
				(prev, cur) => {
					return parseFloat(cur.duration) + prev;
				},
				0
			);
			return lessonTotalDuration + prev;
		}, 0);
	if (this.type === 'video') {
		const courseLength = this.syllabus
			? (programTotalVideoDuration / 3600).toFixed(1)
			: 0;
		Program.model
			.findOneAndUpdate(
				{ _id: this._id },
				{
					$set: {
						courseLength: courseLength
					}
				}
			)
			.exec(err => {
				if (err) {
					if (logger) {
						logger.error(err);
					}
				}
			});
	}
});

Program.defaultColumns =
	'name, type, commenceCourseDate, tuition|20%, city|20%';

Program.register();
