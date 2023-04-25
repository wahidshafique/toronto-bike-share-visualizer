import type { AllBikeRidesInPeriod } from './../types';

const getTotalSpent = (allRides: AllBikeRidesInPeriod) => {
	// covert all the durations to secs
	// convert timestamps to durations in seconds
	const totalSpent = allRides.reduce((acc, ride) => {
		if (ride.price) {
			acc += parseFloat(ride.price.match(/-?(?:\d+(?:\.\d*)?|\.\d+)/)[0]);
		}
		return acc;
	}, 0);

	return totalSpent;
};

export default getTotalSpent;
