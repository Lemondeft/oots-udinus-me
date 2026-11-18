<script lang="ts">
	import { onMount } from 'svelte';
	import type { InstancedMesh, LineBasicMaterial, MeshBasicMaterial } from 'three';

	type Props = {
		theme: 'light' | 'dark';
		enabled: boolean;
	};

	let { theme, enabled }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let shardMat: MeshBasicMaterial | undefined;
	let gateMat: LineBasicMaterial | undefined;
	let renderOnce: (() => void) | undefined;

	$effect(() => {
		const isDark = theme === 'dark';
		if (shardMat) {
			shardMat.color.set(isDark ? 0x9dc19e : 0x3e5b41);
			shardMat.opacity = isDark ? 0.19 : 0.11;
		}
		if (gateMat) {
			gateMat.color.set(isDark ? 0x667863 : 0x758271);
			gateMat.opacity = isDark ? 0.16 : 0.09;
		}
		renderOnce?.();
	});

	$effect(() => {
		void enabled;
		renderOnce?.();
	});

	onMount(() => {
		let disposed = false;
		let cleanup: (() => void) | undefined;

		(async () => {
			if (!canvas) return;
			const THREE = await import('three');
			if (disposed || !canvas) return;

			let renderer: InstanceType<typeof THREE.WebGLRenderer>;
			try {
				renderer = new THREE.WebGLRenderer({
					canvas,
					antialias: true,
					alpha: true,
					powerPreference: 'low-power'
				});
			} catch {
				return;
			}

			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
			renderer.setClearColor(0x000000, 0);

			const scene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(
				58,
				window.innerWidth / window.innerHeight,
				0.1,
				90
			);
			camera.position.set(0, 0, 6);

			const isDarkInit = theme === 'dark';

			// 160 fragmen oktahedron ter-instancing di sepanjang koridor scroll Z
			const shardCount = 160;
			const shardGeo = new THREE.OctahedronGeometry(0.22, 0);
			shardMat = new THREE.MeshBasicMaterial({
				color: isDarkInit ? 0x9dc19e : 0x3e5b41,
				wireframe: true,
				transparent: true,
				opacity: isDarkInit ? 0.19 : 0.11
			});
			const shards: InstancedMesh = new THREE.InstancedMesh(shardGeo, shardMat, shardCount);
			const dummy = new THREE.Object3D();

			const shardMeta: Array<{
				x: number;
				y: number;
				z: number;
				rx: number;
				ry: number;
				scale: number;
				speed: number;
			}> = [];

			for (let i = 0; i < shardCount; i++) {
				// Posisi deterministik berbasis rasio emas agar sebaran simetris tanpa random SSR mismatch
				const angle = i * 2.3999632;
				const radius = 3.2 + (i % 7) * 1.15;
				const z = 4 - (i / shardCount) * 58;
				const scale = 0.55 + (i % 5) * 0.25;
				const meta = {
					x: Math.cos(angle) * radius,
					y: Math.sin(angle) * (radius * 0.72),
					z,
					rx: (i % 6) * 0.4,
					ry: (i % 4) * 0.6,
					scale,
					speed: 0.2 + (i % 4) * 0.12
				};
				shardMeta.push(meta);
				dummy.position.set(meta.x, meta.y, meta.z);
				dummy.rotation.set(meta.rx, meta.ry, 0);
				dummy.scale.setScalar(meta.scale);
				dummy.updateMatrix();
				shards.setMatrixAt(i, dummy.matrix);
			}
			shards.instanceMatrix.needsUpdate = true;
			scene.add(shards);

			// Gerbang cincin ruang sepanjang sumbu Z yang dilalui kamera saat scroll
			const gatePts = [];
			for (let i = 0; i <= 64; i++) {
				const a = (i / 64) * Math.PI * 2;
				gatePts.push(new THREE.Vector3(Math.cos(a) * 4.8, Math.sin(a) * 3.4, 0));
			}
			const gateGeo = new THREE.BufferGeometry().setFromPoints(gatePts);
			gateMat = new THREE.LineBasicMaterial({
				color: isDarkInit ? 0x667863 : 0x758271,
				transparent: true,
				opacity: isDarkInit ? 0.16 : 0.09
			});

			const gates: Array<InstanceType<typeof THREE.LineLoop>> = [];
			for (let g = 0; g < 12; g++) {
				const loop = new THREE.LineLoop(gateGeo, gateMat);
				loop.position.z = 2 - g * 4.6;
				loop.rotation.z = g * 0.18;
				scene.add(loop);
				gates.push(loop);
			}

			let scrollNorm = 0;
			let smoothScroll = 0;
			let pointerX = 0;
			let pointerY = 0;
			let smoothPointerX = 0;
			let smoothPointerY = 0;

			const onResize = () => {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize(window.innerWidth, window.innerHeight, false);
				renderer.render(scene, camera);
			};

			const onScroll = () => {
				const max = document.documentElement.scrollHeight - window.innerHeight;
				scrollNorm = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
			};

			const onPointerMove = (event: PointerEvent) => {
				pointerX = (event.clientX / window.innerWidth) * 2 - 1;
				pointerY = (event.clientY / window.innerHeight) * 2 - 1;
			};

			onResize();
			onScroll();

			window.addEventListener('resize', onResize, { passive: true });
			window.addEventListener('scroll', onScroll, { passive: true });
			window.addEventListener('pointermove', onPointerMove, { passive: true });

			const clock = new THREE.Clock();
			let rafId = 0;

			const applyCameraAndScene = (elapsed: number, animateShards: boolean) => {
				smoothScroll += (scrollNorm - smoothScroll) * 0.08;
				smoothPointerX += (pointerX - smoothPointerX) * 0.06;
				smoothPointerY += (pointerY - smoothPointerY) * 0.06;

				// Terbang melewati terowongan Z saat pengguna scroll ke bawah
				camera.position.z = 6 - smoothScroll * 42;
				camera.position.x = smoothPointerX * 0.95 + Math.sin(smoothScroll * Math.PI * 2) * 0.55;
				camera.position.y = -smoothPointerY * 0.65 + Math.cos(smoothScroll * Math.PI) * 0.35;
				camera.rotation.z = smoothScroll * 0.45 + smoothPointerX * 0.04;
				camera.lookAt(smoothPointerX * 0.25, -smoothPointerY * 0.2, camera.position.z - 10);

				if (animateShards) {
					for (let i = 0; i < shardCount; i++) {
						const m = shardMeta[i];
						dummy.position.set(m.x, m.y, m.z);
						dummy.rotation.set(
							m.rx + elapsed * m.speed,
							m.ry + elapsed * m.speed * 0.8 + smoothScroll * 2.5,
							0
						);
						dummy.scale.setScalar(m.scale);
						dummy.updateMatrix();
						shards.setMatrixAt(i, dummy.matrix);
					}
					shards.instanceMatrix.needsUpdate = true;

					for (let g = 0; g < gates.length; g++) {
						gates[g].rotation.z = g * 0.18 + elapsed * 0.06 + smoothScroll * 0.9;
					}
				}

				renderer.render(scene, camera);
			};

			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			renderOnce = () => applyCameraAndScene(clock.getElapsedTime(), false);

			const tick = () => {
				rafId = requestAnimationFrame(tick);
				if (enabled && !reduced) {
					applyCameraAndScene(clock.getElapsedTime(), true);
				}
			};

			applyCameraAndScene(0, true);
			rafId = requestAnimationFrame(tick);

			cleanup = () => {
				renderOnce = undefined;
				cancelAnimationFrame(rafId);
				window.removeEventListener('resize', onResize);
				window.removeEventListener('scroll', onScroll);
				window.removeEventListener('pointermove', onPointerMove);
				shardGeo.dispose();
				shardMat?.dispose();
				gateGeo.dispose();
				gateMat?.dispose();
				shards.dispose();
				renderer.dispose();
			};
		})();

		return () => {
			disposed = true;
			cleanup?.();
		};
	});
</script>

<canvas
	bind:this={canvas}
	aria-hidden="true"
	class="pointer-events-none fixed inset-0 z-0 h-full w-full transition-opacity duration-300 {enabled
		? 'opacity-100'
		: 'opacity-25'}"
></canvas>
