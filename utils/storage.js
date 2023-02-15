const keystone = require('keystone');

export const getS3Storage = category => {
	return new keystone.Storage({
		adapter: require('keystone-storage-adapter-s3'),
		s3: {
			key: process.env.S3_KEY, // required; defaults to process.env.S3_KEY
			secret: process.env.S3_SECRET, // required; defaults to process.env.S3_SECRET
			bucket: 'jracademy', // required; defaults to process.env.S3_BUCKET
			region: 'ap-southeast-2', // optional; defaults to process.env.S3_REGION, or if that's not specified, us-east-1
			path: `/${category}`, // optional; defaults to "/"
			uploadParams: {
				// optional; add S3 upload params; see below for details
				ACL: 'public-read'
			},
			generateFilename: file => {
				const ext = file.originalname.slice(
					file.originalname.lastIndexOf('.') + 1
				);
				const hash = file.filename;
				return `${hash}.${ext}`;
			}
		},
		schema: {
			bucket: true, // optional; store the bucket the file was uploaded to in your db
			etag: true, // optional; store the etag for the file
			path: true, // optional; store the path of the file in your db
			url: true // optional; generate & store a public URL
		}
	});
};

export const getLocalStorage = category => {
	return new keystone.Storage({
		adapter: keystone.Storage.Adapters.FS,
		fs: {
			path: keystone.expandPath(`./public/uploads/${category}`),
			publicPath: `/public/uploads/${category}/`,
			generateFilename: file => {
				const ext = file.originalname.slice(
					file.originalname.lastIndexOf('.') + 1
				);
				const hash = file.filename;
				return `${hash}.${ext}`;
			}
		}
	});
};
