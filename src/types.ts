export interface bikeRide {
	startTime: string;
	duration: string;
	endTime: string;
	startStation: string;
	endStation: string;
	bikeID: string;
}

export interface bikeProcessResults {
	itemsDownloaded: number;
}

export type allBikeRidesInPeriod = bikeRide[];
