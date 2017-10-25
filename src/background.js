import fancyTimeFormat from './fancyTimeFormat'

//TO-DO: time display bugs out on iframes.
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
	.then( 
		() => browser.tabs.sendMessage(
			tab.id,
		 	{ 
		 		mediaSrcURL: info.srcUrl,
		 	 	command: info.menuItemId 
		 	},
		  	{ 
		  		frameId: info.frameId 
		  	} 
		  ) 
	)
	.catch( (err)=> console.error("reloadListener error:", err)	);	

}


var uiUpdate = response => {
	// console.log("THEN", response);
	displayStart = fancyTimeFormat(response.start);
	displayEnd = fancyTimeFormat(response.end);

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


