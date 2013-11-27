var VideoQuestionnaire = {
    $wrapper: null,
    mediaplayer: null,
    video: null,
    replay: function() {
      this.playAt(0);
    },

    playAt: function(ds) {
      var second = ds / 10.0 + 0.1;
      this.mediaplayer.player.setCurrentTime(second);
      this.mediaplayer.play()
    },

    loadEvents: function() {
      console.debug("loadEvents: " + video);
      var video = this.mediaplayer;
      var $wrapper = this.$wrapper;
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
    },
    
    create: function(ele, url, lastTime) {
      var self = this;
      console.debug("loadVideoQuestionnaire: " + url);
    
      this.$wrapper = $(ele);
    
      var $video = $("video")
      var nakedUrl = url.replace(".mp4","")
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
    
      mejs.MediaFeatures.svg = false;
      console.debug("CanPlayType?", $video[0].canPlayType);
      var firstPlay = true;
      var lastSecond = lastTime || 1.0;
      $video.mediaelementplayer({
      	features: ['playpause','progress','current', 'duration', 'volume','sourcechooser', 'fullscreen'],
        iPadUseNativeControls: true,
        iPhoneUseNativeControls: true, 
        AndroidUseNativeControls: true,
        loop: false,
        enablePluginDebug: true,
      	success: function(media, node, player) {
          $(".video").removeClass("hidden");
          var mediaplayer = self.mediaplayer = media;
          mediaplayer.addEventListener("timeupdate", function() { 
            //lastSecond = mediaplayer.player.getCurrentTime();
            console.debug("Video event: timeupdate")
          });
          $(".mejs-time-total").click(function() {
            lastSecond = mediaplayer.player.getCurrentTime();
          });
        
          mediaplayer.addEventListener("seeked", function() { 
            var currentSecond = mediaplayer.player.getCurrentTime();
            console.log(currentSecond, lastSecond)
            if (currentSecond > lastSecond) {
              //mediaplayer.pause()
              //alert("You have to finish")
              //mediaplayer.player.setCurrentTime(lastSecond);
              //mediaplayer.play()
            }
          });
          mediaplayer.addEventListener("loadeddata", function() { console.debug("Video event: loadeddata") });
          mediaplayer.addEventListener("play", function() { console.debug("Video event: play") });
          mediaplayer.addEventListener("playing", function() { console.debug("Video event: playing") 
            if (firstPlay) {
              mediaplayer.player.setCurrentTime(lastTime);
            }
            firstPlay = false;
          });
          mediaplayer.addEventListener("pause", function() { console.debug("Video event: pause") });
          mediaplayer.addEventListener("ended", function() { console.debug("Video event: ended") });
      	  console.debug('mediaelementplayer mode: ' + media.pluginType);
          self.loadEvents();
           
          Questionnaire.on("continue", function() {
            console.log("Play?", lastTime);
            mediaplayer.play()
            
            self.$wrapper.removeClass("pause");
            Questionnaire.fadeOut();
          });
          //mediaplayer.play();
      	},
      	error: function(media, err) {
      	  console.debug('mediaelementplayer mode: ' + media.pluginType);
          console.error(media.method);
          console.error(media.outerHTML);
          console.error("There was an error");
        }
      });
    }
}
