<script lang="ts">
	import { onMount } from 'svelte';

	let ring: HTMLDivElement | undefined = $state();
	let pulse: HTMLDivElement | undefined = $state();
	let enabled = $state(false);

	onMount(() => {
		const isFinePointer = window.matchMedia('(pointer: fine)').matches;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!isFinePointer || reducedMotion) return;

		enabled = true;

		let x = -100;
		let y = -100;
		let tx = -100;
		let ty = -100;
		let scale = 1;
		let targetScale = 1;
		let visible = false;
		let interactive = false;
		let pressed = false;
		let rafId = 0;

		const INTERACTIVE_SELECTOR =
			'a, button, input, textarea, select, summary, [role="button"], [data-magnetic]';

		const syncTargetScale = () => {
			if (pressed) {
				targetScale = 0.78;
			} else if (interactive) {
				targetScale = 1.55;
			} else {
				targetScale = 1;
			}
		};

		const tick = () => {
			x += (tx - x) * 0.22;
			y += (ty - y) * 0.22;
			scale += (targetScale - scale) * 0.2;

			if (ring) {
				ring.style.opacity = visible ? (interactive ? '0.9' : '0.45') : '0';
				ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
			}

			if (
				Math.abs(tx - x) > 0.1 ||
				Math.abs(ty - y) > 0.1 ||
				Math.abs(targetScale - scale) > 0.005
			) {
				rafId = requestAnimationFrame(tick);
			} else {
				rafId = 0;
			}
		};

		const ensureTick = () => {
			if (!rafId) {
				rafId = requestAnimationFrame(tick);
			}
		};

		const onPointerMove = (event: PointerEvent) => {
			if (event.pointerType === 'touch') return;
			if (!visible) {
				x = event.clientX;
				y = event.clientY;
			}
			tx = event.clientX;
			ty = event.clientY;
			visible = true;

			const target = event.target instanceof Element ? event.target : null;
			interactive = Boolean(target?.closest(INTERACTIVE_SELECTOR));
			syncTargetScale();
			ensureTick();
		};

		const onPointerDown = (event: PointerEvent) => {
			if (event.pointerType === 'touch') return;
			pressed = true;
			syncTargetScale();
			ensureTick();

			if (pulse) {
				pulse.style.left = `${event.clientX}px`;
				pulse.style.top = `${event.clientY}px`;
				pulse.animate(
					[
						{ transform: 'translate(-50%, -50%) scale(0.35)', opacity: 0.65 },
						{ transform: 'translate(-50%, -50%) scale(2.1)', opacity: 0 }
					],
					{ duration: 360, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
				);
			}
		};

		const onPointerUp = () => {
			pressed = false;
			syncTargetScale();
			ensureTick();
		};

		const onPointerLeave = () => {
			visible = false;
			pressed = false;
			interactive = false;
			syncTargetScale();
			ensureTick();
		};

		window.addEventListener('pointermove', onPointerMove, { passive: true });
		window.addEventListener('pointerdown', onPointerDown, { passive: true });
		window.addEventListener('pointerup', onPointerUp, { passive: true });
		document.addEventListener('pointerleave', onPointerLeave, { passive: true });

		return () => {
			if (rafId) cancelAnimationFrame(rafId);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointerup', onPointerUp);
			document.removeEventListener('pointerleave', onPointerLeave);
		};
	});
</script>

{#if enabled}
	<div
		bind:this={ring}
		aria-hidden="true"
		class="pointer-events-none fixed top-0 left-0 z-50 h-6 w-6 rounded-full border border-primary/80 opacity-0 will-change-transform"
	></div>
	<div
		bind:this={pulse}
		aria-hidden="true"
		class="pointer-events-none fixed top-0 left-0 z-50 h-6 w-6 rounded-full border border-primary opacity-0"
	></div>
{/if}
