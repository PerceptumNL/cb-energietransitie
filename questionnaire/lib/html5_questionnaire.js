var VideoQuestionnaire = {
    $wrapper: null,
    mediaplayer: null,
    video: null,
    activity: null,

    replay: function() {
      this.playAt(0);
    },

    playAt: function(ds) {
      var second = ds / 10.0 + 0.1;
      this.mediaplayer.player.setCurrentTime(second);
      this.mediaplayer.play()
    },

    updateCues: function() {
       $(".mejs-cuepoint").each(function() {
         var timeDs = $(this).attr("ds")
         if (Questionnaire.areVideoQuestionsDone(timeDs)) {
           $(this).addClass("done");  
         } else {
           $(this).removeClass("done");  
         }
       });
    },

    loadIndications: function() {
      console.debug("loadIndications");
      var self = this;
      var duration_ds = self.mediaplayer.duration * 10;
      $.each(this.activity.questionsList, function(k, question) {
        if ("time" in question) {
          var ds = Questionnaire.time2ds(question.time);
          $cue = $("<div class='mejs-cuepoint'></div>").css("left", (ds / duration_ds * 100) + "%");
          $cue.attr("ds", ds);
          $(".mejs-time-total").append($cue)
        }
      });
      this.updateCues();
    },

    loadEvents: function() {
      console.debug("loadEvents: " + this.video);
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
            var stop = Questionnaire.checkVideoQuestion(video.currentTime);
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

      $(".mejs-container").bind("controlshidden", function() { 
        $(".mejs-controls").css("visibility","");
      })
    },
    
    create: function(ele, activity, lastTime) {
      var self = this;
      var url = activity.videoId;
      this.activity = activity;

      console.debug("Load video from URL: " + url);
    
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
          //player.hideControls = function() {};
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
            //if (currentSecond > lastSecond) {
            //  mediaplayer.pause()
            //  alert("You have to finish")
            //  mediaplayer.player.setCurrentTime(lastSecond);
            //  mediaplayer.play()
            //}
          });
          mediaplayer.addEventListener("loadeddata", function() { 
            console.debug("Video event: loadeddata") 
            Questionnaire.trigger("loaddeddata");
            self.loadIndications();
          });
          mediaplayer.addEventListener("play", function() { console.debug("Video event: play") });
          mediaplayer.addEventListener("playing", function() { console.debug("Video event: playing") 
            //if (firstPlay) {
            //  mediaplayer.player.setCurrentTime(lastTime);
            //}
            //firstPlay = false;
          });
          mediaplayer.addEventListener("pause", function() { console.debug("Video event: pause") });
          mediaplayer.addEventListener("ended", function() { console.debug("Video event: ended") });
      	  console.debug('mediaelementplayer mode: ' + media.pluginType);
          self.loadEvents();
           
          Questionnaire.on("continue", function() {
        
            console.log("Play?", lastTime);
            mediaplayer.play()
            
            self.updateCues();
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
