const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Project Model
 * =============
 */

const Project = new keystone.List('Project', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

Project.add({
	meta: {
		title: { type: String },
		description: { type: String }
	},
	number: { type: String },
	name: { type: String, required: true },
	title: { type: String },
	url: { type: String },
	city: { type: Types.Relationship, ref: 'City', many: true },
	thumbnail: { type: Types.CloudinaryImage },
	thumbNailAlt: { type: String },
	shortDescription: { type: Types.Html, wysiwyg: true, height: 400 },
	teamDescrition: { type: String },
	teacher: { type: Types.Relationship, ref: 'Teacher', many: true },
	skills: { type: Types.TextArray, label: 'Skills' }
},
'================ 以下为英文内容 ================',
{
	meta_en: {
		title: { type: String },
		description: { type: String }
	},
	title_en: { type: String },
	thumbnail_en: { type: Types.CloudinaryImage },
	thumbNailAlt_en: { type: String },
	shortDescription_en: { type: Types.Html, wysiwyg: true, height: 400 },
	teamDescrition_en: { type: String },
	skills_en: { type: Types.TextArray, label: 'Skills' }
});

Project.register();
