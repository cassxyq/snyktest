const keystone = require('keystone');
const Types = keystone.Field.Types;
import { JOB_TYPE } from '../../utils/constants';

const Employment = new keystone.List('Employment', {
	autokey: { from: 'name', path: 'slug', unique: true, sortable: true },
	track: true
});

Employment.add('Employment Information', {
	commencementDate: {
		type: Types.Datetime,
		default: Date.now(),
		label: '合同起始日期'
	},
	endDate: {
		type: Types.Datetime,
		label: '合同结束日期',
		required: false
	},
	jobType: {
		type: Types.Select,
		options: Object.values(JOB_TYPE),
		default: JOB_TYPE.FULL_TIME,
		required: true
	},
	user: {
		type: Types.Relationship,
		ref: 'User',
		index: true,
		label: 'User ID'
	},
	workingDay: {
		type: String
	}
});

Employment.register();

