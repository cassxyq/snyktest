const keystone = require('keystone');
const Types = keystone.Field.Types;
const Course = keystone.list('Course');
const cloudinary = require('cloudinary').v2;
const { logger } = require('../../utils/logger');
const urlConfig = require('../../config/url-config.json');
import axios from 'axios';
const {
	RESOURCE_TYPE,
	FILE_TYPE,
	isProd,
	S3_BUCKET_NAME,
	INFORMATION_EXCLUDED_RESOURCE_TYPE
} = require('../../utils/constants');
const { LAMBDA_URL } = require('../../utils/urls');
const { getS3Storage, getLocalStorage } = require('../../utils/storage');
const {
	handleOneResourceCountIncrease,
	handleInitialResourceCount,
	handleOneResourceCountDecrease
} = require('../../utils/handleCourseCountUpdate');
import { isEmpty, isEqual } from 'lodash';

/**
 * Resource Upload Model
 * =============
 */

const Resource = new keystone.List('Resource', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

const s3Storage = getS3Storage('resources');
const localStorage = getLocalStorage('resources');
const storage = isProd ? s3Storage : localStorage;
const fileUrl = isProd ? urlConfig.s3Url : '/uploads/resources/';

Resource.add({
	name: { type: String, required: true, note: 'Required' },
	description: {
		type: Types.Html,
		wysiwyg: true,
		height: 800,
		label: '资源描述',
		note: 'Required'
	},
	type: {
		type: Types.Select,
		required: true,
		initial: 'Other',
		options: Object.values(RESOURCE_TYPE),
		label: 'Resource Type'
	},
	filetype: {
		type: Types.Select,
		initial: 'Other',
		options: Object.values(FILE_TYPE),
		label: 'Upload File Type'
	},
	uploadResource: {
		type: Types.File,
		storage: storage,
		ref: 'Only Support zip and pdf. Max-size: 4mb'
	},
	resourceLink: {
		type: String,
		ref: 'Resource Link or upload resouce directly'
	},
	uploadedAt: { type: Date, default: Date.now },
	thumbnailURL: { type: String },
	thumbnail: {
		type: Types.CloudinaryImage,
		select: false,
		autoCleanup: true
	},
	user: { type: Types.Relationship, ref: 'User' },
	tutor: { type: Types.Relationship, ref: 'Tutor' },
	teacher: { type: Types.Relationship, ref: 'Teacher' },
	requestTimes: { type: Types.Number, default: 0, noedit: true },
	unlockTimes: { type: Types.Number, default: 0, noedit: true },
	university: { type: Types.Relationship, ref: 'University' },
	course: { type: Types.Relationship, ref: 'Course' },
	program: { type: Types.Relationship, ref: 'Program' },
	note: { type: String },
	isPublic: { type: Boolean, initial: true },
	key: { type: String },
	previewKey: { type: String },
	topNote: { type: Types.Relationship, ref: 'Note' },
	jobApplication: { type: Types.Relationship, ref: 'JobApplication' },
	dayoff: { type: Types.Relationship, ref: 'DayOff' },
	pinned: { type: Types.Boolean, default: false, label: 'LMS首页置顶' }
});

/**
 * pre hook is a mongoose middleware, as a plugin for KeystoneJS Lists
/* view more on https://keystonejs.com/documentation/database/#lists-plugins
/* and https://mongoosejs.com/docs/middleware.html
*/
Resource.schema.pre('save', async function(next) {
	const { filename } = this.uploadResource;
	// When there is an uploaded file, resource link is not allowed to be deleted manually
	if (filename !== null && this.resourceLink === '') {
		this.resourceLink = fileUrl + filename;
	}
	// before saving data to MangoDB, check whether a file is uploaded, changed, or removed
	// for "Upload Resource", then alter the value of "Resource Link" as per change
	if (this.isModified('uploadResource')) {
		if (filename !== null) {
			this.resourceLink = fileUrl + filename;
		} else {
			this.resourceLink = null;
		}
	}
	const resource = await Resource.model.findById(this._id);
	if (
		!isEmpty(resource) &&
		!isEmpty(resource._doc.course) &&
		this.course !== resource._doc.course
	) {
		Course.model.findById(resource._doc.course).exec((err, course) => {
			handleOneResourceCountDecrease(Course, course, null, logger);
		});
	}
	// If the pdf resource is not those in the 'information excluded type' or TopNote,
	// then get the first 2 pages for preview after save.
	if (
		!INFORMATION_EXCLUDED_RESOURCE_TYPE.includes(this.type) &&
		!isEqual(this.type, RESOURCE_TYPE.NOTE) &&
		isEqual(this.filetype, FILE_TYPE.pdf) &&
		isEmpty(this.previewKey)
	) {
		const payload = {
			bucketName: isProd
				? S3_BUCKET_NAME.JRACADEMY
				: S3_BUCKET_NAME.JRRESOURCE,
			objectKey: this.key,
			fileName: this.name,
			pageSize: 2
		};
		const response = await axios.post(LAMBDA_URL.SPLIT_PDF, payload);
		if (response.status === 200) {
			this.previewKey = response.data.key;
		}
	}
	if (
		!this.thumbnail.exists &&
		this.key &&
		(isEqual(this.type, RESOURCE_TYPE.RESUME) || isEqual(this.type, RESOURCE_TYPE.COVER_LETTER)) &&
		isEqual(this.filetype, FILE_TYPE.pdf)
	) {
		const payload = {
			bucketName: isProd ? 'jracademy' : 'jrresource',
			objectKey: this.key,
			width: 240,
			height: 135
		};
		const item = await axios.post(
			LAMBDA_URL.GENERATE_PDF_THUMBNAIL,
			payload
		);
		if (item.status === 200) {
			const result = await cloudinary.uploader.upload(
				`data:image/png;base64,${item.data}`
			);
			this.thumbnail = result;
		}
	}
	next();
});

/**
 * After saving a Resource if this resource refers a course, then need to judge how to update this course resource count
 * if there is no a resourceCount initial value, set initial values.
 * if there is a resourceCount initial value, then plus one.
 */
Resource.schema.post('save', async function() {
	const Resource = keystone.list('Resource');
	if (this.course) {
		Course.model.findById(this.course).exec((err, course) => {
			if (err) return logger.error(err);
			if (course) {
				if (
					!course._doc.resourceCount &&
					course._doc.resourceCount !== 0
				) {
					//last two parameters are (res and logger), it is optional parameters
					handleInitialResourceCount(
						Resource,
						Course,
						course,
						null,
						logger
					);
				} else {
					//last two parameters are (res and logger), it is optional parameters
					handleOneResourceCountIncrease(
						Course,
						course,
						null,
						logger
					);
				}
			}
		});
	}
});
/**
 * After deleting a Resource if this resource refers a course, then need to judge how to update this course resource count
 * if there is no a resourceCount initial value, set initial values.
 * if there is a resourceCount initial value, then minus one.
 */
Resource.schema.post('remove', function() {
	const Resource = keystone.list('Resource');
	if (this.course) {
		Course.model.findById(this.course).exec((err, course) => {
			if (err) return logger.error(err);
			if (course) {
				if (
					!course._doc.resourceCount &&
					course._doc.resourceCount !== 0
				) {
					//last two parameters are (res and logger), it is optional parameters
					handleInitialResourceCount(
						Resource,
						Course,
						course,
						null,
						logger
					);
				} else {
					//last two parameters are (res and logger), it is optional parameters
					handleOneResourceCountDecrease(
						Course,
						course,
						null,
						logger
					);
				}
			}
		});
	}
});

Resource.defaultColumns = 'name, university, type, isPublic, requestTimes';

Resource.register();
