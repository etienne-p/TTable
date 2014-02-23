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

var main = function() {

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
		scriptProcessor.connect(audio.getContext().destination);

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

window.onload = main;