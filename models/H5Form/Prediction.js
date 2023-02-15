const keystone = require('keystone');
const Types = keystone.Field.Types;

const Prediction = new keystone.List('Prediction', {
	autokey: {
		from: 'name',
		path: 'slug',
		unique: true
	}
});

Prediction.defaultColumns = 'name, description, criteria';

Prediction.add({
	name: {
		type: String,
		initial: true,
		required: true,
		label: '预测'
	},
	description: {
		type: String,
		label: '官方分析'
	},
	criteria: {
		type: Types.Code,
		height: 180,
		language: 'json',
		label: '属性及分数标准'
	}
});

Prediction.register();
