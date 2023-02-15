import { EMAIL_SERVICE_SQS_URL } from './constants';

const generateMailParams = (
	templateValue,
	toValue,
	htmlValue,
	paramsValue,
	message,
	subject
) => {
	return {
		DelaySeconds: 10,
		MessageAttributes: {
			template: {
				DataType: 'String',
				StringValue: templateValue
			},
			to: {
				DataType: 'String',
				StringValue: toValue
			},
			html: {
				DataType: 'String',
				StringValue: htmlValue
			},
			params: {
				DataType: 'String',
				StringValue: paramsValue
			},
			...subject ? {
				subject: {
					DataType: 'String',
					StringValue: subject
				}
			} : {}
		},
		MessageBody: message,
		QueueUrl: EMAIL_SERVICE_SQS_URL
	};
};

export default generateMailParams;
