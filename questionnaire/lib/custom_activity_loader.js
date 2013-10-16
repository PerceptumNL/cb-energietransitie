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

function getURLParameter(name, _default) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||_default
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
    $("#button-hint").hide()
    $("#statistics-button").css("display", "inline-block");
    function _showOverview() {
      self.index = -1;
      self.drawNumbers();
      $("#number").css("display", "inline-block");
      $(".question-wrapper").hide()
      $("#overview").show();
    }

    $("#statistics-button").click(_showOverview);
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
      _showOverview();
      return true;
    } else {
      $("#rewatch").show();
      alert("Missing " + this.leftQuestions.length + " questions");
      return false;
    }
  },

  sendResults: function(results) {
    var self = this;
    if (isTesting()) {
      console.log("Results:");
      console.log(this.doneQuestions);
    } else {
      var evt = {
        //Find Unit
        "source": "questionary-results",
        "payload": JSON.stringify({
          "results": this.doneQuestions, 
          "unit": this.getUnit(),
          "lesson": this.getLesson(),
        }),
        "xsrf_token": eventXsrfToken
      }
      $.post('/rest/events', {request: JSON.stringify(evt)}, function() {
        console.log("Activity results sent");
      }).fail(function() { 
        console.log("Error sending activity results");
      });
    }
  },
  resizeVideoQuestion: function() { 
    if (document.fullScreen || 
        document.mozFullScreen ||
        document.webkitIsFullScreen) {
      $(this.qEle).addClass("fullscreen");
      if ($(this.qEle).find("#questions").height() > $(document).height()) {
        $(this.qEle).addClass("overflow");
        $(this.qEle).css("top", "");
      } else {
        $(this.qEle).removeClass("overflow");
        var hpos = $(document).height() / 2 - $(this.qEle).height() / 2
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
  
  video_question: function(time) {
    var self = this;
    
    //decimals part
    var d = time - Math.floor(time)
    //1/10 of second resolution
    d = Math.floor(d*10);
    d = (d.toString().length == 1 ? "":"") + d.toString();

    var m = Math.floor(time/60.0);
    var h = Math.floor(time/60.0/60);
    var s = Math.floor(time%60);
    s = (s.toString().length == 1 ? "0":"") + s.toString();
    var time = m + ":" + s + "." + d

    for (var i=0; i<this.questionsList.length; i++) {
      //console.error(this.questionsList[i].time, time);
      if (this.questionsList[i].time == time && 
          this.videoIndex != i) {
        this.videoIndex = i;
        //recalculate position
        this.jumpTo(i);
        return true;
      }     
    }
    if (this.videoIndex > -1 &&
        this.questionsList[this.videoIndex].time != time) {
      this.videoIndex = -1;
    }

    return false;
  },

  redo: function() {
    $(".question-instance").remove();
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

  create: function(qEle) {
    var self = this;
    this.qEle = qEle;

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

    if (this.activity.videoId == undefined) {
        this.fadeIn();
        this.jumpNext();
    } else {
        this.on("check", function() {
            self.resizeVideoQuestion();
        });
        loadVideoQuestionnaire($(qEle).parent(), this.activity.videoId);
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
//    console.trace();
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
  },

  fixScroll: function() {
    $(document.body).animate({
        'scrollTop': $('question').eq(0).offset().top
    }, 500);
    $('question').animate({                                                                                         
        'scrollTop': $('question').eq(0).offset().top  - 20                                                              
    }, 500);  
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
    else 
      $("#button-hint").hide();

    $("#overview").hide();
    $(".question-wrapper").hide();
    if (this.questionInstances[index]) {
      this.questionInstances[index].show();
      setTimeout(function() {
      self.fixScroll();
      }, 1000);
      return;
    }
    
    if (this.remaining().length == 0) {
      this.showOverview();
      this.sendResults();
      return;
    } else {
      $("#statistics-button").hide();
    }

    var template = $(this.qEle).find('#template').clone();
    $(template).attr({
      id: "q"+this.index, 
      index: this.index
    }).addClass("question-instance").appendTo('#questions');

    this.questionClass = this.registeredQuestionTypes[this.question.questionType];
    
    this.questionInstances[index] = new this.questionClass(this.question, template)
    this.questionInstances[index].create();
    this.questionInstances[index].show = function() {
        $(this.qEle).show();
    }
    $(template).show();
    $(template).find("#send-button").click(function() {
      if (self.leftQuestions[self.index] !== undefined) {
        self.doneQuestions[self.index] = self.leftQuestions[self.index];
        self.doneQuestions[self.index].result = self.questionInstances[self.index].result;
        self.leftQuestions[self.index] = undefined;
      }
      if (self.redoMode) {
        self.jumpNext();
      } else if (self.questionsList[self.index+1] &&
                 self.questionsList[self.index+1].time === undefined) {
        self.jumpNext();
      } else if (self.questionsList[self.index+1] === undefined && 
                 self.questionsList[self.index].time === undefined) 
        self.jumpNext();
      else {
        self.trigger("continue");
        self.fixScroll();
      }
    });

  },

  registerType: function(questionObj) {
    console.debug("registerType: " + questionObj.questionType);
    this.registeredQuestionTypes[questionObj.questionType] = questionObj;
  }
}

function QuestionBase(question, qEle) {
  // the trait requires these properties
  this.question = question;
  this.$q = qEler;
  this.result = {
    incorrect: false,
    correct: false,
    maybe: false,
    hint: false,
  }

  this.create = function() {
    this.create_question();
  } 
}

if (!isTesting()) {
  window.addEventListener("load", function() {
    var qs = $("question"); 
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
        //Questionnaire.getInstance().checkAnswer();
        //Questionnaire.getInstance().$q("#send-button").trigger("click");
        //Questionnaire.getInstance().checkAnswer();
        //Questionnaire.getInstance().$q("#send-button").trigger("click");
        //mediaplayer.setCurrentTime(164);
        //Questionnaire.once("show", function() {
        //  ok($q.is(":visible"), "appears" );
        //  start();
        //  Questionnaire.getInstance().checkAnswer();
        //  Questionnaire.getInstance().$q("#send-button").trigger("click");
        //  mediaplayer.setCurrentTime(178);
        //  mediaplayer.addEventListener("ended", function() {
        //    this.removeEventListener('ended',arguments.callee,false);
        //    if (cont) cont();
        //  });
        //});
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
