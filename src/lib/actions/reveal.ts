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

	const onMove = (event: PointerEvent) => {
		const rect = node.getBoundingClientRect();
		const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;
		const rotX = -ny * maxDeg;
		const rotY = nx * maxDeg;
		node.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
	};

	const onLeave = () => {
		animate(
			node,
			{
				transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
			},
			{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }
		);
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
