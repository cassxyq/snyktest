import { prefetchYouTubeVideoDetial } from '../../utils/video';
import { isEmpty } from 'lodash';

const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * File AliCloudVideo Model
 * ===========
 */

const AliCloudVideo = new keystone.List('AliCloudVideo', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

AliCloudVideo.add({
	name: {
		type: String,
		required: true,
		note: 'Required',
		default: 'AliCloudVideo'
	},
	url: {
		type: String,
		note:
			'保存视频的完整链接 "https://www.youtube.com/watch?v=zT62eVxShsY",YouTube链接的很多参数这里靠前端去掉'
	},
	isYoutubeVideo: { type: Boolean, note: '标记是否为YouTube的视频' },
	aliCloudVideoId: { type: String },
	youtubeVideoId: { type: String, note: '用来生成视频信息,B站类似' },
	coverURL: {
		type: String,
		note: '预览图,前端部分是以coverURL命名，所以get的时候可以直接返回数据'
	},
	duration: { type: String, note: '单位：秒' },
	courseType: { type: Types.Select, options: '培训课程,大学辅导' },
	lesson: { type: Types.Relationship, ref: 'Lesson' },
	class: { type: Types.Relationship, ref: 'Class' },
	teacher: { type: Types.Relationship, ref: 'Teacher' },
	tutor: { type: Types.Relationship, ref: 'Tutor' },
	videoUploadCompleted: { type: Boolean, default: false }
});

AliCloudVideo.schema.pre('save', async function(next) {
	this.updateAt = Date.now();
	if (!isEmpty(this.youtubeVideoId)) {
		const { thumbnail, duration } = await prefetchYouTubeVideoDetial(
			this.youtubeVideoId
		);
		this.coverURL = thumbnail;
		this.duration = duration;
	}
	next();
});

AliCloudVideo.defaultColumns = 'name';

AliCloudVideo.register();
