function TFQ(question, qEle, savedQuestion) {
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
      answer_idx: null,
    }
  }
  this.$q = function(selector) {
    return $(this.qEle).find(selector);
  }
}

TFQ.questionType = "tfq";
TFQ.prototype = {

  create: function() {
    this.drawQuestion();
    this.drawAnswers();
    
    if (this.savedQuestion) {
      this.checkAnswer(this.result.answer_idx);
    }
  },
  
  drawQuestion: function() {
  },
  
  drawAnswers: function(res) {
    var self = this;
    this.$q(".answer").click(function() {
      self.checkAnswer(this.dataset.index) ;
      self.submit();
    });
  },
  
  checkAnswer: function(answer_idx) {
    var self = this;
    //check correct answer
    if (this.question.correctAnswer == answer_idx) {
      if (!this.result.incorrect) {
        this.result.correct = true;
      }
      this.$q(".right").removeClass("hidden");
    } else {
      this.result.incorrect = true;
      this.$q(".wrong").removeClass("hidden");
    }

    //save result
    this.result.answer_idx = answer_idx;

    //show feedback
    this.$q(".feedback").removeClass("hidden");
    var feedback_text = this.question.answers[answer_idx].feedback;
    if (typeof feedback_text != "undefined")
      this.$q(".feedback-text").html("<div>" + feedback_text + "</div>")
    
    //disable buttons
    this.$q(".answer").each(function(idx, ele) {
      if (idx == answer_idx) {
        self.$q(ele).addClass("selected");
      }
    }).addClass("disabled").unbind("click");

    //next button
    this.$q("#send-button").show();
  },
 
  test_correct: function() {
    this.checkAnswer(this.question.correctAnswer);
  }
}

Questionnaire.registerType(TFQ);

