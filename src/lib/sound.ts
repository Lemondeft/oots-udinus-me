let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	if (!ctx) {
		const AudioCtx =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (!AudioCtx) return null;
		ctx = new AudioCtx();
	}
	if (ctx.state === 'suspended') {
		ctx.resume().catch(() => {});
	}
	return ctx;
}

export function playTick(enabled: boolean) {
	if (!enabled) return;
	const audio = getContext();
	if (!audio) return;

	const now = audio.currentTime;
	const osc = audio.createOscillator();
	const gain = audio.createGain();

	osc.type = 'triangle';
	osc.frequency.setValueAtTime(1180, now);
	osc.frequency.exponentialRampToValueAtTime(640, now + 0.022);

	gain.gain.setValueAtTime(0.0001, now);
	gain.gain.linearRampToValueAtTime(0.02, now + 0.003);
	gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);

	osc.connect(gain);
	gain.connect(audio.destination);
	osc.start(now);
	osc.stop(now + 0.032);
}

export function playConfirm(enabled: boolean) {
	if (!enabled) return;
	const audio = getContext();
	if (!audio) return;

	const now = audio.currentTime;
	const notes = [660, 990];
	notes.forEach((freq, idx) => {
		const osc = audio.createOscillator();
		const gain = audio.createGain();
		const start = now + idx * 0.048;

		osc.type = 'sine';
		osc.frequency.setValueAtTime(freq, start);

		gain.gain.setValueAtTime(0.0001, start);
		gain.gain.linearRampToValueAtTime(0.024, start + 0.006);
		gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.085);

		osc.connect(gain);
		gain.connect(audio.destination);
		osc.start(start);
		osc.stop(start + 0.09);
	});
}

export function playToggle(enabled: boolean, on: boolean) {
	if (!enabled) return;
	const audio = getContext();
	if (!audio) return;

	const now = audio.currentTime;
	const osc = audio.createOscillator();
	const gain = audio.createGain();

	osc.type = 'sine';
	osc.frequency.setValueAtTime(on ? 520 : 780, now);
	osc.frequency.exponentialRampToValueAtTime(on ? 880 : 420, now + 0.075);

	gain.gain.setValueAtTime(0.0001, now);
	gain.gain.linearRampToValueAtTime(0.024, now + 0.008);
	gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

	osc.connect(gain);
	gain.connect(audio.destination);
	osc.start(now);
	osc.stop(now + 0.095);
}

export function playThemeSweep(enabled: boolean, toDark: boolean) {
	if (!enabled) return;
	const audio = getContext();
	if (!audio) return;

	const now = audio.currentTime;
	const osc = audio.createOscillator();
	const gain = audio.createGain();

	osc.type = 'triangle';
	osc.frequency.setValueAtTime(toDark ? 720 : 380, now);
	osc.frequency.exponentialRampToValueAtTime(toDark ? 310 : 740, now + 0.14);

	gain.gain.setValueAtTime(0.0001, now);
	gain.gain.linearRampToValueAtTime(0.025, now + 0.014);
	gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

	osc.connect(gain);
	gain.connect(audio.destination);
	osc.start(now);
	osc.stop(now + 0.17);
}
