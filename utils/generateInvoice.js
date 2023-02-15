import axios from 'axios';
import taxInvoice from '../templates/invoices/taxInvoice';
import { LAMBDA_URL } from './urls';

/**
 * @description return a invoice pdf in base64
 * @param {object} invoiceInfo invoice info
 * @param {string} invoiceInfo.name user full name
 * @param {string} invoiceInfo.email user email
 * @param {string} invoiceInfo.invoiceNo invoice No
 * @param {string} invoiceInfo.date invoice issued date
 * @param {string} invoiceInfo.dueDate invoice due date
 * @param {string} invoiceInfo.product product name
 * @param {number} invoiceInfo.price tax before price
 * @param {number} [invoiceInfo.transactionFeeRate] rate of transaction fee, optional
 */

export default async invoiceInfos => {
	const invoice = taxInvoice(invoiceInfos);
	const payload = {
		content: invoice,
		pageSize: 'A4'
	};
	const invoicePdfContent = await axios.post(LAMBDA_URL.CREATE_PDF, payload);
	return invoicePdfContent?.data
		? Buffer.from(invoicePdfContent.data, 'base64').toString('base64')
		: '';
};
