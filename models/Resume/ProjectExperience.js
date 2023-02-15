const keystone = require('keystone');
const Types = keystone.Field.Types;
import { logger } from '../../utils/logger';

/**
 * Project Experience Model
 * =============
 */

const ProjectExperience = new keystone.List('ProjectExperience', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

ProjectExperience.add(
	{
		name: { type: String },
		role: { type: String },
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

// Pull the project experience from the associate resume when it being deleted;
ProjectExperience.schema.post('remove', function() {
	const Resume = keystone.list('Resume');
	Resume.model
		.updateMany(
			{ projectExperience: this._id },
			{ $pull: { projectExperience: this._id } }
		)
		.exec(err => {
			if (err) logger.error(err);
		});
});

ProjectExperience.defaultColumns = 'name, role, department, user';

ProjectExperience.register();
