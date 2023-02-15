import {
	last,
	isEmpty
} from 'lodash';
import { s3 } from './aws';
import { PUBLIC_IMAGE_BUCKET } from './constants';
const cheerio = require('cheerio');
const cloudinary = require('cloudinary').v2;

/**
 * remove cloudinary images by comparing the old version and new version of a post content
 * @param {string} postContent the ole version of a post content
 * @param {string} updatedPostContent the updated version of a post content
 */

export const removeCloudinaryImagesByPost = async (postContent = '', updatedPostContent = '') => {
	const contentImageIdList = getImagePublicIdFromContent(postContent);
	if (!isEmpty(contentImageIdList)) {
		const updatedContentImageIdList = getImagePublicIdFromContent(updatedPostContent);
		const partitionImageIdList = contentImageIdList.filter(id => !updatedContentImageIdList.includes(id));
		if (!isEmpty(partitionImageIdList)) {
			for (const imageId of partitionImageIdList) {
				if (imageId) {
					await cloudinary.uploader.destroy(imageId);
				}
			}
		}
	}
};

/**
 * remove s3 images by comparing the old version and new version of a post content
 * @param {string} postContent the ole version of a post content
 * @param {string} updatedPostContent the updated version of a post content
 */

export const removeS3ImagesByPost = async (postContent = '', updatedPostContent = '') => {
	const contentImageIdList = getS3ImageKeyFromContent(postContent);
	if (!isEmpty(contentImageIdList)) {
		const updatedContentImageIdList = getS3ImageKeyFromContent(updatedPostContent);
		const partitionImageIdList = contentImageIdList.filter(key => !updatedContentImageIdList.includes(key));
		if (!isEmpty(partitionImageIdList)) {
			for (const imageKey of partitionImageIdList) {
				if (imageKey) {
					const params = {
						Bucket: PUBLIC_IMAGE_BUCKET,
						Key: imageKey
					};
					// check object existence
					await s3.getObject(params).promise();
					// delete object
					await s3.deleteObject(params).promise();
				}
			}
		}
	}
};

/**
 * Get cloudinary image public id list from a post content
 * @param {string} content a post html content
 * @returns the cloudinary image public id array
 */

export const getImagePublicIdFromContent = (content = '') => {
	const imageIdList = [];
	const $ = cheerio.load(`<div>${content || ''}</div>`);
	const imgElements = $('img');
	imgElements.each((index, element) => {
		const url = element?.attribs?.src?.includes('cloudinary') && element.attribs.src;
		// get public id of cloudinary image from url
		if (url) {
			const imageName = last(url.split('/'));
			const public_id = imageName.substring(0, imageName.lastIndexOf('.'));
			if (public_id) {
				imageIdList.push(public_id);
			}
		}
	});
	return imageIdList;
};

/**
 * Get s3 image key list from a post content
 * @param {string} content a post html content
 * @param {string} filterKeyWords keyword to filter images src from content
 * @returns the s3 image key array
 */

export const getS3ImageKeyFromContent = (content = '', filterKeyWords = 'jr-image') => {
	const imageIdList = [];
	const $ = cheerio.load(`<div>${content || ''}</div>`);
	const imgElements = $('img');
	imgElements.each((index, element) => {
		const url = element?.attribs?.src?.includes(filterKeyWords) && element.attribs.src;
		// get key of s3 image from url
		if (url) {
			const imageKey = last(url.split('/'));
			if (imageKey) {
				imageIdList.push(imageKey);
			}
		}
	});
	return imageIdList;
};