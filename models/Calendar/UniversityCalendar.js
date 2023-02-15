const keystone = require('keystone');
const Types = keystone.Field.Types;
const { UNIVERSITY_SEMESTER } = require('../../miniapp/constants');

/**
 * University Calendar Model
 * ============
 */

const UniversityCalendar = new keystone.List('UniversityCalendar', {
	map: { name: 'title' },
	autoKey: { from: 'title', path: 'slug', unique: true }
});
const currentYear = new Date().getFullYear().toString();

UniversityCalendar.add({
	title: { type: String, initial: true, required: true },
	semester: {
		type: Types.Select,
		options: Object.values(UNIVERSITY_SEMESTER)
	},
	university: {
		type: Types.Relationship,
		ref: 'University',
		index: true
	},
	universityYear: { type: Number, default: currentYear },
	image: {
		type: Types.CloudinaryImage,
		autoCleanup: true,
		select: true
	}
});

UniversityCalendar.defaultColumns =
	'title, semester, university, universityYear, image';
UniversityCalendar.register();
