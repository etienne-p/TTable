TTable.Disc = function(canvas_) {

	this._canvas = canvas_;
	this._ctx = canvas_.getContext('2d');
	this.angle = 0;

}

TTable.Disc.prototype = {

	constructor: TTable.Disc,

	setRadius: function(radius_) {
		this._canvas.width = this._canvas.height = 2 * (this._radius = radius_);
	},

	render: function() {

		var rad = this._radius,
			ctx = this._ctx;

		ctx.clearRect(0, 0, 2 * rad, 2 * rad);

		ctx.save();
		ctx.translate(rad, rad);
		ctx.rotate(this.angle);

		ctx.beginPath();
		ctx.arc(0, 0, rad, 0, 2 * Math.PI, false);
		ctx.fillStyle = '#bbbbbb';
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(0, 0, rad * 0.1, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'blue';
		ctx.fill();
		ctx.closePath();

		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, -0.5 * rad);
		ctx.strokeStyle = 'blue';
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.restore();
	}
}