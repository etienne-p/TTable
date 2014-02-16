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

	// TODO: redraw disc on fps IF NEEDED

	// hard part UI movement to disc movement


	// mouse control on disc

	// translate mouse
	var rect = canvas.getBoundingClientRect(),
		canvasXOffset = rect.left,
		canvasYOffset = rect.top,
		prevPosition,
		prevAngle = 0,
		motorStrength = 1,
		userStrength = 0,
		motorDAngle = 0.02,
		//userDAngle = 0,
		dist = GeomUtil.distance;

	function toPolar(pos) {
		return GeomUtil.cartesianToPolar({
			x: pos.x - canvasXOffset - radius,
			y: pos.y - canvasYOffset - radius
		})
	}

	function watchMouse() {

		// TODO: STOP WATCH DOES NOT HiTS DISC

		// translate and change coordinates
		p = toPolar(TTable.mouse.position.value);

		motorStrength *= 0.9;
		var dAngle = p.angle - prevPosition.angle;
		prevAngle += dAngle;
		disc.angle += dAngle;
		prevPosition = p;
	}
	// extraire l'angle

	function moveDisc() {
		// la variation de deplacement sur le radius influe sur le controle
		// plus cette variation est faible plus on garde le controle
		// inversement, on glisse et le moteur reprend de l'importance

		// il va falloir travailler en coordonnees polaires

		prevAngle = userStrength == 0 ? prevAngle * 0.9 : 0; // represents an accumulation between frames
		disc.angle += motorDAngle * motorStrength + prevAngle * (1 - userStrength);
		disc.render();
	}

	TTable.fps.tick.add(moveDisc);

	TTable.mouse.up.add(function() {
		TTable.fps.tick.remove(watchMouse);
		motorStrength = 1;
		userStrength = 0;
	});
	TTable.mouse.down.add(function() {
		// TODO: IF HiTS DISC
		prevPosition = toPolar(TTable.mouse.position.value);
		userStrength = 1;
		TTable.fps.tick.add(watchMouse);
	});

	TTable.fps.enabled(true);
	TTable.mouse.enabled(true);
}

window.onload = main;