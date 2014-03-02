TTable.SamplePlayer = function(left, right) {

	var pos = 0,
		len = left.length,
		rate = 1,
		amp = 0,
		cRate = 1;

	// interpolation requires accessing samples at potentially Math.ceil((len - 1).546))
	// make sure that this sample exists
	// this way, we don't have to add % len on sample index

	left[len] = left[0];
	right[len] = right[0];

	function processAudio(e) {

		var outBufferL = e.outputBuffer.getChannelData(0),
			outBufferR = e.outputBuffer.getChannelData(1),
			bufLen = outBufferL.length,
			d = rate, // depends on speed
			acc = 0,
			l, r,
			alpha = 0.5; // interpolation

		for (var i = 0; i < bufLen; ++i) {

			d = (rate - cRate) * (i / bufLen) + cRate

			alpha = pos - Math.floor(pos);
			outBufferL[i] = l = 0.5 * (alpha * left[Math.floor(pos)] + (1 - alpha) * left[Math.ceil(pos)]);
			outBufferR[i] = r =  0.5 * (alpha * right[Math.floor(pos)] + (1 - alpha) * right[Math.ceil(pos)]);
			pos = (len + pos + d) % len;
			acc += 	Math.abs(l) + Math.abs(r);
		}
		amp = acc / (bufLen * 2);
		cRate = rate;
	};

	function posRatio(){
		return pos / len;
	}

	function setRate(arg) {
		rate = arg
	}

	function getAmp() {
		return amp;
	}

	return {
		processAudio: processAudio,
		posRatio: posRatio,
		setRate: setRate,
		getAmp: getAmp
	}

}

//use:
//scriptProcessor.onaudio = SamplePlayer.processAudio