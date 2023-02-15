import { logger } from '../../utils/logger';
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Education Model
 * =============
 */

const Education = new keystone.List('Education', {
	map: { name: 'university' },
	autokey: { from: 'university', path: 'slug', unique: true }
});

Education.add(
	{
		university: { type: String },
		major: { type: String },
		degree: { type: String },
		degreePreposition: {
			type: String,
			default: 'of',
			note: '学位和专业之间的介词, 比如PhD in Xxx, Master of Xxx'
		},
		city: { type: String },
		startDate: { type: Types.Date },
		endDate: { type: Types.Date },
		description: { type: Types.Html, wysiwyg: true, height: 150 }
	},
	{
		user: { type: Types.Relationship, ref: 'User' }
	}
);

// Pull the education from the associate resume when the education being deleted;
Education.schema.post('remove', function() {
	const Resume = keystone.list('Resume');
	Resume.model
		.updateMany({ education: this._id }, { $pull: { education: this._id } })
		.exec(err => {
			if (err) logger.error(err);
		});
});

Education.defaultColumns = 'university, major, user';

Education.register();
