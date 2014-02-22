// app namespace


var main = function() {

	// setup core
	TTable.mouse = new Mouse(PlatformUtil.isMobile());
	TTable.fps = new FPS();

	// setup disc
	var canvas = document.createElement('canvas');
	document.getElementsByTagName('body')[0].appendChild(canvas);
	var disc = new TTable.ui.Disc(canvas),
		radius = 200;

	disc.setRadius(radius);
	disc.render();

	// translate mouse
	var rect = canvas.getBoundingClientRect(),
		canvasXOffset = rect.left,
		canvasYOffset = rect.top,
		prevPosition,
		dAngle = 0,
		motorDAngle = 0.01,
		dist = GeomUtil.distance;

	function toPolar(pos) {
		return GeomUtil.cartesianToPolar({
			x: pos.x - canvasXOffset - radius, // TODO: find a proper way to manage relative coordinates
			y: pos.y - canvasYOffset - radius
		})
	}

	function watchMouse() {
		p = toPolar(TTable.mouse.position.value);
		dAngle = p.angle - prevPosition.angle;
		disc.angle += dAngle;
		prevPosition = p;
		disc.render();
	}
	// extraire l'angle

	function moveDisc() {
		disc.angle += motorDAngle + dAngle;
		dAngle *= 0.9; // represents an accumulation between frames
		disc.render();
	}

	TTable.fps.tick.add(moveDisc);

	TTable.mouse.up.add(function() {
		TTable.fps.tick.remove(watchMouse);
		TTable.fps.tick.add(moveDisc);
	});
	TTable.mouse.down.add(function() {
		// TODO: IF HiTS DISC
		prevPosition = toPolar(TTable.mouse.position.value);
		TTable.fps.tick.remove(moveDisc);
		TTable.fps.tick.add(watchMouse);
	});

	TTable.fps.enabled(true);
	TTable.mouse.enabled(true);
}

window.onload = main;