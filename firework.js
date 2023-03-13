export class Vec2 {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}

	add(v) {
		if (v instanceof Vec2) {
			this.x += v.x;
			this.y += v.y;
		} else if (typeof v === 'number') {
			this.x += v;
			this.y += v;
		}
	}

	mul(v) {
		this.x *= v;
		this.y *= v;
	}

	clone() {
		return new Vec2(this.x, this.y);
	}
}

export class Particle {
	constructor() {
		this.pos = new Vec2(0, 0);
		this.velocity = new Vec2(0, 0);
		this.color = 'white';
		this.life = 200;
		this.elapsed = 0;
		this.tail = 30;
		this.size = 2.5;
		this.tails = [];
	}

	update(delta) {
		this.pos.add(this.velocity);
		this.updateTails();
		this.elapsed += delta;
	}

	updateTails() {
		this.tails.unshift(this.pos.clone());
		if (this.tails.length > this.tail) {
			this.tails.splice(this.tail, this.tails.length - this.tail);
		}
	}

	render(ctx) {
		ctx.save();
		ctx.globalAlpha = 1 - Math.min(1, this.elapsed / this.life);

		const tailSize = this.size / this.tail;
		for(let i = 0; i < this.tail; i++) {
			const t = this.tails[i];
			if (!t) break;
			ctx.globalAlpha = Math.pow(1 - (i / (this.tail - 1)), 2);
			ctx.beginPath();
			ctx.arc(t.x, t.y, this.size, 0, Math.PI * 2);
			ctx.fill();
		}

		ctx.restore();
	}
}

export class Firework {

	constructor(args) {
		this.color = args.color || 'white';
		this.power1 = args.power1 || 3; // more is higher
		this.power2 = args.power2 || 2.5; // more is wider
		this.particleCount = args.particleCount || 50;
		this.particleTailLength = args.particleTailLength || 5;
		this.elapsed = args.elapsed || 0;
		this.particles = [];
		this.gravity = new Vec2(0, 0.02);
		this.tail = args.tail || 5;
		this.glow = args.glow || 5;

		this.createParticles();
	}

	clearParticle() {
		this.particles = [];
	}

	createParticles() {
		const angleFactor = (Math.PI * 2) / this.particleCount;
		for(let i = 0; i < this.particleCount; i++) {
			const angle = angleFactor * i;
			const force = new Vec2(Math.cos(angle) * this.power2, Math.sin(angle) * this.power2);
			for(let z = 0; z < Math.PI; z += angleFactor) {
				const pForce = new Vec2(Math.cos(z) * force.x, force.y);
				const particle = new Particle();
				particle.velocity.add(pForce);
				particle.tail = this.tail;
				this.particles.push(particle);
			}
		}
	}

	clone() {
		const f = new Firework(this);
		return f;
	}

	update(delta) {
		for(let c = delta; delta > 0; delta -= 1) {
			this.particles.forEach(p => {
				p.velocity.add(this.gravity);
				p.update(1);
			});
		}
	}

	render(ctx) {
		ctx.save();
		ctx.shadowColor = this.color;
		ctx.shadowBlur = this.glow;
		this.particles.forEach(p => {
			ctx.save();
			ctx.fillStyle = this.color;
			ctx.translate(p.pos.x, p.pos.y);
			p.render(ctx);
			ctx.restore();
		});
		ctx.restore();
	}
}

