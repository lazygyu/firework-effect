import {WIDTH, HEIGHT} from './constants.js';
import {App} from './app.js';

function init(elem) {
	const app = new App(elem);
}

const elem = document.querySelector('#app');

if (elem) {
	init(elem);
}
