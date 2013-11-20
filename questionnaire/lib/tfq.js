function TFQ(question, qEle) {
  this.question = question;
  this.qEle = qEle;
  this.data = null;
  this.result = {
    incorrect: false,
    correct: false,
    maybe: false,
    hint: false,
    selections: [],
  }
  this.$q = function(selector) {
    return $(this.qEle).find(selector);
  }
}

TFQ.questionType = "tfq";
TFQ.prototype = {
  answers: null,

  create: function(data) {
    $(this.qEle).addClass("tfq");
    this.answers = this.question.answers;
    this.drawQuestion();
    this.drawAnswers();
    
    if (data) { 
      this.data = data;
      this.checkAnswer(this.data.result.ans_index);
      this.result = this.data.result;
    }
  },
  
  drawQuestion: function() {
    var self = this;
    this.$q("#q-text").html(self.question.text);
    if (self.question.type == "image") {
      self.$q("#q-image").attr("src", self.question.image);
      self.$q("#tr-image").show();
    }
  },
  
  drawAnswers: function(res) {
    var self = this;
    self.$q(".answer").click(function() {
      self.checkAnswer(this.dataset.index) ;
    });
  },
  
  feedback_correct: function(answer_idx) {
    var self = this;
    var ele = self.$q(".option").children()[answer_idx];
    $(ele).addClass("correct");
    self.$q(".right").removeClass("hidden");
    self.$q(".feedback").removeClass("hidden");
    answer_text = self.answers[answer_idx].feedback;
    if (typeof answer_text != "undefined")
      self.$q(".feedback-text").html("<div>" + answer_text + "</div>")
    self.$q(".table-feedback").fadeIn();
  },
  
  feedback_incorrect: function(answer_idx) {
    var self = this;
    var ele = self.$q(".option").children()[answer_idx];
    $(ele).addClass("incorrect");        
    self.$q(".wrong").removeClass("hidden");
    self.$q(".feedback").removeClass("hidden");
    answer_text = self.answers[answer_idx].feedback;
    if (typeof answer_text != "undefined")
      self.$q(".feedback-text").html("<div>" + answer_text + "</div>")
    self.$q(".table-feedback").fadeIn();
  },
    
  checkAnswer: function(answer_idx) {
    var self = this;
    self.result.ans_index = answer_idx;
    if (self.question.correctAnswer == answer_idx) {
      if (!self.result.incorrect) {
        self.result.correct = true;
      }
      //console.log("Good! continue with next concept");
      this.feedback_correct(answer_idx);
    } else {
      self.result.incorrect = true;
      //console.log("Wrong... Try again!");
      this.feedback_incorrect(answer_idx);
    }
    
    self.$q(".option").children().each(function(idx, ele) {
      if (idx != answer_idx) {
        self.$q(ele).addClass("disabled");
      }
    });
    self.$q(".option").children().unbind("click");
  },
}

Questionnaire.registerType(TFQ);

