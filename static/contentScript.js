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

const dateEqualCompare = (d1, d2) => {
	const normalizedD1 = new Date(d1);
	const normalizedD2 = new Date(d2);

	return normalizedD1.getTime() === normalizedD2.getTime();
};

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

const fetchCustomPeriodForBikeRides = async ({ startDate, endDate }) => {
	if (startDate.getTime() > endDate.getTime()) {
		// impossible condition
		console.error('start date is greater than end date!');
		return null;
	}
	return fetch(
		// date format is dd-mm-yyyy
		`${BASE_URL}?period=custom&date%5Bstart%5D=${parseDateForApi(
			startDate
		)}&date%5Bend%5D=${parseDateForApi(endDate)}`
	);
};

const fetchHistoricalRides = async () => {
	console.log('Collecting historical bike rides');
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

	// since the api only cares about dates at large, no need to fuss with extra time values
	startDate.setHours(0, 0, 0, 0);
	todaysDate.setHours(0, 0, 0, 0);

	// Calculate the number of milliseconds between the start date and today's date
	const millisecondsElapsed = Math.abs(todaysDate - startDate);
	// get days elapsed but divide by 15 since we are moving in 15 day increments in our loop
	// if millisecondsElapsed is zero, this means you rode your bike within this ~2 week period
	// I slot the value to 1 anyways and let the deduping in the loop shake it out
	const fortnightsElapsed = Math.ceil(millisecondsElapsed / (1000 * 60 * 60 * 24) / 15) || 1;

	let allBikeRidesInPeriod = [];
	for (let i = 0; i < fortnightsElapsed; i++) {
		// Calculate the start and end dates for this increment, like feb 02 - feb 17 etc. etc.
		const localStartDate = new Date();
		localStartDate.setDate(localStartDate.getDate() - (i + 1) * 15);
		const localEndDate = new Date();
		localEndDate.setDate(localEndDate.getDate() - i * 15);

		localStartDate.setHours(0, 0, 0, 0);
		localEndDate.setHours(0, 0, 0, 0);

		const customPeriodResponse = await fetchCustomPeriodForBikeRides({
			startDate: localStartDate,
			endDate: localEndDate
		});

		if (customPeriodResponse) {
			console.log('Crawling', localStartDate, localEndDate);
			const customPeriodBodyText = await customPeriodResponse?.text();
			let crawledData = crawlBikeRideHtml(customPeriodBodyText);
			if (crawledData.length > 0) {
				// lets say we have 03-18-2022 as the last stored item's "end date"
				// we need to see if our local crawler end date (the one in this loop) happens be _after_ the stored one
				// if so, then run a dedupe because it means we are going over overlapping ranges
				// this is imprecise, but good enough for our purposes, its just "softly" scanning date ranges
				// because the API for this does not accept precise time values, only whole dates, so overlaps are inevitable
				if (lastStoredItem && localEndDate >= startDate) {
					console.log('⿻ overlapping entries found, filtering them out!');
					crawledData = crawledData.filter((e) => {
						// only valid if this item does not appear in the stored data set
						const crawlDataAlreadyExists = storedAllBikeRidesInPeriod.some(
							(r) =>
								dateEqualCompare(r.startTime, e.startTime) && dateEqualCompare(r.endTime, e.endTime)
						);
						return !crawlDataAlreadyExists;
					});
				}
				allBikeRidesInPeriod = [...allBikeRidesInPeriod, ...crawledData.reverse()];
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
