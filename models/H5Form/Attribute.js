const keystone = require('keystone');

const Attribute = new keystone.List('Attribute', {
	autokey: {
		from: 'name',
		path: 'slug',
		unique: true
	}
});

Attribute.defaultColumns = 'name, title, profession';

Attribute.add({
	name: {
		type: String,
		initial: true,
		required: true,
		label: 'Attribute'
	},
	title: {
		type: String,
		initial: true,
		required: true,
		label: '中文属性'
	},
	profession: {
		type: String,
		required: true,
		initial: true,
		label: '对应专业'
	}
});

Attribute.register();
