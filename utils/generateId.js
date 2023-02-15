export function generateId() {
	const myDate = new Date();
	const year = (myDate.getFullYear() - 2000).toString();
	const month =
		myDate.getMonth() + 1 < 10
			? '0' + (myDate.getMonth() + 1)
			: '' + (myDate.getMonth() + 1);
	const stamp = myDate
		.getTime()
		.toString()
		.slice(-6);
	return year + month + stamp;
}
