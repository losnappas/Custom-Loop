import React from 'react';
import ReactDOM from 'react-dom';
import AdvancedMenu from './advanced-menu';

const CHECK_INTERVAL = 500; // in ms

var element;


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
	let media = document.querySelectorAll("video, audio");

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


var findElement = url => {

	let media = document.querySelectorAll("video, audio");
	
	
	//loop through
	for (let lelement of media){
		// if the info of the source, given by the contextMenu item click matches
		if(lelement.currentSrc==url || media.length===1){ // media.length check because of YOUTUBE videos not giving off a srcUrl on context menu click.
			element = lelement;
			break;
		}
	}

}

var createAdvancedMenu = () => {
	let newDiv = document.getElementById("forCustomLoopAdvancedMenu");
	if (newDiv === null){
		newDiv = document.createElement("div"); // to attach advanced menu
		newDiv.id = "forCustomLoopAdvancedMenu";
		document.body.appendChild(newDiv); //this is for attaching the alert}
	}

	let defaults = [0, ~~element.duration];
	
	if(element.hasAttribute('startTime') && element.hasAttribute('endTime')){
		defaults = mergeSortedArray( arrayify(element.getAttribute('startTime')), arrayify(element.getAttribute('endTime')));
	}

	// console.log("hi")
	
	//create advanced options alert on context menu so it'll be done by the time 'advanced' is pressed?
	const am = <AdvancedMenu defaults={defaults} max={~~element.duration} loopTimer={loopTimer} />; // looptimer=loopchecker because last minute changes cba
	ReactDOM.render(am, newDiv);
	//var myMenu = ReactDOM.render(am, newDiv);  //?
	//then myMenu.state.value;
	//could somehow turn this whole advancedmenu into async thing and wait for the values, .then((values)=>looptimer(values))?
}

/*
	small rundown:
		attach the start times and endtimes to the media element as attributes
		then start the interval to check if currentTime > end time
		move to next start time
*/

var loopTimer = (request, sender, sendResponse) =>{	
	//remove the listener, because next time there will be a new injection of this script. We don't want to leave things hanging.
	//phase 2: don't need to remove because of hasListener()?? mb it's smart. -  it's not.
	if(browser.runtime.onMessage.hasListener(loopTimer))
		browser.runtime.onMessage.removeListener(loopTimer);


	if(typeof request.url != undefined)
		findElement(request.url);

	if (typeof element == undefined || !element) return;


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
			if (calcEnd== ~~element.duration) {calcEnd-=1;} //floor media.duration
			let calcStart = request[i];
			if (calcStart== ~~element.duration) {calcStart-=1;}
			startTime.push(calcStart);
			endTime.push(calcEnd);
		}
	}
	else
	{

		if(element.hasAttribute('startTime')){
			startTime=element.getAttribute('startTime');
			endTime=element.getAttribute('endTime');
		} else {
			startTime = 0;
			endTime = element.duration-1;
		}


		switch(request.command){
			case "looperstart":
				startTime = element.currentTime;
				if(startTime>endTime)
					endTime=element.duration-1;
				break;
			case "looperend":
				endTime = element.currentTime;
				if(endTime<startTime)
					startTime=0;
				break;
			case "looperreset":  //Attempting to remove an attribute that is not on the element doesn't raise an exception. so whatever.
				if (element.hasAttribute('startTime')) element.removeAttribute('startTime');
				if (element.hasAttribute('endTime')) element.removeAttribute('endTime');
				if (element.hasAttribute('segment')) element.removeAttribute('segment');
				reseted = true;
				break;
			case "looperadvanced":
				createAdvancedMenu();
				return;
			default:
				console.log("html5looper bug: DEFAULTED");
				return;
		}

		if (endTime > element.duration)
			endTime = element.duration-1; //iframes use this sometimes

		if (startTime < 0)
			startTime = 0;

	}


	if (!reseted) {
		element.setAttribute('startTime', startTime); //attach startTime and endTime to this specific media element as if to save them.
		element.setAttribute('endTime', endTime);
	}

	//set interval to check on if the current time has reached the custom end
	clearInterval(window.interval);
	

	loopingMediaElementsToArray(); // have an array of the elements currently being looped.


	browser.runtime.sendMessage({
		"start": element.hasAttribute('startTime') ? element.getAttribute('startTime') : 0,
		 "end": element.hasAttribute('endTime') ? element.getAttribute('endTime') : element.duration
	});

}




//https://stackoverflow.com/a/42688828
var mergeSortedArray = (a, b) => {
	var arr = a.concat(b).sort(function(a, b) {
        return a - b;
     });
    return arr;
}



if (!browser.runtime.onMessage.hasListener(loopTimer))
	browser.runtime.onMessage.addListener(loopTimer);


