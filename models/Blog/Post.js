const keystone = require('keystone');
const Types = keystone.Field.Types;
const cloudinary = require('cloudinary').v2;
const { logger } = require('../../utils/logger');
const { PUBLIC_IMAGE_BUCKET } = require('../../utils/constants');
const { removeObjectFromS3  } = require('../../services/s3');
const {
	removeCloudinaryImagesByPost,
	getImagePublicIdFromContent,
	removeS3ImagesByPost,
	getS3ImageKeyFromContent
} = require('../../utils/removeCloudImagesByPost');

/**
 * Post Model
 * ==========
 */

const Post = new keystone.List('Post', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true },
	defaultSort: '-publishedAt',
	drilldown: 'categories'
});

Post.add(
	{
		title: { type: String, required: true },
		state: {
			type: Types.Select,
			options: 'draft, published, archived',
			default: 'draft',
			index: true
		},
		createdAt: { type: Date, default: Date.now },
		publishedDate: {
			type: Types.Date,
			index: true,
			dependsOn: { state: 'published' }
		},
		isAuthor: { type: Boolean, default: true },
		author: {
			type: Types.Relationship,
			ref: 'User',
			note: '选择author，teacher或tutor',
			dependsOn: { isAuthor: true }
		},
		isTeacher: { type: Boolean },
		teacher: {
			type: Types.Relationship,
			ref: 'Teacher',
			index: true,
			note: '选择author，teacher或tutor',
			dependsOn: { isTeacher: true }
		},
		isTutor: { type: Boolean },
		tutor: {
			type: Types.Relationship,
			ref: 'Tutor',
			index: true,
			note: '选择author，teacher或tutor',
			dependsOn: { isTutor: true }
		},
		pinned: { type: Types.Boolean, default: false, label: 'LMS首页置顶' },
		isPromotion: {
			type: Types.Boolean,
			default: false,
			label: 'Is Promotion',
			note:
				'Promotion内容将在首页广告位显示 - 请在Post Background Image上传图片并在Categories选择一个种类'
		},
		promotionTitle: {
			type: String,
			default: '',
			required: true,
			dependsOn: { isPromotion: true },
			note: '广告标题不能超过18个中文字'
		},
		promotionBrief: {
			type: String,
			default: '',
			required: true,
			dependsOn: { isPromotion: true },
			note: '广告简要说明不能超过10个中文字'
		}
	},
	'SEO For Google(Required)',
	{
		meta: {
			title: { type: String, initial: true },
			keywords: { type: String, initial: true, note: '用英文 逗号 隔开' },
			description: {
				type: Types.Textarea,
				note: '必须最少40个字，最多90个字 For SEO',
				initial: true,
				label: 'Meta Description'
			}
		}
	},
	'Blog Content',
	{
		image: {
			type: Types.CloudinaryImage,
			note: 'Width:900px, height:500px',
			autoCleanup: true,
			select: true
		},
		imageAlt: {
			type: String,
			note: 'For SEO（Required）'
		},
		content: {
			brief: { type: Types.Textarea, label: '摘要' },
			extended: {
				type: Types.Html,
				wysiwyg: true,
				height: 800,
				label: '正文'
			}
		},
		createdAt: { type: Date, default: Date.now },
		resources: {
			type: Types.Relationship,
			ref: 'Resource',
			many: true,
			note: '暂时只支持上传word或pdf文档'
		}
	},
	'Choose Categories',
	{
		university: { type: Types.Relationship, ref: 'University', many: true },
		course: { type: Types.Relationship, ref: 'Course', many: true },
		training: { type: Types.Relationship, ref: 'Training', many: true },
		service: { type: Types.Relationship, ref: 'Service', many: true },
		categories: {
			type: Types.Relationship,
			ref: 'PostCategory',
			many: true,
			note:
				'显示在大学学习-新生必看页面内的categories包括包括 "选课指南"，"网课",' +
				'"申请指南", "校园向导", "学霸攻略", "考试准备", "玩转澳洲", "租房秘籍", "本地生活", "留学打工", "实习兼职". ' +
				'当大学学习-课程指南页面内的没有搜索和课程筛选时, 显示选课指南和课程讲解两个categories下的文章。'
		},
		city: { type: Types.Relationship, ref: 'City', many: true }
	},
	'Extended Information (Optional)',
	{
		postBackgroundImage: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true
		}
	}
);

Post.schema.virtual('content.full').get(function() {
	return this.content.extended || this.content.brief;
});

Post.schema.pre('save', async function(next) {
	// To remove images from cloudinary and s3 if there are some images removed by editing
	if (!this.isNew) {
		try {
			const keystone = require('keystone');
			const Post = keystone.list('Post');
			const post = await Post.model.findById(this._id);
			await removeCloudinaryImagesByPost(post.content.extended, this.content.extended);
			await removeS3ImagesByPost(post.content.extended, this.content.extended);
			next();
		} catch (err) {
			logger.error(err);
		}
	}
	next();
});

Post.schema.post('remove', async function() {
	try {
		/* Clear images at cloudinary */
		let imageIdList = [
			this.image.public_id,
			this.postBackgroundImage.public_id
		];

		// Gather each cloudinary image public id in content
		if (this.content.extended) {
			const contentImageIdList = getImagePublicIdFromContent(this.content.extended);
			imageIdList = [
				...imageIdList,
				...contentImageIdList
			];
		}

		/** Due to cache policy of CDN at cloudinary, that all delivered images are cached for 30 days.
		 *  these images urls will still be available till 30 days later
		*/
		// Remove images from cloudinary
		for (const imageId of imageIdList) {
			if (imageId) {
				await cloudinary.uploader.destroy(imageId);
			}
		}

		/* Clear images at s3 */
		// Gather each s3 image key in content
		if (this.content.extended) {
			const contentS3ImageIdList = getS3ImageKeyFromContent(this.content.extended, this._id);
			// Remove images from s3
			for (const imageKey of contentS3ImageIdList) {
				if (imageKey) {
					await removeObjectFromS3 (PUBLIC_IMAGE_BUCKET, imageKey);
				}
			}
		}
	} catch (err) {
		logger.error(err);
	}
});

Post.defaultSort = '-createdAt';
Post.defaultColumns =
	'title|35%, state|8%, author|10%, university|13%, categories|15%, publishedDate |15%';
Post.register();
