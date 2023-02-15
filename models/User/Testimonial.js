const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Testimonial Model
 * =============
 */

const Testimonial = new keystone.List('Testimonial', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

Testimonial.add({
	name: { type: String, required: true },
	city: { type: Types.Relationship, ref: 'City' },
	description: { type: Types.Textarea },
	screenshot: {
		type: Types.CloudinaryImage,
		autoCleanup: true,
		select: true,
		whenExists: 'overwrite'
	},
	recommended: {
		type: Boolean,
		initial: false
	},
	university: {
		type: Types.Relationship,
		ref: 'University',
		note: 'Connect University Tutoring'
	},
	major: { type: Types.Relationship, ref: 'Major' },
	course: {
		type: Types.Relationship,
		ref: 'Course',
		note: 'Connect University Tutoring'
	},
	category: {
		type: Types.Select,
		options: 'offer, tutor',
		default: 'offer',
		note: 'Select testimonial type and add into corresponding list'
	},
	score: { type: String, note: 'Score' },
	training: { type: Types.Relationship, ref: 'Training' },
	program: {
		type: Types.Relationship,
		ref: 'Program',
		label: 'Program'
	},
	service: { type: Types.Relationship, ref: 'Service' },
	jobFunction: { type: String, label: 'Job Title' },
	title: { type: String, label: 'User Title' },
	salary: { type: Types.Number },
	company: { type: String, label: 'Offer Recieved' },
	relatedCompany: {
		type: Types.Relationship,
		ref: 'Company',
		note: 'Company in local databse'
	},
	type: {
		type: Types.Select,
		options: 'Internship, Full-time, Part-time',
		default: 'Full-time'
	},
	eventName: { type: String, label: 'General Event Name' },
	eduBackground: { type: String, label: 'Education Background' },
	storyUrl: { type: Types.Url },
	relatedVideo: { type: Types.Relationship, ref: 'Video' },
	createdAt: { type: Date, default: Date.now }
});

Testimonial.defaultColumns =
	'name, location|20%, relatedCompany|20%, training|20%';

Testimonial.register();
