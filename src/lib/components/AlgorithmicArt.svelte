<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		theme: 'light' | 'dark';
	};

	let { theme }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let seed = $state(2026);
	let carrierCount = $state(1800);
	let flowSpeed = $state(1.5);
	let noiseScale = $state(0.004);
	let harmonicPull = $state(1.1);
	let paused = $state(false);

	let restartFn: (() => void) | undefined;

	function createRng(s: number) {
		let a = s >>> 0;
		return () => {
			a |= 0;
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function createNoise2D(s: number) {
		const rng = createRng(s ^ 0x9e3779b9);
		const perm = new Uint8Array(512);
		for (let i = 0; i < 256; i++) perm[i] = i;
		for (let i = 255; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			const tmp = perm[i];
			perm[i] = perm[j];
			perm[j] = tmp;
		}
		for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

		const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
		const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
		const grad = (hash: number, x: number, y: number) => {
			const h = hash & 7;
			const u = h < 4 ? x : y;
			const v = h < 4 ? y : x;
			return ((h & 1) !== 0 ? -u : u) + ((h & 2) !== 0 ? -2.0 * v : 2.0 * v);
		};

		return (x: number, y: number) => {
			const xi = Math.floor(x) & 255;
			const yi = Math.floor(y) & 255;
			const xf = x - Math.floor(x);
			const yf = y - Math.floor(y);
			const u = fade(xf);
			const v = fade(yf);

			const aa = perm[perm[xi] + yi];
			const ab = perm[perm[xi] + yi + 1];
			const ba = perm[perm[xi + 1] + yi];
			const bb = perm[perm[xi + 1] + yi + 1];

			const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u);
			const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u);
			return (lerp(x1, x2, v) + 1.5) / 3.0;
		};
	}

	function applyPreset(kind: 'wired' | 'vortex' | 'laminar') {
		if (kind === 'wired') {
			carrierCount = 1800;
			flowSpeed = 1.5;
			noiseScale = 0.004;
			harmonicPull = 1.1;
		} else if (kind === 'vortex') {
			carrierCount = 2400;
			flowSpeed = 2.1;
			noiseScale = 0.007;
			harmonicPull = 2.2;
		} else {
			carrierCount = 1400;
			flowSpeed = 1.1;
			noiseScale = 0.002;
			harmonicPull = 0.3;
		}
	}

	function exportPng() {
		if (!canvas) return;
		const link = document.createElement('a');
		link.download = `wired-resonance-seed-${seed}.png`;
		link.href = canvas.toDataURL('image/png');
		link.click();
	}

	$effect(() => {
		void theme;
		void seed;
		void carrierCount;
		void flowSpeed;
		void noiseScale;
		void harmonicPull;
		restartFn?.();
	});

	onMount(() => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const W = 900;
		const H = 560;
		canvas.width = W;
		canvas.height = H;

		let rafId = 0;
		let stepCount = 0;
		const maxSteps = 210;

		type Carrier = {
			x: number;
			y: number;
			px: number;
			py: number;
			vx: number;
			vy: number;
			phase: number;
			tier: number;
		};

		type Attractor = {
			x: number;
			y: number;
			freq: number;
			polarity: number;
		};

		let carriers: Carrier[] = [];
		let attractors: Attractor[] = [];
		let noise2d = createNoise2D(seed);
		let inViewport = true;
		const pointerForce = { x: W * 0.5, y: H * 0.5, active: false };

		const onPointerMove = (event: PointerEvent) => {
			if (!canvas) return;
			const rect = canvas.getBoundingClientRect();
			pointerForce.x = ((event.clientX - rect.left) / rect.width) * W;
			pointerForce.y = ((event.clientY - rect.top) / rect.height) * H;
			pointerForce.active = true;
		};

		const onPointerLeave = () => {
			pointerForce.active = false;
		};

		canvas.addEventListener('pointermove', onPointerMove, { passive: true });
		canvas.addEventListener('pointerleave', onPointerLeave, { passive: true });

		const io = new IntersectionObserver(
			(entries) => {
				inViewport = entries[0]?.isIntersecting ?? true;
			},
			{ threshold: 0.05 }
		);
		io.observe(canvas);

		const init = () => {
			cancelAnimationFrame(rafId);
			stepCount = 0;
			noise2d = createNoise2D(seed);
			const rng = createRng(seed);

			const isDark = theme === 'dark';
			ctx.fillStyle = isDark ? '#0e100d' : '#eef2ec';
			ctx.fillRect(0, 0, W, H);

			attractors = [];
			for (let i = 0; i < 3; i++) {
				const angle = rng() * Math.PI * 2;
				const dist = (0.14 + rng() * 0.16) * Math.min(W, H);
				attractors.push({
					x: W * 0.5 + Math.cos(angle) * dist,
					y: H * 0.5 + Math.sin(angle) * dist,
					freq: 0.6 + rng() * 1.2,
					polarity: i % 2 === 0 ? 1 : -1
				});
			}

			carriers = [];
			for (let i = 0; i < carrierCount; i++) {
				const x = rng() * W;
				const y = rng() * H;
				carriers.push({
					x,
					y,
					px: x,
					py: y,
					vx: 0,
					vy: 0,
					phase: rng() * Math.PI * 2,
					tier: rng()
				});
			}

			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			if (reduced) {
				for (let s = 0; s < 90; s++) stepFrame();
				return;
			}

			rafId = requestAnimationFrame(tick);
		};

		const fieldAngle = (x: number, y: number) => {
			const n1 = noise2d(x * noiseScale, y * noiseScale);
			const n2 = noise2d(x * noiseScale * 2.2 + 40, y * noiseScale * 2.2 + 40);
			let base = (n1 * 0.7 + n2 * 0.3) * Math.PI * 4.8;

			if (harmonicPull > 0) {
				for (const a of attractors) {
					const dx = x - a.x;
					const dy = y - a.y;
					const d = Math.hypot(dx, dy) + 32;
					const swirl = Math.atan2(dy, dx) + Math.PI * 0.5 * a.polarity;
					const weight = Math.min(0.82, Math.max(0, (140 / d) * harmonicPull * 0.32));
					base = base + (swirl + Math.sin(d * 0.024 * a.freq) - base) * weight;
				}
			}

			if (pointerForce.active) {
				const dx = x - pointerForce.x;
				const dy = y - pointerForce.y;
				const d = Math.hypot(dx, dy);
				if (d < 180) {
					const cursorSwirl = Math.atan2(dy, dx) + Math.PI * 0.55;
					const influence = (1 - d / 180) * 0.75;
					base = base + (cursorSwirl - base) * influence;
				}
			}

			return base;
		};

		const stepFrame = () => {
			const isDark = theme === 'dark';
			const palette = isDark
				? ['157, 193, 158', '102, 120, 99', '221, 240, 228']
				: ['62, 91, 65', '74, 83, 71', '23, 26, 21'];

			for (const c of carriers) {
				c.px = c.x;
				c.py = c.y;
				const ang = fieldAngle(c.x, c.y);
				const tx = Math.cos(ang) * flowSpeed;
				const ty = Math.sin(ang) * flowSpeed;
				c.vx += (tx - c.vx) * 0.24;
				c.vy += (ty - c.vy) * 0.24;
				c.x += c.vx;
				c.y += c.vy;
				c.phase += 0.04;

				if (c.x < 0 || c.x > W || c.y < 0 || c.y > H) {
					c.x = ((c.x % W) + W) % W;
					c.y = ((c.y % H) + H) % H;
					c.px = c.x;
					c.py = c.y;
					continue;
				}

				const interference = 0.5 + 0.5 * Math.sin(c.phase);
				const rgb = c.tier < 0.58 ? palette[0] : c.tier < 0.9 ? palette[1] : palette[2];
				const alpha = (0.04 + interference * 0.1).toFixed(3);
				ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
				ctx.lineWidth = 0.7 + interference * 0.75;
				ctx.beginPath();
				ctx.moveTo(c.px, c.py);
				ctx.lineTo(c.x, c.y);
				ctx.stroke();
			}
		};

		const tick = () => {
			if (!paused && inViewport && stepCount < maxSteps) {
				stepFrame();
				stepCount++;
			}
			if (stepCount < maxSteps) {
				rafId = requestAnimationFrame(tick);
			}
		};

		restartFn = init;
		init();

		return () => {
			restartFn = undefined;
			cancelAnimationFrame(rafId);
			canvas?.removeEventListener('pointermove', onPointerMove);
			canvas?.removeEventListener('pointerleave', onPointerLeave);
			io.disconnect();
		};
	});
</script>

<div class="grid grid-cols-1 gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-start lg:gap-14">
	<div class="overflow-hidden border border-line bg-surface">
		<canvas
			bind:this={canvas}
			aria-label="Kanvas seni algoritmik Wired Resonance berbasis medan vektor Perlin dan atraktor harmonik"
			class="block aspect-[900/560] w-full cursor-crosshair"
		></canvas>
		<div
			class="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-bg px-4 py-2.5"
		>
			<span class="font-mono text-xs text-muted">wired resonance · seed #{seed}</span>
			<div class="flex flex-wrap items-center gap-2">
				<button
					type="button"
					aria-pressed={paused}
					onclick={() => (paused = !paused)}
					class="inline-flex min-h-[44px] items-center border border-control-line bg-surface px-3.5 font-mono text-xs text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
				>
					{paused ? 'Lanjut' : 'Jeda'}
				</button>
				<button
					type="button"
					onclick={() => restartFn?.()}
					class="inline-flex min-h-[44px] items-center border border-control-line bg-surface px-3.5 font-mono text-xs text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
				>
					Ulang
				</button>
				<button
					type="button"
					onclick={exportPng}
					class="inline-flex min-h-[44px] items-center border border-primary bg-primary px-3.5 font-mono text-xs font-medium text-on-primary transition-opacity duration-200 hover:opacity-90"
				>
					Simpan PNG
				</button>
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-6 border border-line bg-surface p-6">
		<div class="flex flex-col gap-2">
			<span class="font-mono text-xs text-primary">Seed &amp; Parameter</span>
			<p class="text-sm leading-relaxed text-muted">
				Gerakkan kursor di atas kanvas untuk membelokkan medan aliran, atau pilih preset di bawah.
			</p>
		</div>

		<div class="flex flex-wrap gap-2">
			{#each [['wired', 'Wired'], ['vortex', 'Vortex'], ['laminar', 'Laminar']] as [kind, label] (kind)}
				<button
					type="button"
					onclick={() => applyPreset(kind as 'wired' | 'vortex' | 'laminar')}
					class="inline-flex min-h-[44px] flex-1 items-center justify-center border border-line bg-bg px-3 font-mono text-xs text-muted transition-colors hover:border-primary hover:text-primary"
				>
					{label}
				</button>
			{/each}
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => (seed = Math.max(1, seed - 1))}
				class="inline-flex min-h-[44px] flex-1 items-center justify-center border border-control-line bg-bg font-mono text-xs text-ink hover:border-primary hover:text-primary"
			>
				Prev
			</button>
			<button
				type="button"
				onclick={() => (seed = Math.floor(Math.random() * 9999) + 1)}
				class="inline-flex min-h-[44px] flex-1 items-center justify-center border border-primary bg-primary font-mono text-xs font-medium text-on-primary hover:opacity-90"
			>
				Acak
			</button>
			<button
				type="button"
				onclick={() => (seed = seed + 1)}
				class="inline-flex min-h-[44px] flex-1 items-center justify-center border border-control-line bg-bg font-mono text-xs text-ink hover:border-primary hover:text-primary"
			>
				Next
			</button>
		</div>

		<div class="flex flex-col gap-5 border-t border-line pt-5">
			<label class="flex flex-col gap-2">
				<span class="flex justify-between font-mono text-xs text-muted">
					<span>Partikel</span>
					<span class="text-ink">{carrierCount}</span>
				</span>
				<input
					type="range"
					min="600"
					max="3600"
					step="200"
					bind:value={carrierCount}
					class="accent-primary"
				/>
			</label>

			<label class="flex flex-col gap-2">
				<span class="flex justify-between font-mono text-xs text-muted">
					<span>Kecepatan</span>
					<span class="text-ink">{flowSpeed.toFixed(1)}</span>
				</span>
				<input
					type="range"
					min="0.5"
					max="3.0"
					step="0.1"
					bind:value={flowSpeed}
					class="accent-primary"
				/>
			</label>

			<label class="flex flex-col gap-2">
				<span class="flex justify-between font-mono text-xs text-muted">
					<span>Frekuensi Medan</span>
					<span class="text-ink">{noiseScale.toFixed(3)}</span>
				</span>
				<input
					type="range"
					min="0.002"
					max="0.012"
					step="0.001"
					bind:value={noiseScale}
					class="accent-primary"
				/>
			</label>

			<label class="flex flex-col gap-2">
				<span class="flex justify-between font-mono text-xs text-muted">
					<span>Tarikan Harmonik</span>
					<span class="text-ink">{harmonicPull.toFixed(1)}</span>
				</span>
				<input
					type="range"
					min="0"
					max="2.4"
					step="0.1"
					bind:value={harmonicPull}
					class="accent-primary"
				/>
			</label>
		</div>
	</div>
</div>
