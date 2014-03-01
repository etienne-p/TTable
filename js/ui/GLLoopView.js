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
		particles = null,
		PI2 = 2 * Math.PI,
		amp = 1,
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

	function initParticles(numParticles_) {
		particles = [];
		var i = 0;
		for (; i < numParticles_; ++i) {
			particles[i] = 0.2 + 0.8 * Math.cos(0.5 * (i / numParticles_) * PI2);
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
			dA = 0.001, // delta angle
			x, y, a, rad, ind, p,
			len = Math.floor(PI2 / dA),
			audioData = waveform_,
			pOffset = Math.floor(len * (angle / PI2)),
			audioLen = audioData.length;

		// TODO: appens once, shoud NOT check every time
		if (!vertices) {
			initVertices(len);
			initParticles(len);
		}
		p = particles;

		function ampAt(ratio) {
			return audioData[Math.round(ratio * (audioLen - 1))]
		}

		// tmp excitation
		//p[Math.floor(Math.random() * len)] = 1 + Math.random();

		for (i = 0; i < len; ++i) {
			a = angle + dA * i;
			ind = (i + pOffset) % len;
			rad = 0.5 + 0.2 * ampAt(i / (len - 1)) * (1 + p[ind]) * amp/* + Math.random() * 0.2*/ ;
			//p[ind] *= 0.99;
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

	self.resize = function(w_, h_) {
		canvas.width = w_;
		canvas.height = h_;
		gl.viewport(0, 0, canvas.width, canvas.height);
		// mat4.perspective(out, fovy, aspect, near, far) 
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