import keystone from 'keystone';
import {
	MEETUP_TYPE,
	MEETUP_EVENT_TYPE,
	MEETUP_GENDER_TYPE,
	LIVE_STREAMING_OPTIONS
} from '../../miniapp/constants';
const Types = keystone.Field.Types;

/**
 * Meetup Model
 * =============
 */

const Meetup = new keystone.List('Meetup', {
	map: { name: 'title' },
	autokey: { from: 'title', path: 'key', unique: true }
});

Meetup.add(
	{
		meta: {
			title: { type: String },
			keywords: { type: String },
			description: {
				type: String,
				note: 'For SEO'
			}
		},
		title: { type: String, initial: true, required: true },
		description: {
			type: Types.Textarea,
			label: '组局详情'
		},
		descriptionImage: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			label: '组局详情图片'
		},
		city: {
			type: Types.Relationship,
			ref: 'City',
			label: '城市'
		},
		meetupType: {
			type: Types.Select,
			options: Object.values(MEETUP_TYPE),
			default: MEETUP_TYPE.OFFLINE,
			label: '组局类型'
		},
		meetupEventType: {
			type: Types.Select,
			options: Object.values(MEETUP_EVENT_TYPE),
			default: MEETUP_EVENT_TYPE.STUDY,
			label: '组局事件类型'
		},
		genderPreference: {
			type: Types.Select,
			options: Object.values(MEETUP_GENDER_TYPE),
			default: MEETUP_GENDER_TYPE.UNLIMITED,
			label: '期望男女'
		},
		maxRSVPs: {
			type: Number,
			note: '0表示无限制',
			default: 0,
			label: '人数限制'
		},
		period: {
			start: { type: Date, label: '开始时间' },
			end: { type: Date, label: '结束时间' }
		},
		contact: {
			type: Types.Textarea,
			label: '联系方式'
		},
		contactImage: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			label: '联系方式图片'
		},
		createdAt: { type: Date, default: Date.now },
		banners: {
			type: Types.CloudinaryImages,
			autoCleanup: true,
			label: 'banners'
		},
		bannersUrl: {
			type: Types.TextArray,
			note: '与上面banners一一对应链接',
			label: 'bannersUrl'
		}
	},
	'线上',
	{
		liveStreaming: {
			type: Types.Select,
			options: LIVE_STREAMING_OPTIONS,
			label: '视频工具',
			dependsOn: { meetupType: MEETUP_TYPE.ONLINE }
		},
		liveStreamingLink: {
			type: String,
			label: '线上活动链接',
			dependsOn: { meetupType: MEETUP_TYPE.ONLINE }
		}
	},
	'线下',
	{
		location: {
			type: String,
			label: '见面地点',
			dependsOn: { meetupType: MEETUP_TYPE.OFFLINE }
		},
		address: {
			type: String,
			label: '具体地址',
			dependsOn: { meetupType: MEETUP_TYPE.OFFLINE }
		}
	},
	'参与相关',
	{
		user: {
			type: Types.Relationship,
			ref: 'User',
			index: true,
			label: '发布者'
		},
		attendees: {
			type: Types.Relationship,
			ref: 'User',
			many: true,
			label: '参与者'
		},
		attendeeGender: {
			type: Types.TextArray,
			note:
				'记录用户id和用户参加活动填写的性别。格式："userId,male"(中间无空格)'
		}
	},
	'招聘会相关',
	{
		subtitle: {
			type: String,
			label: '副标题',
			dependsOn: { meetupEventType: MEETUP_EVENT_TYPE.CAREER_FAIR }
		},
		slogan: {
			type: String,
			dependsOn: { meetupEventType: MEETUP_EVENT_TYPE.CAREER_FAIR }
		},
		exhibitors: {
			type: Types.Relationship,
			ref: 'Company',
			many: true,
			dependsOn: { meetupEventType: MEETUP_EVENT_TYPE.CAREER_FAIR }
		},
		organizers: {
			type: Types.Relationship,
			ref: 'Company',
			many: true,
			dependsOn: { meetupEventType: MEETUP_EVENT_TYPE.CAREER_FAIR }
		},
		coOrganizers: {
			type: Types.Relationship,
			ref: 'Company',
			many: true,
			dependsOn: { meetupEventType: MEETUP_EVENT_TYPE.CAREER_FAIR }
		},
		subscriptions: {
			type: Types.Relationship,
			ref: 'Subscription',
			label: '赞助方案',
			many: true
		}
	}
);

Meetup.defaultSort = '-period.start';
Meetup.defaultColumns =
	'title, city, meetupType, maxRSVPs, user, period.start|20%';
Meetup.register();
