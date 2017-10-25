import React from "react"
import ReactDOM from "react-dom"
import AdvancedMenuWrapper, { AdvancedMenu } from "./advanced-menu-rewrite"
import Alert from "react-s-alert"

(function(){
// TODO: need to stop using media.ontimeupdate=x; what if the web page already defines that? It just gets stolen and
//  this addon will then wreck the website. .ontimeupdate handler is very rare so good enough for now.
/*
 Dirty IFDEF trick to avoid multiple content script injections
*/
if ( window.customLoop ) {
  return
}


// Cut before to not go over. 0.5 seems okay.
const SECSTOCUT = 0.5


/*
 Iterates through media elements and compares their source to the 
  src given by context menu click in background script.

 Some websites, like YouTube, will not give a src URL so do a length check.
  Not the greatest solution and some unlucky websites will break the addon.
  https://bugzilla.mozilla.org/show_bug.cgi?id=1398453
*/
function getMedia ( url ) {
  let medias = document.querySelectorAll("video, audio");
  
  for ( let media of medias ) {
    if ( media.currentSrc === url  ||  medias.length === 1 ) {
      return media
    }
  }
}

function createAdvancedMenu ( loop ) {
  let anchor = document.getElementById ("forCustomLoopAdvancedMenu")

  // "loopTimer" is "start looping like this".
  const advancedMenu = <AdvancedMenu 
                          defaults={ loop.getSettings().checkpoints } 
                          max={ loop.getMediaDuration() } 
                          loopTimer={ loop.advancedInit } 
                          getCurrentTime={ loop.getMediaCurrentTime }
                        />


  if ( anchor == null ) {
    anchor = document.createElement ("div")
    anchor.id = "forCustomLoopAdvancedMenu"
    document.body.appendChild ( anchor )
    
    // Create the menu
    ReactDOM.render ( <AdvancedMenuWrapper />, anchor )
  }

  // Open menu
  let alertId = Alert.warning(advancedMenu, {
    position: "bottom",
    effect: "jelly",
    timeout: "none"
  })

}

/*
global var:
  window.customLoop = {
    [url1] : {
      checkpoints: [start,end,start,end...]
    },
    [url2]: {
      checkpoints: []
    }
    //etc..
  }

*/
function handleContextMenuClick ( { mediaSrcURL, command } ) {
  // 2 choices: remove listener and ReactDOM.render every time, or don't remove listener and do the tricks...
  // // Remove message listener. Next time it will be re-injected.
  // // browser.runtime.onMessage.removeListener( handleContextMenuClick )
  // Uses the dirty tricks.

  let media = getMedia ( mediaSrcURL )

  if ( window.customLoop == null ) {
    window.customLoop = {}
  }

  if ( window.customLoop[ mediaSrcURL ] == null ) {
    window.customLoop[ mediaSrcURL ] = {
      checkpoints: [ 0, media.duration ]
    }
  }

  let settings = window.customLoop[ mediaSrcURL ]

  let loop = loopOperations ( media, settings )

  switch ( command ) {
    case "looperstart":
      loop.setStart ()
      break
    case "looperend":
      loop.setEnd ()
      break
    case "looperreset":
      loop.reset ()
      break
    case "looperadvanced":
      createAdvancedMenu ( loop )
      return
    default:
      console.log( "looper bug: switch defaulted. Command was: ", command )
      return
  }
}


/*
  This is like a module. The difficulty of addEventListener is losing context. Then they can't be removed.
*/
function loopOperations ( media, settings ) {
  let startTime = settings.checkpoints[ 0 ]
  let endTime = settings.checkpoints[ 1 ]

  if ( settings.checkpoints.length > 2 ) {
    startTime = 0
    endTime = media.duration
  }

  let simpleTimeListener = () => {
    if ( settings.checkpoints[ 1 ] - SECSTOCUT <= media.currentTime ) {
      // media.fastSeek( settings.checkpoints[ 0 ] )

      // Some extra conditions. If loop is on & it's not paused
      if ( media.loop && !media.paused ) {
        media.currentTime = settings.checkpoints[ 0 ]
      }
    }

  }


  let simpleApply = () => {
    settings.checkpoints = [
      startTime,
      endTime
    ]

    // Because an element can only have one handler but multiple listeners, use a handler.
    // ^^^again, irrelevant since this script is now injected fully only once.
    media.ontimeupdate = simpleTimeListener

    browser.runtime.sendMessage({
      start: startTime,
      end: endTime
    })
  }

  let setStart = () => {
    startTime = media.currentTime
    
    if ( startTime > endTime ) {
      endTime = media.duration
    }

    simpleApply()
  }

  let setEnd = () => {
    endTime = media.currentTime

    if ( endTime < startTime ) {
      startTime = 0
    }

    simpleApply()
  }

  let reset = () => {
    startTime = 0
    endTime = media.duration
    
    simpleApply()
    media.ontimeupdate = null
  }


  let advancedInit = value => {
    // end = ar[1], start = ar[0]
    let segment = 1

    settings.checkpoints = value

    let advancedTimeListener = () => {
      if ( media.loop && !media.paused ) {
        if ( settings.checkpoints[ segment ] - SECSTOCUT <= media.currentTime ) {
          ++segment
          if ( segment >= settings.checkpoints.length ) {
            segment = 0
          }

          // media.fastSeek( settings.checkpoints[ segment ] )
          media.currentTime = settings.checkpoints[ segment ]
          ++segment
        }
      }
    }

    // This was used over addEventListener for multi content script injections.
    // No multi inject after all. Could swap to listener if wanted to.
    media.ontimeupdate = advancedTimeListener

    browser.runtime.sendMessage({
      start: 817,
      end: 817
    })
  }


  let getMediaCurrentTime = () => {
    return media.currentTime
  }

  let getMediaDuration = () => {
    return media.duration
  }

  let getSettings = () => {
    return settings
  }


  return {
    reset,
    setEnd,
    setStart,
    advancedInit,
    getMediaCurrentTime,
    getMediaDuration,
    getSettings
  }
}




if ( !browser.runtime.onMessage.hasListener( handleContextMenuClick ) ) {
  browser.runtime.onMessage.addListener( handleContextMenuClick )
}

}())