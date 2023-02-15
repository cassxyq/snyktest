import {
	MS_ACCOUNT
} from './constants';
import {
	msalConfig,
	tokenRequest
} from '../config/msGraph-config';

const msal = require('@azure/msal-node');

export const AAD_USER_ID = Object.fromEntries(
	new Map(
		Object.entries(MS_ACCOUNT).map(
			([key, value]) => ([value, process.env[`AAD_USER_ID_${key}`]])
		)
	)
);

export const getGraphAccessToken = async () => {
	// In dev env, AAD_APP_CLIENT_SECRET needs be set at .env manually
	if (process.env.AAD_APP_CLIENT_SECRET) {
		const cca = new msal.ConfidentialClientApplication(msalConfig);
		const authResponse = await cca.acquireTokenByClientCredential(
			tokenRequest
		);
		return authResponse?.accessToken;
	} else {
		return '';
	}
};
