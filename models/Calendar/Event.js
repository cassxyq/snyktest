import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
dayjs.extend(weekOfYear);
const keystone = require('keystone');
const Types = keystone.Field.Types;
const {
	EVENT_TYPE,
	DUE_TYPE,
	EVENT_REPEAT,
	DAILY_EVENT_TYPE
} = require('../../miniapp/constants');

/**
 * Calendar Event Model
 * =============
 */
const Event = new keystone.List('Event', {
	map: { name: 'title' },
	autokey: { from: 'title', path: 'slug', unique: true }
});

Event.add(
	'Event Basic Info',
	{
		title: { type: String, initial: true, required: true },
		user: {
			type: Types.Relationship,
			ref: 'User',
			index: true
		},
		eventType: {
			type: Types.Select,
			options: Object.values(EVENT_TYPE),
			default: EVENT_TYPE.LESSON
		},
		dueType: {
			type: Types.Select,
			options: Object.values(DUE_TYPE),
			dependsOn: { eventType: EVENT_TYPE.DUE }
		},
		period: {
			start: { type: Date, note: '开始时间（对应due event为放题时间）' },
			end: { type: Date, note: '结束时间（对应due event为提交时间）' }
		},
		isCountdown: { type: Types.Boolean, default: false },
		note: { type: Types.Textarea },
		courseTimetable: { type: Types.Relationship, ref: 'CourseTimetable' },
		createdAt: { type: Date, default: Date.now }
	},
	'Lesson Event',
	{
		lesson: { type: Types.Relationship, ref: 'Course' },
		classroom: { type: String, label: '教室/考试地点' },
		teacher: { type: String },
		lessonType: { type: String },
		repeat: { type: Types.Select, options: Object.values(EVENT_REPEAT) },
		range: {
			start: {
				type: Date,
				label: '授课周期开始时间',
				dependsOn: { eventType: EVENT_TYPE.LESSON }
			},
			end: {
				type: Date,
				label: '授课周期结束时间',
				dependsOn: { eventType: EVENT_TYPE.LESSON }
			}
		},
		repeatWeeks: {
			type: String,
			label: '重复周数',
			note:
				'重复周期和授课周期请勿同时更改，更改其中之一，另一个会随之更新，保存后授课周期如果仍为空，请刷新即可显示',
			dependsOn: { eventType: EVENT_TYPE.LESSON }
		},
		interval: {
			start: {
				type: Date,
				label: '间隔周开始时间',
				dependsOn: { eventType: EVENT_TYPE.LESSON }
			},
			end: {
				type: Date,
				label: '间隔周结束时间',
				dependsOn: { eventType: EVENT_TYPE.LESSON }
			}
		}
	},
	'Daily Event',
	{
		dailyType: {
			type: Types.Select,
			options: Object.values(DAILY_EVENT_TYPE)
		},
		meetup: {
			type: Types.Relationship,
			ref: 'Meetup',
			dependsOn: { dailyType: DAILY_EVENT_TYPE.MEETUP }
		}
	},
	'Due Event',
	{
		assignmentType: { type: String },
		assignmentWeight: { type: String, label: '作业/考试占比' }
	},
	'Uni Event（校历）',
	{
		university: {
			type: Types.Relationship,
			ref: 'University',
			dependsOn: {
				eventType: EVENT_TYPE.UNI
			}
		}
	}
);

Event.schema.pre('validate', function(next) {
	const event = this;
	if (dayjs(event.range.start).isAfter(event.range.end)) {
		throw Error('授课周期结束时间不能早于授课周期开始时间');
	}
	if (dayjs(event.period.start).isAfter(event.period.end)) {
		throw Error('结束时间不能早于开始时间');
	}
	next();
});

Event.schema.pre('save', function(next) {
	const event = this;
	if (event.eventType === EVENT_TYPE.LESSON && event.period.start) {
		if (
			event.range.start &&
			event.range.end &&
			(event.isModified('range') || !event.repeatWeeks)
		) {
			// Get repeat weeks from range
			const startDate = dayjs(event.range.start);
			const endDate = dayjs(event.range.end);
			const weekOfRangeStart =
				startDate.week() +
				(startDate.get('d') > dayjs(event.period.start).get('d')
					? 1
					: 0);
			const weekOfRangeEnd =
				endDate.week() +
				(endDate.get('d') < dayjs(event.period.start).get('d')
					? -1
					: 0);
			const repeatWeeks =
				weekOfRangeEnd -
				weekOfRangeStart +
				1 +
				(weekOfRangeEnd < weekOfRangeStart ? 52 : 0);
			event.repeatWeeks = repeatWeeks.toString();
		} else if (
			event.repeatWeeks &&
			(event.isModified('repeatWeeks') ||
				!event.range.start ||
				!event.range.end)
		) {
			// Set range based on repeat weeks and start date of range or period
			// If start date of range is invalid, assign it with start date of period
			if (!event.range.start) {
				event.range.start = dayjs(event.period.start)
					.startOf('d')
					.toISOString();
			}
			event.range.end = dayjs(event.range.start)
				.add(event.repeatWeeks, 'w')
				.subtract(1, 'd')
				.endOf('d')
				.toISOString();
		}
	}
	next();
});

Event.defaultSort = '-createdAt';
Event.defaultColumns =
	'title, user, eventType, dueType, dailyType, isCountdown, lesson, meetup';

Event.register();
