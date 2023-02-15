import { SOCKET_NAMESPACE } from './constants';

const keystone = require('keystone');
const config = require('../config/auth-config');
const jwt = require('jsonwebtoken');

export default function () {
	const io = keystone.get('io');
	if (!io) return;
	// Setting Socket.io middleware for all namespaces
	for(const namespace of Object.values(SOCKET_NAMESPACE)) {
		// Authentication
		io.of(`/${namespace}`).use((socket, next) => {
			const token = socket.handshake.auth.token;
			if (!token) {
				next(new Error("invalid token"));
			}

			jwt.verify(token, config.TOKEN_SECRET, (err, decoded) => {
				if (err) {
					next(new Error("invalid authorization token"));
				}
				socket.user = decoded;
				next();
			});
		});
	};
}
