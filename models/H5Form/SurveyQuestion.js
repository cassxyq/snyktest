const keystone = require('keystone');
const Types = keystone.Field.Types;

const SurveyQuestion = new keystone.List('SurveyQuestion', {
	autokey: {
		from: 'name',
		path: 'slug',
		unique: true
	}
});

SurveyQuestion.defaultColumns = 'name, campaign, attribute';

SurveyQuestion.add({
	name: {
		type: String,
		initial: true,
		required: true,
		label: '题目'
	},
	campaign: {
		type: Types.Relationship,
		retuired: true,
		initial: true,
		ref: 'SurveyCampaign',
		many: true,
		label: '所属项目'
	},
	attribute: {
		type: Types.Relationship,
		ref: 'Attribute',
		initial: true,
		label: '所属Attribute'
	},
	options: {
		type: Types.Code,
		height: 180,
		language: 'json',
		label: '选项对应属性及分数'
	}
});

SurveyQuestion.register();
