import htmlPdf from 'html-pdf';

export function htmlToPdfBuffer(html, opt = {}) {
	return new Promise((resolve, reject) => {
		htmlPdf.create(html, opt).toBuffer((err, buffer) => {
			if (err) {
				reject(err);
			} else {
				resolve(buffer);
			}
		});
	});
}
