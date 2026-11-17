<script lang="ts">
	import { onMount } from 'svelte';
	import * as THREE from 'three';

	type Props = {
		theme: 'light' | 'dark';
	};

	let { theme }: Props = $props();

	let container: HTMLDivElement | undefined = $state();
	let canvas: HTMLCanvasElement | undefined = $state();
	let paused = $state(false);
	let webglSupported = $state(true);

	let wireMat: THREE.MeshBasicMaterial | undefined;
	let ringMat: THREE.LineBasicMaterial | undefined;
	let pointsMat: THREE.PointsMaterial | undefined;
	let renderOnce: (() => void) | undefined;

	$effect(() => {
		const isDark = theme === 'dark';
		if (wireMat) wireMat.color.set(isDark ? 0x9dc19e : 0x3e5b41);
		if (ringMat) ringMat.color.set(isDark ? 0x667863 : 0x758271);
		if (pointsMat) pointsMat.color.set(isDark ? 0xddf0e4 : 0x2c422e);
		renderOnce?.();
	});

	onMount(() => {
		if (!container || !canvas) return;

		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) paused = true;

		let renderer: THREE.WebGLRenderer;
		try {
			renderer = new THREE.WebGLRenderer({
				canvas,
				antialias: true,
				alpha: true,
				powerPreference: 'low-power'
			});
		} catch {
			webglSupported = false;
			return;
		}

		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setClearColor(0x000000, 0);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
		camera.position.z = 4.6;

		const group = new THREE.Group();
		scene.add(group);

		const isDarkInit = theme === 'dark';

		// Wireframe icosahedron terinspirasi node jaringan The Wired
		const icoGeo = new THREE.IcosahedronGeometry(1.25, 1);
		wireMat = new THREE.MeshBasicMaterial({
			color: isDarkInit ? 0x9dc19e : 0x3e5b41,
			wireframe: true,
			transparent: true,
			opacity: 0.65
		});
		const ico = new THREE.Mesh(icoGeo, wireMat);
		group.add(ico);

		// Cincin orbit tipis
		const ringPoints: THREE.Vector3[] = [];
		for (let i = 0; i <= 72; i++) {
			const angle = (i / 72) * Math.PI * 2;
			ringPoints.push(new THREE.Vector3(Math.cos(angle) * 1.75, Math.sin(angle) * 1.75, 0));
		}
		const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
		ringMat = new THREE.LineBasicMaterial({
			color: isDarkInit ? 0x667863 : 0x758271,
			transparent: true,
			opacity: 0.55
		});
		const ring = new THREE.LineLoop(ringGeo, ringMat);
		ring.rotation.x = Math.PI * 0.34;
		ring.rotation.y = Math.PI * 0.14;
		group.add(ring);

		// Node partikel deterministik di sekitar mesh
		const particleCount = 48;
		const positions = new Float32Array(particleCount * 3);
		for (let i = 0; i < particleCount; i++) {
			const phi = Math.acos(1 - (2 * (i + 0.5)) / particleCount);
			const theta = Math.PI * (1 + Math.sqrt(5)) * i;
			const r = 1.9 + (i % 3) * 0.28;
			positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
			positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			positions[i * 3 + 2] = r * Math.cos(phi);
		}
		const pointsGeo = new THREE.BufferGeometry();
		pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		pointsMat = new THREE.PointsMaterial({
			color: isDarkInit ? 0xddf0e4 : 0x2c422e,
			size: 0.045,
			transparent: true,
			opacity: 0.85
		});
		const points = new THREE.Points(pointsGeo, pointsMat);
		group.add(points);

		const resize = () => {
			if (!container) return;
			const w = container.clientWidth || 320;
			const h = container.clientHeight || 320;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			renderer.setSize(w, h, false);
			renderer.render(scene, camera);
		};

		resize();
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(container);

		let targetX = 0;
		let targetY = 0;
		const onPointerMove = (event: PointerEvent) => {
			if (!container || paused) return;
			const rect = container.getBoundingClientRect();
			const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
			targetX = ny * 0.35;
			targetY = nx * 0.45;
		};
		container.addEventListener('pointermove', onPointerMove, { passive: true });

		let inViewport = true;
		const io = new IntersectionObserver(
			(entries) => {
				inViewport = entries[0]?.isIntersecting ?? true;
			},
			{ threshold: 0.05 }
		);
		io.observe(container);

		let rafId = 0;
		let lastTime = performance.now();

		const tick = (now: number) => {
			rafId = requestAnimationFrame(tick);
			const dt = Math.min((now - lastTime) / 1000, 0.05);
			lastTime = now;

			if (!paused && inViewport) {
				ico.rotation.y += dt * 0.28;
				ico.rotation.x += dt * 0.14;
				ring.rotation.z -= dt * 0.16;
				points.rotation.y -= dt * 0.1;
				group.rotation.x += (targetX - group.rotation.x) * 0.05;
				group.rotation.y += (targetY - group.rotation.y) * 0.05;
				renderer.render(scene, camera);
			}
		};

		// Render frame awal langsung supaya mode paused tetap tampil bersih
		renderOnce = () => renderer.render(scene, camera);
		renderOnce();
		rafId = requestAnimationFrame(tick);

		return () => {
			renderOnce = undefined;
			cancelAnimationFrame(rafId);
			resizeObserver.disconnect();
			io.disconnect();
			container?.removeEventListener('pointermove', onPointerMove);
			icoGeo.dispose();
			wireMat?.dispose();
			ringGeo.dispose();
			ringMat?.dispose();
			pointsGeo.dispose();
			pointsMat?.dispose();
			renderer.dispose();
		};
	});
</script>

<div class="relative flex flex-col border border-line bg-surface">
	<div
		bind:this={container}
		aria-hidden="true"
		class="relative aspect-square w-full overflow-hidden lg:aspect-[5/4]"
	>
		<canvas bind:this={canvas} class="block h-full w-full {webglSupported ? '' : 'hidden'}"
		></canvas>
		{#if !webglSupported}
			<div
				class="flex h-full w-full items-center justify-center p-6 text-center font-mono text-xs text-muted"
			>
				WebGL tidak tersedia di browser ini.
			</div>
		{/if}
	</div>

	<div class="flex items-center justify-between gap-4 border-t border-line bg-bg px-4 py-2.5">
		<span class="font-mono text-[11px] text-muted">three.js · wired lattice</span>
		<button
			type="button"
			aria-pressed={paused}
			aria-label={paused ? 'Putar animasi 3D' : 'Jeda animasi 3D'}
			onclick={() => (paused = !paused)}
			class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center border border-control-line bg-surface px-3.5 font-mono text-[11px] text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
		>
			{paused ? 'Putar' : 'Jeda'}
		</button>
	</div>
</div>
