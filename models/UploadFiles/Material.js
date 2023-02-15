const keystone = require('keystone');
const cloudinary = require('cloudinary').v2;
const { isEqual, isEmpty } = require('lodash');
import axios from 'axios';
const Types = keystone.Field.Types;
const urlConfig = require('../../config/url-config.json');
const { getS3Storage, getLocalStorage } = require('../../utils/storage');
const { MATERIAL_TYPE, FILE_TYPE, isProd } = require('../../utils/constants');
const { LAMBDA_URL } = require('../../utils/urls');
import { logger } from '../../utils/logger';

/**
 * File Upload Model
 * ===========
 */

const Material = new keystone.List('Material', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

const s3Storage = getS3Storage('materials');
const localStorage = getLocalStorage('materials');
const storage = isProd ? s3Storage : localStorage;
const fileUrl = isProd ? urlConfig.s3UrlMaterials : '/uploads/materials/';

Material.add({
	name: { type: String, required: true, note: 'Required' },
	description: { type: String },
	type: {
		type: Types.Select,
		options: Object.values(MATERIAL_TYPE),
		label: 'Material Type'
	},
	filetype: {
		type: Types.Select,
		initial: 'Other',
		options: Object.values(FILE_TYPE),
		label: 'Upload File Type'
	},
	key: { type: String },
	thumbnail: {
		type: Types.CloudinaryImage,
		select: false,
		autoCleanup: true
	},
	uploadMaterial: {
		type: Types.File,
		storage: storage,
		allowedTypes: ['pdf', 'docx', 'gzip', 'zip', 'ppt'],
		ref: 'Only Support zip docx ppt and pdf.'
	},
	uploadedAt: { type: Date, default: Date.now },
	user: { type: Types.Relationship, ref: 'User' },
	url: {
		type: String,
		ref: 'Material Link or upload material directly'
	},
	workshop: { type: Types.Relationship, ref: 'Workshop' },
	program: { type: Types.Relationship, ref: 'Program', many: true },
	training: { type: Types.Relationship, ref: 'Training', many: true },
	course: { type: Types.Relationship, ref: 'Course' },
	lesson: { type: Types.Relationship, ref: 'Lesson' },
	class: { type: Types.Relationship, ref: 'Class' },
	assignment: { type: Types.Relationship, ref: 'Assignment', many: true },
	note: { type: String },
	comment: { type: String },
	score: { type: Number },
	isPublic: { type: Boolean, initial: false },
	isLink: { type: Boolean },
	topNote: { type: Types.Relationship, ref: 'Note' },
	lessonNote: { type: Types.Relationship, ref: 'LessonNote' },
	jobInterview: { type: Types.Relationship, ref: 'JobInterview' },
	tag: { type: Types.TextArray, ref: 'tag' }
});

Material.defaultColumns = 'name, type, key, lesson';

Material.schema.pre('save', async function(next) {
	if (
		!this.thumbnail.exists &&
		this.key &&
		isEqual(this.type, MATERIAL_TYPE.PPT) &&
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

Material.schema.post('save', async function() {
	if (
		this.topNote &&
		this.key &&
		isEqual(this.type, MATERIAL_TYPE.NOTE) &&
		isEqual(this.filetype, FILE_TYPE.pdf)
	) {
		const Note = keystone.list('Note');
		const note = await Note.model.findOne({ _id: this.topNote });
		if (isEmpty(note.resource)) {
			const payload = {
				bucketName: isProd ? 'jracademy' : 'jrresource',
				objectKey: this.key,
				fileName: this.name,
				pageSize: 2
			};
			const item = await axios.post(LAMBDA_URL.SPLIT_PDF, payload);
			if (item.status === 200) {
				const body = {
					name: this.name,
					type: this.type,
					filetype: this.filetype,
					user: this.user,
					key: item.data.key,
					topNote: this.topNote
				};
				const Resource = keystone.list('Resource');
				const newResource = await new Resource.model(body).save(err =>
					logger.error(err)
				);
				if (newResource._id) {
					Note.model
						.findOneAndUpdate(
							{ _id: this.topNote },
							{ $set: { resource: newResource._id } }
						)
						.exec(err => logger.error(err));
				}
			}
		}
	}
});

Material.register();
