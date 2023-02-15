const keystone = require('keystone');
const Types = keystone.Field.Types;

const ShoppingCart = new keystone.List('ShoppingCart', {
	autokey: {
		path: 'slug',
		from: 'cartId',
		unique: true
	},
	defaultSort: '-updatedAt',
	track: true
});

ShoppingCart.add({
	cartId: { type: String, noedit: true },
	user: {
		type: Types.Relationship,
		ref: 'User'
	},
	shoppingCart: { type: Types.Relationship, ref: 'Cart', many: true },
	key: { type: String, noedit: true }
});

function generateID() {
	const date = Date.now().toString();
	return 'CART' + date.slice(-6);
}

ShoppingCart.schema.pre('save', function(next) {
	if (!this.cartId) this.cartId = generateID();
	if (!this.key) this.key = generateID();
	next();
});

ShoppingCart.defaultColumns = 'user, updatedAt';
ShoppingCart.register();
