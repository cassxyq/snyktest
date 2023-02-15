import { ENVIRONMENT, isProd } from './constants';
const urlConfig = require('./../config/url-config.json');
import { STATISTICS_ENROLLMENT_AMOUNT, USER_PREFERENCE_GATEWAY_ID } from '../config/lambda-config';

//lambda function URL
const generateLambdaUrl = (
	isProd,
	prodGatewayId,
	uatGatewayId,
	prodEndPoint,
	uatEndPoint
) => {
	const prodLambdaUrl = `https://${prodGatewayId}.execute-api.ap-southeast-2.amazonaws.com/prod/`;
	const uatLambdaUrl = `https://${uatGatewayId}.execute-api.ap-southeast-2.amazonaws.com/uat/`;
	return isProd ? prodLambdaUrl + prodEndPoint : uatLambdaUrl + uatEndPoint;
};

export const LAMBDA_URL = {
	//method: POST; param: bucketName: string, objectKey: string, width: number, height: number
	GENERATE_PDF_THUMBNAIL: generateLambdaUrl(
		isProd,
		'5vq4c1eydd',
		'gdhosb9m1i',
		'createPdfThumbnail',
		'uat_createPDFThumbnail'
	),
	//method: POST; param: content: string, pageSize: string
	CREATE_PDF: generateLambdaUrl(
		isProd,
		'5vq4c1eydd',
		'gdhosb9m1i',
		'createPdf',
		'uat_createPDF'
	),
	//method: POST; param: bucketName: string, objectKey: string, fileName: string, pageSize: number
	SPLIT_PDF: generateLambdaUrl(
		isProd,
		'5vq4c1eydd',
		'gdhosb9m1i',
		'splitPdf',
		'uat_splitPDF'
	),
	//method: POST; param: bucketName: string, objectKey: string, fileName: string, userName: string, email: string
	CREATE_WATERMARKED_PDF: generateLambdaUrl(
		isProd,
		'5vq4c1eydd',
		'gdhosb9m1i',
		'createWatermarkedPdf',
		'uat_createWatermarketdPDF'
	),
	//method: POST; param: email: string, verificationCode: string, expireTime: number
	//method: GET; route param: email: string
	//method: PUT; route param:: email: string, params: verificationCode: string, expireTime: number
	VERIFICATION_CODE: generateLambdaUrl(
		isProd,
		'ldtaxsffwg',
		'bwxkaf7fti',
		'verification-code',
		'verification-code'
	),
	/** method: GET;
	 * @param  tableName: string
	 */
	GET_TRAININGS_COUNT: generateLambdaUrl(
		isProd,
		STATISTICS_ENROLLMENT_AMOUNT.GATEWAY_PROD,
		STATISTICS_ENROLLMENT_AMOUNT.GATEWAY_UAT,
		STATISTICS_ENROLLMENT_AMOUNT.GET_TRAININGS_COUNT_PROD,
		STATISTICS_ENROLLMENT_AMOUNT.GET_TRAININGS_COUNT_UAT,
	),

	/** method: PUT;
	 * @param  payload: object
	 */
	INCREASE_TRAININGS_COUNT: generateLambdaUrl(
		isProd,
		STATISTICS_ENROLLMENT_AMOUNT.GATEWAY_PROD,
		STATISTICS_ENROLLMENT_AMOUNT.GATEWAY_UAT,
		STATISTICS_ENROLLMENT_AMOUNT.ENDPOINT_INCREMENT_PROD,
		STATISTICS_ENROLLMENT_AMOUNT.ENDPOINT_INCREMENT_UAT,
	),

	/** method: DELETE;
	 * @param  payload: object
	 */
	DECREASE_TRAININGS_COUNT: generateLambdaUrl(
		isProd,
		STATISTICS_ENROLLMENT_AMOUNT.GATEWAY_PROD,
		STATISTICS_ENROLLMENT_AMOUNT.GATEWAY_UAT,
		STATISTICS_ENROLLMENT_AMOUNT.ENDPOINT_DECREMENT_PROD,
		STATISTICS_ENROLLMENT_AMOUNT.ENDPOINT_DECREMENT_UAT,
	)
};

export const getUserPreferenceLambdaUrl = (endpoint) => generateLambdaUrl(
	isProd,
	USER_PREFERENCE_GATEWAY_ID.PROD,
	USER_PREFERENCE_GATEWAY_ID.UAT,
	endpoint,
	endpoint,
);

//predicted dashboard base url for information center resource detail
export const DASHBOARD_INFO_CENTRE_RESOURCE_DETAIL_BASE_URL = () => {
	switch (process.env.NODE_ENV) {
		case ENVIRONMENT.PRODUCTION:
			return 'https://learn.jiangren.com.au/home?tab=resource&infoType=resource';
		case ENVIRONMENT.UAT:
			return 'http://uat-learn.jiangren.com.au/home?tab=resource&infoType=resource';
		case ENVIRONMENT.DEVELOPMENT:
		default:
			return 'http://localhost:8000/home?tab=resource&infoType=resource';
	}
};

export const directFromKeystoneToLms = origin => {
	const urlMap = {
		'jiangren.com.au': 'https://learn.jiangren.com.au',
		'www.jiangren.com.au': 'https://learn.jiangren.com.au',
		'uat.jiangren.com.au': 'http://uat-learn.jiangren.com.au',
		'localhost:3000': 'http://localhost:8000'
	};
	return urlMap[origin];
};

export const getCurrentUrlByEnv = () => {
	switch (process.env.NODE_ENV) {
		case ENVIRONMENT.PRODUCTION:
			return urlConfig.jrDashProd;
		case ENVIRONMENT.UAT:
			return urlConfig.jrDashUat;
		default:
			return urlConfig.jrDashDev;
	}
};

export const getJobpinUrlByEnv = () => {
	switch (process.env.NODE_ENV) {
		case ENVIRONMENT.PRODUCTION:
			return urlConfig.jobpinProd;
		case ENVIRONMENT.UAT:
			return urlConfig.jobpinUat;
		default:
			return urlConfig.jrDashDev;
	}
};
