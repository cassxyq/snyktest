const keystone = require('keystone');
const Types = keystone.Field.Types;

const SurveyCampaign = new keystone.List('SurveyCampaign', {
	autokey: {
		from: 'name',
		path: 'slug',
		unique: true
	}
});

SurveyCampaign.add({
	name: {
		type: String,
		required: true,
		initial: true
	},
	attributes: {
		type: Types.Relationship,
		ref: 'Attribute',
		many: true
	},
	predictions: {
		type: Types.Relationship,
		ref: 'Prediction',
		many: true
	}
});

SurveyCampaign.defaultColumns = 'name';

SurveyCampaign.register();
