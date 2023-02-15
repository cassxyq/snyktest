import { isEmpty, isEqual } from 'lodash';
import { RESOURCE_UNLOCK_TYPE } from '../../utils/constants';
import { validateTimeLengthParse } from '../../utils/validator';
import { encryption } from '../../utils/urlToken';
import { DASHBOARD_INFO_CENTRE_RESOURCE_DETAIL_BASE_URL } from '../../utils/urls';
const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * CourseResourceUnlock Model
 * ==========
 */
const CourseResourceUnlock = new keystone.List('CourseResourceUnlock');
const currentYear = new Date().getFullYear().toString();

CourseResourceUnlock.add({
	inviter: {
		type: Types.Relationship,
		ref: 'User',
		label: '邀请人',
		note:
			'当type为**resource**时, 此项为自动生成(主要记录哪位客服发出的邀请)'
	},
	invitees: {
		type: Types.Relationship,
		ref: 'User',
		many: true,
		label: '受邀人',
		note: '此项为记录申请解锁的用户'
	},
	type: {
		type: Types.Select,
		options: Object.values(RESOURCE_UNLOCK_TYPE),
		label: '解锁类型',
		initial: true
	},
	courses: {
		type: Types.Relationship,
		ref: 'Course',
		many: true,
		note: '一次邀请解锁可选的课程，最多5门'
	},
	universityYear: { type: String },
	term: { type: Types.Select, options: '1,2,3' },
	resource: {
		type: Types.Relationship,
		ref: 'Resource',
		label: '资料',
		note: '需要被解锁的资料(resource)id',
		initial: true
	},
	isCreateToken: {
		type: Boolean,
		label: '生成解锁链接',
		note: '勾选**生成解锁链接**，再点击**保存**即可生成解锁链接',
		default: false
	},
	tokenUrl: {
		type: String,
		label: '解锁链接',
		note:
			'**根据解锁链接创建时间 expiresIn里面标注时长 后过期;** 如需重新生成新的tokenUrl，请**删除(清空)**现有url，再点击**保存**即可',
		dependsOn: { isCreateToken: true }
	},
	ignoreExpiration: {
		type: Boolean,
		label: '忽略链接过期时间',
		dependsOn: { isCreateToken: true }
	},
	expiresIn: {
		type: String,
		label: '解锁链接有效时长',
		note:
			'有效时长输入例子: 1d, 1w, 1y 分别指的是1天, 1周, 1年 **注意: 1m 指的是一分钟**',
		dependsOn: { isCreateToken: true, ignoreExpiration: false },
		validate: {
			validator: value => {
				return !isEmpty(value) && validateTimeLengthParse(value);
			},
			msg:
				'Please fill in correct format of ExpiresIn, such as 1d, 1w, 1y!'
		}
	},
	tokenCreateAt: {
		type: Date,
		label: '解锁链接创建时间',
		noedit: true,
		dependsOn: { isCreateToken: true }
	},
	toeknCreateBy: {
		type: Types.Relationship,
		ref: 'User',
		label: '解锁链接创建人',
		note: '此项为自动生成(主要记录哪位客服发出的邀请)',
		noedit: true,
		dependsOn: { isCreateToken: true }
	}
});

CourseResourceUnlock.schema.pre('save', async function(next) {
	try {
		if (this.resource && this.isNew) {
			const unlock = await CourseResourceUnlock.model
				.findOne({ resource: this.resource })
				.exec();
			if (unlock) {
				throw new Error('This Resource is EXIST in unlock record!');
			}
		} else if (this.resource && !this.isNew) {
			const unlock = await CourseResourceUnlock.model
				.findOne({ resource: this.resource })
				.exec();
			if (unlock && !isEqual(this._id, unlock._doc._id)) {
				throw new Error('This Resource is EXIST in unlock record!');
			}
		}
		if (
			isEqual(this.type, RESOURCE_UNLOCK_TYPE.COURSE_RESOURCE) &&
			isEmpty(this.universityYear)
		) {
			this.universityYear = currentYear;
		}
		if (
			isEmpty(this.courses) &&
			isEmpty(this.universityYear) &&
			isEmpty(this.term) &&
			this.isCreateToken &&
			!isEmpty(this.resource) &&
			isEmpty(this.tokenUrl) &&
			isEqual(this.type, RESOURCE_UNLOCK_TYPE.RESOURCE)
		) {
			if (this.ignoreExpiration) this.expiresIn = undefined;
			const payload = {
				inviter: this._req_user._doc._id,
				resource: this.resource,
				type: this.type
			};
			const expiresIn = this.expiresIn;
			const token = encryption(payload, expiresIn);
			this.tokenUrl = `${DASHBOARD_INFO_CENTRE_RESOURCE_DETAIL_BASE_URL()}&id=${
				this.resource
			}&token=${token}`;
			this.inviter = this._req_user;
			this.toeknCreateBy = this._req_user;
			this.tokenCreateAt = new Date();
		}
		next();
	} catch (error) {
		next(error);
	}
});

/**
 * Registration
 */
CourseResourceUnlock.defaultColumns =
	'inviter, courses, invitees, resource, universityYear, term';
CourseResourceUnlock.register();
