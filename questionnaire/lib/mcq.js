function MCQ(question, qEle, savedQuestion) {
  this.question = question;
  this.qEle = qEle;
  this.savedQuestion = savedQuestion;

  if (savedQuestion && "result" in savedQuestion) {
    this.result = savedQuestion.result;
  } else {
    this.result = {
      incorrect: false,
      correct: false,
      hint: false,
      selections: [],
      time: 0,
    }
  }
  this.$q = function(selector) {
    return $(this.qEle).find(selector);
  }
}

MCQ.questionType = "mcq";
MCQ.prototype = {
  
  create: function() {
    this.drawQuestion();
    this.drawAnswers();

    if (this.savedQuestion) {
      this.setSelections(this.result.selections);
      this.checkAnswer(this.result.answer_idx);
    }
  },
  
  drawQuestion: function() {
  },
  
  drawAnswers: function() {
    var self = this;
    this.$q(".option").empty();
    $.each(this.question.answers, function(k, v) {
      var $div = $("<div>").html(v.text)
      self.$q(".option").append($div);
      $div.click(function(evt) {
          $(this).toggleClass("toggleon")
      });
    });

    this.$q("#send-button").hide(); 
    this.$q("#check-button").show().click(function(){
      var selections = self.getSelections();
      self.checkAnswer(selections);
      self.submit();
    });
  },

  getSelections: function() {
    var answers = [];
    this.$q(".option").children().each(function(idx, ans) {
      if ($(ans).hasClass("toggleon")) {
        answers.push(idx);
      }
    });
    return answers;
  },

  setSelections: function(selections) {
    this.$q(".option").children().each(function(idx, ans) {
      if ($.inArray(idx, selections) >= 0) {
        $(ans).addClass('toggleon');
      }
    });
  },

  checkAnswer: function(selections) {
    var self = this

    self.result.correct = true;
    self.result.selections = selections;

    self.$q(".option").children().each(function(idx, ans) {
      if ($.inArray(idx, self.question.correctAnswer) >= 0) {
        $(ans).addClass("correct");
      } else {
        $(ans).addClass("incorrect");
      }
      //Set correct
      if ($.inArray(idx, self.question.correctAnswer) >= 0 && $.inArray(idx, selections) >=0 ||
          $.inArray(idx, self.question.correctAnswer) == -1 && $.inArray(idx, selections) == -1) {
      } else {
          self.result.correct = false;
          self.result.incorrect = true;
      }
      if (self.question.answers[idx].feedback) {
        var $div = $("<div>").addClass("mcq-feedback").appendTo(ans)
        $("<span>").html(self.question.answers[idx].feedback).appendTo($div);
      }
    });
    //disable buttons
    self.$q(".option").removeClass("enabled");
    self.$q(".option").children().unbind("click");
    //show next action buttons
    self.$q("#check-button").hide();
    self.$q("#send-button").show();
    //meant to resize window
    Questionnaire.trigger("check");
  },

  test_correct: function() {
    this.setSelections(this.question.correctAnswer);
    this.checkAnswer(this.question.correctAnswer);
  }
}

Questionnaire.registerType(MCQ);
