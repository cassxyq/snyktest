const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * StudyTeam Model
 * ==========
 */
const StudyTeam = new keystone.List('StudyTeam');

StudyTeam.add({
	teamName: { type: String, unique: true },
	taskScore: { type: String },
	captain: {
		type: Types.Relationship,
		ref: 'User',
		label: 'captain',
		filters: { team: ':teamName', isCaptain: true }
	},
	teamMembers: {
		type: Types.Relationship,
		ref: 'User',
		label: 'member',
		filters: { team: ':teamName', isCaptain: false },
		many: true
	},
	task: {
		taskType: {
			type: Types.Select,
			options: 'groupAssignment, clockIn',
			default: 'groupAssignment'
		},
		assignementName: { type: String },
		clockInName: { type: String },
		taskDescription: { type: Types.Textarea },
		clockInStart: { type: Date },
		clockInCompleted: { type: Date, default: Date.now },
		clockInEnd: { type: Date }
	},
	progress: { type: Types.Number },
	teamCapacity: { type: Types.Number },
	teamStatus: { type: String },
	relatedLinks: { type: Types.TextArray },
	mentor: {
		mentorid: { type: String },
		mentorName: { type: Types.Name, index: true },
		scoring: {
			type: Types.Boolean,
			default: false,
			label: '正在评分'
		},
		scoredTime: { type: Date },
		individualFeedback: {
			forWhom: { type: String },
			feedback: { type: String }
		}
	},
	program: {
		type: Types.Relationship,
		ref: 'Program',
		label: 'program',
		many: true
	},
	project: {
		projectScore: { type: Types.Number },
		projectQuanlity: { type: String },
		projectFeedback: { type: Types.Textarea }
	}
});

StudyTeam.relationship({
	ref: 'TeamMember',
	refPath: 'studyteam',
	path: 'member'
});

/**
 * Registration
 */
StudyTeam.defaultColumns =
	'teamName, taskScore, captain, teamMembers, task, progress';
StudyTeam.register();
