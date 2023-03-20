<script lang="ts">
	import '../app.css';
	import type { AllBikeRidesInPeriod } from '../types';
	import { onMount } from 'svelte';
	import { allRidesStore } from '../stores';
	import NavMenu from 'components/NavMenu.svelte';

	onMount(() => {
		chrome.storage.local
			.get('allBikeRidesInPeriod')
			.then(({ allBikeRidesInPeriod }: { allBikeRidesInPeriod: AllBikeRidesInPeriod }) => {
				console.log(allBikeRidesInPeriod);
				if (allBikeRidesInPeriod) {
					allRidesStore.set(allBikeRidesInPeriod);
				}
			});
	});
</script>

<div class="p-4">
	<slot />
	<NavMenu />
</div>
