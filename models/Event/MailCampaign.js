const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Mail campaign model
 * =============
 */

const MailCampaign = new keystone.List('MailCampaign', {
	autokey: { from: 'campaignId', path: 'key', unique: false },
	map: { name: 'campaignId' },
	defaultSort: '-createdAt'
});

MailCampaign.add({
	campaignId: { type: String, noedit: true },
	email: { type: Types.Email },
	createdAt: { type: Date, default: Date.now },
	targetResource: { type: String }
});

function generateID() {
	const date = Date.now().toString();
	return 'MAL' + date.slice(-6);
}

MailCampaign.schema.pre('save', function(next) {
	this.campaignId = generateID();
	this.wasNew = this.isNew;
	next();
});

MailCampaign.defaultSort = '-createdAt';
MailCampaign.defaultColumns = 'campaignId|15%, email, createdAt';
MailCampaign.register();
