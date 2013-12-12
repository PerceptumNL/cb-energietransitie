//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function shuffleRange(length) {
    var array = [];
    for (var i=0;i<length;i++) 
        array.push(i);
    return shuffle(array);
}

function getURLParameter(name, _default) {
  var ret = decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||_default
  if (ret == "false") return false;
  else if (ret == "true") return true;
  else return ret;
}

function getXsrfToken() {
    return ("eventXsrfToken" in window) ? window['eventXsrfToken'] : "";
}

function getLibUrl() {
  if (isTesting()) {
    return "lib/";
  } else {
    return "assets/lib/";
  }
}

function isTesting() {
  return (getXsrfToken() == "")
}


const COMPLETED = "2"

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
  nround: 0,
  data: [],

  getLesson: function() {
    return getURLParameter("lesson");
  },

  getUnit: function() {
    return getURLParameter("unit");
  },

  drawNumbers: function() {
    var self = this;
    $(".question-index").find(".index").click(function() {
      $(this).parent().children().removeClass("active");
      $(this).addClass("active");
      self.jumpTo($(this).text()-1);
    });
  },

  showOverview: function() {
    var self = this;
    this.index = -1;
    //fast trick
    if (this.hasVideo()) {
      this.resizeVideoQuestion();
    }
    $("#button-hint").hide()
    $("#button-rewatch-last").hide()
    $(".question-wrapper").hide()
    if (this.remaining().length == 0) {
      if (this.status != COMPLETED)
        self.sendCompleted();
      $(".question-index").children().removeClass("active");
      $(".question-index").children().eq(self.questionsList.length).addClass("active");
      $(".question-index").css("visibility", "visible");
      $("#statistics-button").css("display", "inline-block");
      $(".actions").css("display", "none");

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

      var templateValues = {
        right: Math.round(correct / total * 100) + "%",
        wrong: Math.round(incorrect / total * 100) + "%",
      }
      var html = this.renderTemplate("#overview-partial", templateValues);
      $(html).appendTo("#single-question");
      $("#overview").show();
      $("#redo").click(function() {
        $("#overview").remove();
        $("#button-rewatch-last").show()
        $("#statistics-button").css("display", "none");
        self.redo(false);
      })
      if (this.hasVideo()) {
        $("#revisit").click(function() {
          $("#overview").remove();
          $("#button-rewatch-last").show()
          $(".question-index").css("visibility", "hidden");
          self.redo(true);
          VideoQuestionnaire.updateCues();
        })
      } 
      return true;
    } else {
      var templateValues = {
        "missingCount": this.remaining().length
      }
    
      var html = this.renderTemplate("#unfinished-overview-partial", templateValues);
      $(html).appendTo("#single-question");
      $("#unfinished-overview").show();
      $("#revisit").click(function() {
        $("#button-rewatch-last").show()
        $("#unfinished-overview").remove();
        self.fadeOut();
        VideoQuestionnaire.playAt(0);
      });
      return false;
    }
  },

  renderTemplate: function(selector, templateValues) {
     window.currentPage = window.currentPage || {}
     var globalTemplateValues = {
       hasVideo: this.hasVideo(),
       currentUnit: window.currentPage.currentUnit,
       currentLesson: window.currentPage.currentLesson,
       nextLesson: window.currentPage.nextLesson,
       nextUnit: window.currentPage.nextUnit,
     }
     $.extend(globalTemplateValues, templateValues)
     var template = Handlebars.compile($(selector).html());
     return template(globalTemplateValues)
  },

  sendCompleted: function(index, question) {
    var self = this;
    var payload = {
        "location" : window.location.href,
    }
    var evt = {
        source: "video-end",
        payload: JSON.stringify(payload),
        xsrf_token: getXsrfToken()
    }

    $.post('/questionnaire/save', {request: JSON.stringify(evt)}, function() {
      console.log("Questionnaire ended");
    }).fail(function() { 
      console.error("Error sending questionnaire end");
      console.log(JSON.stringify(self.data))
    });
  },

  sendResults: function(index, question) {
    var self = this;
    var payload = {
      "result": question.result, 
      "unit": this.getUnit(),
      "lesson": this.getLesson(),
      "nround": this.nround,
      "index": index,
      "count": this.questionsList.length,
      "location" : window.location.href,
      "correct": question.result.correct
    }

    var evt = {
      //Find Unit
      "source": "questionnaire-results",
      "payload": JSON.stringify(payload),
      xsrf_token: getXsrfToken()
    }
    $.post('/questionnaire/save', {request: JSON.stringify(evt)}, function() {
      console.log("Activity results sent");
    }).fail(function() { 
      console.error("Error sending activity results");
      if (self.data) {
        self.data.push(payload);
        console.log(JSON.stringify(self.data))
      }
    });
  },

  resizeVideoQuestion: function() { 
    if (document.fullScreen || 
        document.mozFullScreen ||
        document.webkitIsFullScreen) {
        $(".questions").parent().addClass("fullscreen");
    } else {
        $(".questions").parent().removeClass("fullscreen");
    }
  },

  showVideoQuestion: function() {
    this.resizeVideoQuestion();
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

  findVideoQuestions: function(currentDs) {
    var ret = [];
    for (var i=0; i<this.questionsList.length; i++) {
      if (this.questionsList[i].time && ret.length == 0) {
          var questionDs = this.time2ds(this.questionsList[i].time);
          if (questionDs == currentDs) {
              ret.push(i);
          }
      } else if (this.questionsList[i].time == undefined && ret.length) {
        ret.push(i);
      } else if (ret.length ==0) {
        continue;
      } else {  
        break;
      }
    }
    return ret;
  },

  areVideoQuestionsDone: function(currentDs) {
    var indexes = this.findVideoQuestions(currentDs);
    for (i=0;i<indexes.length;i++) {
      var index = indexes[i];
      if (this.doneQuestions[index] == undefined)
        return false;
    }
    return true;
  },

  checkVideoQuestion: function(floatTs) {
    var currentDs = this.seconds2ds(floatTs)
    var indexes = this.findVideoQuestions(currentDs);
    for (i=0;i<indexes.length;i++) {
      var index = indexes[i];
      if (this.videoIndex != currentDs) {
         this.videoIndex = currentDs;
         this.jumpTo(index);
         return true;
      }     
    }
    this.videoIndex = -1;
    return false;
  },

  redo: function(showVideo) {
    var self = this;
    $(".question-wrapper").remove();
    this.data = [];
    this.first_results = $.extend(true, [], this.results);
    this.redoMode = !(showVideo || false);
    this.nround++;
    this.initData();
    if (showVideo) {
        VideoQuestionnaire.replay();
        self.fadeOut();
    } else {
        this.jumpNext();
    }
  },

  initData: function() {
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

  asyncInit: function(onDone) {
    var self = this;
    var doneCount = 0;
    var totalRequests = 2;
    function requestDone() {
      doneCount++;
      if (doneCount == totalRequests)
        onDone();
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
          self.activity = $.extend(true, [], self.activity_original);
          self.questionsList = self.activity.questionsList;
          if (isTesting()) {
            $("#timeDebug").html("");
            $.each(self.questionsList, function(k, v) {
              if (v.time) {
                $("<span>").html(v.time).appendTo($("#timeDebug"));
              } else {
                $("<span>").html("bis").appendTo($("#timeDebug"));
              }
              $("<span>").html(v.questionType).appendTo($("#timeDebug"));
              $("<span>").html(v.text).appendTo($("#timeDebug"));
              $("<br />").appendTo($("#timeDebug"));
            });
          }
          requestDone();
        },
        error: function(data) {
          console.error("Error Activity loaded:", data);
          self.activity_original = data;
          requestDone();
        } 
      });
    }
    $.ajax({
      url: getLibUrl() + 'base.html',
      type: 'get',
      dataType: 'html',
      async: false,
      success: function(source) {
        $(self.qEle).append(source);
        self.template = Handlebars.compile($("#questionnaire-template").html());
        Handlebars.registerPartial("question", $("#question-partial").html());
        Handlebars.registerPartial("overview", $("#overview-partial").html());
        Handlebars.registerPartial("actions", $("#actions-partial").html());
        var templateValues = {
            questionsList: self.questionsList,
            hasVideo: self.hasVideo(),
            base: window.location.href,
        }
        var $html = $(self.template(templateValues));
        $html.attr({
          index: this.index
        }).addClass("question-instance").appendTo('.questionnaire');
        $(".questions").css("display","none");
        self.drawNumbers();
        requestDone();
      },
      error: function(data) {
        console.error("Error loading template");
        requestDone();
      } 
    });
  },

  loadEvents: function() {
    var self = this;
    $("#button-hint").click(function() {
      self.getInstance().result.hint = true;
      $(".hint-text").css("height", $(".hint").height());
      $(".hint-text").css("width", $(".hint").width());
      $(".hint").show();
    });
    $(".hint").click(function() {
      $(".hint").hide();
    });
    $("#statistics-button").click(function() {self.showOverview()});
    if (this.hasVideo()) {
      $("#button-rewatch-last").click(function() {
        self.fadeOut();
        var lastDs = 0
        if (self.index > 0) {
          var startIdx = 0;
          //Find the first question when several happen at the same time
          for (var i=self.index; i>=0; i--) {
            if (self.questionsList[i].time != undefined) {
              startIdx = i-1;
              break;
            }
          }
          for (var i=startIdx; i>=0; i--) {
            if (self.questionsList[i].time != undefined) {
              lastDs = self.time2ds(self.questionsList[i].time);
              break;
            }
          }
        }
        console.debug("Play At " + lastDs);
        VideoQuestionnaire.playAt(lastDs);
      });
    }
  },

  isVideoStopCompleted: function(indexOfStop) {
    for (var i=0;i<this.questionsList.length;i++) {
      this.nround = this.data[0].nround;
      if (Object.keys(this.data[i]).length) {
        console.debug(JSON.stringify(this.data[i], undefined, 2));
        this.createQuestion(i, this.data[i])
        self.doneQuestions[i] = self.leftQuestions[i];
        self.doneQuestions[i].result = self.data[i].result;
        self.leftQuestions[i] = undefined;
        if (this.status != COMPLETED && self.questionsList[i].time) { 
          self.lastTime = self.time2ds(self.questionsList[i].time) / 10.0 + 0.1;
        };
      }
    }
  },

  loadSavedData: function() {
    var self = this;
    for (var i=0;i<this.data.length;i++) {
      this.nround = this.data[0].nround;
      if (Object.keys(this.data[i]).length) {
        console.debug(JSON.stringify(this.data[i], undefined, 2));
        var index = this.data[i].index;
        this.createQuestion(index, this.data[i])
        self.doneQuestions[index] = self.leftQuestions[index];
        self.doneQuestions[index].result = self.data[i].result;
        self.leftQuestions[index] = undefined;
        if (this.status != COMPLETED && self.questionsList[index].time) { 
          self.lastTime = self.time2ds(self.questionsList[index].time) / 10.0 + 0.1;
        };
      }
    }
  },

  start: function() {
    var self = this;
    $(".controls li").tooltip();
    if (this.status != COMPLETED && (!this.hasVideo() || this.isVideoDisabled())) {
      $(".question-index").css("visibility", "visible");
      this.fadeIn();
      this.jumpNext();
    } else {
      if (this.status == COMPLETED) {
        console.debug("Activity completed");
        self.showOverview();
        self.fadeIn(true);
      } 
      this.on("check", function() {
        self.resizeVideoQuestion();
      });
      VideoQuestionnaire.create($(this.qEle).parent(), this.activity, this.lastTime);
    }
    this.trigger("load");
  },

  create: function(qEle, data) {
    Handlebars.registerHelper('add1', function(index) {
        return parseInt(index)+1;
    });
    Handlebars.registerHelper('pluralize', function(number, single, plural) {
     return (number === 1) ? single : plural;
    });

    var self = this;
    this.qEle = qEle;
    this.data = data || [];

    var a_data = $(qEle).attr("data");
    if (a_data && a_data in window) {
      this.data = window[a_data];
    }

    var a_status = $(qEle).attr("status");
    this.status = a_status || "0";

    this.asyncInit(function() {
        self.initData();
        self.loadEvents();
        self.loadSavedData();
        self.start();
    });
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
    $(".questions").fadeOut();
  },

  fadeIn: function(fast) {
    if (fast)
        $(".questions").show();
    else
        $(".questions").fadeIn();
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
    var self = this;
    console.log(self.qEle);
    $(document.body).animate({
      'scrollTop': $(self.qEle).offset().top
    }, 500);
    $('question').animate({                                                                                         
      'scrollTop': -$(self.qEle).offset().top       
    }, 500);  
  },

  hasVideo: function() {
    return (this.activity.videoId != undefined)
  },

  isVideoDisabled: function() {
    return getURLParameter("skipvideo", false);
  },

  isVideoNext: function() {
    if (!this.hasVideo()) return false;
    if (this.isVideoDisabled()) return false;
    if (this.redoMode) return false;
    if (this.questionsList[this.index+1] === undefined)  return true;
    if (this.questionsList[this.index+1] &&
        this.questionsList[this.index+1].time === undefined) 
        return false;
    if (this.questionsList[this.index+1].time) 
        return true;
  },

  createQuestion: function(index, savedQuestion) {
    var self = this;
    var question = this.leftQuestions[index] || this.doneQuestions[index]; 
    var raw_template = $("." + question.questionType + "-template").html()

    var question_template = Handlebars.compile(raw_template);
    var templateValues = {
        question: question,
        hasVideo: this.hasVideo(),
        base: window.location.search,
    }
    var $html = $(question_template(templateValues));
    $html.attr({
      id: this.index, 
      index: this.index
    }).addClass("question-instance").appendTo('#single-question');

    this.questionClass = this.registeredQuestionTypes[question.questionType];
    this.questionInstances[index] = new this.questionClass(question, $html, savedQuestion)
    this.questionInstances[index].create();
    this.questionInstances[index].show = function() {
      $(this.qEle).show();
    }

    this.questionInstances[index].submit = function() {
      if (self.leftQuestions[self.index] !== undefined) {
        self.doneQuestions[self.index] = self.leftQuestions[self.index];
        self.doneQuestions[self.index].result = self.questionInstances[self.index].result;
        self.leftQuestions[self.index] = undefined;
        self.sendResults(self.index, self.doneQuestions[self.index])
      }
    }

    self.trigger("question-created");
    $html.find("#send-button").click(function() {
      if (self.isVideoNext()) {
        self.fadeOut();
        self.trigger("continue");
      } else {
        self.jumpNext();
      }
      self.fixScroll();
    });

  },

  jumpTo: function(index) {
    var self = this;
    this.index = index;
    this.question = this.leftQuestions[this.index] || this.doneQuestions[this.index]; 
     
    if (this.question == undefined) {
        this.showOverview();
        return;
    }

    $(".question-index").children().removeClass("active");
    $(".question-index").children().eq(index).addClass("active");

    if (this.question && this.question.hint) {
      $("#button-hint").show();
      $(".hint-text").html(this.question.hint);
    } else {
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
    this.createQuestion(index);
    this.questionInstances[index].show();
  },

  registerType: function(questionObj) {
    console.debug("registerType: " + questionObj.questionType);
    this.registeredQuestionTypes[questionObj.questionType] = questionObj;
  }
}

window.addEventListener("load", function() {
  if (!isTesting()) {
    console.log("Load questionnaire");
    var qs = $(".questionnaire"); 
    //could support multiple questionnaires
    $.each(qs, function(k, q) {
      Questionnaire.create(q);
    });
  } else {
  }
});

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
