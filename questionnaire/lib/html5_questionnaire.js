var $wrapper;
var mediaplayer;

function loadVideoEvents(video) {
  console.debug("loadVideoEvents: " + video);
  var last_int = null;
  video.addEventListener('play', function() {
    last_int = setInterval(function() {
        console.log("ble");
        if (document.fullScreen || 
            document.mozFullScreen ||
            document.webkitIsFullScreen) {
        console.log("yes");
          $wrapper.addClass("fullscreen");
        } else {
          $wrapper.removeClass("fullscreen");
        }
        var stop = Questionnaire.video_question(video.currentTime);
        if (stop) {
          if (last_int) clearInterval(last_int);
          $wrapper.addClass("pause");
          video.pause();
          Questionnaire.showVideoQuestion();
          Questionnaire.trigger("show");
        }
    }, 50);
  }, false);

  video.addEventListener('pause', function() {
    if (last_int) clearInterval(last_int);
  });

  video.addEventListener('webkitfullscreenchange', function() {
    if (document.fullScreen || 
        document.mozFullScreen ||
        document.webkitIsFullScreen) {
      $wrapper.addClass("fullscreen");
    } else {
      $wrapper.removeClass("fullscreen");
    }
  });

  video.addEventListener('ended', function() {
    Questionnaire.showOverview();
    Questionnaire.fadeIn();
  });

}

function loadVideoQuestionnaire(ele, url) {
  console.debug("loadVideoQuestionnaire: " + url);

  $wrapper = $(ele);
  $wrapper.prepend('<div id="overlay" class="video-evt"></div>');
  $wrapper.addClass("video");

  var nakedUrl = url.replace(".mp4","")
  $video_wrapper = $("<div id='v'></div>");
  $video = $("<video width='768' height='432' controls></video>").appendTo($video_wrapper);
  $("<source>").attr({
    "id": "mp4",
    "src": url,
    "type": "video/mp4",
  }).appendTo($video);
  $("<source>").attr({
    "id": "3gp",
    "src": nakedUrl + ".3gp",
    "type": "video/3gp",
  }).appendTo($video);
  $("<source>").attr({
    "id": "flv",
    "src": nakedUrl + ".flv",
    "type": "video/flv",
  }).appendTo($video);
  $("<source>").attr({
    "id": "webm",
    "src": nakedUrl + ".webm",
    "type": "video/webm",
  }).appendTo($video);

  $video.append("<p>Your user agent does not support the HTML5 Video element.</p>");
    
  $wrapper.prepend($video_wrapper);

  mejs.MediaFeatures.svg = false;
  console.log("CanPlay?");
  console.log($video[0].canPlayType);
  $video.mediaelementplayer({
  	features: ['playpause','progress','current', 'duration', 'volume','sourcechooser', 'fullscreen'],
    iPadUseNativeControls: true,
    iPhoneUseNativeControls: true, 
    AndroidUseNativeControls: true,
    loop: false,
    enablePluginDebug: true,
  	success: function(media, node, player) {
      mediaplayer = media;
      mediaplayer.addEventListener("seeked", function() { console.debug("Video event: seeked") });
      mediaplayer.addEventListener("loadeddata", function() { console.debug("Video event: loadeddata") });
      mediaplayer.addEventListener("play", function() { console.debug("Video event: play") });
      mediaplayer.addEventListener("playing", function() { console.debug("Video event: playing") });
      mediaplayer.addEventListener("pause", function() { console.debug("Video event: pause") });
      mediaplayer.addEventListener("ended", function() { console.debug("Video event: ended") });
  	  console.debug('mediaelementplayer mode: ' + media.pluginType);
      loadVideoEvents(media);
      Questionnaire.on("continue", function() {
        mediaplayer.play()
        $wrapper.removeClass("pause");
        Questionnaire.fadeOut();
      });
      mediaplayer.play();
  	},
  	error: function(media, err) {
  	  console.debug('mediaelementplayer mode: ' + media.pluginType);
      console.error(media.method);
      console.error(media.outerHTML);
      console.error("There was an error");
    }
  });
}
