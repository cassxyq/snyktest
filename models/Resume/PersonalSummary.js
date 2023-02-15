const keystone = require('keystone');
const Types = keystone.Field.Types;
import { logger } from '../../utils/logger';

/**
 * Personal Summary Model
 * =============
 */

const PersonalSummary = new keystone.List('PersonalSummary');

PersonalSummary.add(
	{
		description: { type: Types.Html, wysiwyg: true, height: 150 }
	},
	{
		user: { type: Types.Relationship, ref: 'User' }
	}
);

// remove personal summary from the associate resume when the personal summary being deleted;
PersonalSummary.schema.post('remove', function() {
	const Resume = keystone.list('Resume');
	Resume.model
		.updateMany(
			{ personalSummary: this._id },
			{ $unset: { personalSummary: '' } }
		)
		.exec(err => {
			if (err) logger.error(err);
		});
});

PersonalSummary.defaultColumns = 'id user';

PersonalSummary.register();
