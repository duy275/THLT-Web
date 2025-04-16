export interface Destination {
	id: string;
	name: string;
	type: 'beach' | 'mountain' | 'city';
	image: string;
	price: number;
	rating: number;
	description?: string;
	location?: {
		lat: number;
		lng: number;
	};
}

export interface TravelPlan {
	id: string;
	name: string;
	startDate: Date;
	endDate: Date;
	destinations: Destination[];
	budget: {
		total: number;
		transport: number;
		accommodation: number;
		food: number;
		extra: number;
	};
	createdAt: Date;
}

export interface PlanDestination {
	destinationId: string;
	day: number;
	order: number;
	transportationType: string;
	travelTime: number; // in minutes
}

export interface Budget {
	total: number;
	categories: {
		accommodation: number;
		food: number;
		transport: number;
		activities: number;
		others: number;
	};
}
