import type { AllBikeRidesInPeriod } from './types';
import { writable, type Writable } from 'svelte/store';

export const allRidesStore: Writable<AllBikeRidesInPeriod> = writable([]);
