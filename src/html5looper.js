import React from 'react';
import ReactDOM from 'react-dom';
import AdvancedMenu from './advanced-menu';


const CHECK_INTERVAL = 500; // in ms

const newDiv = document.createElement("div"); // to attach advanced menu
var appended = false;

var media= document.querySelectorAll("video, audio");
var index=0; // media[index]


var arrayify = arr => {
	return JSON.parse("[" + arr + "]");
}


//check all custom looped media elements per interval if media is reaching the loop endTime
var timer = (times) => {

	for (let i = 0; i < times.length; i++) {
		let startTimes = times[i].startTime;
		let endTimes = times[i].endTime;

		if(times[i].media.loop && !times[i].media.paused && endTimes[times[i].segment]<=times[i].media.currentTime){
			
			let j = 0; //just in case all segments are 0.
			//skip 0second intervals
			do{
				if(times[i].segment<startTimes.length-1)
					++times[i].segment;
				else
					times[i].segment=0;

				++j;
			}while(endTimes[times[i].segment]-startTimes[times[i].segment]==0 && j<=startTimes.length);

			//move playback to next segment start
			times[i].media.currentTime = startTimes[times[i].segment];
		}
	}
}

//creates/modifies a list of objects with the currently custom looped media elements.
var loopingMediaElementsToArray = () => {
	let times = [];

	for (let i = 0; i < media.length; i++) {
		let timeobj = {}; //holds media element and start&end times arrays
		timeobj.media = media[i];
		if (media[i].hasAttribute('startTime')){
			timeobj.startTime = arrayify(media[i].getAttribute('startTime'));
			timeobj.endTime = arrayify(media[i].getAttribute('endTime'));
			timeobj.segment = 0;
			times.push(timeobj); // [{media: HTMLMediaElement, startTime: [], endTime: [], segment: 0}]
		}
	}
	if(times.length>0)
		window.interval = setInterval(timer, CHECK_INTERVAL, times);
}





var loopTimer = (request, sender, sendResponse) =>{
	if (!media[index]) return;
	let startTime, endTime, reseted=false;
	
	// used advanced menu?
	if(Array.isArray(request)){
		startTime=[];
		endTime=[];

		//push the created segments onto the arrays which are used in the timer
		for (var i = 0; i < request.length-1; i+=2) {
			//check that end is smaller than media.duration
			//need to check startTime too in case it's also media.duration, so, to be skipped
			let calcEnd = request[i+1];
			if (calcEnd== ~~media[index].duration) {calcEnd-=1;} //floor media.duration
			let calcStart = request[i];
			if (calcStart== ~~media[index].duration) {calcStart-=1;}
			startTime.push(calcStart);
			endTime.push(calcEnd);
		}
	}
	else
	{

		if(media[index].hasAttribute('startTime')){
			startTime=media[index].getAttribute('startTime');
			endTime=media[index].getAttribute('endTime');
		} else {
			startTime = 0;
			endTime = media[index].duration-1;
		}


		switch(request.command){
			case "looperstart":
				startTime = media[index].currentTime;
				if(startTime>endTime)
					endTime=media[index].duration-1;
				break;
			case "looperend":
				endTime = media[index].currentTime;
				if(endTime<startTime)
					startTime=0;
				break;
			case "looperreset":  //Attempting to remove an attribute that is not on the element doesn't raise an exception. so whatever.
				if (media[index].hasAttribute('startTime')) media[index].removeAttribute('startTime');
				if (media[index].hasAttribute('endTime')) media[index].removeAttribute('endTime');
				if (media[index].hasAttribute('segment')) media[index].removeAttribute('segment');
				reseted = true;
				break;
			case "looperadvanced":
				return;
			default:
				console.log("html5looper bug: DEFAULTED");
				return;
		}

		if (endTime > media[index].duration)
			endTime = media[index].duration-1; //iframes use this sometimes

		if (startTime < 0)
			startTime = 0;

	}

	if (!reseted) {
		media[index].setAttribute('startTime', startTime); //attach startTime and endTime to this specific media element as if to save them.
		media[index].setAttribute('endTime', endTime);
	}

	//set interval to check on if the current time has reached the custom end
	clearInterval(window.interval);
	

	loopingMediaElementsToArray(); // have an array of the elements currently being looped.

	// return sendResponse({start: startTime, end: endTime});
	browser.runtime.sendMessage({"start": startTime, "end": endTime});
}




//https://stackoverflow.com/a/42688828
var mergeSortedArray = (a, b) => {
	var arr = a.concat(b).sort(function(a, b) {
        return a - b;
     });
    return arr;
}


// focus on the media element the context menu was opened on and start working on that
var attachMedia = e => {
	let el = e.target.tagName.toLowerCase();
	// console.log("etarget: ",el);
	if(el==='video' || el==='audio'){

		media = document.querySelectorAll("video, audio"); // update in case there is embed elements

		if(!media || media==null) return;

		for (index = 0; index < media.length; index++) {
			if (e.target === media[index]) break;
		}
		// console.log('index', index);

		if (!appended){
			document.body.appendChild(newDiv); //this is for attaching the alert}
			appended = true;
		}

		let defaults = [0, ~~media[index].duration];
		
		if(media[index].hasAttribute('startTime') && media[index].hasAttribute('endTime')){
			defaults = mergeSortedArray( arrayify(media[index].getAttribute('startTime')), arrayify(media[index].getAttribute('endTime')));
		}

		//create advanced options alert on context menu so it'll be done by the time 'advanced' is pressed?
		const am = <AdvancedMenu defaults={defaults} max={~~media[index].duration} loopTimer={loopTimer} />;
		ReactDOM.render(am, newDiv);

		browser.runtime.sendMessage({
			"start": media[index].hasAttribute('startTime') ? media[index].getAttribute('startTime') : 0,
			 "end": media[index].hasAttribute('endTime') ? media[index].getAttribute('endTime') : media[index].duration
		});
	}
}

	

if (!browser.runtime.onMessage.hasListener(loopTimer))
	browser.runtime.onMessage.addListener(loopTimer);

document.addEventListener('contextmenu', attachMedia);

