export default function (e) {
	return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e)}`;
}
