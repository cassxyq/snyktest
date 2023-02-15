import dayjs from 'dayjs';
import holiday from 'date-holidays';
import { ACCRUAL_RATE, DATE_FORMAT, DAYJS_ERROR, EMPLOYMENT_FIELDS } from './constants';
import { isEmpty, isUndefined } from 'lodash';

/**
 * @description calculates how many hours are between given start & end time
 * @param {string} startTime start datetime like "HH:MM"
 * @param {string} endTime end datetime like "HH:MM"
 */
export const getHoursPerDay = (startTime, endTime) => {
	const fromTime = dayjs(`1970-01-01 ${startTime}`);
	const toTime = dayjs(`1970-01-01 ${endTime}`);
	const mins = toTime.diff(fromTime, "minutes", true);
	const totalHours = mins / 60;
	return totalHours;
};

/**
 * @description calculates how many hours are between given start & end time
 * @param {string} type if the fucntion was called to calculate start or end time
 * @param {Datetime} targetDateTime start or end working time of the date
 * @param {number} targetMilisecond the time or leave start of end
 * @param {number} hoursInMilisecond the length of working day
 */
export const calculateDailyCoverage = (type, targetDateTime, targetMilisecond, hoursInMilisecond) => {
	let res = 0;
	if (type === EMPLOYMENT_FIELDS.START_TIME) {
		res = targetDateTime.getTime() - targetMilisecond < 0 ? 0 : Math.min(targetDateTime.getTime() - targetMilisecond, hoursInMilisecond);
	} else {
		res = targetDateTime.getTime() - targetMilisecond > 0 ? 0 : Math.min(targetMilisecond - targetDateTime.getTime(), hoursInMilisecond);
	}
	return res;
};

/**
 * restructure the array to an object
 * ```
 * const workingDay = [{weekday: '1', workingHours: 4.5, startTime: '10:00', endTime: '14:30'},
 * 				 {weekday: '3', workingHours: 7, startTime: '9:00', endTime: '16:00'},
 *               {weekday: '5', workingHours: 5, startTime: '9:00', endTime: '14:00'}]
 *  weekdayAndHours(workingDay);//=>{ 1: {hours: 4.5, startTime: '10:00', endTime: '14:30'}, 3: {hours:7, startTime: '9:00', endTime: '16:00'}, 5: {hours: '5', workingHours: 5, startTime: '9:00', endTime: '14:00'}}
 * }
 * ```
 * @param {*} workingDay The array which contains the objects about the weekdays
 * @returns The object: { key: the weekday,
 *           value: another object which contains hours, startTime and endTime of the weekday}
 */
export const weekdayAndHours = workingDay => {
	const weekdayAndHourObj = new Object();
	workingDay.map(eachDay => {
		const keyStr = eachDay.weekday;
		const value = {
			hours: Number(eachDay.workingHours),
			startTime: eachDay.startTime,
			endTime: eachDay.endTime,
			breakStart: eachDay.breakStart,
			breakEnd: eachDay.breakEnd
		};
		weekdayAndHourObj[keyStr] = value;
	});
	return weekdayAndHourObj;
};

/**
 * ```
 * const workingDay = [{weekday: '1', workingHours: 4.5, startTime: '10:00', endTime: '14:30'},
 * 				 {weekday: '3', workingHours: 7, startTime: '9:00', endTime: '16:00'},
 *               {weekday: '5', workingHours: 5, startTime: '9:00', endTime: '14:00'}]
 * hoursPerWeek(workingDay)// => 16.5
 * ```
 * @param {*} workingDay The array which contains the objects about the weekdays
 * @returns The total working hours in a week
 */
export const hoursPerWeek = workingDay => {
	let totalHoursPerWeek = 0;
	workingDay.map(workDay => {
		totalHoursPerWeek = totalHoursPerWeek + Number(workDay.workingHours);
	});
	return totalHoursPerWeek;
};

/**
 * @param {*} start The commencementDate, the Dayjs object
 * @param {*} end  The end date, the Dayjs object
 * @param {*} workingDay
 * @returns The fixed working hours from start date to the end date
 */
export const calculateFixedWorkHours = (start, end, workingDay) => {
	//calculate how many days from start date to end date
	const startDate = dayjs(`${start.format(DATE_FORMAT.YYYY_MM_DD)}`);
	const endDate = dayjs(`${end.format(DATE_FORMAT.YYYY_MM_DD)}`);
	const days = endDate.diff(startDate, 'day', true);
	if (days <= 0) {
		return 0;
	}
	//calculate how many weeks from start date to end date
	const weeks = parseInt(days / 7);
	let totalHours = weeks * hoursPerWeek(workingDay);
	//calculate the rest of the working days
	const weekdayAndHoursObj = weekdayAndHours(workingDay);
	let current =
		end.day(start.day()).isBefore(end) || end.day(start.day()).isSame(end)
			? end.day(start.day())
			: end.day(start.day()).subtract(7, 'day');
	while (current.isBefore(end)) {
		const workingHours = weekdayAndHoursObj[current.day()]?.hours || 0;
		totalHours = totalHours + workingHours;
		current = current.add(1, 'day');
	}
	const lastWorkDay = weekdayAndHoursObj[end.day()];
	if (lastWorkDay) {
		const applyTime = end;
		const startTime = dayjs(
			`${end.format(DATE_FORMAT.YYYY_MM_DD)} ${lastWorkDay.startTime}`
		);
		let gap = 0;
		(lastWorkDay[EMPLOYMENT_FIELDS.BREAK_START] && lastWorkDay[EMPLOYMENT_FIELDS.BREAK_END])
			? gap = hoursWithBreak(applyTime, startTime, lastWorkDay[EMPLOYMENT_FIELDS.BREAK_START], lastWorkDay[EMPLOYMENT_FIELDS.BREAK_END])
			: gap = applyTime.diff(startTime, 'minutes', true) / 60;
		if (gap > 0) {
			totalHours =
				totalHours +
				(gap > lastWorkDay.hours ? lastWorkDay.hours : gap);
		}
	}
	return totalHours;
};

/**
 * @param {*} endTime end datetime like "YYYY-MM-DD HH:MM:SS", the Dayjs object
 * @param {*} startTime start datetime like "YYYY-MM-DD HH:MM:SS", the Dayjs object
 * @param {*} breakStart breakStart time like "HH:MM"
 * @param {*} breakEnd breakEnd time like "HH:MM"
 * @returns the hours on the last working day from the startTime to the endTime
 */
export const hoursWithBreak = (endTime, startTime, breakStart, breakEnd) => {
	const breakStartTime = dayjs(`${endTime.format(DATE_FORMAT.YYYY_MM_DD)} ${breakStart}`);
	const breakEndTime = dayjs(`${endTime.format(DATE_FORMAT.YYYY_MM_DD)} ${breakEnd}`);
	if (breakEndTime.isBefore(endTime)) {
		return breakStartTime.diff(startTime, 'minutes', true) / 60 +
			endTime.diff(breakEndTime, 'minutes', true) / 60;
	}
	return breakStartTime.diff(startTime, 'minutes', true) / 60;
}

/**
 * @description calculates how many hours are valid for a day where employee only works part of that day
 * @param {object} workingSchedule working schedule of employee
 * @param {Date} targetDateTime date object
 * @param {string} type suggests if it is start or end day of leave period
 */
export const partialDayLeave = (workingSchedule, targetDateTime, type) => {

	const dateString = dayjs(targetDateTime).format(DATE_FORMAT.YYYY_MM_DD);
	const target = workingSchedule[dayjs(targetDateTime).day()]?.[type];
	const breakStart = workingSchedule[dayjs(targetDateTime).day()]?.[EMPLOYMENT_FIELDS.BREAK_START];
	const breakEnd = workingSchedule[dayjs(targetDateTime).day()]?.[EMPLOYMENT_FIELDS.BREAK_END];
	const hours = workingSchedule[dayjs(targetDateTime).day()]?.hours || 0;
	const breakLength = getHoursPerDay(breakStart, breakEnd);
	const breakInMilisecond = breakLength * 60 * 60 * 1000;
	const hoursInMilisecond = hours * 60 * 60 * 1000;

	if (isEmpty(target)) return 0;

	const targetMilisecond = (new Date(`${dateString} ${target}`)).getTime();

	let breakResult = 0;

	if (breakStart && breakEnd) {
		const targetBreakMilisecond = type === EMPLOYMENT_FIELDS.START_TIME ? (new Date(`${dateString} ${breakStart}`)).getTime() : (new Date(`${dateString} ${breakEnd}`)).getTime();
		breakResult = calculateDailyCoverage(type, targetDateTime, targetBreakMilisecond, breakInMilisecond);
	};

	let result = 0;
	result = calculateDailyCoverage(type, targetDateTime, targetMilisecond, hoursInMilisecond);

	return (result - breakResult) / 1000 / 60 / 60;
};
/**
 * @description call the function to calculate total working hours from a given start datetime and end datetime and return
 * @param {string} startDate start datetime like "YYYY-MM-DD HH:MM:SS"
 * @param {string} endDate end datetime like "YYYY-MM-DD HH:MM:SS"
 * @param {array} employmentList user's employemnt details
 */
export const workingHoursPrep = (startDate, endDate, employmentList, cityAbbrev) => {

	const start = new Date(startDate);
	const end = new Date(endDate);
	const { countryAbbr, stateAbbr } = cityAbbrev;

	if (!countryAbbr || !stateAbbr) {
		throw "No public holiday found."
	};

	if (start == DAYJS_ERROR.INVALID_DATE || end == DAYJS_ERROR.INVALID_DATE) {
		throw "Invalid Dates.";
	};

	const validSchedule = employmentList.find(element => {
		if (!element.commencementDate) {
			return;
		} else if (start.getTime() > element.commencementDate.getTime() && (!element.endDate || end.getTime() < element.endDate.getTime())) {
			return element;
		}
	});

	if (!validSchedule?.workingDay) throw "Valid working schedule not found.";
	const scheduleList = JSON.parse(validSchedule?.workingDay);

	if (!scheduleList) throw "Valid working schedule not found.";
	const workingSchedule = {};
	// Assemble an object like { 1: { hours: 7.5, startTime: '09:00', endTime: '17:00' } } for "getWorkingHours" to use.
	scheduleList.map((item) => {
		workingSchedule[parseInt(item.weekday)] = { startTime: item.startTime, endTime: item.endTime, breakStart: item.breakStart, breakEnd: item.breakEnd, breakHours: getHoursPerDay(item.breakStart, item.breakEnd), hours: getHoursPerDay(item.startTime, item.endTime) };
	});

	const totalHolidayHours = getWorkingHours(start, end, workingSchedule, cityAbbrev);
	return totalHolidayHours;
};
/**
 * @description call the function to calculate total working hours from a given start datetime and end datetime and return
 * @param {Date} startDate start datetime like "YYYY-MM-DD HH:MM:SS"
 * @param {Date} endDate end datetime like "YYYY-MM-DD HH:MM:SS"
 * @param {object} employmentDetail user's working schedule like : { 1: { hours: 7.5, startTime: '09:00', endTime: '17:00' } } 
 */
export const getWorkingHours = (start, end, workingSchedule, cityAbbrev) => {

	const publicHoliday = new holiday();
	publicHoliday.init(cityAbbrev.countryAbbr, cityAbbrev.stateAbbr);

	let totalWorkingHours = 0;
	let currentDate = start.getTime();
	const endTime = end.getTime();

	// for start & end date we need to cater for partial day's working hours, return number of hours not included in the working hours of the day
	const subtractStart = publicHoliday.isHoliday(start.getTime()) ? 0 : partialDayLeave(workingSchedule, start, EMPLOYMENT_FIELDS.START_TIME);
	const subtractEnd = publicHoliday.isHoliday(end.getTime()) ? 0 : partialDayLeave(workingSchedule, end, EMPLOYMENT_FIELDS.END_TIME);
	// go through each day between start and end date 
	while (currentDate <= endTime) {
		let isPublicHoliday = false;
		const workingHours = workingSchedule[dayjs(currentDate).day()]?.hours === undefined ? 0 : workingSchedule[dayjs(currentDate).day()]?.hours;
		const workingBreak = workingSchedule[dayjs(currentDate).day()]?.breakHours === undefined ? 0 : workingSchedule[dayjs(currentDate).day()]?.breakHours;
		//only try to find out if this is a public holiday when the working hours of this day is greater than 0
		if (!!workingHours) {
			isPublicHoliday = !!publicHoliday.isHoliday(currentDate);
		};

		totalWorkingHours += isPublicHoliday ? 0 : workingHours - workingBreak;
		currentDate += 1000 * 60 * 1440;
	};

	return Math.round((totalWorkingHours - subtractStart - subtractEnd) * 10000) / 10000;
};

/**
 * @param {*} startStr The datetime string
 * @param {*} endStr The datetime string, if undefined default value is a new dayjs() object
 * @param {*} workingDay The array which contains the objects about the weekdays
 * @param {*} usedUnpaidLeave The number of the usedUnpaidLeave hours
 * @returns The object of cumulativeLeaves
 */
export const cumulativeLeaves = (
	startStr,
	endStr = dayjs(),
	workingDay,
	usedUnpaidLeave
) => {
	const cumulativeLeaves = new Object();
	const start = dayjs(startStr);
	const end = (dayjs(endStr).isAfter(dayjs())) ? dayjs() : dayjs(endStr);
	const fixedWorkHours = calculateFixedWorkHours(start, end, workingDay);
	cumulativeLeaves.cumulativeAnnuals = (
		(fixedWorkHours - Number(usedUnpaidLeave)) /
		ACCRUAL_RATE.ANNUAL_LEAVE
	).toFixed(4);
	cumulativeLeaves.cumulativePersonals = (
		(fixedWorkHours - Number(usedUnpaidLeave)) /
		ACCRUAL_RATE.PERSONAL_LEAVE
	).toFixed(4);
	return cumulativeLeaves;
};

/**
 * ```
 * remainingLeaves('33.3207', '16.6877', 3, 1) //=> { annuals: '30.3207', personals: '15.6877' }
 * ```
 * @param {*} cumulativeAnnualLeave The cumulative annual leave hours
 * @param {*} cumulativePersonalLeave The cumulative personal leave hours
 * @param {*} usedAnnualLeave The used annual leave hours
 * @param {*} usedPersonalLeave The used personal leave hours
 * @returns The object which contains the remaining annual leave hours and the remaining personal leave hours
 */
export const remainingLeaves = (cumulativeAnnualLeave, cumulativePersonalLeave, usedAnnualLeave, usedPersonalLeave) => {
	const remainingLeaves = new Object();
	remainingLeaves.annuals = (Number(cumulativeAnnualLeave) - Number(usedAnnualLeave)).toFixed(4);
	remainingLeaves.personals = (Number(cumulativePersonalLeave) - Number(usedPersonalLeave)).toFixed(4);
	return remainingLeaves;
};

/**
 * ```
 * isInvalidDate('2022-07-16T01:58:50.000Z','2022-07-15T01:58:50.000Z')//=>true
 * ```
 * @param {string} startStr The start datetime string
 * @param {string} endStr The end datetime string
 * @returns true if the start date is later than end date
 */
export const isInvalidDate = (startStr, endStr) => {
	let invalidDate = false;
	const start = dayjs(startStr);
	const end = dayjs(endStr);
	const days = end.diff(start, 'day', true);
	if (days <= 0) {
		invalidDate = true;
	}
	return invalidDate;
}

/**
 * ```
 * isBetween('2022-06-01T11:00:00.000+00:00', '2022-06-15T11:00:00.000+00:00', '2022-07-15T11:00:00.000+00:00')//=>false
 * isBetween('2022-06-01T11:00:00.000+00:00', '2022-08-15T11:00:00.000+00:00', '2022-07-15T11:00:00.000+00:00')//=>true
 * ```
 * @param {string} startDateStr The start datetime string
 * @param {string} currentDateStr The current datetime string
 * @param {string} endDateStr The end datetime string
 * @returns true if startDate<= currentDate <= endDate 
 */
export const isBetween = (startDateStr, endDateStr, currentDateStr) => {
	const start = defaultDayjs(startDateStr);
	const current = defaultDayjs(currentDateStr);
	const end = defaultDayjs(endDateStr);
	if ((current.isAfter(start) || current.isSame(start)) &&
		(current.isBefore(end) || current.isSame(end))) {
		return true;
	}
	return false;
}

/**
 * Return a default dayjs() object if the datetimeStr is empty or undefined
 * @param {string} datetimeStr 
 * @returns the  Dayjs() object 
 */
export const defaultDayjs = (dateStr) => {
	if (isEmpty(dateStr) || isUndefined(dateStr)) {
		return dayjs();
	} else {
		return dayjs(dateStr);
	}
}