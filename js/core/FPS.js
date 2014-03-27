TTable.FPS = function() {
	this._pausedFlag = true;
	this._time = 0;
	this.tick = new TTable.Signal();
	this.paused = new TTable.Signal();
	this.resumed = new TTable.Signal();

	this._loop = this._loop.bind(this);
}

TTable.FPS.prototype = {

	constructor: TTable.FPS,

	_loop: function() {
		if (this._pausedFlag) return;
		var now = Date.now();
		this.tick.dispatch(now - this._time);
		this._time = now;
		requestAnimationFrame(this._loop);
	},

	enabled: function(val) {

		val = val ? true : false;
		if (this._pausedFlag == !val) return;
		if (val) {
			this._time = Date.now();
			this._pausedFlag = false;
			this.resumed.dispatch();
			this._loop();
		} else {
			this._pausedFlag = true;
			this.paused.dispatch();
		}
	}
}