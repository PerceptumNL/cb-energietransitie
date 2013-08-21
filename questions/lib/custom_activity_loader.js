function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

var Questionary = {
  registeredQuestionTypes: {},
  defaultQuestionType: null,
  questionsList: [],
  questionIdx: 0,
  activity: null,
  results: [],
  leftQuestions: [],
  doneQuestions: [],
  firstLoad: true,
  qEle: null,

  getLesson: function() {
    return getURLParameter("lesson");
  },

  getUnit: function() {
    return getURLParameter("unit");
  },

  isTesting: function() {
    return (typeof testing !== "undefined" && testing);
  },

  drawNumbers: function() {
    var nquestions = this.questionsList.length;
    var ntmpl = $("#number").children()[0].outerHTML;
    $("#number").html("");
    for (var i=0; i<nquestions; i++) {
      qnumber = $(ntmpl).html(i+1)
      $("#number").append(qnumber);
    }
    $("#number").children().removeClass("sel-number");
    $("#number").children().eq(this.questionIdx).addClass("sel-number");
  },

  showResults: function() {
    if (this.leftQuestions.length == 0) {
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
      //$("#maybe").html(maybe);
      $(".questionnaire").hide()
      $("#overview").show();
      return;
    }
  },

  saveResults: function(results) {
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
    if (self.isTesting()) {
      console.log("Results:");
      console.log(JSON.stringify(evt));
    } else {
      $.post('/rest/events', {request: JSON.stringify(evt)}, function() {
        console.log("Activity results sent");
      }).fail(function() { 
        console.log("Error sending activity results");
      });
    }
  },

  create: function(qEle) {
    this.questionIdx = 0;
    this.results = [];
    this.leftQuestions = [];
    this.doneQuestions = [];

    var a_name = $(qEle).attr("name");
    if (a_name && a_name in window) {
      this.activity_original = window[a_name];
    }
    this.qEle = qEle;
    this.activity = a = $.extend(true, [], this.activity_original);
    this.questionsList = a.questionsList;
    this.defaultQuestionType = a.questionsType;

    for (var i=0; i<a.questionsList.length; i++) {
      if (typeof a.questionsList[i].questionType == "undefined") 
        a.questionsList[i].questionType = this.defaultQuestionType;
      this.leftQuestions.push(a.questionsList[i]);
    }

    $("#overview").hide();
    this.next();

  },

  next: function(question_result) {
    if (this.question && question_result) {
      this.question.result = question_result;
    }
    if (this.leftQuestions.length == 0) {
      this.showResults();
      this.saveResults();
      return;
    }
    this.question = this.leftQuestions[0]; 
    this.leftQuestions.splice(0,1);
    this.doneQuestions.push(this.question);
    this.questionClass = this.registeredQuestionTypes[this.question.questionType];
    this.questionClass().create(this.question, this.qEle);
    $("#questions").show();
    $("#send-button").click(function() {
      Questionary.next(self.result);
    });
    this.drawNumbers();
    this.questionIdx++;
    $("#button-hint").click(function() {
      $(".hint").show();
    });
    $(".hint").click(function() {
      $(".hint").hide();
    });
    $("#redo").click(function() {
        location.reload(true);
    })
    $("#revisit").click(function() {
        location.href = location.href.replace("activity","unit");
    })

  },

  registerType: function(questionObj) {
    this.registeredQuestionTypes[questionObj().questionType] = questionObj;
  }
}

var QuestionTrait = Trait({
  // the trait requires these properties
  question: Trait.required,
  questionType: Trait.required,
  create: Trait.required,
  result: Trait.required,

  isTesting: function() {
    return (typeof testing !== "undefined" && testing);
  },

  getLibUrl: function() {
    if (this.isTesting()) {
      return "lib/";
    } else {
      return "assets/lib/";
    }
  },

  create: function(question, qEle) {
    var self = this;
    var _question = question;
    var wrapperEle = qEle || $('#activityContents question');
    
    $.ajax({
      url: this.getLibUrl() + 'base.html',
      type: 'get',
      dataType: 'html',
      async: false,
      success: function(data) {
        $(wrapperEle).html("").append(data);
        self.create_question(_question);
        $(".hint-text").html(_question.hint);
        if (typeof _question.hint == "undefined") 
          $("#button-hint").hide();
        else 
          $("#button-hint").show();
      } 
    });
  }, 

  next_question: function() {
    Questionary.next(result);
  }
});

function test_overview() {
  $(".questionnaire").hide();
  $("#overview").show();
}

window.addEventListener("load", function() {
  var qs = $("question"); 
  //could support multiple questionnaires
  $.each(qs, function(k, q) {
    Questionary.create(q);
  });
//  test_overview();
});


