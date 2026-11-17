<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		src: string;
		alt: string;
		caption: string;
	};

	let { src, alt, caption }: Props = $props();

	let frame: HTMLDivElement | undefined = $state();
	let rotX = $state(0);
	let rotY = $state(0);
	let glareX = $state(50);
	let glareY = $state(50);
	let active = $state(false);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		let targetX = 0;
		let targetY = 0;
		let targetGlareX = 50;
		let targetGlareY = 50;
		let rafId = 0;

		const onPointerMove = (event: PointerEvent) => {
			if (!frame) return;
			const rect = frame.getBoundingClientRect();
			const cx = rect.left + rect.width / 2;
			const cy = rect.top + rect.height / 2;

			// Normalisasi jarak kursor terhadap pusat foto agar tetap mengikuti kursor di sekitar section
			const dx = Math.max(-1, Math.min(1, (event.clientX - cx) / (rect.width * 1.15)));
			const dy = Math.max(-1, Math.min(1, (event.clientY - cy) / (rect.height * 1.15)));

			targetX = -dy * 12;
			targetY = dx * 12;
			targetGlareX = 50 + dx * 35;
			targetGlareY = 50 + dy * 35;
			active = true;
		};

		const onPointerLeave = () => {
			targetX = 0;
			targetY = 0;
			targetGlareX = 50;
			targetGlareY = 50;
			active = false;
		};

		window.addEventListener('pointermove', onPointerMove, { passive: true });
		document.addEventListener('pointerleave', onPointerLeave, { passive: true });

		const tick = () => {
			rafId = requestAnimationFrame(tick);
			rotX += (targetX - rotX) * 0.1;
			rotY += (targetY - rotY) * 0.1;
			glareX += (targetGlareX - glareX) * 0.1;
			glareY += (targetGlareY - glareY) * 0.1;
		};
		rafId = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('pointerleave', onPointerLeave);
		};
	});
</script>

<div class="w-full max-w-[420px] lg:w-[420px] lg:shrink-0">
	<div bind:this={frame} class="perspective-[950px]">
		<div
			class="relative aspect-square w-full overflow-hidden border border-line bg-surface transition-shadow duration-300"
			style="transform: rotateX({rotX.toFixed(2)}deg) rotateY({rotY.toFixed(
				2
			)}deg); transform-style: preserve-3d; box-shadow: {(-rotY * 1.4).toFixed(1)}px {(
				rotX * 1.4 +
				10
			).toFixed(1)}px 28px rgba(0, 0, 0, {active ? 0.28 : 0.14});"
		>
			<img {src} {alt} width="736" height="736" loading="lazy" class="h-full w-full object-cover" />

			<div
				aria-hidden="true"
				class="pointer-events-none absolute inset-0 transition-opacity duration-300"
				style="opacity: {active ? 0.22 : 0}; background: radial-gradient(circle at {glareX.toFixed(
					1
				)}% {glareY.toFixed(1)}%, var(--primary), transparent 62%);"
			></div>
		</div>
	</div>

	<p class="mt-4 font-mono text-xs text-muted">
		{caption}
	</p>
</div>
