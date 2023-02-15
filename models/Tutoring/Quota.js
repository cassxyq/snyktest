const keystone = require('keystone');
const randomkey = require('randomkey');
const Types = keystone.Field.Types;

/**
 * Tutor Model
 * =============
 */

const Quota = new keystone.List('Quota', {
	autokey: { from: 'quotaId', path: 'slug', unique: true },
	track: true
});

Quota.add({
	quotaId: { type: String, noedit: true },
	client: { type: String, noedit: true },
	comments: { type: String },
	student: { type: Types.Relationship, ref: 'Student', noedit: true },
	service: { type: Types.Relationship, ref: 'Service', noedit: true },
	length: { type: Number, noedit: true },
	startedDate: { type: Types.Date, noedit: true },
	confirmed: { type: Types.Boolean, index: true }
});

function randomString() {
	return 'QUT' + randomkey([5, 9]);
}

// Hooks
// Quota.relationship({ ref:'Quota', refPath: 'student', path:'quota' });

Quota.schema.pre('save', function(next) {
	this.quotaId = randomString();
	next();
});

Quota.defaultColumns =
	'client|10%, service|20%, length|10%, startedDate|20%, confirmed|10%, comments|10%';

Quota.register();
