const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Learning Path Model
 * =============
 */

const LearningPath = new keystone.List('LearningPath', {
	autokey: {
		from: 'name',
		path: 'slug',
		unique: true,
		sortable: true
	}
});

LearningPath.add(
	{
		name: { type: String },
		englishTitle: { type: String },
		description: { type: Types.Textarea },
		stageNames: {
			type: Types.TextArray,
			label: '阶段名称',
			note: 'Max: four stages'
		}
	},
	'第一阶段',
	{
		trainingOfFirstStage: {
			type: Types.Relationship,
			ref: 'Training',
			many: true,
			label: '第一阶段的培训课程'
		},
		serviceOfFirstStage: {
			type: Types.Relationship,
			ref: 'Service',
			many: true,
			label: '第一阶段的服务项目'
		}
	},
	'第二阶段',
	{
		trainingOfSecondStage: {
			type: Types.Relationship,
			ref: 'Training',
			many: true,
			label: '第二阶段的培训课程'
		},
		serviceOfSecondStage: {
			type: Types.Relationship,
			ref: 'Service',
			many: true,
			label: '第二阶段的服务项目'
		}
	},
	'第三阶段',
	{
		trainingOfThirdStage: {
			type: Types.Relationship,
			ref: 'Training',
			many: true,
			label: '第三阶段的培训课程'
		},
		serviceOfThirdStage: {
			type: Types.Relationship,
			ref: 'Service',
			many: true,
			label: '第三阶段的服务项目'
		}
	},
	'第四阶段',
	{
		trainingOfFourthStage: {
			type: Types.Relationship,
			ref: 'Training',
			many: true,
			label: '第四阶段的培训课程'
		},
		serviceOfFourthStage: {
			type: Types.Relationship,
			ref: 'Service',
			many: true,
			label: '第四阶段的服务项目'
		}
	}
);

LearningPath.defaultColumns = 'name, training';

LearningPath.register();
