<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import Lenis from 'lenis';
	import 'lenis/dist/lenis.css';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => {
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const lenis = new Lenis({ anchors: true });

		let frame = requestAnimationFrame(function raf(time) {
			lenis.raf(time);
			frame = requestAnimationFrame(raf);
		});

		return () => {
			cancelAnimationFrame(frame);
			lenis.destroy();
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Ahmad Rizki Maulana · Portofolio</title>
	<meta
		name="description"
		content="Portofolio Ahmad Rizki Maulana (Lemondeft): proyek web fullstack, aplikasi mobile Flutter, dan otomasi."
	/>
</svelte:head>

{@render children()}
