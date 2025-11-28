// --- Soot easter-egg: click to explode and reform ---
function initSootEasterEgg() {
    const sootSprites = document.querySelectorAll('.soot-sprite');
    sootSprites.forEach(sprite => {
        // ensure pointer events enabled
        sprite.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerSootExplosion(sprite, e);
        });
    });
}

function triggerSootExplosion(sprite, clickEvent) {
    if (sprite.classList.contains('soot-exploding')) return; // already exploding

    // Get click position from event
    const clickX = clickEvent.clientX;
    const clickY = clickEvent.clientY;

    // mark exploding
    sprite.classList.add('soot-exploding');
    // Override the floating animation so the sprite doesn't jump to a different position
    sprite.style.animation = 'sootDisintegrate 1100ms ease-out forwards';

    // Create particle pieces - more particles for a soot cloud, biased to float upward
    const particles = 22 + Math.floor(Math.random() * 16);
    for (let i = 0; i < particles; i++) {
        createParticle(clickX, clickY);
    }

    // After explosion animation completes, hide the original and clear inline animation
    setTimeout(() => {
        sprite.classList.add('soot-hidden');
        sprite.classList.remove('soot-exploding');
        sprite.style.animation = '';
    }, 1100);

    // Sprite stays hidden (doesn't reform) - it's gone like in the movie
}

function createParticle(x, y) {
    const p = document.createElement('div');
    p.className = 'soot-particle';
    // particle size and center it on cursor
    const size = 4 + Math.random() * 4; // 4-8px
    p.style.width = size + 'px';
    p.style.height = size + 'px';

    // random trajectory in all directions but biased upward to emulate soot floating
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 120; // spread distance
    // bias upward by subtracting a vertical offset
    const upwardBias = -20 - Math.random() * 60;
    const tx = Math.round(Math.cos(angle) * dist) + 'px';
    const ty = Math.round(Math.sin(angle) * dist + upwardBias) + 'px';
    const rot = Math.round((Math.random() - 0.5) * 720) + 'deg';

    // Position at exact click point, centered
    p.style.left = (x - size / 2) + 'px';
    p.style.top = (y - size / 2) + 'px';
    p.style.setProperty('--tx', tx);
    p.style.setProperty('--ty', ty);
    p.style.setProperty('--r', rot);
    document.body.appendChild(p);

    // remove particle after animation completes
    setTimeout(() => {
        p.remove();
    }, 1450);
}

// Attach soot handlers after DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // small delay to ensure soot sprites exist when script runs
    setTimeout(initSootEasterEgg, 200);
});