<script lang="ts">
	import { onMount } from 'svelte';
	import { animate, scroll } from 'motion';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { reveal, scrambleElement, springTap, tilt3d } from '$lib/actions/reveal';
	import AlgorithmicArt from '$lib/components/AlgorithmicArt.svelte';
	import BannerLain from '$lib/components/BannerLain.svelte';
	import CommandTerminal from '$lib/components/CommandTerminal.svelte';
	import DailyDriver from '$lib/components/DailyDriver.svelte';
	import Portrait3D from '$lib/components/Portrait3D.svelte';
	import ProjectRow from '$lib/components/ProjectRow.svelte';
	import ScrollScene3D from '$lib/components/ScrollScene3D.svelte';
	import WiredMesh from '$lib/components/WiredMesh.svelte';
	import { profile, projects } from '$lib/data';
	import type { PageProps } from './$types';

	type Theme = 'light' | 'dark';
	type Status = 'idle' | 'loading' | 'success' | 'error';

	let { form }: PageProps = $props();

	let theme: Theme = $state('dark');
	let status: Status = $state('idle');
	let menuOpen: boolean = $state(false);
	let cmdOpen: boolean = $state(false);
	let scroll3d: boolean = $state(true);
	let crtEnabled: boolean = $state(true);
	let progressBar: HTMLDivElement | undefined = $state();
	let heroHeading: HTMLHeadingElement | undefined = $state();
	let hud = $state({ x: 0, y: 0, scrollPct: 0 });
	let stopScramble: (() => void) | undefined;

	function triggerWiredScramble() {
		if (!heroHeading) return;
		stopScramble?.();
		stopScramble = scrambleElement(heroHeading, profile.name);
	}

	function navigateToSection(hash: string) {
		const target = document.querySelector(hash);
		target?.scrollIntoView({ behavior: 'smooth' });
	}

	$effect(() => {
		document.documentElement.classList.toggle('dark', theme === 'dark');
	});

	onMount(() => {
		const cleanups: Array<() => void> = [];

		if (progressBar && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			cleanups.push(scroll(animate(progressBar, { scaleX: [0, 1] }, { ease: 'linear' })));
		}

		const updateScroll = () => {
			const max = document.documentElement.scrollHeight - window.innerHeight;
			hud.scrollPct = max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0;
		};
		updateScroll();
		window.addEventListener('scroll', updateScroll, { passive: true });
		cleanups.push(() => window.removeEventListener('scroll', updateScroll));

		return () => {
			stopScramble?.();
			for (const fn of cleanups) fn();
		};
	});
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			menuOpen = false;
			cmdOpen = false;
		}
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			cmdOpen = !cmdOpen;
			menuOpen = false;
		}
	}}
	onpointermove={(event) => {
		hud.x = Math.round(event.clientX);
		hud.y = Math.round(event.clientY);
	}}
/>

<div
	class="relative min-h-dvh bg-bg text-ink transition-colors duration-200 {theme === 'dark'
		? 'dark'
		: ''}"
>
	<ScrollScene3D {theme} enabled={scroll3d} />
	{#if crtEnabled}
		<div
			aria-hidden="true"
			class="pointer-events-none fixed inset-0 z-40 opacity-[0.04] dark:opacity-[0.06]"
			style="background-image: repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, currentColor 2px, currentColor 3px);"
		></div>
	{/if}
	<div
		bind:this={progressBar}
		aria-hidden="true"
		class="pointer-events-none fixed top-0 right-0 left-0 z-30 h-[2px] origin-left scale-x-0 bg-primary"
	></div>
	<!-- Navigasi -->
	<header class="relative z-10 border-b border-line bg-bg/90 backdrop-blur-xs">
		<div
			class="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:h-20 lg:px-20"
		>
			<a
				href={resolve('/')}
				class="inline-flex min-h-[44px] items-center font-display text-sm font-semibold tracking-wide text-ink lg:text-base"
			>
				{profile.handle}
			</a>

			<div class="flex items-center gap-3 lg:gap-8">
				<nav aria-label="Navigasi utama" class="hidden items-center gap-8 lg:flex">
					<a
						href="#proyek"
						class="inline-flex min-h-[44px] items-center text-sm text-muted transition-colors duration-200 hover:text-primary"
					>
						Proyek
					</a>
					<a
						href="#tentang"
						class="inline-flex min-h-[44px] items-center text-sm text-muted transition-colors duration-200 hover:text-primary"
					>
						Tentang
					</a>
					<a
						href="#eksperimen"
						class="inline-flex min-h-[44px] items-center text-sm text-muted transition-colors duration-200 hover:text-primary"
					>
						Eksperimen
					</a>
					<a
						href="#kontak"
						class="inline-flex min-h-[44px] items-center text-sm text-muted transition-colors duration-200 hover:text-primary"
					>
						Kontak
					</a>
					<a
						href={profile.links.blog}
						target="_blank"
						rel="external noopener noreferrer"
						class="inline-flex min-h-[44px] items-center font-mono text-xs text-primary transition-colors duration-200 hover:underline"
					>
						my-blog
					</a>
				</nav>

				<button
					type="button"
					aria-label={scroll3d ? 'Jeda latar 3D scroll' : 'Putar latar 3D scroll'}
					aria-pressed={scroll3d}
					onclick={() => (scroll3d = !scroll3d)}
					class="inline-flex h-11 items-center border px-3 font-mono text-xs transition-colors duration-200 {scroll3d
						? 'border-primary bg-primary-soft text-primary'
						: 'border-control-line bg-surface text-muted hover:text-ink'}"
				>
					3D
				</button>

				<button
					type="button"
					aria-label={crtEnabled ? 'Matikan efek scanline CRT' : 'Aktifkan efek scanline CRT'}
					aria-pressed={crtEnabled}
					onclick={() => (crtEnabled = !crtEnabled)}
					class="hidden h-11 items-center border px-3 font-mono text-xs transition-colors duration-200 sm:inline-flex {crtEnabled
						? 'border-primary bg-primary-soft text-primary'
						: 'border-control-line bg-surface text-muted hover:text-ink'}"
				>
					CRT
				</button>

				<button
					type="button"
					aria-label="Buka terminal perintah"
					onclick={() => {
						cmdOpen = true;
						menuOpen = false;
					}}
					class="inline-flex h-11 items-center gap-2 border border-control-line bg-surface px-3 font-mono text-xs text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
				>
					<span class="text-primary">$</span>
					<span class="hidden sm:inline">cmd</span>
					<span class="hidden text-muted md:inline">Ctrl+K</span>
				</button>

				<button
					type="button"
					aria-label={theme === 'dark' ? 'Ubah ke tema terang' : 'Ubah ke tema gelap'}
					aria-pressed={theme === 'dark'}
					onclick={() => (theme = theme === 'dark' ? 'light' : 'dark')}
					class="flex h-11 w-11 items-center justify-center border border-control-line bg-surface text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
				>
					<svg
						width="17"
						height="17"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
						class="dark:hidden"
					>
						<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
					</svg>
					<svg
						width="17"
						height="17"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						aria-hidden="true"
						class="hidden dark:block"
					>
						<circle cx="12" cy="12" r="4" />
						<path
							d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
						/>
					</svg>
				</button>

				<button
					type="button"
					aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
					aria-expanded={menuOpen}
					aria-controls="menu-mobile"
					onclick={() => (menuOpen = !menuOpen)}
					class="inline-flex h-11 items-center gap-2 border border-control-line bg-surface px-3.5 font-mono text-xs text-ink transition-colors duration-200 hover:border-primary hover:text-primary lg:hidden"
				>
					<span>{menuOpen ? 'Tutup' : 'Menu'}</span>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						aria-hidden="true"
						class={menuOpen ? 'hidden' : 'block'}
					>
						<path d="M4 7h16M4 12h16M4 17h16" />
					</svg>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						aria-hidden="true"
						class={menuOpen ? 'block' : 'hidden'}
					>
						<path d="M6 6l12 12M18 6L6 18" />
					</svg>
				</button>
			</div>
		</div>

		<!-- Panel menu mobile absolute agar membuka menu tidak menggeser target scroll Lenis -->
		<nav
			id="menu-mobile"
			aria-label="Navigasi mobile"
			class="absolute inset-x-0 top-full z-20 border-b border-line bg-surface shadow-xl lg:hidden {menuOpen
				? 'block'
				: 'hidden'}"
		>
			<div class="mx-auto flex max-w-[1280px] flex-col divide-y divide-line px-6">
				<a
					href="#proyek"
					onclick={() => (menuOpen = false)}
					class="flex min-h-[48px] items-center text-sm text-muted hover:text-primary"
				>
					Proyek
				</a>
				<a
					href="#tentang"
					onclick={() => (menuOpen = false)}
					class="flex min-h-[48px] items-center text-sm text-muted hover:text-primary"
				>
					Tentang
				</a>
				<a
					href="#eksperimen"
					onclick={() => (menuOpen = false)}
					class="flex min-h-[48px] items-center text-sm text-muted hover:text-primary"
				>
					Eksperimen
				</a>
				<a
					href="#kontak"
					onclick={() => (menuOpen = false)}
					class="flex min-h-[48px] items-center text-sm text-muted hover:text-primary"
				>
					Kontak
				</a>
				<a
					href={profile.links.blog}
					target="_blank"
					rel="external noopener noreferrer"
					onclick={() => (menuOpen = false)}
					class="flex min-h-[48px] items-center font-mono text-xs text-primary"
				>
					Baca my-blog
				</a>
				<button
					type="button"
					aria-pressed={crtEnabled}
					onclick={() => (crtEnabled = !crtEnabled)}
					class="flex min-h-[48px] w-full items-center justify-between font-mono text-xs text-muted hover:text-primary"
				>
					<span>Scanline CRT</span>
					<span class="text-primary">{crtEnabled ? 'ON' : 'OFF'}</span>
				</button>
			</div>
		</nav>
	</header>

	<main class="relative z-10">
		<!-- Hero -->
		<section class="mx-auto max-w-[1280px] px-6 pt-20 pb-16 lg:px-20 lg:pt-32 lg:pb-24">
			<div
				class="grid grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] lg:gap-16"
			>
				<div class="flex min-w-0 flex-col gap-8 lg:gap-10">
					<p class="font-mono text-xs text-primary lg:text-sm">LAYER:00 · $ whoami</p>

					<h1
						bind:this={heroHeading}
						class="font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[1.06] font-semibold tracking-tight text-ink"
					>
						{profile.name}
					</h1>

					<p class="max-w-[60ch] text-base leading-relaxed text-muted lg:text-lg">
						{profile.heroIntro}
					</p>

					<div class="flex flex-wrap items-center gap-4 pt-2">
						<a
							href="#proyek"
							use:springTap
							class="inline-flex h-12 items-center bg-primary px-6 text-sm font-medium text-on-primary transition-opacity duration-200 hover:opacity-90"
						>
							Lihat proyek
						</a>
						<a
							href="#kontak"
							use:springTap
							class="inline-flex h-12 items-center border border-control-line bg-surface px-6 text-sm text-ink transition-colors duration-200 hover:border-primary hover:text-primary"
						>
							Hubungi saya
						</a>
						<a
							href={profile.links.blog}
							target="_blank"
							rel="external noopener noreferrer"
							class="inline-flex h-12 items-center gap-2 border border-line px-5 font-mono text-xs text-muted transition-colors duration-200 hover:border-primary hover:text-primary"
						>
							<span>my-blog</span>
							<svg
								width="13"
								height="13"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<path d="M7 17 17 7M9 7h8v8" />
							</svg>
						</a>
					</div>

					<p class="pt-2 font-mono text-xs text-muted">
						@{profile.handle} · {profile.role}
					</p>
				</div>

				<div class="w-full max-w-[460px] justify-self-center lg:max-w-none">
					<WiredMesh {theme} />
				</div>
			</div>
		</section>

		<!-- Banner Lain (dipakai di tema gelap dan tema terang) -->
		<section aria-label="Banner ilustrasi" class="border-t border-line">
			<div class="mx-auto max-w-[1280px] px-6 py-12 lg:px-20 lg:py-20">
				<BannerLain
					src="/images/banner.jpg"
					alt="Banner ilustrasi Serial Experiments Lain di dalam kereta"
				/>
				<p class="mt-4 font-mono text-xs text-muted">
					LAYER:01 · banner · serial experiments lain · palet sage &amp; lumut
				</p>
			</div>
		</section>

		<!-- Proyek -->
		<section id="proyek" class="border-t border-line">
			<div class="mx-auto max-w-[1280px] px-6 py-20 lg:px-20 lg:py-32">
				<div use:reveal={0} class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div class="flex flex-col gap-3">
						<p class="font-mono text-xs text-primary">LAYER:02 · $ ls proyek</p>
						<h2 class="font-display text-2xl font-semibold tracking-tight text-ink lg:text-4xl">
							Proyek Pilihan
						</h2>
					</div>

					<a
						href={profile.links.github}
						target="_blank"
						rel="external noopener noreferrer"
						class="inline-flex min-h-[44px] items-center font-mono text-xs text-muted transition-colors duration-200 hover:text-primary"
					>
						Semua repositori di github.com/Lemondeft
					</a>
				</div>

				<div
					class="mt-12 flex flex-col divide-y divide-line border-t border-b border-line lg:mt-16"
				>
					{#each projects as project, i (project.title)}
						<ProjectRow {project} index={i} />
					{/each}
				</div>
			</div>
		</section>

		<!-- Tentang -->
		<section id="tentang" class="border-t border-line">
			<div class="mx-auto max-w-[1280px] px-6 py-20 lg:px-20 lg:py-32">
				<div use:reveal={0} class="flex flex-col gap-3">
					<p class="font-mono text-xs text-primary">LAYER:03 · $ cat tentang.md</p>
					<h2 class="font-display text-2xl font-semibold tracking-tight text-ink lg:text-4xl">
						Tentang &amp; Stack
					</h2>
				</div>

				<div class="mt-12 flex flex-col items-start gap-12 lg:mt-16 lg:flex-row lg:gap-20">
					<div use:reveal={60}>
						<Portrait3D
							src="/images/portrait.jpg"
							alt="Foto profil ilustrasi untuk Ahmad Rizki Maulana"
							caption="@{profile.handle} · {profile.name}"
						/>
					</div>

					<div use:reveal={120} class="flex w-full flex-1 flex-col gap-10">
						<p class="max-w-[58ch] text-base leading-relaxed text-muted lg:text-lg">
							{profile.bio}
						</p>

						<dl class="flex flex-col divide-y divide-line border-t border-b border-line">
							{#each profile.facts as fact (fact.label)}
								<div
									class="flex flex-col justify-between gap-2 py-4 sm:flex-row sm:items-center sm:gap-8"
								>
									<dt class="font-mono text-xs text-muted">
										{fact.label}
									</dt>
									<dd class="text-sm text-ink sm:text-right">{fact.value}</dd>
								</div>
							{/each}
						</dl>

						<div class="flex flex-col gap-7">
							{#each profile.skillGroups as group (group.label)}
								<div class="flex flex-col gap-3">
									<h3 class="font-mono text-xs text-muted">{group.label}</h3>
									<div class="flex flex-wrap gap-2.5">
										{#each group.items as item (item)}
											<span
												class="border border-line bg-surface px-3 py-1.5 font-mono text-xs text-ink"
											>
												{item}
											</span>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>

				<div use:reveal={80} class="mt-20 border-t border-line pt-16 lg:mt-28 lg:pt-20">
					<div use:tilt3d={3}>
						<DailyDriver />
					</div>
				</div>
			</div>
		</section>

		<!-- Seni Algoritmik -->
		<section id="eksperimen" class="border-t border-line">
			<div class="mx-auto max-w-[1280px] px-6 py-20 lg:px-20 lg:py-32">
				<div use:reveal={0} class="flex flex-col gap-3">
					<p class="font-mono text-xs text-primary">LAYER:04 · $ ./wired_resonance --seed</p>
					<h2 class="font-display text-2xl font-semibold tracking-tight text-ink lg:text-4xl">
						Seni Algoritmik
					</h2>
				</div>

				<div use:reveal={80} class="mt-12 lg:mt-16">
					<AlgorithmicArt {theme} />
				</div>
			</div>
		</section>

		<!-- Kontak -->
		<section id="kontak" class="border-t border-line">
			<div class="mx-auto max-w-[1280px] px-6 py-20 lg:px-20 lg:py-32">
				<div use:reveal={0} class="flex flex-col gap-3">
					<p class="font-mono text-xs text-primary">LAYER:05 · $ ping {profile.handle}</p>
					<h2 class="font-display text-2xl font-semibold tracking-tight text-ink lg:text-4xl">
						Hubungi Saya
					</h2>
				</div>

				<div class="mt-12 grid grid-cols-1 gap-14 lg:mt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
					<div use:reveal={60} class="flex flex-col gap-8">
						<p class="max-w-[46ch] text-base leading-relaxed text-muted lg:text-lg">
							Punya pertanyaan soal proyek, kolaborasi, atau sekadar ingin berdiskusi? Kirim pesan
							lewat formulir ini atau hubungi langsung lewat kanal di bawah.
						</p>

						<div class="flex flex-col divide-y divide-line border-t border-b border-line">
							<a
								href="mailto:{profile.links.email}"
								target="_blank"
								rel="external noopener noreferrer"
								class="flex min-h-[48px] items-center justify-between gap-4 py-3 font-mono text-xs text-ink transition-colors duration-200 hover:text-primary"
							>
								<span class="text-muted">Email</span>
								<span class="text-primary">{profile.links.email}</span>
							</a>
							<a
								href={profile.links.discord}
								target="_blank"
								rel="external noopener noreferrer"
								class="flex min-h-[48px] items-center justify-between gap-4 py-3 font-mono text-xs text-ink transition-colors duration-200 hover:text-primary"
							>
								<span class="text-muted">Discord</span>
								<span>discord.com/users/699924273040719955</span>
							</a>
							<a
								href={profile.links.github}
								target="_blank"
								rel="external noopener noreferrer"
								class="flex min-h-[48px] items-center justify-between gap-4 py-3 font-mono text-xs text-ink transition-colors duration-200 hover:text-primary"
							>
								<span class="text-muted">GitHub</span>
								<span>github.com/Lemondeft</span>
							</a>
							<a
								href={profile.links.blog}
								target="_blank"
								rel="external noopener noreferrer"
								class="flex min-h-[48px] items-center justify-between gap-4 py-3 font-mono text-xs text-ink transition-colors duration-200 hover:text-primary"
							>
								<span class="text-muted">Blog</span>
								<span>my-blog-lemondeft.vercel.app</span>
							</a>
						</div>
					</div>

					<form
						use:reveal={120}
						method="POST"
						action="?/kirim"
						use:enhance={() => {
							status = 'loading';
							return async ({ result, update }) => {
								await update({ reset: result.type === 'success' });
								status = result.type === 'success' ? 'success' : 'error';
							};
						}}
						class="flex w-full flex-col gap-6"
					>
						<div class="flex flex-col gap-2">
							<label for="kontak-nama" class="font-mono text-xs text-muted">Nama</label>
							<input
								id="kontak-nama"
								name="nama"
								required
								autocomplete="name"
								placeholder="Nama kamu"
								class="h-12 w-full border border-control-line bg-surface px-4 text-sm text-ink transition-colors duration-200 placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-offset-0 focus:outline-primary"
							/>
						</div>

						<div class="flex flex-col gap-2">
							<label for="kontak-email" class="font-mono text-xs text-muted">Email</label>
							<input
								id="kontak-email"
								name="email"
								type="email"
								required
								autocomplete="email"
								placeholder="nama@email.com"
								class="h-12 w-full border border-control-line bg-surface px-4 text-sm text-ink transition-colors duration-200 placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-offset-0 focus:outline-primary"
							/>
						</div>

						<div class="flex flex-col gap-2">
							<label for="kontak-pesan" class="font-mono text-xs text-muted">Pesan</label>
							<textarea
								id="kontak-pesan"
								name="pesan"
								required
								rows="5"
								placeholder="Tulis pesan kamu di sini..."
								class="min-h-[140px] w-full border border-control-line bg-surface px-4 py-3 text-sm text-ink transition-colors duration-200 placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-offset-0 focus:outline-primary"
							></textarea>
						</div>

						<button
							type="submit"
							disabled={status === 'loading'}
							class="flex h-12 items-center justify-center gap-2 border px-6 text-sm font-medium transition-colors duration-200 {status ===
							'loading'
								? 'border-line bg-surface text-muted'
								: 'border-transparent bg-primary text-on-primary hover:opacity-90'}"
						>
							{#if status === 'loading'}
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
									aria-hidden="true"
									class="animate-spin"
								>
									<path d="M12 3a9 9 0 1 0 9 9" />
								</svg>
								<span>Mengirim...</span>
							{:else}
								<span>Kirim pesan</span>
							{/if}
						</button>

						<div aria-live="polite">
							{#if status !== 'idle'}
								<div class="flex items-center gap-3 border border-line bg-surface px-4 py-3.5">
									{#if status === 'loading'}
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											aria-hidden="true"
											class="animate-spin text-muted"
										>
											<path d="M12 3a9 9 0 1 0 9 9" />
										</svg>
										<span class="text-sm text-muted">Mengirim pesan lewat Resend...</span>
									{:else if status === 'success'}
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
											aria-hidden="true"
											class="text-success"
										>
											<path d="M20 6 9 17l-5-5" />
										</svg>
										<span class="text-sm text-success">Pesan terkirim. Terima kasih!</span>
									{:else}
										<svg
											width="16"
											height="16"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="1.5"
											stroke-linecap="round"
											stroke-linejoin="round"
											aria-hidden="true"
											class="text-danger"
										>
											<circle cx="12" cy="12" r="9" />
											<path d="M12 8v5M12 16.5v.01" />
										</svg>
										<span class="text-sm text-danger">
											{form?.pesan ?? 'Gagal mengirim pesan. Silakan coba lagi.'}
										</span>
									{/if}
								</div>
							{/if}
						</div>
					</form>
				</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="relative z-10 border-t border-line bg-bg/90">
		<div
			class="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-14 lg:flex-row lg:items-center lg:justify-between lg:px-20 lg:py-20"
		>
			<div class="flex flex-col gap-2">
				<p class="font-mono text-xs text-muted">
					© 2026 {profile.name} (@{profile.handle})
				</p>
				<p class="font-mono text-[11px] text-muted tabular-nums">
					cursor: {hud.x}, {hud.y} · scroll: {hud.scrollPct}% · theme: {theme}
				</p>
			</div>

			<div class="flex flex-wrap items-center gap-6">
				<a
					href="#proyek"
					class="inline-flex min-h-[44px] items-center font-mono text-xs text-muted transition-colors duration-200 hover:text-primary"
				>
					Proyek
				</a>
				<a
					href={profile.links.github}
					target="_blank"
					rel="external noopener noreferrer"
					class="inline-flex min-h-[44px] items-center font-mono text-xs text-muted transition-colors duration-200 hover:text-primary"
				>
					GitHub
				</a>
				<a
					href={profile.links.blog}
					target="_blank"
					rel="external noopener noreferrer"
					class="inline-flex min-h-[44px] items-center font-mono text-xs text-muted transition-colors duration-200 hover:text-primary"
				>
					my-blog
				</a>
				<a
					href={profile.links.discord}
					target="_blank"
					rel="external noopener noreferrer"
					class="inline-flex min-h-[44px] items-center font-mono text-xs text-muted transition-colors duration-200 hover:text-primary"
				>
					Discord
				</a>
				<a
					href="mailto:{profile.links.email}"
					target="_blank"
					rel="external noopener noreferrer"
					class="inline-flex min-h-[44px] items-center font-mono text-xs text-primary transition-colors duration-200 hover:underline"
				>
					{profile.links.email}
				</a>
			</div>
		</div>
	</footer>

	<CommandTerminal
		open={cmdOpen}
		{theme}
		crt={crtEnabled}
		onClose={() => (cmdOpen = false)}
		onToggleTheme={() => (theme = theme === 'dark' ? 'light' : 'dark')}
		onToggleCrt={() => (crtEnabled = !crtEnabled)}
		onTriggerWired={triggerWiredScramble}
		onNavigate={navigateToSection}
	/>
</div>
