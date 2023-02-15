import { DAY_OFF_TYPE, DAY_OFF_STATUS } from '../../client/utils/constants';
const keystone = require('keystone');
const Types = keystone.Field.Types;
const DayOff = new keystone.List('DayOff', {
	map: { name: 'leaveId' },
	autokey: { from: 'leaveId', path: 'slug', unique: true, sortable: true },
	defaultSort: '-createdAt',
	track: true
});

DayOff.add(
	'Basic Information',
	{
		user: { type: Types.Relationship, ref: 'User', label: '请假人' },
		leaveType: {
			type: Types.Select,
			options: Object.values(DAY_OFF_TYPE),
			label: '请假类型'
		},
		leaveReason: { type: String, label: '请假原因' },
		status: {
			type: Types.Select,
			options: Object.values(DAY_OFF_STATUS),
			default: `${DAY_OFF_STATUS.PENDING}`
		},
		city: { type: Types.Relationship, ref: 'City' },
		attachment: { type: Types.Relationship, ref: 'Resource', many: true }
	},
	'Leave period',
	{
		period: {
			start: {
				type: Types.Datetime,
				default: Date.now,
				label: '请假开始时间'
			},
			end: {
				type: Types.Datetime,
				default: Date.now,
				label: '请假结束时间'
			}
		},
		dayoffLength: { type: Number, label: '请假时长（小时）' },
		rejectedReason: { type: String, label: '驳回原因' }
	}
);
DayOff.defaultColumns =
	'leaveId, user, leaveType, leaveReason, status, createdAt, period';
DayOff.register();
