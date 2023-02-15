import dayjs from 'dayjs';
import schedule from 'node-schedule';
import { isEmpty, isUndefined } from 'lodash';
import { NOTIFICATION_REMINDER_TYPE, NOTIFICATION_TYPE } from './constants';

const keystone = require('keystone');
// Frequency of running schedule to filter lessons for notification
const SCHEDULE_FREQUENCY = 12; // unit: hour
// Time slot before a commence date to create notification
const REMINDER_TIME_SLOT_LIST = [24, 120]; // unit: hour

export default async function() {
	// Consider pm2 multiple instances situation
	if (isUndefined(process.env.NODE_APP_INSTANCE) || process.env.NODE_APP_INSTANCE === '0') {
		const scheduleStartDate = dayjs(); // server timezone
		// cronExpression is set by scheduleStartDate plus 1s to avoid creating the schedule job after the trigger date
		const cronExpression = `${scheduleStartDate.get('s') + 1} ${scheduleStartDate.get('m')} ${scheduleStartDate.get('h')}/${SCHEDULE_FREQUENCY} * * ?`;
		// Schedule jobs executed from now with SCHEDULE_FREQUENCY, the time when the server is ready
		schedule.scheduleJob(cronExpression, async function(fireDate) {
			// Multiple time slots
			for (const timeSlot of REMINDER_TIME_SLOT_LIST) {
				// Filter lessons needed to create notification
				const lessonList = await getLessonsForNotification(fireDate, SCHEDULE_FREQUENCY, timeSlot);
				if (!isEmpty(lessonList)) {
					// Schedule reminder notification
					await scheduleTeacherNotificationByLessons(lessonList, timeSlot);
				}
			}
		});
	}
};

/**
 * @description return a lesson list which should be used to create notifications
 * @param {string} startDate the start date of filtering periods
 * @param {string} timeSlot the time slot of filtering periods
 */

const getLessonsForNotification = async (startDate, scheduleFrequency = SCHEDULE_FREQUENCY, timeSlot = 24) => {
	try {
		// Set filtering period, e.g. from the schedule fireDate to 12 hour later
		const start = dayjs(startDate);
		const end = start.add(scheduleFrequency, 'h');

		return await keystone.list('Lesson').model.find({
			commenceDate: {
				$gt: start.add(timeSlot, 'h').toISOString(),
				$lte: end.add(timeSlot, 'h').toISOString() // inclusive, less than or equal
			},
			teacher: { $ne: null }
		});
	} catch (error) {
		console.log(error);
	}
};

/**
 * @description to schedule to create lesson commencement notification to teachers
 * @param {object} lessonList the list of lesson data
 * @param {string} timeSlot the time slot of filtering periods
 */

const scheduleTeacherNotificationByLessons = async (lessonList = [], timeSlot) => {
	try {
		const Notification = keystone.list('Notification');

		// Get teacher user data for their emails
		const teacherIdList = lessonList.map(lesson => lesson.teacher);
		const teacherUserList = await keystone.list('User').model.find({
			teacher: {
				$in: teacherIdList
			}
		}).select('teacher');

		// Schedule job for creating the reminder notification depending on the commence date and time slot for each lesson
		for (const lesson of lessonList) {
			const scheduleShouldFireDate = dayjs(lesson.commenceDate).subtract(timeSlot, 'h');
			/**
			 *  If scheduleShouldFireDate is going to pass soon (within 10s),
			 *  which may not be triggered later, as the schedule job is created after the trigger date,
			 *  fire the schedule right away after 2s.
			 */
			const scheduleFireDate = scheduleShouldFireDate.isAfter(dayjs().add(10, 's')) ? scheduleShouldFireDate : dayjs().add(2, 's');
			schedule.scheduleJob(scheduleFireDate.toISOString(), async function() {
				const user = teacherUserList.find(user => user.teacher.toString() == lesson.teacher.toString());
				if (user) {
					const program = await keystone.list('Program').model.findOne({ syllabus: lesson.syllabus });
					const notification = new Notification.model({
						type: NOTIFICATION_TYPE.REMINDER,
						reminderType: NOTIFICATION_REMINDER_TYPE.LESSON,
						user,
						lesson,
						program
					});
					await notification.save();
				}
			});
		}
	} catch (error) {
		console.log(error);
	}
};
