var testScratch = function() {

	TTable.mouse = new TTable.Mouse(TTable.PlatformUtil.isMobile(), document),
	TTable.fps = new TTable.FPS();

	var audio = TTable.AudioUtil,
		ctrl = new TTable.GestureControl(TTable.mouse, TTable.fps.tick, {
			x: window.innerWidth * 0.5,
			y: window.innerHeight * 0.5
		}, window.innerWidth * 0.5);

	audio.loadSample('media/loop2.wav', function(buffer) {

		var canvas = document.createElement('canvas');
		document.getElementsByTagName('body')[0].appendChild(canvas);
		canvas.style.position = 'fixed';

		var samplePlayer = new TTable.SamplePlayer(buffer.getChannelData(0), buffer.getChannelData(1)),
			scriptProcessor = audio.getContext().createScriptProcessor(1024, 0, 2),
			audioData = buffer.getChannelData(0),
			glView = new TTable.GLLoopView(canvas);

		glView.init();

		scriptProcessor.onaudioprocess = samplePlayer.processAudio;
		scriptProcessor.connect(audio.getContext().destination);

		// 1 round = 1 loop
		ctrl.loopAngularSpeed(2 * Math.PI / (buffer.length / buffer.sampleRate)); // radians per second

		window.xxx = scriptProcessor; // prevent buggy garbage collection

		ctrl.speed.add(function(arg) {
			samplePlayer.setRate(arg);
		});

		ctrl.toEngineControl();
		TTable.fps.enabled(true);
		TTable.mouse.enabled(true);

		// sync disc UI on audio stream
		TTable.fps.tick.add(function() {
			glView.angle(-1 * 2 * Math.PI * samplePlayer.posRatio());
			glView.amp(1 + 50 * samplePlayer.getAmp());
			glView.update(audioData);
		});

		function resizeHandler() {
			glView.resize(window.innerWidth, window.innerHeight);
			ctrl.center({
					x: window.innerWidth * 0.5,
					y: window.innerHeight * 0.5
				});
			ctrl.radius(window.innerWidth * 0.5);
		}

		resizeHandler();
		window.onresize = resizeHandler;

		// add GUI, dat.gui is designed to operate on public fields
		// to fit with our design, we introduce a mock object
		var gui = new dat.GUI(),
			mock = {
				friction: 0.9,
				angularSpeedMul: 1
			};
		gui.add(mock, 'friction', 0, 1).onChange(function(newValue) {
			ctrl.friction(newValue);
		});
		gui.add(mock, 'angularSpeedMul', -2, 2).onChange(function(newValue) {
			ctrl.angularSpeedMul(newValue);
		});
	});
}

window.onload = testScratch;