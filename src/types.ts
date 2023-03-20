export interface BikeRide {
	startTime: string;
	duration: string;
	endTime: string;
	startStation: string;
	endStation: string;
	bikeID: string;
}

export type BikeRideKeys = keyof BikeRide;

export interface BikeProcessResults {
	itemsDownloaded: number;
}

export type AllBikeRidesInPeriod = BikeRide[];
