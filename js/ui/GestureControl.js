TTable.GestureControl = function(mouse_, fpsTick_, center_, radius_) {

	// imports
	var cartesianToPolar = TTable.GeomUtil.cartesianToPolar,
		dist = TTable.GeomUtil.distance,
		// ...
		prevPosition = null,
		dAngle = 0,
		PI = Math.PI,
		motorAngularSpeed =  0,
		speed = new TTable.Signal(),
		radius =  radius_ || 0,
		center = center_ || {
			x: 0,
			y: 0
		};

	//-- Helper
	function polar(pos) {
		return cartesianToPolar({
			x: pos.x - radius + center.x,
			y: pos.y - radius + center.y
		});
	}

	//-- Handle user control
	function watchMouse(dt) {
		p = polar(mouse_.position.value);
		if (p.radius > radius) {
			moveDisc(); // something should happen this tick
			toEngineControl();
		}
		dAngle = (p.angle - prevPosition.angle) % (2 * PI);
		if (dAngle > PI) dAngle -= 2 * PI;
		else if (dAngle < -PI) dAngle += 2 * PI;
		prevPosition = p;
		speed.dispatch(dAngle / (motorAngularSpeed * (dt / 1000)));
	}

	//-- Handle motor control
	function moveDisc(dt) {
		var motorDAngle = motorAngularSpeed * (dt / 1000);
		dAngle *= 0.9;
		speed.dispatch((motorDAngle + dAngle) / motorDAngle);
	}

	function toEngineControl() {
		mouse_.up.remove(toEngineControl);
		fpsTick_.remove(watchMouse);
		fpsTick_.add(moveDisc);
		mouse_.down.add(checkUserControl);
	}

	function checkUserControl() {
		if (polar(mouse_.position.value).radius < radius) toUserControl();
	}

	function toUserControl() {
		mouse_.down.remove(toUserControlIf);
		dAngle = 0;
		prevPosition = polar(mouse.position.value);
		fpsTick_.remove(moveDisc);
		fpsTick_.add(watchMouse);
		mouse_.up.addOnce(toEngineControl);
	}

	function disable(){
		mouse_.down.remove(toUserControlIf);
		mouse_.up.remove(toEngineControl);
		fpsTick_.remove(watchMouse);
		fpsTick_.remove(moveDisc);
		dAngle = 0;
	}
	
	return {
		// properties
		motorAngularSpeed: motorAngularSpeed,
		radius: radius,
		speed: speed,
		// methods
		toEngineControl: toEngineControl,
		disable: disable
	}
}