const keystone = require('keystone');

/**
 * Review Model
 * =============
 */

const Major = new keystone.List('Major', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});
Major.defaultColumns = 'name, priority';

Major.add({
	name: { type: String, required: true }
});

Major.register();
