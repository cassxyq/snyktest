const keystone = require('keystone');
const Types = keystone.Field.Types;

const Email = require('keystone-email');
const path = require('path');
import { logger } from '../../utils/logger';

/**
 * Enrollment Model
 * =============
 */

const Enrollment = new keystone.List('Enrollment', {
	autokey: { from: 'name', path: 'key', unique: true }
});

Enrollment.add({
	studentName: { type: String },
	user: {
		type: Types.Relationship,
		ref: 'User',
		filters: { slug: ':slug' }
	},
	studentId: { type: String },
	order: { type: Types.Relationship, ref: 'Order', many: true },
	program: { type: Types.Relationship, ref: 'Program', many: true },
	workshop: {
		type: Types.Relationship,
		ref: 'Workshop',
		many: true,
		filters: { slug: ':slug' }
	},
	topNote: { type: Types.Relationship, ref: 'Note', many: true },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date }
});

Enrollment.schema.pre('save', async function(next) {
	this.wasNew = this.isNew;
	this.updatedAt = Date.now();
	next();
});

//TODO : Change template
Enrollment.schema.methods.sendNotificationEmail = function(callback) {
	if (typeof callback !== 'function') {
		callback = function() {}; // eslint-disable-line no-param-reassign
	}
	const enrollment = this;
	keystone
		.list('User')
		.model.find()
		.where('isAdmin', true)
		// eslint-disable-next-line  consistent-return
		.exec(function(err, admins) {
			if (err) return callback(err);
			for (const admin of admins) {
				new Email(path.join(__dirname, 'email-template.pug'), {
					transport: 'mailgun'
				}).send(
					{
						admin: admin,
						user: enrollment
					},
					{
						apiKey: 'key-6eec61fd764df4b00bfb1634f528ad19',
						domain:
							'sandbox36d2455d79fc4df79a29d08050415143.mailgun.org',
						to: 'ozitquan@gmail.com',
						from: {
							name: 'Your Site',
							email: 'ozitquan@gmail.com'
						},
						subject: 'Your first KeystoneJS email'
					},
					function(err, result) {
						if (err) {
							logger.error(err);
						} else {
							logger.info(result);
						}
					}
				);
			}
		});
};

Enrollment.defaultSort = '-updatedAt';
Enrollment.defaultColumns =
	'name, user, program, order, workshop, createdAt, updatedAt';
Enrollment.register();
