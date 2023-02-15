import { compact, mean } from 'lodash';
import ratingConfig from '../../utils/ratingConfig';
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Feedback Model
 * =============
 */

const UserFeedback = new keystone.List('UserFeedback', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});
UserFeedback.defaultColumns = 'name, description, rating';

UserFeedback.add(
	{
		name: { type: String, required: true, default: 'default' },
		description: { type: Types.Textarea, label: 'Description' },
		user: { type: Types.Relationship, ref: 'User' },
		isVerified: { type: Boolean, label: '是否审核成功' }
	},
	'评分对象',
	{
		workshop: { type: Types.Relationship, ref: 'Workshop' },
		program: { type: Types.Relationship, ref: 'Program' },
		topNote: { type: Types.Relationship, ref: 'Note' }
	},
	'评分项',
	{
		rating: { ...ratingConfig, label: '综合评分' },
		practicability: { ...ratingConfig, label: '实用性' },
		difficulty: { ...ratingConfig, label: '难易度' },
		understandability: { ...ratingConfig, label: '易懂性' },
		teacherRatings: { ...ratingConfig, label: '教师/导师评分' },
		experience: { ...ratingConfig, label: '体验感' }
	}
);

UserFeedback.schema.pre('save', function(next) {
	if (!this.rating) {
		const ratingData = compact([
			this.practicability,
			this.difficulty,
			this.understandability,
			this.teacherRatings,
			this.experience
		]);
		this.rating = Math.round(mean(Object.values(ratingData)));
	}
	this.wasNew = this.isNew;
	next();
});

UserFeedback.register();
