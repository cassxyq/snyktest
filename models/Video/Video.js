import { prefetchYouTubeVideoDetial } from '../../utils/video';
import { isEmpty } from 'lodash';

const keystone = require('keystone');
const Types = keystone.Field.Types;
const { VIDEO_RECOMMEND_PLACE, VIDEO_TYPE } = require('../../utils/constants');

/**
 * Video Model
 * =============
 */

const Video = new keystone.List('Video', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

Video.add(
	{
		name: { type: String, required: true }, // Video Name
		title: {
			type: String,
			required: true,
			initial: true,
			note:
				'为了方便视频筛选和搜索，请添加对应关键字：面试为面试指导，职业为职业发展，就业为就业指南，生活为澳洲生活'
		}, // Title displayed
		featured: {
			type: Types.Select,
			options: Object.values(VIDEO_RECOMMEND_PLACE),
			default: VIDEO_RECOMMEND_PLACE.DEFAULT,
			label: 'Recommended Place',
			note:
				'homepage推荐到首页；training是培训页面，career求职页面，tutorial大学页面页面,Recommend会推荐到header部分'
		},
		type: {
			type: Types.Select,
			options: Object.values(VIDEO_TYPE),
			default: VIDEO_TYPE.SKILLS,
			label: '视频类型',
			note:
				'INTERVIEW学员采访，course_enrollment_guidance是选课指南，会出现在学校页面，SKILLS技能视频, Demo为项目演示视频, General为普通视频，比如校园采访'
		},
		youtubeId: {
			type: String,
			required: true,
			initial: true,
			note:
				'例如：视频的链接是www.youtube.com/watch?v=1HPGA0Gp53o ID就是1HPGA0Gp53o'
		},
		careerPath: {
			type: Types.Relationship,
			ref: 'CareerPath',
			many: true,
			note: '关联到相关职业，会出现在首页职业专栏'
		},
		duration: {
			type: String
		},
		youtubePublishTime: { type: String, noedit: true },
		bilibiliId: {
			type: String,
			note:
				'例如：视频的链接是https://www.bilibili.com/video/BV12J411179F ID就是BV12J411179F B站称之为bvid大写BV开头'
		},
		user: { type: Types.Relationship, ref: 'User' },
		teacher: { type: Types.Relationship, ref: 'Teacher' },
		tutor: { type: Types.Relationship, ref: 'Tutor' },
		university: { type: Types.Relationship, ref: 'University' },
		course: {
			type: Types.Relationship,
			ref: 'Course',
			label: 'University Course'
		},
		training: { type: Types.Relationship, ref: 'Training' },
		service: { type: Types.Relationship, ref: 'Service', many: true },
		workshop: { type: Types.Relationship, ref: 'Workshop' },
		createdAt: { type: Date, default: Date.now },
		updateAt: { type: Date, default: Date.now },
		thumbnail: { type: String },
		tag: { type: Types.Textarea, note: '用/隔开，比如：前端/后端' },
		pinned: { type: Types.Boolean, default: false, label: 'LMS首页置顶' }
	},
	'Display Information',
	{
		videoHeroName: { type: String, label: 'Video主人公名字' },
		videoHeroGender: {
			type: Types.Select,
			options: 'male, female',
			default: 'male',
			label: 'Video主人公性别'
		},
		relatedProgram: {
			type: String,
			label: '相关课程',
			note: '例如：全栈班第十期'
		},
		description: { type: Types.Textarea, label: 'Video描述介绍' },
		jobOfferReceived: { type: String }
	}
);

Video.schema.pre('save', async function(next) {
	this.updateAt = Date.now();
	if (
		isEmpty(this.youtubePublishTime) ||
		isEmpty(this.thumbnail) ||
		isEmpty(this.duration)
	) {
		const {
			thumbnail,
			publishedAt,
			duration
		} = await prefetchYouTubeVideoDetial(this.youtubeId);
		this.youtubePublishTime = publishedAt;
		this.thumbnail = thumbnail;
		this.duration = duration;
	}
	next();
});
Video.defaultColumns =
	'name|30%, featured, type, youtubeId, careerPath, university, updateAt';

Video.register();
