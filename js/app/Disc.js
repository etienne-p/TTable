/*

1. Model a non motorized disc

2. add inertia

3. add motor

4. extract rate (lin. prop. to Disc Speed)

*/

TTable.ui.Disc = function(canvas_) {

	this._canvas = canvas_;
	this._ctx = canvas_.getContext('2d');
	this.angle = 0;

}

TTable.ui.Disc.prototype = {

	constructor: TTable.ui.Disc,

	setRadius: function(radius_) {
		this._canvas.width = this._canvas.height = this._radius = radius_;
	},

	render: function() {

		var rad = this._radius;

		_ctx.clearRect(0, 0, 2 * rad, 2 * rad);

		_ctx.save();
		_ctx.translate(rad, rad);
		_ctx.rotate(this.angle);

		_ctx.beginPath();
		_ctx.moveTo(0, 0);
		_ctx.lineTo(0, -0.5 * rad);
		_ctx.strokeStyle = 'red';
		_ctx.lineWidth = 2;
		_ctx.stroke();

		_ctx.beginPath();
		_ctx.arc(0, 0, rad * 0.1, 0, 2 * Math.PI, false);
		_ctx.fillStyle = 'red';
		_ctx.fill();
		_ctx.endPath();

		_ctx.beginPath();
		_ctx.arc(0, 0, rad, 0, 2 * Math.PI, false);
		_ctx.fillStyle = 'grey';
		_ctx.fill();
		_ctx.endPath();

		_ctx.restore();
	}

}