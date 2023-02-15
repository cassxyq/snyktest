import { CONSULTATION_TYPE } from '../../utils/constants';

const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Module Model
 * =============
 */

const Module = new keystone.List('Module', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});

Module.add(
	{
		name: { type: String, required: true, default: 'default' },
		title: { type: String },
		description: { type: Types.Textarea, label: '描述' },
		teachingMethod: { type: String, label: '授课模式' },
		duration: { type: String, label: '时长' },
		tips: { type: Types.Html, wysiwyg: true, label: '阶段Tips' }
	},
	'Consultation',
	{
		consultationType: {
			type: Types.Select,
			options: `${CONSULTATION_TYPE.MENTOR}, ${CONSULTATION_TYPE.MOCK_INTERVIEW}, ${CONSULTATION_TYPE.RESUME}`
		},
		consultationAmount: {
			type: Types.Number,
			default: 1
		}
	},
	'================ 以下为英文内容 ================',
	{
		title_en: { type: String },
		description_en: { type: Types.Textarea, label: '描述_英文' },
		teachingMethod_en: { type: String, label: '授课模式_英文' },
		duration_en: { type: String, label: '时长_英文' },
		tips_en: { type: Types.Html, wysiwyg: true, label: '阶段Tips_英文' }
	}
);

Module.defaultColumns = 'name';
Module.register();
