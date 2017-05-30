var media;
var startTime = -1;
var endTime = -1;


var loopTimer = (request, sender, sendResponse) =>{
	// console.log("looptimer", media);

	if (!media) return;
	let settingInterval = true;
	// console.log('r',request);
	// console.log('s', sender);
	// console.log('sr', sendResponse);
		// console.log("test");
	if (request.start === "not set" || (startTime===817 && endTime===817)) {
		startTime=0;
		endTime=media.duration;
	}else{
		startTime=request.start;
		endTime=request.end;
	}
	switch(request.command){
		case "looperstart":
			startTime = media.currentTime;
			// media.onseeking = setTime(true);
			break;
		case "looperend":
			endTime = media.currentTime;
			// media.onseeking = setTime(false);
			break;
		case "looperreset":
			endTime = 817;
			startTime = 817;
			settingInterval=false;
			clearInterval(window.interval);
			browser.runtime.sendMessage({"start": startTime, "end": endTime});
			return;
		case "default":
			console.log("html5looper bug: DEFAULTED");
			return;
	}
	if (startTime>endTime) 
		startTime = endTime;
	
	if (endTime > media.duration)
		endTime = media.duration;
	
	if (startTime < 0)
		startTime = 0;

	clearInterval(window.interval);

	if (settingInterval)
		window.interval = setInterval(timer, (1000*(1/media.playbackRate)));


	// return sendResponse({start: startTime, end: endTime});
	browser.runtime.sendMessage({"start": startTime, "end": endTime});
}

setTime = beginning => {

	if (beginning) startTime = media.currentTime;
	else endTime = media.currentTime;
}

timer = () => {
	// console.log("timer is running");
	if(media.loop && !media.paused && endTime<=media.currentTime){
		media.currentTime = startTime;
		// console.log("timer");
	}
}

attachMedia = e => {
	let el = e.target.tagName.toLowerCase();
	// console.log("etarget: ",el);
	if(el==='video' || el==='audio'){
		media = e.target;
	}
}

if (!browser.runtime.onMessage.hasListener(loopTimer))
	browser.runtime.onMessage.addListener(loopTimer);

document.addEventListener('contextmenu', attachMedia);
// document.oncontextmenu = attachMedia;
