const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Course Model
 * =============
 */

const Course = new keystone.List('Course', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

Course.add(
	{
		meta: {
			title: { type: String, note: 'Required' },
			description: { type: Types.Textarea, note: 'Required' },
			keywords: { type: String, note: 'Required' }
		},
		university: {
			type: Types.Relationship,
			ref: 'University',
			required: true,
			initial: true,
			note: 'Required'
		},
		courseCode: { type: String, note: 'Required, Check Auto-Fill' },
		courseTitle: { type: String, note: 'Required, Check Auto-Fill' },
		name: { type: String, required: true, note: 'Required' },
		description: {
			type: Types.Textarea,
			height: 200,
			label: '课程介绍'
		},
		assignments: {
			type: Types.Html,
			wysiwyg: true,
			height: 200,
			label: '作业考试信息'
		},
		reviews: {
			type: Types.Html,
			wysiwyg: true,
			height: 200,
			label: '课程点评(大神解析)'
		},
		lessonsPerWeek: {
			type: Types.TextArray,
			label: '每周课时'
		},
		// Make sure the assignmentDates are in JSON format so that it can be converted into Object
		assignmentDates: {
			type: Types.TextArray,
			label: '作业时间安排',
			note:
				'格式如下: {"name": "作业名称", "date": "@YYYY-MM-DD HH:mm:ss"}' +
				'例子: {"name": "Assignment 1 30%", "date": "@2022-02-22 12:00:00"}'
		},
		midExamDate: { type: Types.Date, index: true, label: '期中时间' },
		finalExamDate: { type: Types.Date, index: true, label: '期末时间' },
		recommendedReources: {
			type: Types.Html,
			wysiwyg: true,
			height: 200,
			label: '推荐学习资料'
		},
		resourceTypes: {
			type: Types.TextArray,
			note:
				'请填写类型对应的key：电子书-ebook, 学习笔记-summary, 考试卷子-exam'
		},
		officialWebsite: { type: String },
		countNumOfLecture: { type: Number },
		countNumOfAssignment: { type: Number },
		countNumOfExam: { type: Number }
	},
	'课程打分',
	{
		coursePressure: {
			type: Types.Select,
			options: '1,2,3,4,5',
			default: '3',
			label: '易懂'
		},
		courseDifficulty: {
			type: Types.Select,
			options: '简易,中等,难,超难',
			default: '中等',
			label: '难度'
		},
		courseNutrition: {
			type: Types.Select,
			options: '1,2,3,4,5',
			default: '4',
			label: '实用'
		},
		credits: {
			type: Types.Select,
			options: '1,2,3,4,5,6,7,8,9,10,11,12',
			default: '2',
			label: '学分'
		},
		passingRate: { type: String, label: '通过率' }
	},
	'Extended Information (Optional)',
	{
		categories: {
			type: Types.Relationship,
			ref: 'JobCategory',
			many: true
		},
		promote: { type: String },
		spec: { type: String },
		slogan: { type: String },
		enrolledStudentCount: { type: Number },
		courseReviews: {
			type: Types.Relationship,
			ref: 'Reviews',
			many: true,
			label: '课程评价'
		},
		resourceCount: { type: Number },
		numberOfReviews: { type: Number },
		timetableCreatedAt: { type: Date }
	}
);

Course.schema.pre('save', function(next) {
	// Pre-process the name
	const processedName = this.name.split(' ');
	// Auto-fill for the first situation - eg. BISM3222 Information Analysis and System Design and 32113 Advanced Database
	// Auto-fill works only when courseCode has no value
	if (!this.courseCode) {
		// Check whether guessed code ends with a number by finding its last digit
		const questionableCode = processedName[0];
		const questionableCodeEnds = questionableCode.charAt(
			questionableCode.length - 1
		);
		if (!isNaN(Number(questionableCodeEnds))) {
			this.courseCode = questionableCode;
		}
		// Auto-fill for the first situation - eg. 1621ICT Web Design & Development
		// Check whether guessed code starts with a number and ends with a letter
		const questionableCodeStarts = questionableCode.charAt(0);
		if (
			!isNaN(Number(questionableCodeStarts)) &&
			questionableCodeEnds >= 'A' &&
			questionableCode <= 'Z'
		) {
			this.courseCode = questionableCode;
		}
	}
	// Remove courseCode part
	processedName.shift();
	// Stringify the rest again
	const questionableTitle = processedName.toString().replace(/,/g, ' ');
	const booleanTitle =
		!!isNaN(Number(questionableTitle.charAt(0))) &&
		questionableTitle.charAt(0) !== '/';
	// Auto-fill works only when courseCode has no value and questionableTitle is checked
	if (!this.courseTitle && booleanTitle) {
		this.courseTitle = questionableTitle;
	}
	// Auto-fill works for a second situation - eg. COMP 9021 Principles of Programming or COMP1001 7014 Python
	if (!this.courseCode || !this.courseTitle) {
		const secondProcessedName = this.name.split(' ');
		const secondQuestionableCode =
			secondProcessedName[0] + ' ' + secondProcessedName[1];
		const secondQuestionableCodeEnds = secondQuestionableCode.charAt(
			secondQuestionableCode.length - 1
		);
		const secondBooleanCode = !isNaN(Number(secondQuestionableCodeEnds));
		secondProcessedName.shift();
		secondProcessedName.shift();
		const secondQuestionableTitle = secondProcessedName
			.toString()
			.replace(/,/g, ' ');
		const secondBooleanTitle =
			!!isNaN(Number(secondQuestionableTitle.charAt(0))) &&
			secondQuestionableTitle.charAt(0) !== '/';
		// Auto-fill only works for having past both checks
		if (secondBooleanCode && secondBooleanTitle) {
			this.courseCode = secondQuestionableCode;
			this.courseTitle = secondQuestionableTitle;
		}
	}
	next();
});

Course.relationship({ ref: 'Tutor', refPath: 'course', path: 'tutor' });
Course.relationship({ ref: 'Resource', refPath: 'course', path: 'resource' });
Course.relationship({ ref: 'Workshop', refPath: 'course', path: 'workshop' });

Course.defaultColumns =
	'name, courseCode|20%, university|20%, tutor|20%, enrolledStudentCount|10%, resourceCount|10%';

Course.register();
