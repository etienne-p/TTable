var testScratch = function() {

	// setup core
	TTable.mouse = new TTable.Mouse(TTable.PlatformUtil.isMobile(), document),
	TTable.fps = new TTable.FPS();

	// setup disc
	var info = document.getElementById('info');
	canvas = document.createElement('canvas'),
	disc = new TTable.Disc(canvas),
	audio = TTable.AudioUtil,
	radius = 400;

	document.getElementsByTagName('body')[0].appendChild(canvas);
	disc.setRadius(radius);
	disc.render();

	// translate mouse
	var ctrl = new TTable.GestureControl(TTable.mouse, TTable.fps.tick, {
			x: window.innerWidth * 0.5,
			y: window.innerHeight * 0.5
		}, radius);

	// AUDIO
	audio.loadSample('media/loop.wav', function(buffer) {

		var samplePlayer = new TTable.SamplePlayer(buffer.getChannelData(0), buffer.getChannelData(1)),
			scriptProcessor = audio.getContext().createScriptProcessor(1024, 0, 2);

		scriptProcessor.onaudioprocess = samplePlayer.processAudio;
		scriptProcessor.connect(audio.getContext().destination);

		// 1 round = 1 loop
		ctrl.motorAngularSpeed(2 * Math.PI / (buffer.length / buffer.sampleRate)); // radians per second
		console.log('motorAngularSpeed: [' + ctrl.motorAngularSpeed() + ']');

		window.xxx = scriptProcessor; // prevent buggy garbage collection

		ctrl.speed.add(function(arg) {
			info.innerHTML = 'playbackRate: ' + arg;
			samplePlayer.setRate(arg);
		});

		ctrl.toEngineControl();
		TTable.fps.enabled(true);
		TTable.mouse.enabled(true);

		// sync disc UI on audio stream
		TTable.fps.tick.add(function() {
			disc.angle = 2 * Math.PI * samplePlayer.posRatio();
			disc.render();
		});

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


window.onload = testScratch;