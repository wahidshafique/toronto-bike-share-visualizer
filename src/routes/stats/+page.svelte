<script>
	import RideMetrics from 'components/RideMetrics.svelte';
	import { allRidesStore } from 'stores';
	import LocationMetrics from 'components/LocationMetrics.svelte';
</script>

<section>
	{#if $allRidesStore}
		<RideMetrics />
		<LocationMetrics />
	{/if}
</section>
