import {
	COURSE_TIMETABLE_TYPE,
	EVENT_REPEAT,
	LECTURE_TYPE,
	HOMEWORK_TYPE,
	EXAM_TYPE
} from '../../miniapp/constants';
import { POST_STATUS } from '../../utils/constants';
const keystone = require('keystone');
const Types = keystone.Field.Types;
import {
	initTimetableCount,
	updateTimetableCount
} from './handleTimetableCountUpdate';
import { logger } from '../../utils/logger';

/**
 * Course Timetable
 * ================
 * Geniric model for all `COURSE_TIMETABLE_TYPE`s.
 */
const CourseTimetable = new keystone.List('CourseTimetable', {
	map: { name: 'title' },
	autokey: { from: 'title', path: 'slug', unique: true }
});

CourseTimetable.add(
	'Basic Info',
	{
		title: {
			type: String,
			initial: true,
			required: true
		},
		key: {
			type: String,
			index: true,
			note: '爬虫原始数据id/key'
		},
		type: {
			type: Types.Select,
			options: Object.values(COURSE_TIMETABLE_TYPE),
			default: COURSE_TIMETABLE_TYPE.LETURE
		},
		course: {
			type: Types.Relationship,
			ref: 'Course',
			index: true
		},
		university: {
			type: Types.Relationship,
			ref: 'University',
			index: true
		},
		year: {
			type: String
		},
		semester: {
			type: String
		},
		state: {
			type: Types.Select,
			options: Object.values(POST_STATUS),
			default: POST_STATUS.DRAFT,
			index: true,
			note: '发布状态(草稿/发布)'
		},
		createdAt: { type: Date, default: Date.now },
		publishedDate: {
			type: Types.Date,
			index: true,
			default: Date.now,
			dependsOn: { state: POST_STATUS.PUBLISHED }
		},
		fetchByWebCrawler: {
			type: Boolean
		}
	},
	'Time',
	{
		period: {
			start: { type: Types.Datetime, label: '开始时间' },
			end: { type: Types.Datetime, label: '结束时间' }
		}
	},
	'Range',
	{
		range: {
			start: { type: Types.Datetime, label: '授课周期开始时间' },
			end: { type: Types.Datetime, label: '授课周期结束时间' }
		}
	},
	'Interval',
	{
		interval: {
			start: { type: Types.Datetime, label: '间隔周开始时间' },
			end: { type: Types.Datetime, label: '间隔周结束时间' }
		}
	},
	'Lecture',
	{
		repeat: { type: Types.Select, options: Object.values(EVENT_REPEAT) },
		lectureType: { type: String },
		teacher: { type: String },
		classroom: { type: String, note: '线上请填写online' }
	},
	'Exam',
	{
		examType: {
			type: String,
			options: Object.values(EXAM_TYPE)
		},
		examLocation: {
			type: String,
			note: '线上请填写online',
			dependsOn: { type: COURSE_TIMETABLE_TYPE.EXAM }
		},
		examNote: {
			type: String,
			dependsOn: { type: COURSE_TIMETABLE_TYPE.EXAM }
		},
		examRatio: {
			type: String,
			dependsOn: { type: COURSE_TIMETABLE_TYPE.EXAM }
		}
	},
	'Homework',
	{
		homeworkType: {
			type: Types.Select,
			options: Object.values(HOMEWORK_TYPE)
		},
		homeworkName: { type: String },
		homeworkPercentage: { type: String },
		homeworkNote: { type: String }
	}
);

CourseTimetable.schema.post('save', function() {
	const courseTimetableModel = keystone.list('CourseTimetable').model;
	const courseModel = keystone.list('Course').model;
	if (this.course && this.type) {
		courseModel.findById(this.course).exec((err, courseDoc) => {
			if (err) return logger.error(err);
			if (
				//when any of three fields (countNumOfLecture, countNumOfAssignment, and countNumOfExam) cannot be found in in any of the documents in keystone.list('Course).model.
				//when any of three fields (countNumOfLecture, countNumOfAssignment, and countNumOfExam) in any of the documents in keystone.list('Course).model is not a number.
				(!courseDoc._doc.countNumOfLecture &&
					courseDoc._doc.countNumOfLecture !== 0) ||
				(!courseDoc._doc.countNumOfAssignment &&
					courseDoc._doc.countNumOfAssignment !== 0) ||
				(!courseDoc._doc.countNumOfExam &&
					courseDoc._doc.countNumOfExam !== 0)
			) {
				initTimetableCount(
					courseTimetableModel,
					courseModel,
					this.course,
					null,
					logger
				);
			} else {
				updateTimetableCount(
					1,
					courseModel,
					this.course,
					this.type,
					null,
					logger
				);
			}
		});
	}
});

CourseTimetable.schema.post('remove', function() {
	const courseTimetableModel = keystone.list('CourseTimetable').model;
	const courseModel = keystone.list('Course').model;
	if (this.course && this.type) {
		courseModel.findById(this.course).exec((err, courseDoc) => {
			if (err) return logger.error(err);
			if (
				//when any of three fields (countNumOfLecture, countNumOfAssignment, and countNumOfExam) cannot be found in in any of the documents in keystone.list('Course).model.
				//when any of three fields (countNumOfLecture, countNumOfAssignment, and countNumOfExam) in any of the documents in keystone.list('Course).model is not a number.
				(!courseDoc._doc.countNumOfLecture &&
					courseDoc._doc.countNumOfLecture !== 0) ||
				(!courseDoc._doc.countNumOfAssignment &&
					courseDoc._doc.countNumOfAssignment !== 0) ||
				(!courseDoc._doc.countNumOfExam &&
					courseDoc._doc.countNumOfExam !== 0)
			) {
				initTimetableCount(
					courseTimetableModel,
					courseModel,
					this.course,
					null,
					logger
				);
			} else {
				updateTimetableCount(
					-1,
					courseModel,
					this.course,
					this.type,
					null,
					logger
				);
			}
		});
	}
});

CourseTimetable.defaultSort = '-publishedDate';
CourseTimetable.defaultColumns =
	'title, course, type, lectureType, teacher, classroom, university, state, publishedDate';
CourseTimetable.register();
