
// app namespace
var TTable = {};


var main = function(){

	// setup core
	TTable.mouse = new Mouse(PlatformUtil.isMobile());
	TTable.fps = new FPS();

	// setup disc
	var disc = new TTable.ui.Disc(document.createElement('canvas'));
	disc.setRadius(200);

	// TODO: redraw disc on fps IF NEEDED

	// hard part UI movement to disc movement
	TTable.mouse.enabled(true);


}

window.onload = main;