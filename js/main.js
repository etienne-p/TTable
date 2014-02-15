
// app namespace
var TTable = {};


var main = function(){

	// setup core
	TTable.mouse = new Mouse(PlatformUtil.isMobile());
	TTable.fps = new FPS();

}

window.onload = main;