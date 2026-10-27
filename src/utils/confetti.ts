import confetti from 'canvas-confetti';

export function fireRescueConfetti() {
  try {
    confetti({
      particleCount: 55,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'],
    });
  } catch {
    // Graceful fallback if window or canvas is restricted
  }
}

export function fireCompleteConfetti() {
  try {
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#10b981', '#34d399', '#6ee7b7', '#3b82f6'],
    });
  } catch {
    // fallback
  }
}
