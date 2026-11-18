<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		src: string;
		alt: string;
	};

	let { src, alt }: Props = $props();

	let outer: HTMLDivElement | undefined = $state();
	let card: HTMLDivElement | undefined = $state();
	let beamMask: HTMLDivElement | undefined = $state();
	let beamGlow: HTMLDivElement | undefined = $state();
	let hudLabel = $state('hover · flashlight');

	onMount(() => {
		if (!outer || !card || !beamMask || !beamGlow) return;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		let rotX = 0;
		let rotY = 0;
		let targetRotX = 0;
		let targetRotY = 0;
		let lightX = 50;
		let lightY = 50;
		let targetLightX = 50;
		let targetLightY = 50;
		let shadowOpacity = 0.16;
		let targetShadowOpacity = 0.16;
		let beamStrength = 0.35;
		let targetBeamStrength = 0.35;
		let glowOpacity = 0;
		let targetGlowOpacity = 0;
		let insideBanner = false;
		let rafId = 0;

		const updateFromPointer = (clientX: number, clientY: number, forceInside = false) => {
			if (!outer) return;
			const rect = outer.getBoundingClientRect();
			if (rect.width <= 0 || rect.height <= 0) return;

			if (!reducedMotion) {
				const cx = rect.left + rect.width / 2;
				const cy = rect.top + rect.height / 2;
				const dx = Math.max(-1, Math.min(1, (clientX - cx) / (rect.width * 0.85)));
				const dy = Math.max(-1, Math.min(1, (clientY - cy) / (rect.height * 1.4)));
				targetRotX = -dy * 6;
				targetRotY = dx * 7.5;
				targetShadowOpacity = 0.34;
			}

			const inBounds =
				forceInside ||
				(clientX >= rect.left &&
					clientX <= rect.right &&
					clientY >= rect.top &&
					clientY <= rect.bottom);

			insideBanner = inBounds;
			if (inBounds) {
				const px = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
				const py = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
				targetLightX = px * 100;
				targetLightY = py * 100;
				targetBeamStrength = 1;
				targetGlowOpacity = 1;
			} else {
				targetBeamStrength = 0.35;
				targetGlowOpacity = 0;
			}
		};

		const onPointerMove = (event: PointerEvent) => {
			updateFromPointer(event.clientX, event.clientY);
		};

		const onBannerDown = (event: PointerEvent) => {
			updateFromPointer(event.clientX, event.clientY, true);
		};

		const onPointerLeave = () => {
			targetRotX = 0;
			targetRotY = 0;
			targetShadowOpacity = 0.16;
			targetBeamStrength = 0.35;
			targetGlowOpacity = 0;
			insideBanner = false;
			hudLabel = 'hover · flashlight';
		};

		window.addEventListener('pointermove', onPointerMove, { passive: true });
		outer.addEventListener('pointerdown', onBannerDown, { passive: true });
		document.addEventListener('pointerleave', onPointerLeave, { passive: true });

		const tick = () => {
			rafId = requestAnimationFrame(tick);

			rotX += (targetRotX - rotX) * 0.12;
			rotY += (targetRotY - rotY) * 0.12;
			lightX += (targetLightX - lightX) * 0.22;
			lightY += (targetLightY - lightY) * 0.22;
			shadowOpacity += (targetShadowOpacity - shadowOpacity) * 0.12;
			beamStrength += (targetBeamStrength - beamStrength) * 0.16;
			glowOpacity += (targetGlowOpacity - glowOpacity) * 0.18;

			if (!reducedMotion && card) {
				card.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
				card.style.boxShadow = `${(-rotY * 1.7).toFixed(1)}px ${(rotX * 1.7 + 14).toFixed(1)}px 36px rgba(0, 0, 0, ${shadowOpacity.toFixed(3)})`;
			}

			if (beamMask) {
				const lx = lightX.toFixed(1);
				const ly = lightY.toFixed(1);
				beamMask.style.opacity = beamStrength.toFixed(3);
				beamMask.style.background = `radial-gradient(230px circle at ${lx}% ${ly}%, rgba(226, 246, 233, 0.22) 0%, rgba(157, 193, 158, 0.04) 36%, rgba(4, 6, 5, 0.78) 76%)`;
			}

			if (beamGlow) {
				const lx = lightX.toFixed(1);
				const ly = lightY.toFixed(1);
				beamGlow.style.opacity = glowOpacity.toFixed(3);
				beamGlow.style.background = `radial-gradient(125px circle at ${lx}% ${ly}%, rgba(225, 248, 234, 0.34) 0%, rgba(157, 193, 158, 0.12) 45%, transparent 75%)`;
			}

			const nextLabel = insideBanner
				? `beam: ${Math.round(lightX)}%, ${Math.round(lightY)}%`
				: 'hover · flashlight';
			if (nextLabel !== hudLabel) {
				hudLabel = nextLabel;
			}
		};

		rafId = requestAnimationFrame(tick);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('pointermove', onPointerMove);
			outer?.removeEventListener('pointerdown', onBannerDown);
			document.removeEventListener('pointerleave', onPointerLeave);
		};
	});
</script>

<div bind:this={outer} class="perspective-[1100px]">
	<div
		bind:this={card}
		class="relative aspect-[3/1] w-full border border-line bg-surface will-change-transform"
		style="transform-style: preserve-3d;"
	>
		<!-- Lapisan kedalaman 3D di belakang banner -->
		<div
			aria-hidden="true"
			class="pointer-events-none absolute -inset-2 border border-primary/35"
			style="transform: translateZ(-18px);"
		></div>

		<div class="relative h-full w-full overflow-hidden" style="transform: translateZ(10px);">
			<img
				{src}
				{alt}
				width="734"
				height="245"
				fetchpriority="high"
				class="block h-full w-full object-cover"
			/>

			<!-- Mask senter: sorotan terang di kursor dan vignette gelap di sekeliling -->
			<div
				bind:this={beamMask}
				aria-hidden="true"
				class="pointer-events-none absolute inset-0"
			></div>

			<!-- Titik cahaya senter utama -->
			<div
				bind:this={beamGlow}
				aria-hidden="true"
				class="pointer-events-none absolute inset-0 mix-blend-screen"
			></div>
		</div>

		<div
			aria-hidden="true"
			class="pointer-events-none absolute top-3 left-3 z-20 border border-control-line bg-bg/85 px-2.5 py-1 font-mono text-[10px] text-primary"
			style="transform: translateZ(26px);"
		>
			{hudLabel}
		</div>

		<div
			aria-hidden="true"
			class="pointer-events-none absolute right-3 bottom-3 z-20 border border-control-line bg-bg/85 px-2.5 py-1 font-mono text-[10px] text-muted"
			style="transform: translateZ(26px);"
		>
			LAYER:01 · wired
		</div>
	</div>
</div>
