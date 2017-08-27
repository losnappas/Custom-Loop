//TO-DO: time display bugs out on iframes.
var currentStart="not set";
var currentEnd="not set";
var displayStart="not set";
var displayEnd="not set";



var timeListener = (info, tab) => {
	// console.log('timeListener', info, tab);

    var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
    let frameId = info.frameId;
    gettingActiveTab.then((tabs) => {
    	if (info.menuItemId.indexOf("looper")!==-1){
			browser.tabs.sendMessage(tabs[0].id, 
				{command: info.menuItemId, start: currentStart, end: currentEnd}, {frameId});			
		}
      });
}


function fancyTimeFormat(time)
{   
    // Hours, minutes and seconds
    // ~~ === Math.floor
    time = ~~time;
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = time % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";

    if (hrs > 0) {
        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
}

var uiUpdate = response => {
	// console.log("THEN", response);
	displayStart = fancyTimeFormat(response.start);
	displayEnd = fancyTimeFormat(response.end);
	currentStart = response.start;
	currentEnd = response.end;

	//update the tooltip
	browser.contextMenus.update("current", {title: displayStart+"-"+displayEnd});
}

browser.contextMenus.create({
	id: "current",
	title: displayStart + "-" + displayEnd,
	contexts: ["audio", "video"]
});


browser.contextMenus.create({
	id: "looperstart",
	title: "Select start",
	contexts: ["audio", "video"]
});
browser.contextMenus.create({
	id: "looperend",
	title: "Select end",
	contexts: ["audio", "video"]
});
browser.contextMenus.create({
	id: "looperreset",
	title: "Reset",
	contexts: ["audio", "video"]
});
browser.contextMenus.create({
	id: "looperadvanced",
	title: "Advanced",
	contexts: ["audio", "video"]
});


browser.contextMenus.onClicked.addListener(timeListener);

browser.runtime.onMessage.addListener(uiUpdate);


