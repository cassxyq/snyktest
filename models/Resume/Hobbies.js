const keystone = require('keystone');
const { logger } = require('../../utils/logger');
const Types = keystone.Field.Types;

/**
 * Hobbies Model
 * =============
 */

const Hobbies = new keystone.List('Hobbies');

Hobbies.add({
	description: { type: Types.Html, wysiwyg: true, height: 150 }
});

// remove hobbies from the associate resume when the hobbies being deleted;
Hobbies.schema.post('remove', function() {
	const Resume = keystone.list('Resume');
	Resume.model
		.updateMany({ Hobbies: this._id }, { $unset: { Hobbies: '' } })
		.exec(err => {
			if (err) logger.error(err);
		});
});

Hobbies.defaultColumns = 'id';

Hobbies.register();
