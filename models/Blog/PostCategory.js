const keystone = require('keystone');
const Types = keystone.Field.Types;
/**
 * PostCategory Model
 * ==================
 */

const PostCategory = new keystone.List('PostCategory', {
	autokey: { from: 'name', path: 'key', unique: true }
});

PostCategory.add({
	name: { type: String, required: true },
	icon: { type: Types.CloudinaryImage },
	// Use this to fetch the post category ID which is used to fetch blogs under this category
	// If isDisplayed is 'Yes', the blogs under this category will be displayed on LMS University page
	isDisplayed: {
		type: Types.Select,
		options: 'Yes, No',
		index: true,
		note:
			'决定此category下的文章是否在大学学习-新生必看页面显示，当前为Yes的categories包括 "选课指南"，"网课",' +
			'"申请指南", "校园向导", "学霸攻略", "考试准备", "玩转澳洲", "租房秘籍", "本地生活", "留学打工", "实习兼职".'
	}
});

PostCategory.relationship({ ref: 'Post', refPath: 'categories' });

PostCategory.register();
