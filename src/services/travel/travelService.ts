import { Destination, TravelPlan } from '@/models/travel/destination';

const DESTINATIONS_KEY = 'destinations';
const PLANS_KEY = 'travel_plans';

export const travelService = {
	// Destinations
	getDestinations(): Destination[] {
		const data = localStorage.getItem(DESTINATIONS_KEY);
		return data ? JSON.parse(data) : [];
	},

	addDestination(destination: Destination): void {
		const destinations = this.getDestinations();
		destinations.push(destination);
		localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(destinations));
	},

	updateDestinations(destinations: Destination[]): void {
		localStorage.setItem('destinations', JSON.stringify(destinations));
	},

	// Travel Plans
	getTravelPlans(): TravelPlan[] {
		const data = localStorage.getItem(PLANS_KEY);
		return data ? JSON.parse(data) : [];
	},

	createPlan(plan: TravelPlan): void {
		const plans = this.getTravelPlans();
		plans.push(plan);
		localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
	},

	updatePlan(updatedPlan: TravelPlan): void {
		const plans = this.getTravelPlans();
		const index = plans.findIndex((p) => p.id === updatedPlan.id);
		if (index >= 0) {
			plans[index] = updatedPlan;
			localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
		}
	},

	savePlan(plan: TravelPlan): void {
		const plans = this.getPlans();
		plans.push(plan);
		localStorage.setItem('travel_plans', JSON.stringify(plans));
	},

	getPlans(): TravelPlan[] {
		const plansJson = localStorage.getItem('travel_plans');
		if (!plansJson) return [];

		const plans = JSON.parse(plansJson);
		// Convert string dates back to Date objects
		return plans.map((plan: any) => ({
			...plan,
			startDate: new Date(plan.startDate),
			endDate: new Date(plan.endDate),
			createdAt: new Date(plan.createdAt),
		}));
	},

	getPlanById(id: string): TravelPlan | undefined {
		const plans = this.getPlans();
		return plans.find((plan) => plan.id === id);
	},

	deletePlan(id: string): void {
		const plans = this.getPlans();
		const filteredPlans = plans.filter((plan) => plan.id !== id);
		localStorage.setItem('travel_plans', JSON.stringify(filteredPlans));
	},
};
