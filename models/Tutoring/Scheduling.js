import { logger } from '../../utils/logger';
const keystone = require('keystone');
const Types = keystone.Field.Types;
/**
 * Scheduling Model
 * Assignment task and scheduling meetings to calculate quota for clients
 * =============
 */

const Scheduling = new keystone.List('Scheduling', {
	map: { name: 'schedulingId' },
	autokey: { from: 'schedulingId', path: 'slug', unique: true },
	track: true
});

Scheduling.add({
	schedulingId: { type: String, noedit: true },
	startedDate: { type: Types.Date },
	endDate: { type: Types.Date },
	length: { type: Number },
	address: { type: String },
	comments: { type: String },
	service: { type: Types.Relationship, ref: 'Service' },
	student: { type: Types.Relationship, ref: 'Student' },
	tutor: { type: Types.Relationship, ref: 'Tutor' },
	teacher: { type: Types.Relationship, ref: 'Teacher' }
});

function generateId() {
	return 'SCH' + Date.now();
}

// Hooks

Scheduling.schema.pre('save', function(next) {
	this.schedulingId = generateId();
	next();
});

Scheduling.schema.post('save', function(next) {
	const Quota = keystone.list('Quota');
	const studentId = this.student;
	const serviceId = this.service;
	const length = this.length;
	Quota.model.find(
		{
			service: serviceId,
			student: studentId
		},
		function(err, quotas) {
			// eslint-disable-next-line
			quotas.some(quota => {
				if (quota.length > length) {
					quota.length = quota.length - length;
					quota.save().then(err => {
						if (err) logger.error(err);
						return true;
					});
					return true;
				}
			});
			next();
		}
	);
});

Scheduling.defaultColumns =
	' schedulingId|10%, tutor|10%, service|20%, length|5%, startedDate|15%, endDate|15%, address|10%';

Scheduling.register();
