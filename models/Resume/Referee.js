const keystone = require('keystone');
const { logger } = require('../../utils/logger');
const Types = keystone.Field.Types;

/**
 * Referee Model
 * =============
 */

const Referee = new keystone.List('Referee');

Referee.add({
	description: { type: Types.Html, wysiwyg: true, height: 150 }
});

// remove referee from the associate resume when the referee being deleted;
Referee.schema.post('remove', function() {
	const Resume = keystone.list('Resume');
	Resume.model
		.updateMany({ Referee: this._id }, { $unset: { Referee: '' } })
		.exec(err => {
			if (err) logger.error(err);
		});
});

Referee.defaultColumns = 'id';

Referee.register();
