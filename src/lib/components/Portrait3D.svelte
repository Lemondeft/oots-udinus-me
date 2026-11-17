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

			const dx = Math.max(-1, Math.min(1, (event.clientX - cx) / (rect.width * 1.1)));
			const dy = Math.max(-1, Math.min(1, (event.clientY - cy) / (rect.height * 1.1)));

			targetX = -dy * 16;
			targetY = dx * 16;
			targetGlareX = 50 + dx * 38;
			targetGlareY = 50 + dy * 38;
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
			rotX += (targetX - rotX) * 0.12;
			rotY += (targetY - rotY) * 0.12;
			glareX += (targetGlareX - glareX) * 0.12;
			glareY += (targetGlareY - glareY) * 0.12;
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
	<div bind:this={frame} class="perspective-[900px]">
		<div
			class="relative aspect-square w-full border border-line bg-surface transition-shadow duration-300"
			style="transform: rotateX({rotX.toFixed(2)}deg) rotateY({rotY.toFixed(
				2
			)}deg); transform-style: preserve-3d; box-shadow: {(-rotY * 1.8).toFixed(1)}px {(
				rotX * 1.8 +
				14
			).toFixed(1)}px 36px rgba(0, 0, 0, {active ? 0.36 : 0.16});"
		>
			<!-- Lapisan kedalaman 3D di belakang foto -->
			<div
				aria-hidden="true"
				class="pointer-events-none absolute -inset-2 border border-primary/35"
				style="transform: translateZ(-22px);"
			></div>

			<img
				{src}
				{alt}
				width="736"
				height="736"
				loading="lazy"
				class="relative z-10 h-full w-full object-cover"
				style="transform: translateZ(12px);"
			/>

			<div
				aria-hidden="true"
				class="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
				style="transform: translateZ(18px); opacity: {active
					? 0.24
					: 0}; background: radial-gradient(circle at {glareX.toFixed(1)}% {glareY.toFixed(
					1
				)}%, var(--primary), transparent 60%);"
			></div>

			<!-- Label mengambang di kedalaman 3D -->
			<div
				aria-hidden="true"
				class="pointer-events-none absolute right-3 bottom-3 z-30 border border-control-line bg-bg/90 px-2.5 py-1 font-mono text-[10px] text-primary"
				style="transform: translateZ(34px);"
			>
				@lemondeft · 3d
			</div>
		</div>
	</div>

	<p class="mt-5 font-mono text-xs text-muted">
		{caption}
	</p>
</div>
