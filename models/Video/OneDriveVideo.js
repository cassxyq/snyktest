const keystone = require('keystone');
const cloudinary = require('cloudinary').v2;
const { isEmpty } = require('lodash');
const { MS_ACCOUNT } = require('../../utils/constants');
const Types = keystone.Field.Types;

/**
 * One Drive Video Model
 * ===========
 */

const OneDriveVideo = new keystone.List('OneDriveVideo', {
	autokey: { from: 'name', path: 'slug', unique: true }
});

OneDriveVideo.add({
	name: {
		type: String,
		required: true,
		note: 'Required',
		default: 'OneDriveVideo'
	},
	msAccount: {
		type: Types.Select,
		options: Object.values(MS_ACCOUNT),
		label: 'Microsoft账号',
	},
	videoId: { type: String, note: 'The video file ID at one drive' },
	thumbnail: {
		type: Types.CloudinaryImage,
		autoCleanup: true,
		select: true
	},
	duration: { type: String, note: '单位：秒' },
	recordingStartDateTime: { type: Date, default: Date.now },
	recordingEndDateTime: { type: Date, default: Date.now },
	createdAt: { type: Date, default: Date.now }
});

OneDriveVideo.schema.post('remove', async function() {
	if (this.thumbnail?.public_id) {
		try {
			//Delete thumbnail from Cloudinary
			await cloudinary.uploader.destroy(this.thumbnail.public_id);
		} catch (error) {
			throw Error('Delete thumbnail failed.');
		}
	}
});

OneDriveVideo.defaultColumns = 'name, duration|10%, recordingStartDateTime, createdAt';

OneDriveVideo.register();
