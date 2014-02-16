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
	TTable.mouse.enabled(true);

	// mouse control on disc

	// translate mouse
	var rect = canvas.getBoundingClientRect(),
		canvasXOffset = rect.left,
		canvasYOffset = rect.top,
		toPolar = GeomUtil.cartesianToPolar,
		prevPosition,
		dist = GeomUtil.distance;

	function moveDisc(mousePosition_) {
		// translate and change coordinates
		var p = toPolar({
			x: mousePosition_.x - canvasXOffset - radius,
			y: mousePosition_.y - canvasYOffset - radius
		});

		// extraire l'angle

		// la variation de deplacement sur le radius influe sur le controle
		// plus cette variation est faible plus on garde le controle
		// inversement, on glisse et le moteur reprend de l'importance

		// il va falloir travailler en coordonnees polaires

		disc.angle = p.angle;
		disc.render();

		prevPosition = p;
	}

	xxx = TTable.mouse;

	TTable.mouse.up.add(function() {
		TTable.mouse.position.remove(moveDisc);
	});
	TTable.mouse.down.add(function() {
		prevPosition = toPolar(TTable.mouse.position);
		TTable.mouse.position.add(moveDisc);
	});
}

window.onload = main;