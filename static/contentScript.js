/**
 * The bike share website, sadly, has no pagination
 * As you navigate, it can only display a max of 50 items
 * Therefore we need to crawl custom date ranges and aggregate your historical bike rides. Once done they are saved to indexDb (locally)
 * The simplest way to 'reliably' get all your rides is to simply assume a time window where < 50 rides are likely (unless you are Lance Armstrong or something).
 * Lets say you use the service each day, to and from somewhere like work. In 15 days that's 30 rides.
 * The 20 remaining are what I call "discretionary" rides,
 * which should probably meet average use and then some.
 * So our window is going to be 15 days incrementing all the way back from today (for the first run).
 * According to https://en.wikipedia.org/wiki/Bike_Share_Toronto the service launched in 2011
 * so the crawl will stop around that time.
 * Subsequent crawls are relative to last crawl date (much faster I imagine)
 */

const BASE_URL = 'https://members.bikesharetoronto.com/trips';

const parseDateForApi = (d) => {
	// api loves the mm-dd-yyyy format
	const formatter = new Intl.DateTimeFormat('en-US', {
		month: '2-digit',
		day: '2-digit',
		year: 'numeric'
	});
	return formatter.format(d).toString().replaceAll('/', '-');
};

const fetchHistoricalRides = async () => {
	const today = new Date();
	console.log('Collecting historical bike rides');
	const customPeriodResponse = await fetch(
		// date format is dd-mm-yyyy
		`${BASE_URL}?period=custom&date%5Bstart%5D=04-01-2023&date%5Bend%5D=${parseDateForApi(today)}`
	);

	const customPeriodBodyText = await customPeriodResponse.text();

	// parse the html text so we can run dom methods on it
	const dp = new DOMParser();
	const parsedBody = dp.parseFromString(customPeriodBodyText, 'text/html');
	// TODO: this is, obviously, volatile as the site could change
	let allBikeRidesInPeriod = [];
	parsedBody.querySelectorAll('.col.w-col.w-col-6.w-col-stack').forEach((br) => {
		const startTime = br.querySelector('.start-date .text-small')?.textContent?.trim();
		const duration = br.querySelector('.duration .text-small')?.textContent?.trim();
		const endTime = br.querySelector('.end-date .text-small')?.textContent?.trim();
		const startStation = br
			.querySelector('.start-station-name-block .text-large')
			?.textContent?.trim();
		const endStation = br.querySelector('.end-station-name-block .text-large')?.textContent?.trim();
		/** ~shudders~ */
		const bikeID = br.querySelector('.start-station-name-block .text-small')?.textContent?.trim();

		// this is all the possible info that can be gleaned from the page
		allBikeRidesInPeriod.push({
			startTime,
			duration,
			endTime,
			startStation,
			endStation,
			bikeID
		});
	});

	chrome.storage.local.set({ allBikeRidesInPeriod });

	console.log(allBikeRidesInPeriod);
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(sender.tab ? 'from a content script:' + sender.tab.url : 'from the extension');
	if (request.greeting === 'hello') sendResponse({ farewell: 'goodbye' });
});
