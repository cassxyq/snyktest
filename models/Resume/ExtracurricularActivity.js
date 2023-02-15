const keystone = require('keystone');
const Types = keystone.Field.Types;
import { logger } from '../../utils/logger';

/**
 * ExtracurricularActivity Model
 * =============
 */

const ExtracurricularActivity = new keystone.List('ExtracurricularActivity', {
	map: { name: 'organization' },
	autokey: { from: 'organization', path: 'slug', unique: true }
});

ExtracurricularActivity.add(
	{
		organization: { type: String },
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

// Pull the extracurricular activity from the associate resume when the extracurricular activity being deleted;
ExtracurricularActivity.schema.post('remove', function() {
	const Resume = keystone.list('Resume');
	Resume.model
		.updateMany(
			{ ExtracurricularActivity: this._id },
			{ $pull: { ExtracurricularActivity: this._id } }
		)
		.exec(err => {
			if (err) logger.error(err);
		});
});

ExtracurricularActivity.defaultColumns = 'organization, role, user';

ExtracurricularActivity.register();
