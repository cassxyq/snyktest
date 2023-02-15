import { logger } from '../../utils/logger';
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Classroom Model
 * =============
 */

const Classroom = new keystone.List('Classroom', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});
Classroom.defaultColumns = 'name, banners';

Classroom.add({
	name: { type: String, required: true, default: 'default' },
	workshop: {
		type: Types.Relationship,
		ref: 'Workshop',
		required: true,
		initial: true
	},
	class: {
		type: Types.Relationship,
		ref: 'Class',
		many: true
	},
	resource: {
		type: Types.Relationship,
		ref: 'Resource',
		many: true
	}
});

Classroom.schema.post('remove', function() {
	const Workshop = keystone.list('Workshop');
	Workshop.model
		.findOneAndUpdate({ _id: this.workshop }, { $unset: { classroom: '' } })
		.exec(err => {
			if (err) logger.error(err);
		});
});

Classroom.register();
