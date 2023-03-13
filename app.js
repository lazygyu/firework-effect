import {WIDTH, HEIGHT} from './constants.js';
import {Firework} from './firework.js';

const MAX = 200;

class Slider {
	constructor(name, min, max, value, step = 1) {
		const container = document.createElement('div');

		container.classList.add('input-control');

		const label = document.createElement('label');
		label.innerHTML = name;

		container.appendChild(label);


		const el = document.createElement('input');
		el.type = 'range';
		el.min = min;
		el.max = max;
		el.value = value;
		el.step = step;
		el.addEventListener('input', this.handleChange.bind(this));
		container.appendChild(el);
		this.el = container;
	}

	handleChange(e) {
		if (this.onChange) {
			this.onChange(Number(e.target.value));
		}
	}
}

export class App {
	constructor(elem) {
		this.container = elem;
		this.elapsed = 0;
		this.playing = null;
		this.lastTime = 0;
		this.zoom = 1;
		this.particleCount = 10;
		this.tail = 5;
		this.glow = 5;

		this.bindMethods();

		this.firework = new Firework({
			particleCount: this.particleCount,
			tail: this.tail,
			glow: this.glow
		});
		this.createUi();
		this.bindEvents();
	}

	bindMethods() {
		this._changeTime = this.changeTime.bind(this);
		this._togglePlay = this.togglePlay.bind(this);
		this._update = this.update.bind(this);
	}

	createUi() {
		this.slider = document.createElement('input');
		this.slider.type = 'range';
		this.slider.min = 0;
		this.slider.max = MAX;
		this.slider.value = 0;
		this.slider.classList.add('fill');

		this.btnPlay = document.createElement('button');
		this.btnPlay.innerHTML = 'Play';

		this.canvas = document.createElement('canvas');
		this.canvas.width = WIDTH;
		this.canvas.height = HEIGHT;

		const actionBar = document.createElement('div');
		actionBar.classList.add('action-bar');

		actionBar.appendChild(this.btnPlay);
		actionBar.appendChild(this.slider);


		const configBar = document.createElement('div');
		configBar.classList.add('action-bar', 'config');

		const zoomHandle = new Slider('zoom', 0.1, 3, 1, 0.1);
		zoomHandle.onChange = (v) => {
			this.zoom = v;
			this.render();
		}


		const particleCountHandle = new Slider('particles', 5, 50, this.particleCount, 1);
		particleCountHandle.onChange = (v) => {
			this.particleCount = v;
			this.firework.particleCount = v;
			this.render();
		}

		const tailHandle = new Slider('tail', 1, 20, this.tail, 1);
		tailHandle.onChange = (v) => {
			this.tail = v;
			this.firework.tail = v;
			this.render();
		}

		const glowHandle = new Slider('glow', 1, 10, this.glow, 1);
		glowHandle.onChange = (v) => {
			this.glow = v;
			this.firework.glow = v;
			this.render();
		}

		[zoomHandle, particleCountHandle, tailHandle, glowHandle].forEach(h => {
			configBar.appendChild(h.el);
		});

		this.container.appendChild(this.canvas);
		this.container.appendChild(actionBar);
		this.container.appendChild(configBar);
	}

	bindEvents() {
		this.slider.addEventListener('change', this._changeTime);
		this.btnPlay.addEventListener('click', this._togglePlay);
	}

	unbindEvents() {
		this.slider.removeEventListener('change', this._changeTime);
		this.btnPlay.removeEventListener('click', this._togglePlay);
	}

	changeTime(e) {
		this.elapsed = (e.target.value | 0);
		this.render();
	}

	togglePlay() {
		if (this.playing) {
			this.stop();
		} else {
			this.play();
		}
	}

	play() {
		if (this.elapsed >= MAX) {
			this.elapsed = 0;
		}
		this.btnPlay.innerHTML = 'Stop';
		this.playing = requestAnimationFrame(this._update);
	}

	stop() {
		this.btnPlay.innerHTML = 'Play';
		cancelAnimationFrame(this.playing);
		this.playing = null;
		this.lastTime = 0;
	}

	render() {
		const f = this.firework.clone();
		f.update(this.elapsed);
		const ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		ctx.save();
		ctx.translate(WIDTH / 2, HEIGHT / 3);
		ctx.scale(this.zoom, this.zoom);
		f.render(ctx);
		ctx.restore();
	}

	update() {
		const current = Date.now();
		if (this.lastTime === 0) {
			this.lastTime = current;
		}
		const delta = current - this.lastTime;
		this.lastTime = current;

		this.elapsed += (delta / 10);
		if (this.elapsed >= MAX) {
			this.elapsed = MAX;
		}
		this.slider.value = this.elapsed;

		this.render();


		if (this.elapsed < MAX) {
			this.playing = requestAnimationFrame(this._update);
		} else {
			this.stop();
		}
	}
}
