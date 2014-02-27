TTable.GLLoopView = function(canvas) {

	// imports
	var makeShader = TTable.GLUtil.makeShader;

	// vars
	var self = {},
		gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'),
		glProgram = null,
		fragmentShader = null,
		vertexShader = null,
		vertexPositionAttribute = null,
		verticeBuffer = null,
		vertices = null,
		verticeBuffer = null;

	function glClear() {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	function initShaders() {
		vertexShader = makeShader(gl, document.getElementById('shader-vs').innerHTML, gl.VERTEX_SHADER);
		fragmentShader = makeShader(gl, document.getElementById('shader-fs').innerHTML, gl.FRAGMENT_SHADER);

		glProgram = gl.createProgram();
		gl.attachShader(glProgram, vertexShader);
		gl.attachShader(glProgram, fragmentShader);
		gl.linkProgram(glProgram);
		gl.useProgram(glProgram);
	}

	function initVertices(numVertices_) {
		vertices = new Float32Array(numVertices_ * 3),
		verticeBuffer = gl.createBuffer();

		gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);

		vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
		gl.enableVertexAttribArray(vertexPositionAttribute);
		gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
		gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	}

	// Public API
	/*self.destroy = function() {
		if (vertexShader) gl.deleteShader(vertexShader);
		if (fragmentShader) gl.deleteShader(fragmentShader);
		if (glProgram) gl.deleteProgram(glProgram);
	}*/

	self.init = function() {
		glClear();
		initShaders();
	}

	self.update = function(waveform_) {

		var i = 0,
			dA = 0.005, // delta angle
			x, y, a, rad,
			len = Math.floor((2 * Math.PI) / dA),
			audioData = waveform_,
			audioLen = audioData.length;

		// TODO: appens once, shoud NOT check every time
		if (!vertices) {
			initVertices(len);
		}

		function ampAt(ratio) {
			return audioData[Math.round(ratio * (audioLen - 1))]
		}

		for (; i < len; ++i) {
			a = dA * i;
			rad = 0.4 + 0.4 * ampAt(i / (len - 1)) + Math.random() * 0.2;
			x = rad * Math.cos(a); // offset to center
			y = rad * Math.sin(a);
			vertices[3 * i] = x;
			vertices[(3 * i) + 1] = y;
			vertices[(3 * i) + 2] = 0;
		}

		// using gl.DYNAMIC_DRAW instead of STATIC_DRAW doesn't seem to make a difference...
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.LINE_STRIP, 0, len);
	}

	return self;
}