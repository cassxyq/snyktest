const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Settings Model
 * =============
 */

const Settings = new keystone.List('Settings', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});
Settings.defaultColumns = 'name, banners';

Settings.add({
	name: { type: String, required: true, default: 'default' },
	advertisements: { type: Types.CloudinaryImages, autoCleanup: true },
	banners: { type: Types.CloudinaryImages, autoCleanup: true },
	bannersUrl: { type: Types.TextArray, note: '与上面banners一一对应链接' },
	unlockRules: { type: Types.Html, wysiwyg: true, height: 200 },
	unlockInstructions: {
		type: Types.Html,
		wysiwyg: true,
		height: 200
	},
	internshipEnvironment: { type: Types.CloudinaryImages, autoCleanup: true }
});

Settings.register();
