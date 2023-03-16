/**
 * The bike share website, sadly, has no pagination
 * As you navigate, it can only display a max of 50 items
 * Therefore we need to crawl custom date ranges and aggregate your historical bike rides. Once done they are saved to indexDb (locally)
 * The simplest way to 'reliably' get all your rides is to simply assume a time window where < 50 rides are likely (unless you are Lance Armstrong or something).
 * Lets say you use the service each day, to and from somewhere like work. In 15 days that's 30 rides.
 * The 20 remaining are what I call "discretionary" rides, which should probably meet
 * average use and then some.
 * So our window is going to be ~15 days (or, half the month, so february will have 14, or 14 and 15 if its a leap year), these windows are then used to query the custom period url
 */

const BASE_URL = 'https://members.bikesharetoronto.com/trips';

(async () => {
	console.log('async func');
	const res = await fetch(
		// date format is dd-mm-yyyy
		`${BASE_URL}?period=custom&date%5Bstart%5D=04-01-2023&date%5Bend%5D=16-03-2023`
	);

	const resBody = await res.text();

	// parse the html text so we can run dom methods on it
	const dp = new DOMParser();
	const parsedBody = dp.parseFromString(resBody, 'text/html');
	// TODO: this is, obviously, volatile as the site could change
	let allBikeRidesInPeriod = [];
	parsedBody.querySelectorAll('.col.w-col.w-col-6.w-col-stack').forEach((br) => {
		const startTime = br.querySelector('.start-date .text-small')?.textContent?.trim();
		const duration = br.querySelector('.duration .text-small')?.textContent?.trim();
		const endTime = br.querySelector('.end-date .text-small')?.textContent?.trim();

		allBikeRidesInPeriod.push({
			startTime,
			duration,
			endTime
		});
	});

	chrome.storage.local.set({ allBikeRidesInPeriod });

	console.log(allBikeRidesInPeriod);
})();

console.log('content script is running');
