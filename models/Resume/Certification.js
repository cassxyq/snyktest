import { logger } from '../../utils/logger';
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Certification Model
 * =============
 */

const Certification = new keystone.List('Certification', {
	map: { name: 'certification' },
	autokey: { from: 'certification', path: 'slug', unique: true }
});

Certification.add(
	{
		certification: { type: String },
		institution: { type: String },
		date: { type: Types.Date },
		description: { type: Types.Html, wysiwyg: true, height: 150 }
	},
	{
		user: { type: Types.Relationship, ref: 'User' }
	}
);

// Pull the certification from the associate resume when the certification being deleted;
Certification.schema.post('remove', function () {
	const Resume = keystone.list('Resume');
	Resume.model
		.updateMany({ certification: this._id }, { $pull: { certification: this._id } })
		.exec(err => {
			if (err) logger.error(err);
		});
});

Certification.defaultColumns = 'certification, institution, user';

Certification.register();
