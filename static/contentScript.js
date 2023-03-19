/**
 * The bike share website, sadly, has no pagination
 * As you navigate, it can only display a max of 50 items
 * Therefore we need to crawl custom date ranges and aggregate your historical bike rides. Once done they are saved to indexDb (locally)
 * The simplest way to 'reliably' get all your rides is to simply assume a time window where < 50 rides are likely (unless you are Lance Armstrong or an Uber Eats Gig Worker..).
 * Lets say you use the service each day as a typical user, to and from work. In 15 days that's 30 rides.
 * The 20 remaining are what I call "discretionary" rides,
 * which should probably meet average use and then some.
 * So our window is going to be 15 days incrementing all the way back from today (for the first run).
 * According to https://en.wikipedia.org/wiki/Bike_Share_Toronto the service launched in 2011
 * so the crawl will stop around that time.
 * Subsequent crawls are relative to last crawl date (no need to keep crawling historical data)
 */

const BASE_URL = 'https://members.bikesharetoronto.com/trips';
const BIKE_SHARE_ESTABLISHED_DATE = new Date('January 1, 2011');

const crawlBikeRideHtml = (htmlToCrawl) => {
	let rides = [];
	// parse the html text so we can run dom methods on it
	const dp = new DOMParser();
	const parsedBody = dp.parseFromString(htmlToCrawl, 'text/html');
	// TODO: this is, obviously, volatile as the site could change
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
		rides.push({
			startTime,
			duration,
			endTime,
			startStation,
			endStation,
			bikeID
		});
	});
	return rides;
};

const parseDateForApi = (d) => {
	// api loves the dd-mm-yyyy format, jolly good!
	const formatter = new Intl.DateTimeFormat('en-GB', {
		month: '2-digit',
		day: '2-digit',
		year: 'numeric'
	});
	return formatter.format(d).toString().replaceAll('/', '-');
};

const fetchCustomPeriodForBikeRides = async ({ startDate, todaysDate }) => {
	// only comparing dates here as that is what api cares about (not times)
	startDate.setHours(0, 0, 0);
	todaysDate.setHours(0, 0, 0);
	if (startDate.getTime() > todaysDate.getTime()) {
		// impossible condition
		return null;
	}
	if (startDate.toString() === todaysDate.toString()) {
		return fetch(`${BASE_URL}?period=today`);
	} else {
		return fetch(
			// date format is dd-mm-yyyy
			`${BASE_URL}?period=custom&date%5Bstart%5D=${parseDateForApi(
				startDate
			)}&date%5Bend%5D=${parseDateForApi(todaysDate)}`
		);
	}
};

const fetchHistoricalRides = async () => {
	//debugger;
	console.log('Collecting historical bike rides');
	// debugger;

	const { allBikeRidesInPeriod: storedAllBikeRidesInPeriod = [] } = await chrome.storage.local.get(
		'allBikeRidesInPeriod'
	);

	console.log('bike rides already stored in chrome.storage.local', storedAllBikeRidesInPeriod);

	const lastStoredItem = storedAllBikeRidesInPeriod?.length > 0 && storedAllBikeRidesInPeriod[0];
	console.log('last stored bike ride, ', lastStoredItem);
	// either we start at the very beginning (if you are running this for first time), or start at where you last left off
	const startDate = lastStoredItem?.endTime
		? new Date(lastStoredItem.endTime)
		: BIKE_SHARE_ESTABLISHED_DATE;
	const todaysDate = new Date();

	// Calculate the number of milliseconds between the start date and today's date
	const millisecondsElapsed = Math.abs(todaysDate - startDate);
	// get days elapsed but divide by 15 since we are moving in 15 day increments in our loop
	const fortnightsElapsed = Math.ceil(millisecondsElapsed / (1000 * 60 * 60 * 24) / 15);

	let allBikeRidesInPeriod = [];
	// Loop through the weeks since start and create start and end dates for each
	for (let i = 0; i < fortnightsElapsed; i++) {
		// Calculate the start and end dates for this increment
		const localStartDate = new Date();
		localStartDate.setDate(localStartDate.getDate() - (i + 1) * 15);
		const localEndDate = new Date();
		localEndDate.setDate(localEndDate.getDate() - i * 15);

		const customPeriodResponse = await fetchCustomPeriodForBikeRides({
			startDate: localStartDate,
			todaysDate: localEndDate
		});

		if (customPeriodResponse) {
			console.log('Crawling', localStartDate, localEndDate);
			const customPeriodBodyText = await customPeriodResponse?.text();
			// TODO: we also need to dedupe this in case you had more bike rides on the same "last ridden date"
			const crawledData = crawlBikeRideHtml(customPeriodBodyText);
			if (crawledData.length > 0) {
				allBikeRidesInPeriod = [...crawledData.reverse()];
			}
		}
	}

	await chrome.storage.local.set({
		allBikeRidesInPeriod: [...allBikeRidesInPeriod, ...storedAllBikeRidesInPeriod]
	});

	return {
		itemsDownloaded: allBikeRidesInPeriod?.length
	};
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	const shouldStartDownoad = msg.startDownload;

	if (shouldStartDownoad) {
		fetchHistoricalRides().then(({ itemsDownloaded }) => {
			sendResponse({
				complete: true,
				results: {
					itemsDownloaded
				}
			});
		});

		// return true from the event listener to indicate you wish to send a response asynchronously
		// (this will keep the message channel open to the other end until sendResponse is called).
		return true;
	}
});
