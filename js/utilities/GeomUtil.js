var GeomUtil = {

	centerOfMass: function(points) {

		var x = 0,
			y = 0,
			n = points.length,
			i = n,
			pt;

		while (i--) {
			pt = points[i];
			x += pt.x;
			y += pt.y;
		}

		x /= n;
		y /= n;

		return {
			x: x,
			y: y
		};
	},

	distance: function(xa, ya, xb, yb) {
		return Math.sqrt((xa - xb) * (xa - xb) + (ya - yb) * (ya - yb));
	}
};