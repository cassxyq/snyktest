//Wechat QRcode status
export const QRCODE_STATUS = {
	WAITTING_SCAN: 'waitting_scan',
	SUBSCRIBED: 'subscribed',
	HAS_BOUND: 'has_bound',
	OPENID_BEEN_TAKEN: 'openid_been_taken',
	BINDING_SUCCESS: 'binding_success',
	ERROR: 'error'
};

//Wechat message type
export const MESSAGE_TYPE = {
	EVENT: 'event'
};

//Wechat event type
export const EVENT_TYPE = {
	SUBSCRIBE: 'subscribe',
	UNSUBSCRIBE: 'unsubscribe',
	SCAN: 'SCAN'
};

export const QRSCENE_KEY = {
	LOGIN: 'login',
	BIND: 'bind'
};

//Wechat auto reply
export const MESSAGE_CONTENT = {
	WELCOME: `Hi 小伙伴，眼光不错，你已经成功关注澳洲匠人学院官方服务号~
	欢迎关注我们匠人其他的公众号：澳洲IT圈，UQ课代表，UNSW课代表，墨大课代表，USYD课代表，阿德课代表。如果遇到问题可以加微信 jracademy5`,
	SCAN: '扫码成功'
};

//Wechat menu
export const BUTTON = {
	NAME: {
		LMS_LOGIN: '匠人课堂',
		LMS_REGISTER: '匠人学院官网'
	},
	TYPE: {
		VIEW: 'view',
		CLICK: 'click',
		MINI_PROGRAM: 'miniprogram'
	},
	URL: {
		LMS_LOGIN: 'https://learn.jiangren.com.au',
		LMS_REGISTER: 'https://jiangren.com.au'
	}
};
