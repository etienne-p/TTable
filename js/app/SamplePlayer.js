SamplePlayer = function(left, right) {

	function processAudio(e) {

		var inBufferL = e.inputBuffer.getChannelData(0),
			inBufferR = e.inputBuffer.getChannelData(1),
			outBufferL = e.outputBuffer.getChannelData(0),
			outBufferR = e.outputBuffer.getChannelData(1),
			len = outBufferL.length,
			threshold = self.threshold * 5,
			smoothness = self.smoothness;

		//--  threshold * Math.sin(Math.atan(smoothness * x))
		for (var i = 0; i < len; ++i) {
			outBufferL[i] = threshold * Math.sin(Math.atan(smoothness * inBufferL[i]));
			outBufferR[i] = threshold * Math.sin(Math.atan(smoothness * inBufferR[i]));
		}
	};

	return {
		processAudio: processAudio
	}

}

//use:
//scriptProcessor.onaudio = SamplePlayer.processAudio
