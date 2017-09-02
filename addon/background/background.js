//TO-DO: time display bugs out on iframes.
var currentStart="not set";
var currentEnd="not set";
var displayStart="not set";
var displayEnd="not set";



var timeListener = (info, tab) => {
	// console.log('timeListener', info, tab);

	//HOW TO not require <"all_urls">:
	//execute the script, then inside the script compare media srcUrls to find the correct element.
	browser.tabs.executeScript({
		file: "/content_scripts/html5looper.js",
		frameId: info.frameId
	})
	.then( () => browser.tabs.sendMessage(tab.id, {url: info.srcUrl, command: info.menuItemId, start: currentStart, end: currentEnd}) )
	.catch( (err)=> console.error("reloadListener error:", err)	);	

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


