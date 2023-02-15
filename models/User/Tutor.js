const keystone = require('keystone');
const Types = keystone.Field.Types;
const { generateId } = require('../../utils/generateId');

/**
 * Tutor Model
 * =============
 */

const Tutor = new keystone.List('Tutor', {
	autokey: {
		from: 'name',
		path: 'slug',
		unique: true,
		sortable: true
	}
});

//  Tutor.defaultColumns

Tutor.add(
	{
		user: { type: Types.Relationship, ref: 'User', noedit: true },
		meta: {
			title: { type: String },
			description: { type: String },
			keywords: { type: String }
		},
		name: { type: String, required: true },
		tutorId: { type: String, noedit: true },
		avatar: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			note: '头像大小最大200kb, width x height: 200px x 200px'
		},
		weChat: { type: String },
		mobile: { type: String },
		title: { type: String }, // job title
		slogan: { type: String },
		passport: { type: String },
		university: { type: Types.Relationship, ref: 'University', many: true },
		course: { type: Types.Relationship, ref: 'Course', many: true },
		city: { type: Types.Relationship, ref: 'City' },
		service: { type: Types.Relationship, ref: 'Service', many: true },
		introduction: { type: Types.Textarea },
		resume: { type: Types.Relationship, ref: 'Resource' },
		transcript: { type: Types.Relationship, ref: 'Resource' },
		highlights: { type: Types.TextArray, label: '亮点' },
		isApproval: { type: Boolean, default: false }
	},
	'Extended Information (Optional)',
	{
		techSkills: {
			type: Types.Relationship,
			ref: 'TechnologyStack',
			label: 'Technology Skills',
			many: true
		},
		score: { type: String },
		availableTime: { type: String },
		meetingTime: { type: String },
		priority: { type: Types.Number }
	}
);

Tutor.schema.pre('save', function(next) {
	if (!this.tutorId) {
		this.tutorId = 'T' + generateId();
	}
	next();
});

Tutor.defaultColumns =
	'name|10%, course, techSkills, university, city, isApproval';

Tutor.relationship({ ref: 'Scheduling', refPath: 'tutor', path: 'scheduling' });
// Tutor.relationship({ ref:'Order', refPath: 'tutor', path:'order' });
Tutor.relationship({ ref: 'Reviews', refPath: 'tutor', path: 'reviews' });
Tutor.relationship({ ref: 'Note', refPath: 'tutor', path: 'notes' });

Tutor.register();
