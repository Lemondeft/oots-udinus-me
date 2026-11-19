import { animate, hover, inView, press, scroll } from 'motion';

function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

export function reveal(node: HTMLElement, delaySec = 0) {
	if (typeof window === 'undefined' || prefersReducedMotion()) {
		return {};
	}

	const rect = node.getBoundingClientRect();
	if (rect.top < window.innerHeight * 0.92) {
		return {};
	}

	node.style.opacity = '0';
	node.style.transform = 'translateY(14px)';

	const stop = inView(
		node,
		() => {
			animate(
				node,
				{ opacity: [0, 1], y: [14, 0] },
				{
					duration: 0.45,
					delay: delaySec / 1000,
					ease: [0.22, 1, 0.36, 1]
				}
			);
		},
		{ amount: 0.08 }
	);

	return {
		destroy() {
			stop();
		}
	};
}

export function springTap(node: HTMLElement) {
	if (typeof window === 'undefined' || prefersReducedMotion()) {
		return {};
	}

	const stopHover = hover(node, () => {
		animate(node, { y: -1.5 }, { duration: 0.18, ease: 'easeOut' });
		return () => {
			animate(node, { y: 0 }, { duration: 0.2, ease: 'easeOut' });
		};
	});

	const stopPress = press(node, () => {
		animate(node, { scale: 0.98 }, { duration: 0.1 });
		return () => {
			animate(node, { scale: 1 }, { duration: 0.18, ease: 'easeOut' });
		};
	});

	return {
		destroy() {
			stopHover();
			stopPress();
		}
	};
}

export function tilt3d(node: HTMLElement, maxDeg = 6) {
	if (typeof window === 'undefined' || prefersReducedMotion()) {
		return {};
	}

	node.style.transformStyle = 'preserve-3d';
	node.style.willChange = 'transform';

	let rotX = 0;
	let rotY = 0;
	let targetX = 0;
	let targetY = 0;
	let rafId = 0;

	const tick = () => {
		rotX += (targetX - rotX) * 0.14;
		rotY += (targetY - rotY) * 0.14;
		node.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;

		if (
			Math.abs(targetX - rotX) > 0.02 ||
			Math.abs(targetY - rotY) > 0.02 ||
			Math.abs(rotX) > 0.02 ||
			Math.abs(rotY) > 0.02
		) {
			rafId = requestAnimationFrame(tick);
		} else {
			rafId = 0;
			if (targetX === 0 && targetY === 0) {
				node.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
			}
		}
	};

	const ensureTick = () => {
		if (!rafId) {
			rafId = requestAnimationFrame(tick);
		}
	};

	const onMove = (event: PointerEvent) => {
		const rect = node.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return;
		const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
		targetX = -ny * maxDeg;
		targetY = nx * maxDeg;
		ensureTick();
	};

	const onLeave = () => {
		targetX = 0;
		targetY = 0;
		ensureTick();
	};

	node.addEventListener('pointermove', onMove, { passive: true });
	node.addEventListener('pointerleave', onLeave, { passive: true });

	return {
		destroy() {
			if (rafId) cancelAnimationFrame(rafId);
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
}

export function flashlight(
	node: HTMLElement,
	onUpdate: (state: { x: number; y: number; active: boolean }) => void
) {
	if (typeof window === 'undefined' || prefersReducedMotion()) {
		return {};
	}

	const onMove = (event: PointerEvent) => {
		const rect = node.getBoundingClientRect();
		onUpdate({
			x: ((event.clientX - rect.left) / rect.width) * 100,
			y: ((event.clientY - rect.top) / rect.height) * 100,
			active: true
		});
	};

	const onLeave = () => {
		onUpdate({ x: 50, y: 50, active: false });
	};

	node.addEventListener('pointermove', onMove, { passive: true });
	node.addEventListener('pointerleave', onLeave, { passive: true });

	return {
		destroy() {
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
}

export function spotlight(node: HTMLElement) {
	if (typeof window === 'undefined' || prefersReducedMotion()) {
		return {};
	}

	const onMove = (event: PointerEvent) => {
		const rect = node.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		node.style.backgroundImage = `radial-gradient(360px circle at ${x}px ${y}px, var(--primary-soft), transparent 70%)`;
	};

	const onLeave = () => {
		node.style.backgroundImage = '';
	};

	node.addEventListener('pointermove', onMove, { passive: true });
	node.addEventListener('pointerleave', onLeave, { passive: true });

	return {
		destroy() {
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+';

export function scrambleElement(node: HTMLElement, finalText: string) {
	if (typeof window === 'undefined' || prefersReducedMotion()) {
		node.textContent = finalText;
		return () => {};
	}

	let frame = 0;
	const totalFrames = 18;
	let rafId = 0;

	const tick = () => {
		frame++;
		const progress = frame / totalFrames;
		const revealCount = Math.floor(progress * finalText.length);
		let out = '';
		for (let i = 0; i < finalText.length; i++) {
			const ch = finalText[i];
			if (ch === ' ' || i < revealCount) {
				out += ch;
			} else {
				out += GLYPHS[(frame * 7 + i * 13) % GLYPHS.length];
			}
		}
		node.textContent = out;
		if (frame < totalFrames) {
			rafId = requestAnimationFrame(tick);
		} else {
			node.textContent = finalText;
		}
	};

	rafId = requestAnimationFrame(tick);
	return () => {
		cancelAnimationFrame(rafId);
		node.textContent = finalText;
	};
}

export function scrollDepth3d(node: HTMLElement) {
	if (typeof window === 'undefined' || prefersReducedMotion()) {
		return {};
	}

	node.style.transformStyle = 'preserve-3d';

	const stop = scroll(
		animate(
			node,
			{
				transform: [
					'perspective(1200px) rotateX(6deg) scale(0.97)',
					'perspective(1200px) rotateX(0deg) scale(1)',
					'perspective(1200px) rotateX(-4deg) scale(0.985)'
				]
			},
			{ ease: 'linear' }
		),
		{
			target: node,
			offset: ['start end', 'center center', 'end start']
		}
	);

	return {
		destroy() {
			stop();
		}
	};
}

export function magnetic(node: HTMLElement, strength = 6) {
	if (
		typeof window === 'undefined' ||
		prefersReducedMotion() ||
		!window.matchMedia('(pointer: fine)').matches
	) {
		return {};
	}

	node.dataset.magnetic = 'true';
	node.style.willChange = 'transform';

	let x = 0;
	let y = 0;
	let tx = 0;
	let ty = 0;
	let rafId = 0;

	const tick = () => {
		x += (tx - x) * 0.18;
		y += (ty - y) * 0.18;
		node.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;

		if (
			Math.abs(tx - x) > 0.05 ||
			Math.abs(ty - y) > 0.05 ||
			Math.abs(x) > 0.05 ||
			Math.abs(y) > 0.05
		) {
			rafId = requestAnimationFrame(tick);
		} else {
			rafId = 0;
			if (tx === 0 && ty === 0) {
				node.style.transform = '';
			}
		}
	};

	const ensureTick = () => {
		if (!rafId) rafId = requestAnimationFrame(tick);
	};

	const onMove = (event: PointerEvent) => {
		const rect = node.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return;
		const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
		tx = nx * strength;
		ty = ny * strength;
		ensureTick();
	};

	const onLeave = () => {
		tx = 0;
		ty = 0;
		ensureTick();
	};

	node.addEventListener('pointermove', onMove, { passive: true });
	node.addEventListener('pointerleave', onLeave, { passive: true });

	return {
		destroy() {
			if (rafId) cancelAnimationFrame(rafId);
			delete node.dataset.magnetic;
			node.style.transform = '';
			node.removeEventListener('pointermove', onMove);
			node.removeEventListener('pointerleave', onLeave);
		}
	};
}

export function hoverScramble(node: HTMLElement, finalText: string) {
	if (typeof window === 'undefined' || prefersReducedMotion()) {
		return {};
	}

	let text = finalText;
	let stop: (() => void) | undefined;
	let cooldownUntil = 0;

	const onEnter = () => {
		const now = performance.now();
		if (now < cooldownUntil) return;
		cooldownUntil = now + 900;
		stop?.();
		stop = scrambleElement(node, text);
	};

	node.addEventListener('pointerenter', onEnter, { passive: true });

	return {
		update(nextText: string) {
			text = nextText;
		},
		destroy() {
			stop?.();
			node.removeEventListener('pointerenter', onEnter);
		}
	};
}
