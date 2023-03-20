import type { allBikeRidesInPeriod } from './../types';

const getDurationMetrics = (
	allRides: allBikeRidesInPeriod
): {
	totalDurationInSecs: number;
	averageDurationSecs: number;
} => {
	// covert all the durations to secs
	// convert timestamps to durations in seconds
	const durationsInSecs = allRides.map((ride) => {
		const duration = ride.duration;
		const [hours, minutes, seconds] = duration.split(':').map(Number);
		return hours * 3600 + minutes * 60 + seconds;
	});

	const totalDurationInSecs = durationsInSecs.reduce((acc, cur) => acc + cur, 0);
	const averageDurationSecs = totalDurationInSecs / durationsInSecs.length;
	return {
		totalDurationInSecs,
		averageDurationSecs
	};
};

export default getDurationMetrics;
