const keystone = require('keystone');
const Types = keystone.Field.Types;
import { logger } from '../../utils/logger';

/**
 * Professional Experience Model
 * =============
 */

const ProfessionalExperience = new keystone.List('ProfessionalExperience', {
	map: { name: 'company' },
	autokey: { from: 'company', path: 'slug', unique: true }
});

ProfessionalExperience.add(
	{
		company: { type: String },
		position: { type: String },
		department: { type: String },
		city: { type: String },
		startDate: { type: Types.Date },
		endDate: { type: Types.Date },
		description: { type: Types.Html, wysiwyg: true, height: 150 }
	},
	{
		user: { type: Types.Relationship, ref: 'User' }
	}
);

// Pull the professional experience from the associate resume when it being deleted;
ProfessionalExperience.schema.post('remove', function() {
	const Resume = keystone.list('Resume');
	Resume.model
		.updateMany(
			{ professionalExperience: this._id },
			{ $pull: { professionalExperience: this._id } }
		)
		.exec(err => {
			if (err) logger.error(err);
		});
});

ProfessionalExperience.defaultColumns = 'company, position, department, user';

ProfessionalExperience.register();
