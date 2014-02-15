var Mouse = function(isMobile_) {

	var _position = {x: 0, y: 0},
		_mouseClickSignal = new Signal(),
		_mouseMoveSignal = new Signal();

	//-- init signals value
	_mouseClickSignal.value = _position;
	_mouseMoveSignal.value = _position;

	//-- Event handlers
	function _mouseClickHandler(e) {
		_mouseClickSignal.dispatch(_position);
	}

	function _mouseMoveHandlerRegular(e) {
		e.preventDefault();
		_position.x = e.pageX;
		_position.y = e.pageY;
		_mouseMoveSignal.dispatch(_position);
	}

	function _mouseMoveHandlerIPad(e) {
		e.preventDefault();
		_position.x = e.originalEvent.targetTouches[0].pageX;
		_position.y = e.originalEvent.targetTouches[0].pageY;
		_mouseMoveSignal.dispatch(_position);
	}

	function _bind(val_, ctx_, evts_, handler_) {
		var method = val_ ? ctx_.addEventListener : ctx_.removeEventListener;
		if (Object.prototype.toString.call(evts_) == '[object Array]') {
			var i = evts_.length,
			while (i--) method.call(ctx_, evts_[i], handler_);
		} else method.call(ctx_, evts_, handler_);
	}

	//-- Platform dependant config
	var _mouseMoveHandler = isMobile_ ? _mouseMoveHandlerMobile : _mouseMoveHandlerRegular,
		_mouseMoveEvent = isMobile_ ? ['touchstart', 'touchmove', 'touchend'] : 'mousemove',
		_self = {};

	//-- Exposed
	_self.enabled = function(val_) {
		_bind(val_, document, _mouseMoveEvent, _mouseMoveHandler)
		_bind(val_, document, 'click', _mouseClickHandler)
	}

	_self.position = _mouseMoveSignal;

	_self.click = _mouseClickSignal;

	return _self;
}