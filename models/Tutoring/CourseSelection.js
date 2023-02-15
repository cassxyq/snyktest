const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * CourseSelection Model
 * ==========
 */
const CourseSelection = new keystone.List('CourseSelection');
const currentYear = new Date().getFullYear().toString();

CourseSelection.add({
	user: { type: Types.Relationship, ref: 'User' },
	course: {
		type: Types.Relationship,
		ref: 'Course',
		many: true,
		note: '本学期学的课，最多五门'
	},
	universityYear: { type: String, default: currentYear },
	term: { type: Types.Select, options: '1,2,3,4' },
	currentCourseResourceUnlock: {
		type: Types.Relationship,
		ref: 'CourseResourceUnlock'
	}
});

/**
 * Registration
 */
CourseSelection.defaultColumns = 'user, course, universityYear, term';
CourseSelection.register();
