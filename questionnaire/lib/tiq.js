function TIQ(question, qEle, savedQuestion) {
  this.question = question;
  this.qEle = qEle;
  this.savedQuestion = savedQuestion;
  if (savedQuestion && "result" in savedQuestion) {
    this.result = savedQuestion.result;
  } else {
    this.result = {
      incorrect: false,
      correct: false,
      maybe: false,
      hint: false,
      text_input: "",
    }
  }
  this.$q = function(selector) {
    return $(this.qEle).find(selector);
  }
}

TIQ.questionType = "tiq";
TIQ.prototype = {
  
  create: function() {
    this.answers = this.question.answers;
    this.drawQuestion();
    this.drawAnswers();
    if (this.savedQuestion) {
      this.$q("#textinput").val(this.result.text_input);
      this.checkAnswer();
    }
  },
  
  drawQuestion: function() {
  },
  
  drawAnswers: function(res) {
    var self = this;

    this.$q("#textinput").keydown(function(evt) {
      words = $(evt.target).val().split(" ")
      for (var i=0;i<(self.question.minWords || 2); i++) {
        if (words[i] && words[i].length > 0) 
          self.$q("#submit-button").toggle(true);
        else 
          self.$q("#submit-button").toggle(false);
      }
    });

    this.$q("#submit-button").click(function() {
        self.checkAnswer();
        self.submit();
    });
  },
  
  checkAnswer: function(text_input) {
    var self = this;
    self.$q("#textinput").prop('disabled', true);
    self.$q("#textinput").addClass("submitted");
    self.$q("#submit-button").hide();
    self.$q("#send-button").show();
    self.result.correct = true;
    self.result.text_input = self.$q("#textinput").val();
  },
}

Questionnaire.registerType(TIQ);

