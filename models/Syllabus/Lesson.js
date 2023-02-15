const keystone = require('keystone');
const Types = keystone.Field.Types;
const { v4: uuidv4 } = require('uuid');
const { LESSON_DURATION, MS_ACCOUNT, LESSON_TYPE } = require('../../utils/constants');

/**
 * Syllabus Lesson Model
 * =============
 */

const Lesson = new keystone.List('Lesson', {
	autokey: { from: 'lessonId', path: 'slug', unique: true, sortable: true },
	defaultSort: '-createdAt',
	track: true
});
Lesson.defaultColumns = 'name, banners';

Lesson.schema.pre('save', function(next) {
	this.lessonId = uuidv4();
	next();
});

Lesson.add({
	lessonId: { type: String, noedit: true },
	name: { type: String, required: true, default: 'default' },
	title: { type: String },
	type: {
		type: Types.Select,
		options: Object.values(LESSON_TYPE),
		default: LESSON_TYPE.LESSON,
		note: 'Information用于穿插说明，Tips'
	},
	module: {
		type: Types.Relationship,
		ref: 'Module',
		label: '课程阶段',
		note: '对应该Training的哪一课程阶段'
	},
	isCompulsory: { type: Types.Boolean, default: false },
	description: { type: Types.Textarea, label: '描述' },
	knowledge: { type: Types.TextArray, label: '课程知识点' },
	commenceDate: {
		type: Date,
		default: Date.now,
		label: '上课时间'
	},
	duration: {
		type: Types.Select,
		options: LESSON_DURATION,
		label: '课时时长(分钟)'
	},
	classroomLink: {
		type: String,
		label: '直播教室链接'
	},
	availableTo: {
		type: Types.Select,
		options: '全体学生, VIP学生, 免费学生, 仅自己可见',
		label: '可见于'
	},
	teacher: { type: Types.Relationship, ref: 'Teacher' },
	material: {
		type: Types.Relationship,
		ref: 'Material',
		many: true
	}, // Only Enrolled User Read this attribute
	link: {
		type: Types.TextArray,
		label: '课程链接',
		note:
			'单个link为JSON Object，格式参照JSON.stringify({name: XX, url: http(s)://XX})，必须有name和url；最好通过前端增删改查，不要直接修改keystone'
	},
	aliCloudVideo: {
		type: Types.Relationship,
		ref: 'AliCloudVideo',
		many: true
	},
	assignment: { type: Types.Relationship, ref: 'Assignment', many: true },
	syllabus: { type: Types.Relationship, ref: 'Syllabus' },
},
'Ms Teams',
{
	msAccount: {
		type: Types.Select,
		options: Object.values(MS_ACCOUNT),
		label: 'Microsoft账号',
	},
	calendarEventId: {
		type: String,
		note: 'Ms Calendar Event id'
	},
	oneDriveFolderId: { type: String },
	oneDriveVideos: {
		type: Types.Relationship,
		ref: 'OneDriveVideo',
		many: true
	},
},
'================ 以下为英文内容 ================',
{
	title_en: { type: String },
	description_en: { type: Types.Textarea, label: '描述_英文' },
});

Lesson.register();
