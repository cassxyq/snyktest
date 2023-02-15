import { COURSE_TIMETABLE_TYPE, EVENT_REPEAT } from '../miniapp/constants';
import { POST_STATUS, LEARNING_METHOD } from './constants';
import { last } from 'lodash';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Australia/Brisbane');

// Original Function by UQ for getting valid timetable range from raw data
function weekpatternToDates(e, t, n) {
	try {
		let i = 0,
			a = 0,
			o = 0,
			r = 0,
			s = '',
			l = '',
			d = n.split('/'),
			c = new Date(d[2], d[1] - 1, d[0]),
			u = new Date(d[2], d[1] - 1, d[0]),
			h = '',
			dd = '';
		if (void 0 == t) return '';
		for (let f = 0; f < t.length; f++) {
			if ((f > 0 && (i += 7), t.charAt(f) == '1')) {
				a =
					e == 'Mon'
						? 2
						: e == 'Tue'
							? 3
							: e == 'Wed'
								? 4
								: e == 'Thu'
									? 5
									: e == 'Fri'
										? 6
										: e == 'Sat'
											? 7
											: e == 'Sun'
												? 1
												: u.getDay() + 1;
				const p = c.getDay() + 1;
				(o = a >= p ? a - p : a + 7 - p),
				(dd = new Date(u)),
				dd.setDate(dd.getDate() + (i + o)),
				r == 0 && (s = dd.getDate() + '/' + (dd.getMonth() + 1)),
				(l = dd.getDate() + '/' + (dd.getMonth() + 1)),
				(r = 1);
			} else r = 0;
			(r == 0 || (r == 1 && f == t.length - 1)) &&
				(!l == '' &&
					(h =
						l == s
							? h == ''
								? s
								: h + ', ' + s
							: h == ''
								? s + '-' + l
								: h + ', ' + s + '-' + l),
				(s = ''),
				(l = ''));
		}
		return h;
	} catch (_) {
		return console.log('Error in weekpatternToDates: ' + _), '';
	}
}

/**
 * @description map range, period, interval of course timetable from uni timetable
 * @param {string} ranges weeks of uni timetable
 * @param {string} startTime start_time of uni timetable
 * @param {string} duration duration of uni timetable
 */
const getPeriodRangeInterval = (ranges, startTime, duration) => {
	// Range
	// If there are multiple intervals, igonore interval, use first date and last date of weeks data
	let range;
	const firstDate = ranges[0].split('-')[0];
	const lastDate = last(ranges[ranges.length - 1].split('-'));
	const validRange =
		ranges.length > 2 ? [`${firstDate}-${lastDate}`] : ranges;
	// Transfer to date data, combining with year
	const currentYear = dayjs.tz().get('y');
	// If month of first date is larger than one of last date, last date should be next year
	const yearOfLastDate =
		firstDate.split('/')[1] > lastDate.split('/')[1]
			? currentYear + 1
			: currentYear;
	if (firstDate !== lastDate) {
		range = {
			start: dayjs
				.tz()
				.startOf('d')
				.set('y', currentYear)
				.set('M', firstDate.split('/')[1] - 1)
				.set('date', firstDate.split('/')[0])
				.toISOString(),
			end: dayjs
				.tz()
				.endOf('d')
				.set('y', yearOfLastDate)
				.set('M', lastDate.split('/')[1] - 1)
				.set('date', lastDate.split('/')[0])
				.toISOString()
		};
	}

	// Interval
	let interval;
	if (validRange.length > 1) {
		const endDateOfFirstPeriod = last(validRange[0].split('-')); // e.g. 25/4
		const startDateOfLastPeriod = validRange[1].split('-')[0];
		const yearOfIntervalStartDate =
			firstDate.split('/')[1] > endDateOfFirstPeriod.split('/')[1]
				? currentYear + 1
				: currentYear;
		const yearOfIntervalEndDate =
			yearOfIntervalStartDate > currentYear
				? currentYear + 1
				: currentYear;
		interval = {
			start: dayjs
				.tz()
				.startOf('d')
				.set('y', yearOfIntervalStartDate)
				.set('M', endDateOfFirstPeriod.split('/')[1] - 1)
				.set('date', endDateOfFirstPeriod.split('/')[0])
				.add(1, 'd')
				.toISOString(),
			end: dayjs
				.tz()
				.endOf('d')
				.set('y', yearOfIntervalEndDate)
				.set('M', startDateOfLastPeriod.split('/')[1] - 1)
				.set('date', startDateOfLastPeriod.split('/')[0])
				.subtract(1, 'd')
				.toISOString()
		};
	}

	// Period
	const periodStartDate = dayjs
		.tz()
		.set('y', currentYear)
		.set('M', firstDate.split('/')[1] - 1)
		.set('date', firstDate.split('/')[0])
		.startOf('d');
	const periodStart = periodStartDate
		.set('h', startTime.split(':')[0])
		.set('m', startTime.split(':')[1]);
	const period = {
		start: periodStart.toISOString(),
		end: periodStart.add(+duration, 'm').toISOString()
	};
	return {
		repeat: EVENT_REPEAT.WEEKLY,
		...(range ? { range } : { repeat: EVENT_REPEAT.NEVER }), // If no range, the lecture is never repeat
		...(interval ? { interval } : {}),
		period
	};
};

/**
 * @description map course timetable from uni timetable
 * @param {object} rawData uni timetable
 * @param {string} courseId course id
 * @param {string} universityId university id
 * @param {Array<string>} ignoreTypeList array list of unwanted timetable type
 */
export const manipulateUQCourseTimetables = (
	rawData,
	courseId,
	universityId,
	ignoreTypeList = []
) =>
	// Filter out delayed data and transfer activities to course timetable
	Object.entries(rawData.activities)
		.filter(
			([key, value]) =>
				!(
					key.includes('Delayed') ||
					ignoreTypeList.includes(value.activity_type.toLowerCase())
				)
		)
		.map(([key, value]) => {
			const weeks = weekpatternToDates(
				value.day_of_week,
				value.week_pattern,
				value.start_date
			).split(', ');
			const monthOfStartDate = +value.start_date.split('/')[1];
			const yearOfStartDate = +value.start_date.split('/')[2];
			const year =
				monthOfStartDate > 11 ? yearOfStartDate + 1 : yearOfStartDate;
			return {
				title: key,
				key,
				type: COURSE_TIMETABLE_TYPE.LETURE,
				course: courseId,
				university: universityId,
				year,
				semester: UQ_SEMESTER_TO_CURRENT_TERM[value.semester],
				state: POST_STATUS.PUBLISHED,
				lectureType: value.activity_type.toLowerCase(),
				teacher: value.staff,
				classroom:
					value.zone === LEARNING_METHOD.ONLINE.toUpperCase()
						? LEARNING_METHOD.ONLINE
						: value.location,
				...getPeriodRangeInterval(
					weeks,
					value.start_time,
					value.duration
				),
				fetchByWebCrawler: true
			};
		});

// map UQ semester to currentTerm options in User model
const UQ_SEMESTER_TO_CURRENT_TERM = {
	S1: '0',
	S2: '1',
	S3: '3'
};
