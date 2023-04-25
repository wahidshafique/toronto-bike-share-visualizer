import type { AllBikeRidesInPeriod, BikeRideKeys } from '../types';
const getMostFrequent = (
	allBikeRidesInPeriod: AllBikeRidesInPeriod,
	match1: BikeRideKeys,
	match2?: BikeRideKeys
) => {
	const freqCount: Record<string, number> = {};
	for (const ride of allBikeRidesInPeriod) {
		if (freqCount[ride[match1]]) {
			freqCount[ride[match1]] += 1;
		} else {
			freqCount[ride[match1]] = 1;
		}

		if (match2) {
			if (freqCount[ride[match2]]) {
				freqCount[ride[match2]] += 1;
			} else {
				freqCount[ride[match2]] = 1;
			}
		}
	}

	console.log(freqCount);
	let highestCount = 0;
	let highestItem = '';

	for (const freq in freqCount) {
		if (freqCount[freq] > highestCount) {
			highestCount = freqCount[freq];
			highestItem = freq;
		}
	}

	return {
		highestItem,
		highestCount
	};
};

export { getMostFrequent };
