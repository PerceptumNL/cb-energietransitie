function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * (counter + 1));

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

function shuffleRange(length) {
    var array = [];
    for (var i=0;i<length;i++) 
        array.push(i);
    return shuffle(array);
}


function getURLParameter(name, _default) {
  ret = decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||_default
  if (ret == "false") return false;
  else if (ret == "true") return true;
  else return ret;
  
}

function getLibUrl() {
  if (isTesting()) {
    return "lib/";
  } else {
    return "assets/lib/";
  }
}

function isTesting() {
  return (window.location.href.indexOf("127.0.0.1") > -1) 
}

var Questionnaire = {
  registeredQuestionTypes: {},
  defaultQuestionType: null,
  questionsList: [],
  questionInstances: [],
  index: 0,
  activity: null,
  results: [],
  leftQuestions: [],
  doneQuestions: [],
  qEle: null,
  evts: {},
  evtsOnce: {},
  videoIndex: -1,
  redoMode: false,
  skipVideo: false,

  getLesson: function() {
    return getURLParameter("lesson");
  },

  getUnit: function() {
    return getURLParameter("unit");
  },

  drawNumbers: function() {
    var self = this;
    var nquestions = this.questionsList.length;
    var ntmpl = $("#number").children()[0].outerHTML;
    $("#number").html("");
    for (var i=0; i<nquestions; i++) {
      var qnumber;
      (function(j) { 
        qnumber = $(ntmpl).html(j+1).addClass("number-spacing").click(function() {
            self.jumpTo(j);
            self.drawNumbers();
        });
      })(i);
      $("#number").append(qnumber);
    }
    $("#number").children().removeClass("sel-number");
    if (this.index > -1)
      $("#number").children().eq(this.index).addClass("sel-number");
  },

  showOverview: function() {
    var self = this;

    //fast trick
    if ($wrapper) {
      if (document.fullScreen || 
          document.mozFullScreen ||
          document.webkitIsFullScreen) {
        $wrapper.addClass("fullscreen");
        this.resizeVideoQuestion();
      } else {
        $wrapper.removeClass("fullscreen");
      }
    }
    $("#button-hint").hide()
    $("#statistics-button").css("display", "inline-block");
    if (this.remaining().length == 0) {
      var correct=0, incorrect=0, maybe=0;
      $.each(this.doneQuestions, function(k, q) {
        v = q.result;
        if (v.correct) 
            correct += 1;
        else if (v.incorrect)
            incorrect += 1;
        else if (v.maybe) 
            maybe += 1;
      });
      var total = correct + incorrect + maybe;
      console.debug("Overview: ");
      console.debug(" total: " + total);
      console.debug(" correct: " + correct);
      console.debug(" incorrect: " + incorrect);
      console.debug(" maybe: " + maybe);
      $("#right .percentage").html(Math.round(correct / total * 100) + "%");
      $("#wrong .percentage").html(Math.round(incorrect / total * 100) + "%");

      this.index = -1;
      this.drawNumbers();
      $("#number").css("display", "inline-block");
      $(".question-wrapper").hide()
      $("#overview").show();
      return true;
    } else {
      $("#rewatch").show();
      alert("Missing " + this.leftQuestions.length + " questions");
      return false;
    }
  },

  sendEndVideo: function(index, question) {
    var payload = {
        "location" : window.location.href,
    }
    var evt = {
        source: "video-end",
        payload: JSON.stringify(payload),
        xsrf_token: eventXsrfToken
    }

    $.post('/questionnaire/save', {request: JSON.stringify(evt)}, function() {
      console.log("Video end signal sent");
    }).fail(function() { 
      console.error("Error video end singal sending");
      self.data.push(payload);
      console.log(JSON.stringify(self.data))
    });
    
  },

  sendResults: function(index, question) {
    var self = this;
    //if (isTesting()) {
    //  console.log("Results:");
    //  console.log(JSON.stringify(this.doneQuestions));
    //} else {
    if (!("eventXsrfToken" in window))
        window['eventXsrfToken'] = ""
      var payload = {
        "result": question.result, 
        "unit": this.getUnit(),
        "lesson": this.getLesson(),
        "nround": 0,
        "index": index,
        "count": this.questionsList.length,
        "location" : window.location.href,
        "correct": question.result.correct
      }

      var evt = {
        //Find Unit
        "source": "questionnaire-results",
        "payload": JSON.stringify(payload),
        "xsrf_token": eventXsrfToken
      }
      $.post('/questionnaire/save', {request: JSON.stringify(evt)}, function() {
        console.log("Activity results sent");
      }).fail(function() { 
        console.error("Error sending activity results");

        self.data.push(payload);
        console.log(JSON.stringify(self.data))
      });
    //}
  },

  resizeVideoQuestion: function() { 
    if (document.fullScreen || 
        document.mozFullScreen ||
        document.webkitIsFullScreen) {
      //necessary to find real height
      $(this.qEle).removeClass("overflow");
      $(this.qEle).addClass("fullscreen");
      if ($(this.qEle).height() > $(window).height()) {
        $(this.qEle).addClass("overflow");
        $(this.qEle).css("top", "");
      } else {
        $(this.qEle).removeClass("overflow");
        var hpos = $(window).height() / 2 - $(this.qEle).height() / 2
        $(this.qEle).css("top", hpos + "px");
      }
    } else {
        $(this.qEle).removeClass("fullscreen");
        $(this.qEle).css("top", "");
    }
  },

  showVideoQuestion: function() {
    $(this.qEle).css({
      "display":"block",
      "visibility":"hidden",
    });
    this.resizeVideoQuestion();
    $(this.qEle).css({
      "display":"none",
      "visibility":"",
    });
    this.fadeIn();
  },
  
  time2ds: function(strTime) {
    var dsplit = strTime.split("."),
        d=0;

    //floor to 1/10 second
    if (dsplit.length > 1)
        d=parseInt(dsplit[1]);

    var tsplit=dsplit[0].split(":").reverse()
    var s=0, m=0, h=0;
    s = parseInt(tsplit[0]);
    if (tsplit.length > 1)
        m = parseInt(tsplit[1]);
    if (tsplit.length > 2)
        h = parseInt(tsplit[2]);

    return d+s*10+m*600+h*36000;
  },

  seconds2ds: function(floatTs) {
    return parseInt(floatTs*10)
  },

  video_question: function(floatTs) {
    var currentDs = this.seconds2ds(floatTs)

    for (var i=0; i<this.questionsList.length; i++) {
      if (this.questionsList[i].time) {
        var questionDs = this.time2ds(this.questionsList[i].time);
        if (questionDs == currentDs && this.videoIndex != i) {
          this.videoIndex = i;
          this.jumpTo(i);
          return true;
        }     
      }
    }

    if (this.videoIndex > -1 && 
        this.time2ds(this.questionsList[this.videoIndex].time) != currentDs) {
      this.videoIndex = -1;
    }
    return false;
  },

  redo: function() {
    $(".question-instance").remove();
    this.data = null;
    this.first_results = $.extend(true, [], this.results);
    this.redoMode = true
    this.resetData();
    this.jumpNext();
  },

  resetData: function() {
    this.index = -1;
    this.results = [];
    this.leftQuestions = [];
    this.doneQuestions = [];
    this.question = null;
    this.questionInstances =  [];
    this.videoIndex =  -1;
    this.results =  [];
    this.activity = $.extend(true, [], this.activity_original);
    this.questionsList = this.activity.questionsList;
    this.defaultQuestionType = this.activity.questionsType;
    for (var i=0; i<this.questionsList.length; i++) {
      if (typeof this.questionsList[i].questionType == "undefined") 
        this.questionsList[i].questionType = this.defaultQuestionType;
      this.leftQuestions[i] = this.questionsList[i];
      this.doneQuestions[i] = undefined;
    }
  },

  create: function(qEle, data) {
    var self = this;
    this.qEle = qEle;
    this.data = data;

    var a_data = $(qEle).attr("data");
    if (a_data && a_data in window) {
      this.data = window[a_data];
    }

    var a_name = $(qEle).attr("name");
    if (a_name && a_name in window) {
      this.activity_original = window[a_name];
    }

    var a_src = $(this.qEle).attr("src");
    if (a_src) {
      $.ajax({
        url: a_src,
        type: 'get',
        dataType: 'json',
        async: false,
        success: function(data) {
          console.debug("Activity loaded:", data);
          self.activity_original = data;
        },
        error: function(data) {
          console.error("Error Activity loaded:", data);
          self.activity_original = data;
        } 
      });
    }
    $.ajax({
      url: getLibUrl() + 'base.html',
      type: 'get',
      dataType: 'html',
      async: false,
      success: function(data) {
        $(self.qEle).hide();
        $(self.qEle).empty();
        $(self.qEle).append(data);
      } 
    });

    this.resetData();

    $("#button-hint").click(function() {
      self.getInstance().result.hint = true;
      $(".hint-text").css("height", $(".hint").height());
      $(".hint-text").css("width", $(".hint").width());
      $(".hint").show();
    });
    $(".hint").click(function() {
      $(".hint").hide();
    });
    $("#redo").click(function() {
      self.redo();
    })
    $("#revisit").click(function() {
      location.href = location.href.replace("activity","unit");
    })
    $("#statistics-button").click(function() {self.showOverview()});

    if (this.data) {
      for (var i=0;i<this.data.length;i++) {
        console.log(JSON.stringify(this.data[i], undefined, 2));
        this.createQuestion(i)
        self.doneQuestions[i] = self.leftQuestions[i];
        self.doneQuestions[i].result = self.data[i].result;
        self.leftQuestions[i] = undefined;
      }
    }

    if (this.activity.videoId == undefined || this.isVideoDisabled()) {
      this.jumpNext();
      this.fadeIn();
    } else {
      this.on("check", function() {
        self.resizeVideoQuestion();
      });
      var lastTime = 0;
      if (this.data) {
        $.each(this.data, function(k, v) {
            if (self.questionsList[k].time) {
                lastTime = self.time2ds(self.questionsList[k].time) / 10.0;
            }
        });

      }
      loadVideoQuestionnaire($(qEle).parent(), this.activity.videoId, lastTime);
    }
    this.trigger("load");
  },

  getInstance: function() {
    return this.questionInstances[this.index];
  },

  once: function(evtName, fnc) {
    if (this.evtsOnce[evtName] === undefined) {
      this.evtsOnce[evtName] = [];
    }
    this.evtsOnce[evtName].push(fnc);
  },

  on: function(evtName, fnc) {
    if (this.evts[evtName] === undefined) {
      this.evts[evtName] = [];
    }
    this.evts[evtName].push(fnc);
  },

  trigger: function(evtName, params) {
    
    console.debug("trigger: " + evtName);
    if (this.evts[evtName]) {
      for (var i=0;i<this.evts[evtName].length;i++) {
        this.evts[evtName][i].apply(this, params);
      }
    }

    var _evts = this.evtsOnce[evtName];
    this.evtsOnce[evtName] = [];
    if (_evts) {
      for (var i=0;i<_evts.length;i++) {
        _evts[i].apply(this, params);
      }
    }
  },

  fadeOut: function() {
    $(this.qEle).fadeOut();
  },

  fadeIn: function() {
    $(this.qEle).fadeIn();
  },

  remaining: function() {
    var ret = [];
    for (i=0; i<this.leftQuestions.length; i++) {
        if (this.leftQuestions[i] !== undefined)
            ret.push(i);
    }
    return ret;
  },

  jumpNext: function() {
    this.index++; 
    this.jumpTo(this.index);
    this.resizeVideoQuestion();
  },

  fixScroll: function() {
    $(document.body).animate({
      'scrollTop': $('question').eq(0).offset().top
    }, 500);
    $('question').animate({                                                                                         
      'scrollTop': -$('question').eq(0).offset().top       
    }, 500);  
  },

  isVideoDisabled: function() {
    return getURLParameter("skipvideo", false)
  },

  createQuestion: function(index) {
    var self = this;
    var question = this.leftQuestions[index] || this.doneQuestions[index]; 
    var template = $(this.qEle).find('#template').clone();
    $(template).attr({
      id: "q"+this.index, 
      index: this.index
    }).addClass("question-instance").appendTo('#questions');

    this.questionClass = this.registeredQuestionTypes[question.questionType];
    this.questionInstances[index] = new this.questionClass(question, template)
    var _data;
    if (this.data && this.data[index]) {
      _data = this.data[index];
    }
    this.questionInstances[index].create(_data);
    this.questionInstances[index].show = function() {
      $(this.qEle).show();
    }
    $(template).find("#send-button").click(function() {
      if (self.leftQuestions[self.index] !== undefined) {
        self.doneQuestions[self.index] = self.leftQuestions[self.index];
        self.doneQuestions[self.index].result = self.questionInstances[self.index].result;
        self.leftQuestions[self.index] = undefined;
        self.sendResults(self.index, self.doneQuestions[self.index])
      }
      if (self.redoMode || self.isVideoDisabled()) {
        self.jumpNext();
      } else if (self.questionsList[self.index+1] &&
                 self.questionsList[self.index+1].time === undefined) {
        self.jumpNext();
      }
      //} else if (self.questionsList[self.index+1] === undefined && 
      //           self.questionsList[self.index].time === undefined) 
      //  self.jumpNext();
      else {
        self.trigger("continue");
      }
      self.fixScroll();
    });

  },

  jumpTo: function(index) {
    var self = this;
    this.index = index;
    this.drawNumbers();
    this.question = this.leftQuestions[this.index] || this.doneQuestions[this.index]; 

    if (this.question && this.question.hint) {
      $("#button-hint").show();
      $(".hint-text").html(this.question.hint);
    } 
    else {
      $("#button-hint").hide();
    }
    $("#overview").hide();
    $(".question-wrapper").hide();

    if (this.questionInstances[index]) {
      this.questionInstances[index].show();
      setTimeout(function() {
        self.fixScroll();
      }, 500);
      return;
    }     
    if (this.remaining().length == 0) {
      this.showOverview();
      //this.sendResults();
      return;
    } else {
      $("#statistics-button").hide();
    }
    this.createQuestion(index);
    this.questionInstances[index].show();
  },

  registerType: function(questionObj) {
    console.debug("registerType: " + questionObj.questionType);
    this.registeredQuestionTypes[questionObj.questionType] = questionObj;
  }
}

if (!isTesting()) {
  window.addEventListener("load", function() {
    var qs = $(".questionnaire"); 
    //could support multiple questionnaires
    $.each(qs, function(k, q) {
      Questionnaire.create(q);
    });
  });
} else {
}

window.test_nofullscreen = function(cont) {
  test( "nofullscreen", function() {
    ok(Questionnaire, "load Questionnaire lib" );
    var $q = $('question');
    ok($q, "load question tag" );
    ok(!$q.is(":visible"), "starts hidden" );
    asyncTest("forward player", function() {
      expect(2);
      mediaplayer.setCurrentTime(93);
      Questionnaire.once("show", function() {
        ok($q.is(":visible"), "appears" );
        Questionnaire.getInstance().checkAnswer();
        Questionnaire.getInstance().$q("#send-button").trigger("click");
        Questionnaire.getInstance().checkAnswer();
        Questionnaire.getInstance().$q("#send-button").trigger("click");
        mediaplayer.setCurrentTime(164);
        Questionnaire.once("show", function() {
          ok($q.is(":visible"), "appears" );
          start();
          Questionnaire.getInstance().checkAnswer();
          Questionnaire.getInstance().$q("#send-button").trigger("click");
          mediaplayer.setCurrentTime(178);
          mediaplayer.addEventListener("ended", function() {
            this.removeEventListener('ended',arguments.callee,false);
            if (cont) cont();
          });
        });
      });
    });
  });
}

window.test_q1 = function(cont) {
  test( "q1", function() {
    ok(Questionnaire, "load Questionnaire lib" );
    var $q = $('question');
    ok($q, "load question tag");
    ok(!$q.is(":visible"), "starts hidden");
    asyncTest("forward player", function() {
      expect(1);
      mediaplayer.setCurrentTime(93);
      Questionnaire.once("show", function() {
        ok($q.is(":visible"), "appears" );
        Questionnaire.getInstance().checkAnswer();
      });
    });
  });
}

window.test_fullscreen = function(cont) {
  $(".mejs-fullscreen-button").children().eq(0).trigger('click')
  if (screenfull.enabled) {
      console.log(mediaplayer);
      screenfull.request(mediaplayer);
  }

  test( "fullscreen", function() {
    ok(Questionnaire, "load Questionnaire lib" );
    var $q = $('question');
    ok($q, "load question tag" );
    ok(!$q.is(":visible"), "starts hidden" );
    asyncTest("forward player", function() {
      expect(2);
      mediaplayer.setCurrentTime(92);
      Questionnaire.once("show", function() {
        ok($q.is(":visible"), "appears" );
      });
    });
  });
    
}
window.test_redo = function(cont) {
    window.test_nofullscreen(function() {
        test( "redo", function() {
              $("#redo").trigger("click");
              var $q = $('question');
              console.log($q);
              console.log($q.is(":visible"));
              Questionnaire.getInstance().checkAnswer();
              Questionnaire.getInstance().$q("#send-button").trigger("click");
              ok($q.is(":visible"), "appears" );
              Questionnaire.getInstance().checkAnswer();
              Questionnaire.getInstance().$q("#send-button").trigger("click");
              ok($q.is(":visible"), "appears" );
              Questionnaire.getInstance().checkAnswer();
              Questionnaire.getInstance().$q("#send-button").trigger("click");
              ok($q.is(":visible"), "appears" );
        });
    });
}

window.test_time = function() {
    test( "time2ds", function() {
        var ds = Questionnaire.time2ds("2:00.0")
        equal(ds, 1200)
        ds = Questionnaire.time2ds("2:00.1")
        equal(ds, 1201)
        ds = Questionnaire.time2ds("1:02:00.1")
        equal(ds, 37201)
    });
    test( "seconds2ds", function() {
        var ds = Questionnaire.seconds2ds("12")
        equal(ds, 120)
        ds = Questionnaire.seconds2ds("12.1")
        equal(ds, 121)
        ds = Questionnaire.seconds2ds("12.01")
        equal(ds, 120)
    });
}
