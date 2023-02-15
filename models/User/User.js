const keystone = require('keystone');
const Types = keystone.Field.Types;
const rolesConfig = require('../../config/roles-config');
const { logger } = require('../../utils/logger');
const Student = keystone.list('Student');
const Teacher = keystone.list('Teacher');
const Tutor = keystone.list('Tutor');
const Enrollment = keystone.list('Enrollment');
const CourseSelection = keystone.list('CourseSelection');
const Resume = keystone.list('Resume');
const Education = keystone.list('Education');
const Certification = keystone.list('Certification');
const ProfessionalExperience = keystone.list('ProfessionalExperience');
const ExtracurricularActivity = keystone.list('ExtracurricularActivity');
const ProjectExperience = keystone.list('ProjectExperience');
const PersonalSummary = keystone.list('PersonalSummary');
const { generateId } = require('../../utils/generateId');

import dayjs from 'dayjs';
import {
	STUDENT_ROLE,
	TEACHER_ROLE,
	TUTOR_ROLE,
	USER_VISA_TYPE,
	USER_SOURCE,
	positionAsStaff,
	JOB_TYPE,
	USER_DEGREE_TYPE,
	JOBPIN_ROLE
} from '../../utils/constants';

/**
 * User Model
 * ==========
 */
const User = new keystone.List('User');

User.add(
	{
		name: { type: Types.Name, required: true, index: true },
		weChatOpenId: { type: String, initial: true, index: true },
		jrCalendarOpenId: { type: String, initial: true, index: true },
		weChatUnionId: { type: String, initial: true, index: true },
		weChatEventKey: { type: Types.Number },
		oneTimeToken: { type: String },
		isDisableWechat: { type: Types.Boolean, label: '是否为弃用微信' },
		source: {
			type: Types.Select,
			options: Object.values(USER_SOURCE),
			note: '用户注册的前端'
		},
		email: {
			type: Types.Email,
			initial: true,
			index: true
		},
		backupEmail: { type: Types.Email },
		securityQuestion: { type: String },
		team: {
			type: Types.Relationship,
			ref: 'StudyTeam',
			label: 'study team'
		},
		teamTask: {
			allocatedTasks: { type: String },
			compeletionOfTasks: { type: String },
			taskDescription: { type: Types.Textarea },
			performance: { type: String },
			needHelp: {
				type: Types.Boolean,
				default: false,
				label: '是否需要帮助'
			},
			helpPortion: { type: Types.Number }
		},
		isCaptain: {
			type: Types.Boolean,
			default: false,
			label: '是否为队长'
		},
		title: { type: String },
		inviter: {
			type: Types.Relationship,
			ref: 'User'
		},
		invitees: {
			type: Types.Relationship,
			ref: 'User',
			many: true
		},
		avatar: {
			type: Types.CloudinaryImage,
			autoCleanup: true,
			select: true,
			note: '头像大小最大200kb, width x height: 200px x 200px'
		},
		role: {
			type: Types.Select,
			options: rolesConfig.roles.map(role => role.name)
		},
		jobpinRole: {
			type: Types.Select,
			options: Object.values(JOBPIN_ROLE)
		},
		positionAsStaff: {
			type: Types.Select,
			options: Object.values(positionAsStaff),
			dependsOn: { role: ['staff'] }
		},
		jobTypeAsStaff: {
			type: Types.Select,
			options: Object.values(JOB_TYPE),
			dependsOn: { role: ['staff'] }
		},
		interviewQuestionsCount: {
			type: Number,
			default: 0
		},
		introduction: { type: Types.Textarea },
		password: { type: Types.Password, initial: true },
		passwordStrength: { type: String, noedit: true },
		resetPasswordKey: { type: String, hidden: true },
		priority: { type: Types.Number }
	},
	'Profile',
	{
		prefix: { type: String },
		phone: { type: String },
		wechat: { type: String },
		address: { type: String },
		gender: { type: Types.Select, options: 'male,female', default: 'male' },
		linkedinUrl: { type: String },
		city: { type: Types.Relationship, ref: 'City' },
		country: { type: String },
		major: { type: Types.Relationship, ref: 'Major' },
		university: { type: Types.Relationship, ref: 'University' },
		currentStatus: {
			type: Types.Select,
			options: '在读, 已毕业, 新生入学, 在职人士, 导师, 辅导老师',
			default: '在读'
		},
		registrationDate: { type: String },
		graduationDate: { type: String },
		currentYear: { type: String, default: dayjs().get('y') },
		currentTerm: { type: Types.Select, options: '0, 1,2,3', default: '0' },
		degree: {
			type: Types.Select,
			options: [...Object.values(USER_DEGREE_TYPE), '本科', '硕士', '博士']
		},
		jobStatus: {
			type: Types.Select,
			options: '正在求职,实习,已工作,跳槽,想换工作,提升技能,随便看看',
			default: '正在求职'
		},
		objective: { type: Types.Textarea, note: '求职意向' },
		jobTypePreference: {
			type: Types.Select,
			options: Object.values(JOB_TYPE),
		},
		interestedFields: { type: Types.TextArray }, //field link to 求职感兴趣的领域
		company: { type: String, label: '公司名称' },
		employer: {
			type: Types.Relationship,
			ref: 'Company',
			label: '公司',
			note: '选择公司'
		},
		position: { type: String },
		bio: { type: Types.Markdown },
		signature: { type: Types.Textarea },
		tags: { type: Types.TextArray, label: '亮点' },
		order: {
			type: Types.Relationship,
			ref: 'Order',
			many: true,
			noedit: true
		},
		msTenantId: { type: String },
		visa: {
			type: Types.Select,
			options: Object.values(USER_VISA_TYPE)
		},
		createdAt: { type: Date, default: Date.now },
		isFollowingJobpin: { type: Boolean, default: false },
		howHeardJobpin: { type: String },
		birthday: { type: Types.Datetime },
		visaNumber: { type: String },
		IDNumber: { type: String },
		TFN: { type: String },
		bankNumber: { type: String },
		emergencyContact: { type: String }
	},
	'For Student',
	{
		student: {
			type: Types.Relationship,
			ref: 'Student',
			dependsOn: {
				role: 'student'
			}
		},
		isTopStudent: {
			type: Types.Boolean,
			default: false,
			label: '是否为学霸'
		}
	},
	'For Tutor',
	{
		tutor: {
			type: Types.Relationship,
			ref: 'Tutor',
			dependsOn: {
				role: 'tutor'
			}
		}
	},
	'For Teacher',
	{
		teacher: {
			type: Types.Relationship,
			ref: 'Teacher',
			dependsOn: {
				role: 'teacher'
			}
		}
	},
	'For Referrer',
	{
		isReferrer: { type: Boolean, label: '是否为内推官', default: false },
		applicationCount: {
			type: Types.Number,
			default: 0,
			dependsOn: {
				isReferrer: true
			}
		},
		referrerEmail: {
			type: Types.Email,
			dependsOn: {
				isReferrer: true
			}
		},
		referrerCompanies: {
			type: Types.Relationship,
			ref: 'Company',
			many: true,
			dependsOn: {
				isReferrer: true
			}
		},
		timeBecameReferrer: {
			type: Types.Date,
			label: 'Time Became Referrer',
			dependsOn: {
				isReferrer: true
			}
		}
	},
	'Notification',
	{
		enableEmailNotification: {
			type: Boolean,
			default: true
		}
	},
	'Permissions',
	{
		isAdmin: {
			type: Boolean,
			label: 'Can access Keystone(不要选)',
			index: true
		},
		isVerified: {
			type: Boolean,
			label: 'Has a verified email address',
			initial: false
		},
		isCompleted: {
			type: Boolean,
			initial: false,
			label: '用户自我更新信息(不要选)'
		} // when profile filled , isCompleted would be true
	},
	'As Job Applicant',
	{
		applicantDetail: {
			firstName: { type: String },
			lastName: { type: String },
			prefix: { type: String },
			phoneNumber: { type: String },
			email: { type: Types.Email }
		}
	},
	'Employment Information',
	{
		usedAnnualLeave: {
			type: Number,
			dependsOn: { role: ['staff'] }
		},
		usedPersonalLeave: {
			type: Number,
			dependsOn: { role: ['staff'] }
		},
		usedUnpaidLeave: {
			type: Number,
			dependsOn: { role: ['staff'] }
		}
	}
);

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

User.schema.pre('validate', async function (next) {
	this.wasNew = this.isNew;
	const currentUser = this;
	const {
		role,
		avatar,
		title,
		city,
		weChat,
		_id: userId,
		phone: mobile,
		linkedinUrl
	} = this;
	const name = `${this.name.first} ${this.name.last}`;
	switch (role) {
		case STUDENT_ROLE:
			Student.model.findOne({ user: userId }, function (err, student) {
				if (err) {
					logger.error(err);
					return;
				}
				if (student) {
					if (!currentUser.student) currentUser.student = student._id;
					student.name = name;
					student.save(err => {
						if (err) {
							logger.error(err);
							return;
						}
						next();
					});
				} else {
					const studentId = 'S' + generateId();
					const newStudent = new Student.model({
						user: userId,
						studentId,
						name
					});
					newStudent.save().then((newStudent, err) => {
						if (err) {
							logger.error(err);
							return;
						}
						currentUser.student = newStudent._id;
						next();
					});
				}
			});
			break;
		case TUTOR_ROLE:
			const tutorId = this.tutor;
			const existedTutor = await Tutor.model.findById(tutorId);
			if (!tutorId || !existedTutor) {
				Tutor.model.findOne({ user: userId }, function (err, tutor) {
					if (err) {
						logger.error(err);
						return;
					}
					if (tutor) {
						currentUser.tutor = tutor._id;
						tutor.name = name;
						setValidValue(currentUser, tutor, [
							'title',
							'avatar',
							'city',
							'wechat',
							'phone'
						]);
						tutor.save(err => {
							if (err) {
								logger.error(err);
								return;
							}
							next();
						});
					} else {
						const tutorId = 'T' + generateId();
						const newTutor = new Tutor.model({
							user: userId,
							tutorId,
							name,
							avatar,
							title,
							city,
							weChat,
							mobile
						});
						newTutor.save().then((newTutor, err) => {
							if (err) {
								logger.error(err);
								return;
							}
							currentUser.tutor = newTutor._id;
							next();
						});
					}
				});
			} else {
				Tutor.model.findOne({ _id: tutorId }, function (err, tutor) {
					if (err) {
						logger.error(err);
						return;
					}
					if (tutor.user) tutor.user = userId;
					setValidValue(currentUser, tutor, [
						'title',
						'avatar',
						'city',
						'wechat',
						'phone'
					]);
					tutor.save(err => {
						if (err) {
							logger.error(err);
							return;
						}
						next();
					});
				});
			}
			break;
		case TEACHER_ROLE:
			const teacherId = this.teacher;
			const existedTeacher = await Teacher.model.findById(teacherId);
			if (!teacherId || !existedTeacher) {
				Teacher.model.findOne({ user: userId }, function (err, teacher) {
					if (err) {
						logger.error(err);
						return;
					}
					if (teacher) {
						currentUser.teacher = teacher._id;
						teacher.name = name;
						setValidValue(currentUser, teacher, [
							'title',
							'city',
							'linkedinUrl'
						]);
						teacher.save(err => {
							if (err) {
								logger.error(err);
								return;
							}
							next();
						});
					} else {
						const teacherId = 'T' + generateId();
						const newTeacher = new Teacher.model({
							user: userId,
							teacherId,
							name,
							title,
							city,
							linkedinUrl
						});
						newTeacher.save().then((newTeacher, err) => {
							if (err) {
								logger.error(err);
								return;
							}
							currentUser.teacher = newTeacher._id;
							next();
						});
					}
				});
			} else {
				Teacher.model.findOne({ _id: teacherId }, function (
					err,
					teacher
				) {
					if (err) {
						logger.error(err);
						return;
					}
					if (!teacher.user) teacher.user = userId;
					setValidValue(currentUser, teacher, [
						'title',
						'city',
						'linkedinUrl'
					]);
					teacher.save(err => {
						if (err) {
							logger.error(err);
							return;
						}
						next();
					});
				});
			}
			break;
		default:
			next();
			break;
	}
});

// Link to Enrollment
User.schema.post('save', async function () {
	const { _id: user, role } = this;
	const student = await Student.model.findOne({ user }).exec();
	if (role === STUDENT_ROLE && student) {
		const enrollment = await Enrollment.model.findOne({ user }).exec();
		if (enrollment) {
			if (!enrollment.studentId) {
				enrollment
					.update({
						$set: {
							studentId: student.studentId
						}
					})
					.exec(err => logger.error(err));
			}
		} else {
			const enrollmentData = { user, studentId: student.studentId };
			new Enrollment.model(enrollmentData).save(err => {
				if (err) logger.error(err);
			});
		}
	}
});

// Delete associate Student when user being deleted;
User.schema.post('remove', function () {
	const userId = this._id;
	if (this.role === STUDENT_ROLE) {
		Student.model.findOne({ user: userId }, function (err, student) {
			if (student) {
				student.remove(err => {
					if (err) logger.error(err);
				});
			}
		});
	}
	if (this.role === TEACHER_ROLE) {
		Teacher.model.findOne({ user: userId }, function (err, teacher) {
			if (teacher) {
				teacher.remove(err => {
					if (err) logger.error(err);
				});
			}
		});
	}
	if (this.role === TUTOR_ROLE) {
		Tutor.model.findOne({ user: userId }, function (err, tutor) {
			if (tutor) {
				tutor.remove(err => {
					if (err) logger.error(err);
				});
			}
		});
	}
	Enrollment.model.findOne({ user: userId }, function (err, enrollment) {
		if (enrollment) {
			enrollment.remove(err => {
				if (err) logger.error(err);
			});
		}
	});
	CourseSelection.model.remove({ user: userId }, function (err) {
		if (err) logger.error(err);
	});
	Resume.model.remove({ user: userId }, function (err) {
		if (err) logger.error(err);
	});
	Education.model.remove({ user: userId }, function (err) {
		if (err) logger.error(err);
	});
	Certification.model.remove({ user: userId }, function (err) {
		if (err) logger.error(err);
	});
	ProfessionalExperience.model.remove({ user: userId }, function (err) {
		if (err) logger.error(err);
	});
	ExtracurricularActivity.model.remove({ user: userId }, function (err) {
		if (err) logger.error(err);
	});
	ProjectExperience.model.remove({ user: userId }, function (err) {
		if (err) logger.error(err);
	});
	PersonalSummary.model.remove({ user: userId }, function (err) {
		if (err) logger.error(err);
	});
});

/**
 * Relationships
 */
User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });
User.relationship({ ref: 'Student', path: 'students', refPath: 'user' });
User.relationship({ ref: 'Teacher', path: 'teachers', refPath: 'user' });
User.relationship({ ref: 'Tutor', path: 'tutors', refPath: 'user' });
User.relationship({
	ref: 'JobInterviewQuestion',
	refPath: 'poster'
});
/**
 * Registration
 */
User.defaultColumns =
	'name, email, role, university, currentStatus, isAdmin, createdAt';
User.register();

//to set selected fields for both of user and teacher/tutor by a valid value
//If the value in the selected field in user and role(teacher/tutor) are different,
//to pick the valid value and update the field in both collections.
const setValidValue = (user, roleData, keysOfUser) => {
	keysOfUser.forEach(key => {
		let keyOfRole = '';
		//as the relative field name in user and totur are different
		//for example, "wechat" in user and "weChat" in tutor
		switch (key) {
			case 'wechat':
				keyOfRole = 'weChat';
				break;
			case 'phone':
				keyOfRole = 'mobile';
				break;
			default:
				keyOfRole = key;
				break;
		}

		//When a field of user has valid value, update the counterpart in role(teacher/tutor),
		//otherwise, update the field in user by the value in role(teacher/tutor).
		if (user[key] !== roleData[keyOfRole]) {
			if (
				(key === 'avatar' && user[key].url) ||
				(key !== 'avatar' && user[key])
			) {
				roleData[keyOfRole] = user[key];
			} else {
				if (roleData[keyOfRole]) {
					user[key] = roleData[keyOfRole];
				}
			}
		}
	});
};
