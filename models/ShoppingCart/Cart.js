const keystone = require('keystone');
const Types = keystone.Field.Types;
import { logger } from '../../utils/logger';

const Cart = new keystone.List('Cart');

Cart.add({
	productName: { type: String },
	price: { type: Number },
	promoPrice: { type: Number },
	productId: { type: String },
	orderType: { type: String },
	thumbnailURL: { type: String },
	commenceDate: { type: String },
	completeDate: { type: String },
	lecturers: { type: String },
	totalLength: { type: Number },
	page: { type: Number },
	selectedUniversity: { type: String },
	courseCode: { type: String },
	workshopType: { type: String },
	user: { type: String }
});

Cart.schema.post('save', async function() {
	const ShoppingCart = keystone.list('ShoppingCart');

	ShoppingCart.model
		.findOne({ user: this.user })
		.update({
			$push: {
				shoppingCart: this._id
			},
			updatedAt: Date.now()
		})
		.exec(err => logger.error(err));
});

Cart.register();
