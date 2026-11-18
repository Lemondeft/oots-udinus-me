<script lang="ts">
	import { onMount } from 'svelte';
	import type { BufferGeometry, LineBasicMaterial, MeshBasicMaterial, PointsMaterial } from 'three';

	type Props = {
		theme: 'light' | 'dark';
	};

	type MeshShape = 'ico' | 'knot' | 'sphere';

	let { theme }: Props = $props();

	let container: HTMLDivElement | undefined = $state();
	let canvas: HTMLCanvasElement | undefined = $state();
	let paused = $state(false);
	let shape: MeshShape = $state('ico');
	let webglSupported = $state(true);

	let wireMat: MeshBasicMaterial | undefined;
	let innerMat: MeshBasicMaterial | undefined;
	let ringMat: LineBasicMaterial | undefined;
	let ring2Mat: LineBasicMaterial | undefined;
	let pulseMat: LineBasicMaterial | undefined;
	let pointsMat: PointsMaterial | undefined;
	let renderOnce: (() => void) | undefined;
	let swapShape: ((next: MeshShape) => void) | undefined;
	let triggerPulse: (() => void) | undefined;

	$effect(() => {
		const isDark = theme === 'dark';
		if (wireMat) wireMat.color.set(isDark ? 0x9dc19e : 0x3e5b41);
		if (innerMat) innerMat.color.set(isDark ? 0xddf0e4 : 0x171a15);
		if (ringMat) ringMat.color.set(isDark ? 0x667863 : 0x758271);
		if (ring2Mat) ring2Mat.color.set(isDark ? 0x9dc19e : 0x3e5b41);
		if (pulseMat) pulseMat.color.set(isDark ? 0xddf0e4 : 0x3e5b41);
		if (pointsMat) pointsMat.color.set(isDark ? 0xddf0e4 : 0x2c422e);
		renderOnce?.();
	});

	$effect(() => {
		swapShape?.(shape);
	});

	onMount(() => {
		let disposed = false;
		let cleanupScene: (() => void) | undefined;

		(async () => {
			if (!container || !canvas) return;
			const THREE = await import('three');
			if (disposed || !container || !canvas) return;

			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (reduced) paused = true;

			let renderer: InstanceType<typeof THREE.WebGLRenderer>;
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
			camera.position.z = 4.7;

			const group = new THREE.Group();
			scene.add(group);

			const isDarkInit = theme === 'dark';

			const buildGeometry = (kind: MeshShape): BufferGeometry => {
				if (kind === 'knot') return new THREE.TorusKnotGeometry(0.88, 0.28, 72, 12);
				if (kind === 'sphere') return new THREE.SphereGeometry(1.22, 18, 12);
				return new THREE.IcosahedronGeometry(1.28, 1);
			};

			let mainGeo = buildGeometry(shape);
			wireMat = new THREE.MeshBasicMaterial({
				color: isDarkInit ? 0x9dc19e : 0x3e5b41,
				wireframe: true,
				transparent: true,
				opacity: 0.65
			});
			const mainMesh = new THREE.Mesh(mainGeo, wireMat);
			group.add(mainMesh);

			const innerGeo = new THREE.OctahedronGeometry(0.56, 0);
			innerMat = new THREE.MeshBasicMaterial({
				color: isDarkInit ? 0xddf0e4 : 0x171a15,
				wireframe: true,
				transparent: true,
				opacity: 0.72
			});
			const innerCore = new THREE.Mesh(innerGeo, innerMat);
			group.add(innerCore);

			const ringPoints = [];
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

			ring2Mat = new THREE.LineBasicMaterial({
				color: isDarkInit ? 0x9dc19e : 0x3e5b41,
				transparent: true,
				opacity: 0.35
			});
			const ring2 = new THREE.LineLoop(ringGeo, ring2Mat);
			ring2.rotation.x = -Math.PI * 0.28;
			ring2.rotation.y = -Math.PI * 0.38;
			group.add(ring2);

			// Cincin shockwave saat mesh diklik
			pulseMat = new THREE.LineBasicMaterial({
				color: isDarkInit ? 0xddf0e4 : 0x3e5b41,
				transparent: true,
				opacity: 0
			});
			const pulseRing = new THREE.LineLoop(ringGeo, pulseMat);
			scene.add(pulseRing);

			const particleCount = 56;
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
			let dragging = false;
			let lastX = 0;
			let lastY = 0;
			let velX = 0;
			let velY = 0;
			let pulseProgress = 1;
			let spinBoost = 0;

			const onPointerDown = (event: PointerEvent) => {
				dragging = true;
				lastX = event.clientX;
				lastY = event.clientY;
			};

			const onPointerMove = (event: PointerEvent) => {
				if (!container || paused) return;
				if (dragging) {
					const dx = event.clientX - lastX;
					const dy = event.clientY - lastY;
					lastX = event.clientX;
					lastY = event.clientY;
					velY = dx * 0.012;
					velX = dy * 0.012;
					mainMesh.rotation.y += velY;
					mainMesh.rotation.x += velX;
					return;
				}
				const rect = container.getBoundingClientRect();
				const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
				const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
				targetX = ny * 0.4;
				targetY = nx * 0.5;
			};

			const onPointerUp = () => {
				dragging = false;
			};

			const onClick = () => {
				triggerPulse?.();
			};

			triggerPulse = () => {
				pulseProgress = 0;
				spinBoost = 2.6;
			};

			swapShape = (next: MeshShape) => {
				const nextGeo = buildGeometry(next);
				mainMesh.geometry.dispose();
				mainMesh.geometry = nextGeo;
				mainGeo = nextGeo;
				renderer.render(scene, camera);
			};

			container.addEventListener('pointerdown', onPointerDown, { passive: true });
			container.addEventListener('pointermove', onPointerMove, { passive: true });
			window.addEventListener('pointerup', onPointerUp, { passive: true });
			container.addEventListener('click', onClick);

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
					spinBoost *= 0.94;
					velX *= 0.94;
					velY *= 0.94;

					mainMesh.rotation.y += dt * (0.28 + spinBoost) + velY;
					mainMesh.rotation.x += dt * 0.14 + velX;
					innerCore.rotation.y -= dt * (0.55 + spinBoost * 1.3);
					innerCore.rotation.z += dt * 0.32;
					ring.rotation.z -= dt * 0.16;
					ring2.rotation.z += dt * 0.22;
					points.rotation.y -= dt * (0.1 + spinBoost * 0.5);

					group.rotation.x += (targetX - group.rotation.x) * 0.05;
					group.rotation.y += (targetY - group.rotation.y) * 0.05;

					if (pulseProgress < 1 && pulseMat) {
						pulseProgress = Math.min(1, pulseProgress + dt * 1.4);
						const s = 0.65 + pulseProgress * 1.25;
						pulseRing.scale.set(s, s, s);
						pulseMat.opacity = (1 - pulseProgress) * 0.75;
					} else if (pulseMat) {
						pulseMat.opacity = 0;
					}

					renderer.render(scene, camera);
				}
			};

			renderOnce = () => renderer.render(scene, camera);
			renderOnce();
			rafId = requestAnimationFrame(tick);

			cleanupScene = () => {
				renderOnce = undefined;
				swapShape = undefined;
				triggerPulse = undefined;
				cancelAnimationFrame(rafId);
				resizeObserver.disconnect();
				io.disconnect();
				container?.removeEventListener('pointerdown', onPointerDown);
				container?.removeEventListener('pointermove', onPointerMove);
				window.removeEventListener('pointerup', onPointerUp);
				container?.removeEventListener('click', onClick);
				mainGeo.dispose();
				innerGeo.dispose();
				wireMat?.dispose();
				innerMat?.dispose();
				ringGeo.dispose();
				ringMat?.dispose();
				ring2Mat?.dispose();
				pulseMat?.dispose();
				pointsGeo.dispose();
				pointsMat?.dispose();
				renderer.dispose();
			};
		})();

		return () => {
			disposed = true;
			cleanupScene?.();
		};
	});
</script>

<div class="relative flex flex-col border border-line bg-surface">
	<div
		bind:this={container}
		aria-hidden="true"
		title="Geser untuk memutar atau klik untuk denyut sinyal"
		class="relative aspect-square w-full cursor-grab overflow-hidden active:cursor-grabbing lg:aspect-[5/4]"
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

	<div
		class="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-bg px-3.5 py-2.5"
	>
		<div class="flex items-center gap-1" role="group" aria-label="Bentuk objek 3D">
			{#each [['ico', 'Ico'], ['knot', 'Knot'], ['sphere', 'Grid']] as [id, label] (id)}
				<button
					type="button"
					aria-pressed={shape === id}
					onclick={() => (shape = id as MeshShape)}
					class="inline-flex min-h-[44px] items-center border px-2.5 font-mono text-[11px] transition-colors duration-200 {shape ===
					id
						? 'border-primary bg-primary-soft text-primary'
						: 'border-line bg-surface text-muted hover:text-ink'}"
				>
					{label}
				</button>
			{/each}
		</div>

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
