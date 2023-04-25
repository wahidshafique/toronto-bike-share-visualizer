import type { AllBikeRidesInPeriod, BikeRideKeys } from '../types';
const getSankeyFrequency = (
	allBikeRidesInPeriod: AllBikeRidesInPeriod,
	match1: BikeRideKeys,
	match2: BikeRideKeys
) => {
	const nodes = new Set<string>([]);
	const links: Record<
		string, // squish source and target to make uniq string (for counting later)
		{
			source: string;
			target: string;
			value: number;
		}
	> = {};
	for (const ride of allBikeRidesInPeriod) {
		// maintain list of unique nodes
		nodes.add(ride.startStation);
		nodes.add(ride.endStation);

		const indexingKey = `${ride[match1]}-${ride[match2]}`;
		if (links[indexingKey]) {
			links[indexingKey].value += 1;
		} else {
			links[indexingKey] = {
				source: ride[match1],
				target: ride[match2],
				value: 1
			};
		}
	}

	return {
		nodes: Array.from(nodes).map((e) => ({ id: e })),
		links: Object.values(links)
	};
};

export { getSankeyFrequency };
