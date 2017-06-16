var media;
var startTime = -1;
var endTime = -1;


var loopTimer = (request, sender, sendResponse) =>{

	if (!media) return;
	// console.log('r',request);

	//set start and endtime if they're not set or have been reset
	if (request.start === "not set" || (startTime===817 && endTime===817)) {
		startTime=0;
		endTime=media.duration-1; //-1 because interval is only once/sec->otherwise will miss it and time will be 0
	}else{ // this else is needed for iframes and such
		startTime=request.start;
		endTime=request.end;
	}

	switch(request.command){
		case "looperstart":
			startTime = media.currentTime;
			break;
		case "looperend":
			endTime = media.currentTime;
			break;
		case "looperreset":
			endTime = 817;
			startTime = 817;
			clearInterval(window.interval);
			browser.runtime.sendMessage({"start": startTime, "end": endTime});
			return;
		default:
			console.log("html5looper bug: DEFAULTED");
			return;
	}
	if (startTime>endTime) 
		startTime = endTime;
	
	if (endTime > media.duration)
		endTime = media.duration-1; //iframes use this sometimes
	
	if (startTime < 0)
		startTime = 0;

	//set interval to check on if the current time has reached the custom end
	clearInterval(window.interval);
	window.interval = setInterval(timer, (1000*(1/media.playbackRate)));

	// return sendResponse({start: startTime, end: endTime});
	browser.runtime.sendMessage({"start": startTime, "end": endTime});
}

//check once a second if media is reaching the loop endTime
timer = () => {
	// console.log("timer is running");
	if(media.loop && !media.paused && endTime<=media.currentTime){
		media.currentTime = startTime;
		// console.log("timer");
	}
}

// might TO-DO: find a way to stick to all media elements separately.
// focus on the media element the context menu was opened on and start working on that
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

