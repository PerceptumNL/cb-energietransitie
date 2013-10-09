function MCQ(question, qEle) {
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

MCQ.questionType = "mcq";
MCQ.prototype = {
  answers: null,
  //submissionList: [],
  
  create: function() {
    this.answers = this.question.answers;
    this.drawQuestion();
    this.drawAnswers();
  },
  
  drawQuestion: function() {
    var self = this;
    self.$q("#q-text").html(this.question.text);
    if (this.question.type == "image") {
      self.$q("#q-image").attr("src", this.question.image);
      self.$q("#tr-image").show();
    }
  },
  
  drawAnswers: function() {
    var self = this,
      q = this.question,
      a = q.answers,
      per = 95 / a.length,
      selected = [];
    self.$q(".option").html("").addClass("mcq").addClass("enabled");
    $.each(a, function(k, v) {
      div = $("<div>").text(v.text).css("width", "80%");
      self.$q(".option").append(div);
      $(div).click(
        function(evt) {
          $(this).toggleClass("toggleon")
        }
      )
    });

    self.$q("#send-button").hide(); 
    self.$q(".table-feedback").show();
    self.$q(".table-feedback").css("border", "none");
    self.$q("#check-button").show();

    self.$q("#check-button").click(function(){
      self.checkAnswer();
      self.$q("#check-button").hide();
      self.$q("#send-button").show();
    });
  },

  checkAnswer: function() {
    var self = this
    var question = self.question
    var answers = self.question.answers
    self.result.correct = true;

    self.$q(".option").children().each(function(idx, ans) {
      var img;
      if ($.inArray(idx, question.correctAnswer) >= 0 && $(ans).hasClass("toggleon") || 
          $.inArray(idx, question.correctAnswer) == -1 && !$(ans).hasClass("toggleon")) {
          img = 'http://bit.ly/11iXTZG'
      }
      else {
          self.result.correct = false;
          self.result.incorrect = true;
          img = 'http://bit.ly/1aMHTSK'
      }
      var $div = $("<div>").attr("id", "fb").appendTo(ans)
      $("<img>").attr("src", img).appendTo($div);
      if (answers[idx].feedback) {
        $("<span>").html(answers[idx].feedback).appendTo($div);
        $div.addClass("fill")
      }
    });
    self.$q(".option").removeClass("enabled");
    self.$q(".option").children().unbind("click");
  }
}

Questionnaire.registerType(MCQ);
