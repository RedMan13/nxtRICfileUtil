# nxtRICfileUtil
 this is a nodejs module for reading/writing .ric files
### Icons retrieved from LEGO MINDSTORMS NXT Firmware V1.31.rfw
the code below (when put into about:blank) will allow you to view and capture these icons fromt he firmware package aswell
```js
document.body.style.display = 'flex';
const canvas = document.createElement('canvas');
canvas.width = Math.floor(window.innerWidth / 2);
canvas.height = Math.floor(window.innerHeight);
document.body.appendChild(canvas);
const wrap = document.createElement('div');
document.body.appendChild(wrap);
const file = document.createElement('input');
file.type = 'file';
wrap.appendChild(file);
const offset = document.createElement('input');
offset.type = 'range';
wrap.appendChild(offset);
const cut = document.createElement('input');
cut.type = 'range';
wrap.appendChild(cut);
const warp = document.createElement('input');
warp.type = 'range';
wrap.appendChild(warp);
const expo = document.createElement('button');
expo.textContent = 'export finding';
wrap.appendChild(expo);
expo.onclick = () => window.open(canvas.toDataURL(), '_blank');
let data = [];
document.onwheel = (e) => {
	cut.valueAsNumber += e.deltaY * 8;
	drawImg();
}
file.onchange = () => {
	console.log('a')
	const loader = new FileReader();
	loader.onload = () => {
		data = [...new Uint8Array(loader.result)].map(byte => [(byte >> 0) & 0b1,(byte >> 1) & 0b1,(byte >> 2) & 0b1,(byte >> 3) & 0b1,(byte >> 4) & 0b1,(byte >> 5) & 0b1,(byte >> 6) & 0b1,(byte >> 7) & 0b1]).flat();
		cut.max = data.length;
		drawImg();
	}
	loader.readAsArrayBuffer(file.files[0]);
}
const ctx = canvas.getContext('2d');
function drawImg() {
	ctx.clearRect(0,0, canvas.width,canvas.height);
	const off = offset.valueAsNumber;
	const w = 8;
	const cutAt = cut.valueAsNumber;
	const wrap = warp.valueAsNumber;
	const toTile = Math.floor(canvas.width / w);
	for (let i = 0, x = 0, y = 0; i < canvas.height * w; x = ++i % w, y = Math.floor(i / w)) {
		const realI = i;
		if (data[i + cutAt + off])
			ctx.fillStyle = 'white';
		else
			ctx.fillStyle = 'black';
		ctx.fillRect(x,y,1,1);
		for (let j = 1; j < toTile; j++) {
			i += w * wrap;
			if (data[i + cutAt + off])
				ctx.fillStyle = 'white';
			else
				ctx.fillStyle = 'black';
			ctx.fillRect(x + (w * j),y,1,1);
		}
		i = realI;
	}
}
offset.onchange = drawImg;
cut.onchange = drawImg;
warp.onchange = drawImg;
cut.value = 887454;
drawImg();
```