function TFQ(question, qEle) {
  this.question = question;
  this.qEle = qEle;
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
  questioncnt: 0,
  
  create: function() {
    $(this.qEle).addClass("tfq");
    this.answers = this.question.answers;
    this.drawQuestion();
    this.drawAnswers();
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
    var q = self.question;
    var a = q.answers;
    self.$q(".table-feedback").hide();
    self.$q(".feedback-text").html("");
    self.$q(".right").hide();
    self.$q(".wrong").hide();
    self.$q(".option").html("").addClass("tfq");
  
    $.each(a, function(k, v) {
      var div = $("<div>").text(v.text);
      self.$q(".option").append(div);
      if (!res) {
        div.click(function() { 
          self.prompt_maybe(false); 
          self.checkAnswer(k) 
        });
      }
    });
    if (q.answerMaybe) {
      var div = $("<div>").text("Maybe").attr("id", "maybe-button");
      self.$q(".option").append(div);
      if (!res) {
        
        div.click(function() {
            self.prompt_maybe(true)
        });  
        self.$q("#submit-button").click(function() {
          $(this).hide()
          self.$q("#send-button").show();
          self.$q("#tr-fb-input").hide();
          self.$q("#feedback-input").hide();
          self.result.maybe = true;
          self.result.ans_index=2;
          self.result.maybeText = $q("#feedback-input").val();
        });
        self.$q("#feedback-input").keyup(function() {
          if ($(this).val().length > 0) {
            self.$q("#submit-button").show();
          } else {
            self.$q("#submit-button").hide();
          }
        });
      }
    }
    if (res) {
      self.checkAnswer(res.answerIdx)
    }
  },
  
  prompt_maybe: function(show) {
    var self = this;
    if (show) {
      self.$q("#feedback-input").show();
      self.$q("#tr-fb-input").show();
      self.$q("#send-button").hide();
      self.$q("#maybe-button").addClass("selected");
      self.$q(".table-feedback").fadeIn();
      self.$q("#feedback-input").focus();
    } else {
      self.$q(".table-feedback").hide();
      self.$q("#feedback-input").hide();
      self.$q("#tr-fb-input").hide();
      self.$q("#send-button").show();
      self.$q("#submit-button").hide();
      self.$q("#maybe-button").removeClass("selected");
    }
  },
  
  feedback_correct: function(answer_idx) {
    var self = this;
    var ele = self.$q(".option").children()[answer_idx];
    $(ele).addClass("correct");
    self.$q(".right").show();
    answer_text = self.answers[answer_idx].feedback;
    if (typeof answer_text != "undefined")
      self.$q(".feedback-text").html("<div>" + answer_text + "</div>")
    self.$q(".table-feedback").fadeIn();
  },
  
  feedback_incorrect: function(answer_idx) {
    var self = this;
    var ele = self.$q(".option").children()[answer_idx];
    $(ele).addClass("incorrect");        
    self.$q(".wrong").show();
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

