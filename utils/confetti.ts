import type { Options } from "canvas-confetti";

/** Short celebratory burst for a successful bill save. */
export async function celebrateBillSaved(): Promise<void> {
  if (typeof window === "undefined") return;

  const confetti = (await import("canvas-confetti")).default;
  const count = 200;
  const defaults: Options = {
    origin: { y: 0.55 },
    zIndex: 100,
  };

  const fire = (partial: Options) => {
    confetti({ ...defaults, ...partial });
  };

  fire({ spread: 26, startVelocity: 55, particleCount: count * 0.25 });
  fire({ spread: 60, particleCount: count * 0.2 });
  fire({ spread: 100, decay: 0.91, scalar: 0.8, particleCount: count * 0.35 });
  fire({
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
    particleCount: count * 0.1,
  });
  fire({ spread: 120, startVelocity: 45, particleCount: count * 0.1 });
}
