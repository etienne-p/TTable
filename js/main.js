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
	TTable.mouse = new TTable.Mouse(TTable.PlatformUtil.isMobile(), document),
	TTable.fps = new TTable.FPS();

	// setup disc
	var info = document.getElementById('info');
	canvas = document.createElement('canvas'),
	mouse = new TTable.Mouse(TTable.PlatformUtil.isMobile(), canvas),
	disc = new TTable.Disc(canvas),
	radius = 400;

	document.getElementsByTagName('body')[0].appendChild(canvas);
	disc.setRadius(radius);
	disc.render();

	// translate mouse
	var prevPosition,
		dAngle = 0,
		motorAngularSpeed = 0,
		PI = Math.PI,
		setSpeed = function() {},
		cartesianToPolar = TTable.GeomUtil.cartesianToPolar,
		dist = TTable.GeomUtil.distance;

	function polar(pos) {
		return cartesianToPolar({
			x: pos.x - radius, // TODO: find a proper way to manage relative coordinates
			y: pos.y - radius
		});
	}

	function watchMouse(dt) {
		p = polar(mouse.position.value);
		dAngle = (p.angle - prevPosition.angle) % (2 * PI);
		if (dAngle > PI) dAngle -= 2 * PI;
		else if (dAngle < -PI) dAngle += 2 * PI;
		//disc.angle += dAngle;
		prevPosition = p;
		disc.render();
		setSpeed(dAngle / (motorAngularSpeed * (dt / 1000)));
	}

	function moveDisc(dt) {
		var motorDAngle = motorAngularSpeed * (dt / 1000);
		//disc.angle += motorDAngle + dAngle;
		dAngle *= 0.9; // represents an accumulation between frames
		//disc.render();
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

		var samplePlayer = new TTable.SamplePlayer(buffer.getChannelData(0), buffer.getChannelData(1)),
			scriptProcessor = audio.getContext().createScriptProcessor(1024, 0, 2);

		scriptProcessor.onaudioprocess = samplePlayer.processAudio;
		scriptProcessor.connect(audio.getContext().destination);

		// 1 round = 1 loop
		motorAngularSpeed = 2 * PI / (buffer.length / buffer.sampleRate); // radians per second
		console.log('motorAngularSpeed: [' + motorAngularSpeed + ']');

		window.xxx = scriptProcessor; // prevent buggy garbage collection

		setSpeed = function(arg) {
			info.innerHTML = [
				'playbackRate: ' + arg,
				'dAngle: ' + dAngle
			].join('<br />');
			samplePlayer.setRate(arg);
		}

		// sync disc UI on audio stream
		TTable.fps.tick.add(function() {
			disc.angle = 2 * PI * samplePlayer.posRatio();
			disc.render();
		});

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

		var canvas = document.createElement('canvas');
		document.getElementsByTagName('body')[0].appendChild(canvas);
		canvas.width = canvas.height = 600;

		var audioData = buffer.getChannelData(0),
			glView = new TTable.GLLoopView(canvas);

		glView.init();

		(function animLoop() {
			glView.update(audioData);
			requestAnimationFrame(animLoop);
		})();
	});
}


window.onload = drawSound3d;