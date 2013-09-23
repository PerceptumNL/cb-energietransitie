
function loadVideoQuestionnaire(ele, youtubeid) {
  console.log("loadVideoQuestionnaire: " + youtubeid);
  $wrapper = $(ele);
  $wrapper.append(
  '<div id="ytapiplayer">'+
  '  You need Flash player 8+ and JavaScript enabled to view this video.'+
  '</div>'
  );

  var params = { 
    allowScriptAccess: "always", 
    wmode: "transparent" 
  };
  var atts = { 
    id: "myytplayer" 
  };
  swfobject.embedSWF("http://www.youtube.com/v/"+youtubeid+
                        "?enablejsapi=1&playerapiid=ytplayer&version=3",
                      "ytapiplayer", 
                      "788", "536", "8", null, null, params, atts);
}

var inter;
var ytplayer;

function onYouTubePlayerReady(playerId) {
  console.log("onYouTubePlayerReady: " + playerId);
  ytplayer = document.getElementById("myytplayer");
  ytplayer.addEventListener("onStateChange", 
    "onytplayerStateChange");

  $('question').hide();
  $('question').css({
    position: "relative", 
//    top: "-536px", 
    "z-index": "-1" 
  });
  Questionnaire.on("next", function() {
    this.fadeOut();
    ytplayer.playVideo()
  });
}

function onytplayerStateChange(newState) {
  console.log("Player's new state: " + newState);

  if (newState == 1) {
    inter = setInterval(function() {
      console.log(ytplayer.getCurrentTime());
      if (ytplayer.getPlayerState() != 2) {
        var stop = Questionnaire.video_question(ytplayer.getCurrentTime());
        if (stop) {
            ytplayer.pauseVideo()
        }
      }
    }, 5)
  }
  if (newState == 2) {
    clearInterval(inter);
  }
  if (newState == 0) {
    Questionnaire.showOverview();
    Questionnaire.fadeIn();
    console.log("Video ended");
  }
}
