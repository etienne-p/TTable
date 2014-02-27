TTable.FPS = function() {

	var _paused = true,
		_self = {},
		_tick = new TTable.Signal(),
		_paused = new TTable.Signal(),
		_resumed = new TTable.Signal();

	function _loop() {
		if (_paused) return;
		_tick.dispatch();
		requestTimeout(_loop, _del);
	}

	_self.setRate = function(n_) {
		_del = Math.round(1000 / n_);
	}

	_self.enabled = function(val_) {
		var val = val_ ? true : false;
		if (_paused == !val) return;
		if (val) {
			_paused = false;
			_resumed.dispatch();
			_loop();
		} else {
			_paused = true;
			_paused.dispatch();
		}
	}

	_self.tick = _tick;
	_self.paused = _paused;
	_self.resumed = _resumed;

	_self.setRate(30);

	return _self;
}