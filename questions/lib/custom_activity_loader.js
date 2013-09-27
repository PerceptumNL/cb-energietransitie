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

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function getLibUrl() {
  if (isTesting()) {
    return "lib/";
  } else {
    return "assets/lib/";
  }
}

function isTesting() {
  return (typeof testing !== "undefined" && testing);
}

if (isTesting()) {
//    console.log = function() {};
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
  firstLoad: true,
  qEle: null,
  evts: {},
  videoIndex: -1,

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
        qnumber = $(ntmpl).html(j+1).click(function() {
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

    function _showOverview() {
      self.index = -1;
      self.drawNumbers();
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
      $("#right .percentage").html(Math.round(correct / total * 100) + "%");
      $("#wrong .percentage").html(Math.round(incorrect / total * 100) + "%");
      _showOverview();
      //$("#maybe").html(maybe);
      return true;
    } else {
      $("#rewatch").show();
      alert("Missing " + this.leftQuestions.length + " questions");
      return false;
    }
  },

  sendResults: function(results) {
    var self = this;
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
    if (isTesting()) {
      console.log("Results:");
      console.log(this.doneQuestions);
    } else {
      $.post('/rest/events', {request: JSON.stringify(evt)}, function() {
        console.log("Activity results sent");
      }).fail(function() { 
        console.log("Error sending activity results");
      });
    }
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
      if (this.questionsList[i].time == time && 
          this.videoIndex != i) {
        this.videoIndex = i;
        Questionnaire.jumpTo(i);
        Questionnaire.fadeIn();
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
    $(this.qEle).html("");
    this.create(this.qEle);
  //  this.fadeIn();
  //  $('.questionnaire').show();
   // this.jumpTo(0);
  },

  create: function(qEle) {
    var self = this;
    this.index = -1;
    this.results = [];
    this.leftQuestions = [];
    this.doneQuestions = [];
    this.question = null;
    this.questionsList = [];
    this.questionInstances =  [];
    this.activity =  null;
    this.results =  [];
    this.firstLoad =  true;
    this.videoIndex =  -1;
    this.qEle = qEle;

    var a_name = $(qEle).attr("name");
    if (a_name && a_name in window) {
      this.activity_original = window[a_name];
    }

    var a_src = $(qEle).attr("src");
    if (a_src) {
      $.ajax({
        url: a_src,
        type: 'get',
        dataType: 'json',
        async: false,
        success: function(data) {
          console.log(data);
          console.log("Activity loaded:", data);
          self.activity_original = data;
        },
        error: function(data) {
          console.log(data);
          console.log("Activity loaded:", data);
          self.activity_original = data;
        } 

      });
    }

    this.qEle = qEle;
    this.activity = a = $.extend(true, [], this.activity_original);
    this.questionsList = a.questionsList;
    this.defaultQuestionType = a.questionsType;
    if (this.activity.videoId) {
      $(qEle).hide();
      loadVideoQuestionnaire($(qEle).parent(), this.activity.videoId);
    }

    for (var i=0; i<a.questionsList.length; i++) {
      if (typeof this.questionsList[i].questionType == "undefined") 
        this.questionsList[i].questionType = this.defaultQuestionType;
      this.leftQuestions[i] = this.questionsList[i];
      this.doneQuestions[i] = undefined;
    }
    $.ajax({
      url: getLibUrl() + 'base.html',
      type: 'get',
      dataType: 'html',
      async: false,
      success: function(data) {
        $(self.qEle).append(data);
      } 
    });

    $("#button-hint").click(function() {
      self.questionInstances[self.index].result.hint = true;
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

    $("#overview").hide();
    this.trigger("load");

    if (this.activity.videoId == undefined) {
        this.fadeIn();
        this.jumpNext();
    } else {
        //$(".questionnaire").css("position", "absolute");
        $(".questionnaire").css("position", "relative");
        $(".questionnaire").css("top", "-542px");
    }

  },

  on: function(evtName, fnc) {
    if (this.evts[evtName] === undefined) {
      this.evts[evtName] = [];
    }
    this.evts[evtName].push(fnc);
  },

  trigger: function(evtName, params) {
    if (this.evts[evtName]) {
      for (var i=0;i<this.evts[evtName].length;i++) {
        this.evts[evtName][i].apply(this, params);
      }
      return true;
    } else
      return false;
  },

  fadeOut: function() {
    $(this.qEle).children().fadeOut();
  },

  fadeIn: function() {
    $(this.qEle).children().hide();
    $(this.qEle).show();
    $(this.qEle).children().fadeIn();
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

  jumpTo: function(index) {
    var self = this;
    this.index = index;
    this.drawNumbers();
    this.question = this.leftQuestions[this.index]; 


    if (this.question && this.question.hint) {
      $(".hint-text").html(this.question.hint);
    } 
    $("#overview").hide();
    $(".question-wrapper").hide();
    if (this.questionInstances[index]) {
      this.questionInstances[index].show();
      return;
    }
    
    if (this.remaining().length == 0) {
      this.showOverview();
      this.sendResults();
      $("#statistics-button").show();
      return;
    } else {
      $("#statistics-button").hide();
    }

    var template = $(this.qEle).find('#template').clone();
    $(template).attr({
      id: "q"+this.index, 
      index: this.index
    }).appendTo('#questions');

    $("#questions").show();

    this.questionClass = this.registeredQuestionTypes[this.question.questionType];
    
    this.questionInstances[index] = new this.questionClass(this.question, template)
    this.questionInstances[index].create();
    this.questionInstances[index].show = function() {
        $(this.qEle).show();
    }
    $(template).show();

    if (this.question.hint) 
      $("#button-hint").show();
    else 
      $("#button-hint").hide();

    $(template).find("#send-button").click(function() {
      if (self.leftQuestions[self.index] !== undefined) {
        self.doneQuestions[self.index] = self.leftQuestions[self.index];
        self.doneQuestions[self.index].result = self.questionInstances[self.index].result;
        self.leftQuestions[self.index] = undefined;
      }
      self.trigger("next");
      if (self.questionsList[self.index+1] &&
          self.questionsList[self.index+1].time === undefined)
        self.jumpNext();
      else if (self.questionsList[self.index+1] === undefined && 
               self.questionsList[self.index].time === undefined) 
        self.jumpNext();
    });

  },

  registerType: function(questionObj) {
    console.log("registerType");
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

window.addEventListener("load", function() {
  var qs = $("question"); 
  //could support multiple questionnaires
  $.each(qs, function(k, q) {
    Questionnaire.create(q);
  });
});
