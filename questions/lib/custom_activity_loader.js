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
    nquestions = this.questionsList.length;
    console.log(nquestions);
    var ntmpl = $("#number").children()[0].outerHTML;
    $("#number").html("");
    for (var i=0; i<nquestions; i++) {
      qnumber = $(ntmpl).html(i+1)
      $("#number").append(qnumber);
    }
  },

  showResults: function() {
    if (this.leftQuestions.length == 0) {
      $("#activity").hide();
      $("#results").show();
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
      $("#correct").html(correct);
      $("#incorrect").html(incorrect);
      $("#maybe").html(maybe);
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

  create: function(a) {
    this.activity = a;
    this.questionsList = a.questionsList;
    this.defaultQuestionType = a.questionsType;
    for (var i=0; i<a.questionsList.length; i++) {
      if (typeof a.questionsList[i].questionType == "undefined") 
        a.questionsList[i].questionType = this.defaultQuestionType;
      this.leftQuestions.push(a.questionsList[i]);
    }
    //$("#activityContents").parent().append("<div id='cover'></div>");
    //$("#cover").bind("click", function(evt) {
    //  Questionary.next(result);
    //});
    $("#button-hint").click(function() {
      $(".hint").show();
    });
    $(".hint").click(function() {
      $(".hint").hide();
    });
    this.drawNumbers();
    this.next();
  },

  next: function(question_result) {

    $("#number").children().removeClass("sel-number");
    $("#number").children().eq(this.questionIdx).addClass("sel-number");
    this.questionIdx++;

    if (this.question && question_result) {
      this.question.result = question_result;
    }

    if (this.leftQuestions.length == 0) {
      this.showResults();
      this.saveResults();
      return;
    }
    this.question = this.leftQuestions[0]; //pop?
    this.leftQuestions.splice(0,1);
    this.doneQuestions.push(this.question);
    this.questionClass = this.registeredQuestionTypes[this.question.questionType];
    this.questionClass().create(this.question);
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

  create: function(question) {
    var self = this;
    var _question = question;
    $("#send-button").click(function() {
      Questionary.next(self.result);
    });
    $(".hint-text").html(question.hint);
    if (typeof question.hint == "undefined") 
      $("hint").hide();
    else 
      $("hint").show();
    console.log(question);
    
   // $.ajax({
   //   url: this.getLibUrl() + this.questionType + '.html',
   //   type: 'get',
   //   dataType: 'html',
   //   async: false,
   //   success: function(data) {
   //     $('#activityContents').delay(500).fadeOut(200, function() { 
   //       $('#activityContents').html("");
   //       $('#activityContents').append(data);

          self.create_question(_question);
   //       $("#cover").removeClass("show");
   //       $(this).fadeIn(200); 
   //     });
   //   } 
   // });
  }, 

  next_question: function() {
  }
});


window.addEventListener("load", function() {
  var a_name = $("question").attr("name");
  if (a_name && a_name in window) {
    var a = window[a_name];
    Questionary.create(a);
  }
});
