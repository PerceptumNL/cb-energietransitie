
function loadVideoQuestionnaire(ele, url) {
  console.debug("loadVideoQuestionnaire: " + url);
    

  $wrapper = $(ele);
  $wrapper.prepend('<div id="overlay" class="video-evt"></div>');
  $wrapper.addClass("video");
  var nakedUrl = url.replace(".mp4","")

  $video = $("<video id='v' width='768' height='432' controls></video>");
  $("<source>").attr({
    "id": "mp4",
    "src": url,
    "type": "video/mp4",
    "preload": "none"
  }).appendTo($video);
  $("<source>").attr({
    "id": "3gp",
    "src": nakedUrl + ".3gp",
    "type": "video/3gp",
    "preload": "none"
  }).appendTo($video);
  $("<source>").attr({
    "id": "flv",
    "src": nakedUrl + ".flv",
    "type": "video/flv",
    "preload": "none"
  }).appendTo($video);
  $("<source>").attr({
    "id": "webm",
    "src": nakedUrl + ".webm",
    "type": "video/webm",
    "preload": "none"
  }).appendTo($video);

  $video.append("<p>Your user agent does not support the HTML5 Video element.</p>");
    
  $wrapper.prepend($video);

  var video= document.getElementById('v');
  var last_int = null;
  video.addEventListener('play', function() {
    last_int = setInterval(function() {
        if (document.fullScreen || 
            document.mozFullScreen ||
            document.webkitIsFullScreen) {
          $wrapper.addClass("fullscreen");
        } else {
          $wrapper.removeClass("fullscreen");
        }
        //console.log(video.currentTime);
        var stop = Questionnaire.video_question(video.currentTime);
        if (stop) {
            if (last_int) clearInterval(last_int);
            $wrapper.addClass("pause");
            video.pause();
        }
    }, 50);
  }, false);

  video.addEventListener('pause', function() {
    if (last_int) clearInterval(last_int);
  });

  video.addEventListener('webkitfullscreenchange', function() {
    console.error("FULLSCREEN");
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
    console.debug("Video ended");
  });

  Questionnaire.on("next", function() {
    video.play()
    Questionnaire.fadeOut();
    $wrapper.removeClass("pause");
  });

  video.play();
}
