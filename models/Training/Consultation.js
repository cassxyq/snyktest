import {
	CONSULTATION_TYPE,
	CONSULTATION_STATUS,
	LEARNING_METHOD
} from '../../utils/constants';

const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Consultation Model
 * =============
 */

const Consultation = new keystone.List('Consultation', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

Consultation.add(
	{
		user: {
			type: Types.Relationship,
			ref: 'User',
			filters: { slug: ':slug' }
		},
		type: {
			type: Types.Select,
			options: Object.values(CONSULTATION_TYPE)
		},
		status: {
			type: Types.Select,
			options: Object.values(CONSULTATION_STATUS),
			default: CONSULTATION_STATUS.BOOKED,
			note: 'failed: 学员未出席'
		},
		program: {
			type: Types.Relationship,
			ref: 'Program'
		},
		teacher: {
			type: Types.Relationship,
			ref: 'Teacher'
		},
		commenceDate: {
			type: Date,
			default: Date.now,
			label: '预约时间'
		},
		method: {
			type: Types.Select,
			options: Object.values(LEARNING_METHOD),
			label: '咨询方式',
			default: LEARNING_METHOD.ONLINE
		},
		content: {
			type: Types.Textarea,
			label: '咨询问题'
		}
	},
	'Feedback',
	{
		material: {
			type: Types.Relationship,
			ref: 'Material',
			many: true
		},
		aliCloudVideo: {
			type: Types.Relationship,
			ref: 'AliCloudVideo',
			many: true
		}
	}
);

Consultation.defaultColumns = 'name, user, teacher, commenceDate, status';
Consultation.register();
