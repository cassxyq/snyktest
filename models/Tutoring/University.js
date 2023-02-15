const keystone = require('keystone');
const Types = keystone.Field.Types;
const post = keystone.list('Post');

/**
 * University Model
 * =============
 */

const University = new keystone.List('University', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

University.add(
	{
		meta: {
			title: { type: String },
			description: { type: Types.Textarea },
			keywords: { type: String }
		},
		name: { type: String, required: true }
	},
	'Basic Information (Required)',
	{
		featured: { type: Boolean },
		chineseName: { type: String },
		officialWebsite: { type: String },
		address: { type: String },
		ranking: { type: String },
		tuitionFeeRange: { type: String },
		logo: { type: Types.CloudinaryImage },
		badge: { type: Types.CloudinaryImage },
		cardBackground: { type: Types.CloudinaryImage },
		shortDescription: { type: Types.Textarea, label: '简短介绍' },
		schoolHistory: { type: Types.Textarea, label: '学校历史' },
		schoolFeatures: { type: Types.Textarea, label: '学校特色' },
		languageCriteria: { type: Types.Textarea, label: '语言和成绩要求' },
		tuition: { type: Types.Textarea, label: '费用' },
		applicationRequirements: {
			type: Types.Textarea,
			label: '申请材料清单'
		},
		rankings: {
			type: Types.Textarea,
			label: '学科排名',
			note: '大学各个学科分项排名'
		},
		preparatory: {
			type: Types.Html,
			wysiwyg: true,
			height: 800,
			label: '预科'
		},
		city: { type: Types.Relationship, ref: 'City' },
		wechatAccountName: { type: String },
		wechatAccountQRCode: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			label: '课代表二维码'
		},
		customServiceQRCode: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			label: '学校客服二维码'
		},
		worldRankings: {
			arwu: {
				type: String,
				label: 'ARWU排名',
				note: '填需要显示的文字,没有就留空'
			},
			times: {
				type: String,
				label: 'Times排名',
				note: '填需要显示的文字,没有就留空'
			},
			usnews: {
				type: String,
				label: 'US.News排名',
				note: '填需要显示的文字,没有就留空'
			},
			qs: {
				type: String,
				label: 'QS排名',
				note: '填需要显示的文字,没有就留空'
			}
		}
	},
	'Extended Information (Optional)',
	{
		slogan: { type: String },
		foundedYear: { type: String },
		famousAlumni: { type: String, label: '知名校友' },
		tution: { type: String, label: '学费' },
		ielts: { type: String, label: '雅思要求' },
		description: { type: String },
		categories: {
			type: Types.Relationship,
			ref: 'PostCategory',
			many: true,
			note: '请选择显示在匠人官网-新生入学页面内的文章的category'
		},
		workshopBannerImage: {
			type: Types.CloudinaryImages,
			autoCleanup: true,
			select: true,
			label: '牛小匠大学辅导滚动播放图片(多张)'
		}
	}
);

University.relationship({
	ref: 'Course',
	refPath: 'university',
	path: 'course'
});
University.relationship({ ref: 'Tutor', refPath: 'university', path: 'tutor' });

University.schema.virtual('chapters').get(async function() {
	let universityRelatedPosts = [];
	await post.model
		.find({
			university: this._id
		})
		.select('title content categories')
		.exec(async function(err, posts) {
			if (err) return res.err(err);
			if (!posts) return res.notfound();
			universityRelatedPosts = posts;
		});
	// build the chapters array
	const chapters = this.categories.reduce((prev, curr) => {
		const categoryId = curr._id ? curr._id : curr;
		const categoryRelatedPosts = universityRelatedPosts.filter(post => {
			const categoriesId = post.categories.map(category =>
				category.toString()
			);
			return categoriesId.includes(categoryId.toString());
		});
		const articles = categoryRelatedPosts.reduce((prev, curr) => {
			return [
				...prev,
				{
					name: curr.title,
					contentId: curr._id.toString(),
					content: curr.content.extended
				}
			];
		}, []);
		return [...prev, { category: curr, articles }];
	}, []);

	return chapters;
});

University.register();
