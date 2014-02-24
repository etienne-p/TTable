function(ns) {
	ns.Mouse = function(isMobile_, element_) {

		// mouse move is a special case,
		// other signals can be generated dynamically

		var _self = {},
			_data = [{
				evt: isMobile_ ? 'touchstart' : 'mousedown',
				as: 'down'
			}, {
				evt: isMobile_ ? 'touchend' : 'mouseup',
				as: 'up'
			}, {
				evt: 'click',
				as: 'click'
			}],
			_position = {
				x: 0,
				y: 0
			},
			_signals = {},
			_handlers = {},
			_mouseMoveSignal = new Signal(),
			_xOffset = 0,
			_yOffset = 0;

		//-- init signals value
		_mouseMoveSignal.value = _position;

		// dynamic signals / handlers generation
		function getHandler(as) {
			return function(evt) {
				_signals[as].dispatch(_position);
			}
		}
		var as = null;
		for (var i = _data.length - 1; i > -1; --i) {
			as = _data[i].as;
			_self[as] = _signals[as] = new Signal();
			_self[as].value = _position;
			_handlers[as] = getHandler(as);
		}

		//...

		function _updateOffset() {
			if (!element_.getBoundingClientRect) return;
			var rect = element_.getBoundingClientRect();
			_xOffset = rect.left;
			_yOffset = rect.top;
		}

		//-- Event handlers

		function _mouseMoveHandlerRegular(e) {
			e.preventDefault();
			_position = {
				x: e.pageX - _xOffset,
				y: e.pageY - _yOffset
			};
			_mouseMoveSignal.dispatch(_position);
		}

		function _mouseMoveHandlerIPad(e) {
			e.preventDefault();
			_position = {
				x: e.originalEvent.targetTouches[0].pageX - _xOffset,
				y: e.originalEvent.targetTouches[0].pageY - _yOffset
			};
			_mouseMoveSignal.dispatch(_position);
		}

		function _bind(val_, ctx_, evts_, handler_) {
			var method = val_ ? ctx_.addEventListener : ctx_.removeEventListener;
			if (Object.prototype.toString.call(evts_) == '[object Array]') {
				var i = evts_.length;
				while (i--) method.call(ctx_, evts_[i], handler_);
			} else method.call(ctx_, evts_, handler_);
		}

		//-- Platform specific config
		var _mouseMoveHandler = isMobile_ ? _mouseMoveHandlerMobile : _mouseMoveHandlerRegular,
			_mouseMoveEvent = isMobile_ ? ['touchstart', 'touchmove', 'touchend'] : 'mousemove';

		//-- Exposed
		_self.enabled = function(val_) {
			_bind(val_, element_, _mouseMoveEvent, _mouseMoveHandler)
			for (var i = _data.length - 1; i > -1; --i) {
				_bind(val_, element_, _data[i].evt, _handlers[_data[i].as])
			}
			if (val_) _updateOffset();
		}

		_self.position = _mouseMoveSignal;

		return _self;
	}
})(namespace('core'));