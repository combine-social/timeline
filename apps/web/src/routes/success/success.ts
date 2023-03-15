export function openInstanceURL() {
	const urlParams = new URLSearchParams(window.location.search);
	const username = urlParams.get('username');
	const instance = username?.split('@')?.pop();
	document.location.href = `https://${instance}/home`;
}
