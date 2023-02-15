const keystone = require('keystone');
const Types = keystone.Field.Types;
const { logger } = require('../../utils/logger');
const courseModel = keystone.list('Course');
const {
	calculateExistingPassRates,
	handleAddNewReview,
	handleDeleteReview
} = require('../../utils/handleCourseReview');

/**
 * Review Model
 * =============
 */

const Reviews = new keystone.List('Reviews', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true }
});

Reviews.add(
	{
		name: { type: String, required: false },
		priority: { type: Types.Number },
		user: { type: Types.Relationship, ref: 'User' },
		training: { type: Types.Relationship, ref: 'Training' },
		service: { type: Types.Relationship, ref: 'Service' },
		course: { type: Types.Relationship, ref: 'Course' },
		workshop: { type: Types.Relationship, ref: 'Workshop' },
		tutor: { type: Types.Relationship, ref: 'Tutor' },
		content: { type: Types.Textarea },
		isVerified: { type: Boolean, label: '是否审核成功' },
		// Used to determine whether isVerified is updated, not shown in Keystone UI
		isVerifiedUpdated: {
			type: Boolean,
			hidden: true
		},
		createdAt: { type: Date, default: Date.now },
		isAnonymous: { type: Boolean }
	},
	'课程打分',
	{
		score: { type: Types.Number },
		difficulty: {
			type: Types.Select,
			options: '1,2,3,4,5'
		},
		nutrition: {
			type: Types.Select,
			options: '1,2,3,4,5'
		},
		pressure: {
			type: Types.Select,
			options: '1,3,5',
			default: '3',
			note: '通过率'
		},
		teacherRating: {
			type: Types.Select,
			options: '1,2,3,4,5'
		}
	}
);

/**
 * Create hook for mongoose to determine whether isVerified is updated before saving the review, used in schema.post.
 */
Reviews.schema.pre('save', function(next) {
	this.isVerifiedUpdated = this.isModified('isVerified') && this.isVerified;
	next();
});

/**
 * After saving a Review with isVerified being true, the passingRate of the related Course will be recalculated.
 */
Reviews.schema.post('save', async function() {
	if (this.isVerifiedUpdated && this.course && this.pressure) {
		let newPassingRate = '';
		let newNumberOfReviews = 0;
		await courseModel.model
			.findOne({ _id: this.course })
			.exec(async (err, course) => {
				if (err) return logger.error(err);
				if (course) {
					if (!course._doc.passingRate) {
						await reviewsModel.model
							.find({ course: this.course })
							.where('isVerified', true)
							.exec((err, reviews) => {
								if (logger) {
									logger.error(err);
								}
								if (reviews) {
									newPassingRate = calculateExistingPassRates(
										reviews
									);
									newNumberOfReviews = reviews.length;
								}
							});
					} else {
						newPassingRate = handleAddNewReview(
							course,
							this.pressure
						);
						newNumberOfReviews = course._doc.numberOfReviews + 1;
					}
					courseModel.model
						.findOneAndUpdate(
							{ _id: course._doc._id },
							{
								$set: {
									passingRate: newPassingRate,
									numberOfReviews: newNumberOfReviews
								}
							}
						)
						.exec(err => {
							if (err) {
								if (logger) {
									logger.error(err);
								}
							}
						});
				}
			});
	}
});

/**
 * After deleting a Review with isVerified being true, the passingRate of the related Course will be recalculated.
 */
Reviews.schema.post('remove', async function() {
	if (this.course) {
		await courseModel.model
			.findOne({ _id: this.course })
			.exec((err, course) => {
				if (err) return logger.error(err);
				if (course && this.isVerified) {
					const newPassingRate = handleDeleteReview(
						course,
						this.pressure
					);
					const newNumberOfReviews =
						course._doc.numberOfReviews - 1 > 0
							? course._doc.numberOfReviews - 1
							: 0;
					courseModel.model
						.findOneAndUpdate(
							{ _id: course._doc._id },
							{
								$set: {
									passingRate: newPassingRate,
									numberOfReviews: newNumberOfReviews
								}
							}
						)
						.exec(err => {
							if (err) {
								if (logger) {
									logger.error(err);
								}
							}
						});
				}
			});
	}
});

Reviews.defaultSort = '-createdAt';
Reviews.defaultColumns =
	'name|20%, user|10%, course|12%, score|8%, pressure, difficulty, teacherRating, isVerified|8%';
Reviews.register();

const reviewsModel = keystone.list('Reviews');
