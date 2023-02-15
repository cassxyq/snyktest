import { CONSTELLATION_OPTIONS } from '../../utils/constants';
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Candidate
 * ============
 */

const Candidate = new keystone.List('Candidate', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

Candidate.add(
	{
		name: { type: String, initial: true },
		candidateNo: {
			type: Number,
			format: '0',
			label: '选手编号',
			note:
				'若需自动生成，请不要填写编号，并且选择参加的投票评选活动后保存即可生成；自动生成不会填补空缺编号，只会在最大编号上增加'
		}
	},
	'Basic info',
	{
		height: { type: String, label: '身高', note: '单位：cm' },
		major: { type: String, label: '专业' },
		constellation: {
			type: Types.Select,
			options: Object.values(CONSTELLATION_OPTIONS),
			label: '星座'
		},
		hobby: { type: String, label: '爱好' },
		intro: { type: String, label: '自我介绍' },
		red: {
			type: String,
			label: '小红书账号ID',
			note: '此账号ID需从小红书用户页面URL中获取，而非“小红书号”'
		},
		wechat: { type: String, label: '微信' }
	},
	'Photo',
	{
		avatar: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			label: '排行榜头像(max:200x200px)'
		},
		coverPhoto: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			label: '分享转发消息显示的图片(max:500X400px, ratio:5:4)'
		},
		photo: {
			type: Types.CloudinaryImages,
			autoCleanup: true,
			select: true,
			label:
				'照片(第一张比例17:23,最大680X920px,其余宽度最大680px,比例不限制)'
		}
	},
	'Award',
	{
		award: {
			type: Types.Relationship,
			ref: 'Award',
			label: '投票评选活动'
		},
		voter: { type: Types.Relationship, ref: 'User', many: true },
		pageview: { type: Number, format: '0', label: '访问量', default: 0 }
	}
);

// set previous award for middleware
Candidate.schema.path('award').set(function(newVal) {
	this._previousAward = this.award;
	return newVal;
});
Candidate.schema.pre('save', async function(next) {
	// Candidate No. generator
	try {
		if (!this.award) {
			this.candidateNo = null; // If no award, unset candidateNo
		} else if (
			// If no candidateNo, or change award on keystone
			!this.candidateNo ||
			(!!this._previousAward &&
				this.award.toString() !== this._previousAward.toString())
		) {
			const candidateModel = keystone.list('Candidate').model;
			const candidates = await candidateModel
				.find({ award: this.award })
				.sort({ candidateNo: -1 });
			this.candidateNo =
				(candidates.length ? candidates[0].candidateNo : 0) + 1;
		}
		next();
	} catch (err) {
		next(err);
	}
});

Candidate.defaultColumns =
	'name, candidateNo, height, major, constellation, pageview, award';
Candidate.register();
