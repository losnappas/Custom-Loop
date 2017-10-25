/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _fancyTimeFormat = __webpack_require__(1);
	
	var _fancyTimeFormat2 = _interopRequireDefault(_fancyTimeFormat);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	//TO-DO: time display bugs out on iframes.
	var displayStart = "not set";
	var displayEnd = "not set";
	
	var timeListener = function timeListener(info, tab) {
		// console.log('timeListener', info, tab);
	
		//HOW TO not require <"all_urls">:
		//execute the script, then inside the script compare media srcUrls to find the correct element.
		browser.tabs.executeScript({
			file: "/content_scripts/html5looper.js",
			frameId: info.frameId
		}).then(function () {
			return browser.tabs.sendMessage(tab.id, { mediaSrcURL: info.srcUrl, command: info.menuItemId });
		}).catch(function (err) {
			return console.error("reloadListener error:", err);
		});
	};
	
	var uiUpdate = function uiUpdate(response) {
		// console.log("THEN", response);
		displayStart = (0, _fancyTimeFormat2.default)(response.start);
		displayEnd = (0, _fancyTimeFormat2.default)(response.end);
	
		//update the tooltip
		browser.contextMenus.update("current", { title: displayStart + "-" + displayEnd });
	};
	
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

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	//duplicate code from background.js o_O
	var fancyTimeFormat = function fancyTimeFormat(time) {
	    // Hours, minutes and seconds
	    // ~~ === Math.floor
	    time = ~~time;
	    var hrs = ~~(time / 3600);
	    var mins = ~~(time % 3600 / 60);
	    var secs = time % 60;
	
	    // Output like "1:01" or "4:03:59" or "123:03:59"
	    var ret = "";
	
	    if (hrs > 0) {
	        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
	    }
	
	    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
	    ret += "" + secs;
	    return ret;
	};
	
	exports.default = fancyTimeFormat;

/***/ }
/******/ ]);
//# sourceMappingURL=background.js.map