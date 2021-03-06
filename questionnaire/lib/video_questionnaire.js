
function loadVideoQuestionnaire(ele, youtubeid) {
  console.log("loadVideoQuestionnaire: " + youtubeid);
  $wrapper = $(ele);
  $wrapper.prepend(
  '<div id="ytapiplayer">'+
  '  You need Flash player 8+ and JavaScript enabled to view this video.'+
  '</div>'
  );

  $video = $("<video id='v' controls></video");
  $video.append("<source>").attr({
    "id": "mp4",
    "src": "videos/1.1 Introductie met dagelijks energiegerbruik-IsHAobnJz-I.mp4",
    "type": "video/mp4"
  });
  $video.append("<p>Your user agent does not support the HTML5 Video element.</p>");
    
  $("#ytapiplayer").append($video);
  
  var video= document.getElementById('v');
  video.addEventListener('progress', function() {
    var show= video.currentTime>=5 && video.currentTime<10;
    overlay.style.visibility= show? 'visible' : 'visible';
  }, false);"

  //var params = { 
  //  allowScriptAccess: "always", 
  //  wmode: "transparent",
  //  allowFullscreen: "true",
  //};
  //var atts = { 
  //  id: "myytplayer",
  //  style: "position:absolute" 
  //};
  //swfobject.embedSWF("http://www.youtube.com/v/"+youtubeid+
  //                      "?enablejsapi=1&playerapiid=ytplayer&version=3",
  //                    "ytapiplayer", 
  //                    "788", "536", "8", null, null, params, atts);
}

var inter;
var ytplayer;

function onYouTubePlayerReady(playerId) {
  console.log("onYouTubePlayerReady: " + playerId);
  ytplayer = document.getElementById("myytplayer");
  ytplayer.addEventListener("onStateChange", 
    "onytplayerStateChange");

  $("question").show()
  Questionnaire.on("load", function() {
    this.fadeIn();
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
