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
		verticeBuffer = null,
		pMatrix = mat4.create(),
		pMatrixUniform = null,
		mvMatrix = mat4.create(),
		mvMatrixUniform = null,
		muls = null,
		PI2 = 2 * Math.PI,
		amp = 1,
		amps = null,
		angle = 0;

	//-- Helpers
	function glClear() {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	function getMatrixUniforms() {
		pMatrixUniform = gl.getUniformLocation(glProgram, "uPMatrix");
		mvMatrixUniform = gl.getUniformLocation(glProgram, "uMVMatrix");
	}

	function setMatrixUniforms() {
		gl.uniformMatrix4fv(pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(mvMatrixUniform, false, mvMatrix);
	}

	//...
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

	function initMuls(len) {
		muls = [];
		var i = 0;
		for (; i < len; ++i) {
			muls[i] = 0.2 + 0.8 * Math.cos(0.5 * (i / len) * PI2);
		}
	}

	function initAmps(len, audioData) {
		amps = [];
		var i = 0,
			j = 0,
			lenn = 0,
			acc = 0,
			chunkSize = Math.floor(audioData.length / len);
		for (; i < len; ++i) {
			acc = 0;
			j = Math.floor(audioData.length * i / len);
			lenn = j + chunkSize;
			for (; j < lenn; ++j) acc += Math.abs(audioData[j]);
			amps[i] = acc / chunkSize;
		}
	}

	/*self.destroy = function() {
		if (vertexShader) gl.deleteShader(vertexShader);
		if (fragmentShader) gl.deleteShader(fragmentShader);
		if (glProgram) gl.deleteProgram(glProgram);
	}*/

	//-- Public
	self.init = function() {
		glClear();
		initShaders();
		getMatrixUniforms();
	}

	self.update = function(waveform_) {

		var i = 0,
			vertexIndex = -1,
			dA = 0.1, // delta angle
			dda = dA * 0.4,
			a = 0,
			rad = 0.3,
			radAmp = 0,
			cacheIndex = 0,
			len = Math.ceil(PI2 / dA),
			audioData = waveform_,
			cacheOffset = Math.floor(len * (angle / PI2)),
			audioLen = audioData.length,
			cosmin = 0,
			cosmax = 0,
			sinmin = 0,
			sinmax = 0,
			radMax = 0,
			radMin = 0;

		// TODO: appens once, shoud NOT check every time
		if (!vertices) {
			initVertices(len * 6);
			initMuls(len);
			initAmps(len, waveform_);
		}

		for (i = 0; i < len; ++i) {
			a = angle + dA * i;
			cacheIndex = (i + cacheOffset) % len;
			radAmp = amps[i] * (1 + muls[cacheIndex]) * amp;

			radMin = rad - radAmp * 0.05;
			radMax = rad + radAmp * 0.4;

			cosmin = Math.cos(a - dda);
			cosmax = Math.cos(a + dda);
			sinmin = Math.sin(a - dda);
			sinmax = Math.sin(a + dda);

			// bottom left
			vertices[++vertexIndex] = radMin * cosmin;
			vertices[++vertexIndex] = radMin * sinmin;
			vertices[++vertexIndex] = 0; // z

			// top left
			vertices[++vertexIndex] = radMax * cosmin;
			vertices[++vertexIndex] = radMax * sinmin;
			vertices[++vertexIndex] = 0; // z

			// top right
			vertices[++vertexIndex] = radMax * cosmax;
			vertices[++vertexIndex] = radMax * sinmax;
			vertices[++vertexIndex] = 0; // z

			// bottom right
			vertices[++vertexIndex] = radMin * cosmax;
			vertices[++vertexIndex] = radMin * sinmax;
			vertices[++vertexIndex] = 0; // z

			// bottom left
			vertices[++vertexIndex] = radMin * cosmin;
			vertices[++vertexIndex] = radMin * sinmin;
			vertices[++vertexIndex] = 0; // z

			// top right
			vertices[++vertexIndex] = radMax * cosmax;
			vertices[++vertexIndex] = radMax * sinmax;
			vertices[++vertexIndex] = 0; // z

		}

		// using gl.DYNAMIC_DRAW instead of STATIC_DRAW doesn't seem to make a difference...
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
		gl.drawArrays(gl.TRIANGLES, 0, len * 6);
	}

	self.resize = function(w_, h_) {
		canvas.width = w_;
		canvas.height = h_;
		gl.viewport(0, 0, canvas.width, canvas.height);
		mat4.perspective(pMatrix, Math.PI * 0.25, canvas.width / canvas.height, 0.1, 100.0);
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, mvMatrix, [0, 0, -2]);
		setMatrixUniforms();
	}

	self.angle = function(val) {
		if (typeof val === 'number') {
			angle = val % PI2;
			angle = angle > 0 ? angle : angle + PI2;
		}
		return angle;
	}

	self.amp = function(val) {
		amp = val;
		return amp;
	}

	return self;
}