var audio = audio || {};

audio.getContext = function() {
	var rv = null;
	if ('webkitAudioContext' in window) {
		rv = new webkitAudioContext();
	} else if ('AudioContext' in window) {
		rv = new AudioContext();
	}
	audio.getContext = function() {
		return rv;
	}
	return rv;
}

audio.loadSample = function(url_, callback_) {
	var req = new XMLHttpRequest(),
		onError = function() {
			alert('decodeAudioData failed!');
		},
		loadCompleteHandler = function() {
			audio.getContext().decodeAudioData(req.response, callback_, onError);
		};
	req.open('GET', url_, true);
	req.responseType = 'arraybuffer';
	req.addEventListener('load', loadCompleteHandler, false);
	req.send();
}

audio.SamplePlayer = function(left_, right_) {

}

// buffer_ = __audioContext.createBuffer(__loadRequest.response, false);
// smapler is only responsible for playing a buffer at a given rate
// filters, gain, are to be handled externally

//-- TODO

var testScratch = function() {

	// setup core
	TTable.mouse = new Mouse(PlatformUtil.isMobile(), document),
	TTable.fps = new FPS();

	// setup disc
	var info = document.getElementById('info');
	canvas = document.createElement('canvas'),
	mouse = new Mouse(PlatformUtil.isMobile(), canvas),
	disc = new TTable.ui.Disc(canvas),
	radius = 200;

	document.getElementsByTagName('body')[0].appendChild(canvas);
	disc.setRadius(radius);
	disc.render();

	// translate mouse
	var prevPosition,
		dAngle = 0,
		motorDAngle = 0.1,
		pi = Math.PI,
		setSpeed = function() {},
		//polar = GeomUtil.cartesianToPolar,
		dist = GeomUtil.distance;

	function polar(pos) {
		return GeomUtil.cartesianToPolar({
			x: pos.x - radius, // TODO: find a proper way to manage relative coordinates
			y: pos.y - radius
		})
	}

	function watchMouse() {

		p = polar(mouse.position.value);
		dAngle = (p.angle - prevPosition.angle) % (2 * pi);
		if (dAngle > pi) dAngle -= 2 * pi;
		else if (dAngle < -pi) dAngle += 2 * pi;
		disc.angle += dAngle;
		prevPosition = p;
		disc.render();
		setSpeed(dAngle / motorDAngle);
	}

	// extraire l'angle

	function moveDisc() {
		disc.angle += motorDAngle + dAngle;
		dAngle *= 0.9; // represents an accumulation between frames
		disc.render();
		setSpeed((motorDAngle + dAngle) / motorDAngle);
	}

	function toEngineControl() {
		TTable.fps.tick.remove(watchMouse);
		TTable.fps.tick.add(moveDisc);
		mouse.down.addOnce(toUserControl);
	}

	function toUserControl() {
		dAngle = 0;
		prevPosition = polar(mouse.position.value);
		TTable.fps.tick.remove(moveDisc);
		TTable.fps.tick.add(watchMouse);
		TTable.mouse.up.addOnce(toEngineControl);
	}

	TTable.fps.enabled(true);
	TTable.mouse.enabled(true);
	mouse.enabled(true);
	toEngineControl();

	// AUDIO
	audio.loadSample('media/loop.wav', function(buffer) {

		var samplePlayer = new SamplePlayer(buffer.getChannelData(0), buffer.getChannelData(1)),
			scriptProcessor = audio.getContext().createScriptProcessor(1024, 0, 2);

		scriptProcessor.onaudioprocess = samplePlayer.processAudio;
		//scriptProcessor.connect(audio.getContext().destination);

		window.xxx = scriptProcessor; // prevent buggy garbage collection

		setSpeed = function(arg) {
			info.innerHTML = [
				'playbackRate: ' + arg,
				'dAngle: ' + dAngle
			].join('<br />');
			samplePlayer.setRate(arg);
		}
	});
}

var drawSound2d = function() {

	audio.loadSample('media/loop.wav', function(buffer) {

		var pi = Math.PI,
			waveCanvas = document.createElement('canvas');

		document.getElementsByTagName('body')[0].appendChild(waveCanvas);
		waveCanvas.width = 600;
		waveCanvas.height = 600;

		var wctx = waveCanvas.getContext('2d'),
			imgData = wctx.createImageData(600, 600),
			data = imgData.data;

		// bind me! set RED pixel
		function setPixel(r, g, b, a, x, y) {
			var index = (y * 600 + x) * 4;
			data[index] = r;
			data[index + 1] = g;
			data[index + 2] = b;
			data[index + 3] = a;
		}

		var audioData = buffer.getChannelData(0),
			audioLen = audioData.length,
			i = 0,
			dA = 0.005,
			x, y, a, rad,
			len = Math.floor((2 * pi) / dA);

		function ampAt(ratio) {
			return audioData[Math.round(ratio * (audioLen - 1))]
		}

		for (i = 0; i < len; ++i) {
			a = dA * i;
			rad = 150 + 60 * ampAt(i / (len - 1));
			x = Math.round(300 + rad * Math.cos(a)); // offset to center
			y = Math.round(300 + rad * Math.sin(a));
			setPixel(255, 0, 0, 255, x, y)
		}

		wctx.putImageData(imgData, 0, 0);
		console.log('done');
	});
}

var drawSound3d = function() {

	audio.loadSample('media/loop.wav', function(buffer) {

		var pi = Math.PI,
			canvas = document.createElement('canvas');

		document.getElementsByTagName('body')[0].appendChild(canvas);
		canvas.width = 600;
		canvas.height = 600;

		// GL related
		var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'),
			glProgram = null,
			fragmentShader = null,
			vertexShader = null,
			vertexPositionAttribute = null,
			verticeBuffer = null,
			// others
			audioData = buffer.getChannelData(0),
			audioLen = audioData.length,
			i = 0,
			dA = 0.005,
			x, y, a, rad,
			len = Math.floor((2 * pi) / dA);

		function ampAt(ratio) {
			return audioData[Math.round(ratio * (audioLen - 1))]
		}

		// setup GL
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// setup shaders
		vertexShader = gl.createShader(gl.VERTEX_SHADER);
		fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		// set shaders source
		var vs_source = document.getElementById('shader-vs').innerHTML,
			fs_source = document.getElementById('shader-fs').innerHTML;
		gl.shaderSource(vertexShader, vs_source);
		gl.shaderSource(fragmentShader, fs_source);
		// compile them
		gl.compileShader(vertexShader);
		gl.compileShader(fragmentShader);
		// attach shaders to a program
		glProgram = gl.createProgram();
		gl.attachShader(glProgram, vertexShader);
		gl.attachShader(glProgram, fragmentShader);
		// link and use that program
		gl.linkProgram(glProgram);
		gl.useProgram(glProgram);
		// delete shaders and program 
		// TODO: try to delete them right now, does it break?
		/*gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		gl.deleteProgram(glProgram);*/
		// setup buffers
		var vertices = [];
		for (i = 0; i < len; ++i) {
			a = dA * i;
			rad = 0.8 + 0.2 * ampAt(i / (len - 1));
			//rad = 0.8;
			x = rad * Math.cos(a); // offset to center
			y = rad * Math.sin(a);
			vertices[3 * i] = x;
			vertices[(3 * i) + 1] = y;
			vertices[(3 * i) + 2] = 0;
		}
		verticeBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
		// draw
		vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
		gl.enableVertexAttribArray(vertexPositionAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
		gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.LINE_STRIP, 0, len);



	});
}


window.onload = drawSound3d;