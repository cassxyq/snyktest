import { INFORMATION_TYPE } from './constants';

/**
 * @description return aggregate configuration of job interview for information center
 * @param {boolean} isInformationCenterAPI whether get data from information center API
 */

export const getJobInterviewAggregateConfig = (
	isInformationCenterAPI = false
) => {
	const companyLookupConfig = [
		{
			$lookup: {
				from: 'companies',
				localField: 'company',
				foreignField: '_id',
				as: 'company'
			}
		},
		{
			$unwind: {
				path: '$company',
				preserveNullAndEmptyArrays: true
			}
		}
	];
	const config = [
		{
			$lookup: {
				from: 'users',
				localField: 'user',
				foreignField: '_id',
				as: 'author'
			}
		},
		{
			$unwind: {
				path: '$author',
				preserveNullAndEmptyArrays: true
			}
		},
		{
			$lookup: {
				from: 'materials',
				localField: 'materials',
				foreignField: '_id',
				as: 'materials'
			}
		},
		{
			$addFields: {
				infoType: INFORMATION_TYPE.JOB_INTERVIEW,
				author: {
					$cond: {
						if: {
							$eq: ['$isAnonymous', false]
						},
						then: '$author.name',
						else: null
					}
				},
				authorAvatarURL: {
					$cond: {
						if: {
							$eq: ['$isAnonymous', false]
						},
						then: '$author.avatar.secure_url',
						else: null
					}
				},
				authorID: '$author._id',
				companyId: '$company._id',
				companySlug: '$company.slug',
				companyName: {
					$ifNull: ['$companyName', '$company.name']
				},
				thumbnailURL: '$company.logo.secure_url',
				wordCount: '$wordCount',
				meta: '$meta'
			}
		},
		{
			$project: {
				company: false,
				user: false
			}
		}
	];
	if (!isInformationCenterAPI) return [...companyLookupConfig, ...config];
	return config;
};

/**
 * @description return aggregate configuration of job for information center
 * @param {boolean} isInformationCenterAPI whether get data from information center API
 */

export const getJobAggregateConfig = (isInformationCenterAPI = false) => {
	const companyLookupConfig = [
		{
			$lookup: {
				from: 'companies',
				localField: 'company',
				foreignField: '_id',
				as: 'company'
			}
		},
		{
			$unwind: {
				path: '$company',
				preserveNullAndEmptyArrays: true
			}
		}
	];
	const config = [
		{
			$project: {
				_id: 1,
				title: 1,
				infoType: 'job',
				pinned: {
					$ifNull: ['$pinned', false]
				},
				publishedDate: 1,
				thumbnailURL: '$company.logo.secure_url',
				city: 1,
				country: 1,
				jobFeatures: 1,
				jobType: 1,
				level: 1,
				salary: 1,
				description: '$job.description',
				requirement: '$job.requirement',
				companyId: '$company._id',
				companyName: {
					$cond: [
						{
							$ifNull: ['$company.name', false]
						},
						'$company.name',
						'$job.companyName'
					]
				},
				companyDescription: {
					$cond: [
						{
							$ifNull: ['$company.description', false]
						},
						'$company.description',
						'$job.companyDescription'
					]
				},
				companyAddress: '$job.address',
				companyWebsite: '$company.website',
				categories: 1,
				apply: 1,
				applyMethod: 1,
				tag: 1,
				meta: 1,
				referral: 1
			}
		}
	];
	if (!isInformationCenterAPI) return [...companyLookupConfig, ...config];
	return config;
};
