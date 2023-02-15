import dayjs from 'dayjs';

// env
export const ENVIRONMENT = {
	PRODUCTION: 'production',
	UAT: 'uat',
	DEVELOPMENT: 'development'
};

// S3 Bucket Name
export const S3_BUCKET_NAME = {
	JRACADEMY: 'jracademy', //use in prod env
	JRRESOURCE: 'jrresource' //use in dev and uat env
};

export const PUBLIC_IMAGE_BUCKET = isProd ? 'jr-image' : 'jr-image-uat';

// isProd env
export const isProd = process.env.NODE_ENV === ENVIRONMENT.PRODUCTION;

// isUat env
export const isUat = process.env.NODE_ENV === ENVIRONMENT.UAT;

// open-lecture
export const STATE_ACTIVE = 'active';
export const TYPE_OPENLECTURE = '公开课';

// role
export const STUDENT_ROLE = 'student';
export const TEACHER_ROLE = 'teacher';
export const TUTOR_ROLE = 'tutor';
export const STAFF_ROLE = 'staff';
export const JOBPIN_ROLE = {
	SEEKER: 'seeker',
	EMPLOYER: 'employer'
};
export const TEACHER_ROLE_OPTIONS = {
	INSTRUCTOR: 'instructor',
	TUTOR: 'tutor'
};

// Position as staff
export const positionAsStaff = {
	HUMAN_RESOURCE: 'human resource',
	MARKETING_SPECIALIST: 'marketing specialist',
	SALES_SPECIALIST: 'sales specialist',
	OPERATION: 'operation'
};

//Job Type
export const JOB_TYPE = {
	INTERN: 'Intern',
	PART_TIME: 'Part-time',
	FULL_TIME: 'Full-time',
	CONTRACT: 'Contract',
	CASUAL: 'Casual'
};

//Salary Range
export const ANNUAL_SALARY_RANGE = {
	RANGE_ONE: '$0 - $50,000',
	RANGE_TWO: '$50,000 - $60,000',
	RANGE_THREE: '$60,000 - $70,000',
	RANGE_FOUR: '$70,000 - $80,000',
	RANGE_FIVE: '$80,000 - $100,000',
	RANGE_SIX: '$100,000 - $120,000',
	RANGE_SEVEN: '$120,000 - $150,000',
	RANGE_EIGHT: '$150,000 - $200,000',
	RANGE_NINE: '$200,000 - $250,000',
	RANGE_TEN: '$250,000+ '
};

export const HOURLY_SALARY_RANGE = {
	RANGE_ONE: '$0 - $20',
	RANGE_TWO: '$20 - $30',
	RANGE_THREE: '$30 - $40',
	RANGE_FOUR: '$40 - $50',
	RANGE_FIVE: '$50 - $60',
	RANGE_SIX: '$60 - $80',
	RANGE_SEVEN: '$80 - $100',
	RANGE_EIGHT: '$100 - $150',
	RANGE_NINE: '$150+'
};

// training feature
export const RECOMMEND_FEATURE = 'recommend';
export const TRAINING = 'training';

// workshop api
export const WORKSHOP_STATUS = {
	ACTIVE: 'active',
	PAST: 'past',
	SCHEDULED: 'scheduled',
	UNAPPROVED: 'unapproved'
};

export const AVAILABLE = 'available';

// resource type
export const RESOURCE_TYPE = {
	SYLLABUS: 'syllabus', //课程大纲
	EBOOK: 'ebook', // 课程电子书
	SUMMARY: 'summary', //课程笔记
	UNIVERSITY_COURSE: 'university_course', //大学课程的公开资料
	EXAM: 'exam', //考试相关资料
	RESUME: 'resume', //Teacher 简历
	TEACHER: 'teacher', //Teacher Onboading资料
	TUTOR: 'tutor', //Tutor Onboarding资料
	TRANSCRIPT: 'transcript',
	NOTE: 'topNote',
	RESUME_TEMPLATE: 'resume_template', //简历模板
	INTERVIEW_QUESTIONS: 'interview_questions', //面试真题
	DAYOFF: 'dayoff_attachment',
	COVER_LETTER: 'cover_letter',
	OTHER: 'other'
};

// resource type in chinese
export const RESOURCE_TYPE_CHINESE = {
	EBOOK: '电子书',
	SUMMARY: '课程笔记',
	UNIVERSITY_COURSE: '课程资料',
	EXAM: '备考资料',
	NOTE: '学霸笔记',
	RESUME_TEMPLATE: '简历模板',
	INTERVIEW_QUESTIONS: '面试真题'
};

// resource file type in chinese
export const RESOURCE_FILE_TYPE_CHINESE = {
	doc: 'WORD文档',
	docx: 'WORD文档',
	pdf: 'PDF文件',
	xzip: 'ZIP压缩文件',
	xrar: 'RAR压缩文件',
	ppt: 'PPT文件',
	pptx: 'PPT文件',
	jpg: 'JPG图片',
	png: 'PNG图片',
	mp4: 'MP4视频',
	mp3: 'MP3音频',
	m4a: 'M4A音频',
	rar: 'RAR压缩文件',
	zip: 'ZIP压缩文件',
	undefined: '未知'
};

// material type
export const MATERIAL_TYPE = {
	SYLLABUS: 'syllabus', //课程大纲
	ASSIGNMENT: 'assignment', //Assignemnt要求（导师用）
	ASSIGNMENT_SUBMISSION: 'submission', //Assignemnt提交 （学生用）
	PPT: 'PPT', //某个lesson的PPT资料 (both workshop & program)
	UNIVERSITY_WORKSHOP: 'university_workshop', //辅导班资料
	SUMMARY: 'summary', //学习笔记
	EXAM: 'exam', //考试相关资料
	LESSON_RELATED_MATERIAL: 'related', //某个lesson的相关资料 (both workshop & program)
	GLOBAL_COURSE_MATERIAL: 'global_course_material', //全局资料
	VIDEO: 'video',
	OTHER: 'other',
	NOTE: 'topNote',
	FEEDBACK: 'feedback',
	JOB_INTERVIEW: 'jobInterview', //面试机经附件
	LESSON_NOTE: 'lessonNote' //随堂笔记文档资料
};

// file type
export const FILE_TYPE = {
	doc: 'application/msword',
	docx:
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	pdf: 'application/pdf',
	xzip: 'application/x-zip-compressed',
	xrar: 'application/x-rar-compressed',
	ppt: 'application/vnd.ms-powerpoint',
	pptx:
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	jpg: 'image/jpeg',
	png: 'image/png',
	mp4: 'video/mp4',
	mp3: 'audio/mpeg',
	m4a: 'audio/m4a',
	rar: 'application/x-rar',
	zip: 'application/zip'
};

//video recommend place
export const VIDEO_RECOMMEND_PLACE = {
	DEFAULT: 'default',
	COURSE_INTRODUCTION: 'course_introduction',
	HOMEPAGE: 'homepage',
	RECOMMEND: 'recommend',
	TRAINING: 'training',
	CAREER: 'career',
	TUTORIAL: 'tutorial',
	COURSE_ENROLLMENT_GUIDANCE: 'course_enrollment_guidance'
};

//video recommend place
export const VIDEO_TYPE = {
	INTERVIEW: 'interview', // 学员采访视频分类；展示在学员采访位置
	COURSE_ENROLLMENT_GUIDANCE: 'course_enrollment_guidance',
	SKILLS: 'skills',
	GENERAL: 'general',
	DEMO: 'demo'
};
// video category for homepage
export const VIDEO_CATEGORY = {
	INTERVIEW_GUIDANCE: '面试',
	CAREER_DEVELOPMENT: '职业',
	JOB_GUIDANCE: '就业',
	AUSSIE_LIFE: '生活'
};
//program status
export const STATUS = {
	ONGOING: 'ongoing',
	INCOMING: 'incoming'
};

//learning method
export const LEARNING_METHOD = {
	ONLINE: 'online',
	OFFLINE: 'offline'
};

//incoming programs type
export const INCOMING_TYPE = {
	SHORT: 'short'
};

//order type
export const ORDER_TYPE = {
	GENERAL: 'General',
	WORKSHOP: 'Workshop',
	TRAINING: 'Training',
	CAREER: 'Career',
	VIDEO: 'Video',
	NOTE: 'Note',
	INTERNSHIP: 'Internship',
	SUBSCRIPTION: 'Subscription'
};

export const PAY_METHOD = {
	ROYAL_PAY: 'royalpay',
	PAYPAL: 'paypal',
	STRIPE: 'stripe',
	WECHAT: 'wechat',
	ALIPAY: 'alipay',
	VISA: 'visa',
	APPLE_PAY: 'applePay',
	FACE_TO_FACE: '当面付款',
	BANK_TRANSFER: '银行转账',
	CUSTOMER_SERVICE: '客服付款'
};

export const ORDER_STATUS = {
	UNPAID: 'unpaid',
	PAID: 'paid',
	PENDING: 'pending',
	ACTIVE: 'active',
	CANCELLED: 'cancelled',
	INVALID: 'invalid', // 作废的订单
	REJECTED: 'rejected'
};

export const WORKSHOP_TYPE = {
	LIVESTREAM: 'livestream', // Live Bootcamp
	VIDEO: 'video' // Online Video Workshop, no deadline and commence date
};

export const WORKSHOP_TYPE_CN = {
	LIVESTREAM: '直播互动',
	VIDEO: '视频课程'
};

export const WORKSHOP_CLASSTYPE = {
	PRECISION: { name: 'precision', chName: '精讲班' },
	EXAM: { name: 'exam', chName: '考试冲刺班' },
	ASSIGNMENT: { name: 'assignment', chName: '作业无忧班' },
	OPEN_LECTURE: { name: 'open_lecture', chName: '免费公开课' },
	REVIEW_STRATEGY: { name: 'review_strategy', chName: '复习攻略' },
	INTENSIVE: { name: 'intensive', chName: '护航班' }
};

export const TRAINING_LEVEL = {
	ENTRY: '零基础',
	JUNIOR: '初级',
	INTERMEDIATE: '中级',
	INTERMEDIATE_ADVANCE: '中级进阶',
	ADVANCED: '高级'
};

export const TRAINING_LEVEL_EN = {
	ENTRY: 'entry',
	JUNIOR: 'junior',
	INTERMEDIATE: 'intermediate',
	INTERMEDIATE_ADVANCE: 'intermediateAdvance',
	ADVANCED: 'advance'
};

export const TRAINING_TYPE = {
	TRAINING: 'training', // Live Bootcamp
	VIDEO: 'video', // Online Video Training, no deadline and commence date
	INTERNSHIP: 'internship', //实习 项目集训
	MOCK: 'mock', // Mock Interview
	CAREER: 'career' // Career Coaching
};

export const TRAINING_TYPE_CN = {
	training: '集训b营',
	video: '视频课程',
	mock: '模拟面试',
	career: '1v1私教',
	internship: '项目实习'
};

export const TEACHING_TYPE = {
	TRAINING: {
		label: 'training',
		value: '直播互动'
	},
	VIDEO: {
		label: 'video',
		value: '视频课程'
	},
	INTERNSHIP: {
		label: 'internship',
		value: '项目实习'
	}
};

export const TRAINING_ARRANGEMENT_TAGS = {
	COURSE_CONTENT: '课程内容',
	PROJECT: '实战项目',
	LEARN_DIRECTION: '学习方向',
	COURSE_DURATION: '课程有效期'
};

export const TRAINING_SORT_OPTIONS = {
	DEFAULT: 'default',
	ENROLLMENT: 'enrollment'
};

export const LINK_TYPE = {
	ASSESSMENT: 'assessment', // 课程测试
	GENERAL: 'general' // 一般链接
};

//Post status
export const POST_STATUS = {
	DRAFT: 'draft',
	PUBLISHED: 'published'
};

//Note type
export const NOTE_TYPE = {
	CLASS: 'class', // 学习攻略
	JOB: 'job' // 求职攻略
};

//Note years
const now = dayjs().format('YYYY');
export const NOTE_YEARS = [
	now,
	(Number(now) - 1).toString(),
	(Number(now) - 2).toString()
];

//cache key
export const CACHE_KEY = {
	UNIVERSITY_WORKSHOPS: 'university_workshops',
	UNIVERSITY_VIDEOS: 'university_videos',
	UNIVERSITY_ENROLLMENT_GUIDANCES: 'university_enrollment_guidances'
};

// consultation type
export const CONSULTATION_TYPE = {
	MENTOR: 'mentor',
	MOCK_INTERVIEW: 'mockInterview',
	RESUME: 'resume'
};

// consultation status
export const CONSULTATION_STATUS = {
	BOOKED: 'booked',
	FAILED: 'failed',
	FINISHED: 'finished',
	CANCELLED: 'cancelled'
};

// information tab type
export const INFORMATION_TAB_TYPE = {
	RECOMMENDATION: 'recommendation',
	UNIVERSITY: 'university',
	JOB: 'job',
	JOB_INTERVIEW: 'jobInterview',
	SKILL: 'skill',
	JOB_SEEKING_TRAINING: 'jobSeekingTraining', //求职课
	RESOURCE: 'resource',
	SEARCH: 'search'
};

// information data type
export const INFORMATION_TYPE = {
	JOB: 'job',
	JOB_INTERVIEW: 'jobInterview',
	POST: 'post',
	VIDEO: 'video',
	RESOURCE: 'resource'
};

// information excluded resource type
export const INFORMATION_EXCLUDED_RESOURCE_TYPE = [
	'syllabus', //课程大纲
	'resume', //Teacher 简历
	'teacher', //Teacher Onboading资料
	'tutor', //Tutor Onboarding资料
	'transcript',
	'other'
];

//Resource Unlock Type
export const RESOURCE_UNLOCK_TYPE = {
	COURSE_RESOURCE: 'course',
	RESOURCE: 'resource'
};

//lesson duration
export const LESSON_DURATION = [60, 90, 120, 150, 180, 240];

export const LESSON_TYPE = {
	LESSON: 'Lesson',
	TUTORIAL: 'Tutorial',
	QUIZ: 'Quiz',
	VIDEO: 'Video',
	OFFLINE: 'Offline',
	WORKSHOP: 'Workshop',
	INFORMATION: 'Information'
};

export const Job_Features = {
	INTERNAL_REFERENCE: '工作内推'
};

//Filter key of training list
export const TRAINING_FILTER_KEYS = {
	CAREER_PATHS: 'careerPaths',
	LEVEL: 'level',
	TYPE: 'type'
};

export const WORKSHOP_FILTER_KEYS = {
	TYPE: 'serviceType',
	CLASS_TYPE: 'type'
};
export const UNIVERSITY_LIST_DEFAULT = 'University of Queensland';

// sensitive information
export const SENSITIVE_INFO = [
	'name',
	'lastname',
	'firstname',
	'email',
	'backupEmail',
	'referrerEmail',
	'securityQuestion',
	'password',
	'resetPasswordKey',
	'phone',
	'wechat',
	'mobile',
	'address',
	'gender',
	'signature',
	'linkedinUrl',
	'githubUrl',
	'visa',
	'personalWebsite',
	'signatureDataUrl'
];
export const OBJECT_SENSITIVE_INFO = [
	'projectExperience',
	'personalSummary',
	'referee',
	'professionalExperience',
	'education',
	'extracurricularActivity',
	'certification'
];
export const EMAIL_SERVICE_SQS_URL = isProd
	? 'https://sqs.ap-southeast-2.amazonaws.com/026559016816/prod-email-service-sqs'
	: 'https://sqs.ap-southeast-2.amazonaws.com/026559016816/uat-email-ervice-sqs';
export const EMAIL_SERVICE_TYPE = {
	REGISTRY: 'registry',
	PASSWORD_CH: 'password-CH',
	PASSWORD_EN: 'password-EN',
	RESOURCE: 'resource',
	SIGNATURE: 'signature',
	INVOICE_TO_CUSTOMER: 'invoiceToCustomer',
	ORDER_TO_CUSTOMER: 'orderToCustomer',
	ORDER_TO_SALES: 'orderToSales',
	QUOTE_TO_CUSTOMER: 'quoteToCustomer',
	QUOTE_TO_SALES: 'quoteToSales',
	SEND_COMMENTS: 'sendComments',
	CAREER_FAIR_REGISTRY: 'careerFairRegistry',
	JOB_REFERRAL_CONFIRMATION: 'jobReferralConfirmation',
	UNVERIFIED_LOGGING: 'unverifiedLogging',
	INTERVIEW_VERIFIED: 'interview-verified',
	INTERVIEW_DECLINED: 'interview-declined',
	JOB_APPLICATION_NOTIFICATION: 'job-application-notification',
	JOB_APPLICATION_CONFIRMATION: 'job-application-confirmation',
	MEETUP_ENROLLMENT_NOTIFICATION: 'meetup-enrollment-notification',
	CAREER_SPONSOR_NOTIFICATION: 'career-sponsor-notification',
	VERIFICATION_CODE: 'verification-code',
	PASSWORD_REISSUE: 'password-reissue',
	JOBPIN_JOB_APPLICATION_NOTIFICATION: 'jobpin-job-application-notification',
	LESSON_COMMENCEMENT_REMINDER: 'lesson-commencement-reminder'
};

export const INVOICE_VALID_DAYS = 3;

export const CDN = process.env.CDN || '';

export const COURSE_TIMETABLE_TYPE = {
	LECTURE: 'lecture',
	ASSIGNMENT: 'assignment',
	EXAM: 'exam'
};

export const TRIPLE_STATES = {
	UNSET: 'unset',
	TRUE: 'true',
	FALSE: 'false'
};

export const JOB_APPLICATION_STATUS = {
	INBOX: 'Inbox',
	SHORTLIST: 'Shortlist',
	INTERVIEW: 'Interview',
	OFFER: 'Offer',
	ACCEPT: 'Accept',
	NOT_SUITABLE: 'Not Suitable'
};

export const JR_CALENDAR = 'jrCalendar';

export const CONSTELLATION_OPTIONS = {
	ARIES: {
		label: '白羊座',
		value: 'aries'
	},
	TAURUS: {
		label: '金牛座',
		value: 'taurus'
	},
	GEMINI: {
		label: '双子座',
		value: 'gemini'
	},
	CANCER: {
		label: '巨蟹座',
		value: 'cancer'
	},
	LEO: {
		label: '狮子座',
		value: 'Leo'
	},
	VIRGO: {
		label: '处女座',
		value: 'virgo'
	},
	LIBRA: {
		label: '天秤座',
		value: 'libra'
	},
	SCORPIUS: {
		label: '天蝎座',
		value: 'scorpius'
	},
	SAGITTARIUS: {
		label: '射手座',
		value: 'sagittarius'
	},
	CAPRICORNUS: {
		label: '摩羯座',
		value: 'capricornus'
	},
	AQUARIUS: {
		label: '水瓶座',
		value: 'aquarius'
	},
	PISCES: {
		label: '双鱼座',
		value: 'pisces'
	}
};

export const PAGEANT_TYPE = {
	BELLE: {
		label: '校花',
		value: 'belle'
	},
	HUNK: {
		label: '校草',
		value: 'hunk'
	}
};

export const SPONSOR_VOUCHER_TYPE = {
	VOUCHER: {
		label: '抵用券',
		value: 'voucher'
	},
	DISCOUNT: {
		label: '折扣券',
		value: 'discount'
	}
};

export const EMAIL_CODE_VERIFICATION_STATUS = {
	EXPIRED: 'EXPIRED',
	INVALID: 'INVALID',
	VALID: 'VALID',
	FAILED: 'FAILED'
};

export const DAY_OFF_DEFAULT = {
	TYPE_ALL: 'all',
	STRING_ZERO: '0'
};

export const DAY_OFF_STATUS = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected',
	HISTORY: 'history'
};

export const DAY_OFF_UPDATE_STATUS = {
	SUCCESS: 'success',
	FAIL: 'fail',
	ERROR: 'error',
	NOT_FOUND: 'not found'
};

export const DAY_OFF_TYPES = {
	ANNUAL_LEAVE: 'Annual Leave',
	PERSONAL_LEAVE: 'Personal Leave',
	UNPAID_LEAVE: 'Unpaid Leave'
};

export const PROVIDER_TYPES = {
	STRIPE: {
		label: 'Stripe',
		value: 'stripe'
	},
	OTHER_PROVIDERS: {
		label: 'Other Providers',
		value: 'other providers'
	}
};

export const SUBSCRIPTION_APPLICATIONS = {
	JOBPIN: {
		label: 'Jobpin',
		value: 'jobpin'
	},
	SIGMA: {
		label: 'Sigma',
		value: 'sigma'
	},
	CAREER_FAIR: {
		label: 'Career Fair',
		value: 'career fair'
	},
	OTHER_APPLICATIONS: {
		label: 'Other Applications',
		value: 'other applications'
	}
};

export const STRIPE_EVENT_TYPES = {
	CHECKOUT_SESSION_COMPLETED: {
		label: 'Checkout Session Completed',
		value: 'checkout.session.completed'
	},
	INVOICE_PAID: {
		label: 'Invoice Paid',
		value: 'invoice.paid'
	},
	PAYMENT_INTENT_PAYMENT_FAILED: {
		label: 'Payment Intent Payment Failed',
		value: 'payment_intent.payment_failed'
	}
};

export const PLATFORMS = {
	JR_ACADEMY: {
		label: 'JR Academy',
		value: 'jr academy'
	},
	JOBPIN: {
		label: 'Jobpin',
		value: 'jobpin'
	}
};

export const SUBSCRIPTION_TYPES = {
	ONE_TIME: {
		label: 'One time',
		value: 'oneTime'
	},
	MONTHLY: {
		label: 'Monthly',
		value: 'monthly'
	},
	QUARTERLY: {
		label: 'Quarterly',
		value: 'quarterly'
	},
	ANNUALLY: {
		label: 'Annually',
		value: 'annually'
	}
};

export const SUBSCRIPTION_PRODUCT_STATUS = {
	ACTIVE: {
		label: 'Active',
		value: 'active'
	},
	INACTIVE: {
		label: 'Inactive',
		value: 'inactive'
	}
};

export const ACCRUAL_RATE = {
	ANNUAL_LEAVE: 13.05714,
	PERSONAL_LEAVE: 26.071428
};

export const DATE_FORMAT = {
	YYYY_MM_DD: 'YYYY-MM-DD'
};

export const EMPLOYMENT_FIELDS = {
	START_TIME: 'startTime',
	END_TIME: 'endTime',
	BREAK_START: 'breakStart',
	BREAK_END: 'breakEnd'
};

export const DAYJS_ERROR = {
	INVALID_DATE: 'Invalid Date'
};

export const USER_DEGREE_TYPE = {
	HIGH_SCHOOL: 'highSchool',
	ASSOCIATE: 'associate',
	BACHELOR: 'bachelor',
	MASTER: 'master',
	DOCTOR: 'doctor',
	OTHER: 'other'
};

export const USER_DEGREE_TRANSFORM_CONFIG = {
	[USER_DEGREE_TYPE.BACHELOR]: '本科',
	[USER_DEGREE_TYPE.MASTER]: '硕士',
	[USER_DEGREE_TYPE.DOCTOR]: '博士'
};

export const VISA_TYPE = {
	PR: 'Permanent Residency',
	CITIZEN: 'Citizen',
	OVERSEAS: 'Overseas',
	STUDENT_VISA: 'Student-visa',
	WORKING_VISA: 'Working-visa',
	WORKING_HOLIDAY: 'Working-holiday'
};

export const JOB_VISA_TYPE = {
	...VISA_TYPE,
	NO_LIMIT: 'No Limit'
};

export const USER_VISA_TYPE = {
	...VISA_TYPE,
	OTHER: 'Other'
};

export const CONDITION_TYPE = {
	TRUE_STR: 'true'
};

export const USER_SOURCE = {
	JOBPIN: 'jobpin',
	JR_ACADEMY: 'jrAcademy',
	JR_CALENDAR: 'jrCalendar'
};

export const SORT_TYPE = {
	TIME_ASC: 'ascending',
	TIME_DESC: 'descending',
	SORT_DEFAULT: 'default'
};

export const MS_ACCOUNT = {
	BUSINESS: 'business',
	MELBOURNE: 'melbourne',
	HELLO: 'hello',
	SYDNEY: 'sydney',
	CAREER: 'career',
	PRODUCT: 'product'
};

// Notification
export const NOTIFICATION_TYPE = {
	REMINDER: 'reminder'
};

export const NOTIFICATION_REMINDER_TYPE = {
	LESSON: 'lesson'
};

// Socket
export const SOCKET_NAMESPACE = {
	LEARN: 'learn'
	// add more namespaces
};

export const SOCKET_EVENT = {
	NOTIFICATION: 'notification'
	// add more events
};

// User preference
export const GET_USER_PREFERENCE_ENDPOINTS = {
	GET_LIKES_OR_ARCHIVED_LIST: 'getLikesOrArchivedList',
	GET_LIKES_QUANTITY: 'getLikesQuantity',
	GET_PREFERENCE_LIST: 'getPreferenceList'
};

export const UPDATE_USER_PREFERENCE_ENDPOINTS = {
	UPDATE_ONE_USER_PREFERENCE: 'updateOneUserPreference'
};
