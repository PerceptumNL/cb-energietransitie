function MCQ(question, qEle) {
  this.question = question;
  this.qEle = qEle;
  this.result = {
    incorrect: false,
    correct: false,
    hint: false,
    selections: [],
    time: 0,
  }
  this.$q = function(selector) {
    return $(this.qEle).find(selector);
  }
}

MCQ.questionType = "mcq";
MCQ.prototype = {
  answers: null,
  
  create: function(data) {
    this.answers = this.question.answers;
    this.drawQuestion();
    this.drawAnswers();
    if (data) { 
      console.log(data);
      this.data = data;
      this.setSelections(this.data.result.selections);
      this.checkAnswer(this.data.result.selections);
      this.result = this.data.result;
    }
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
      div = $("<div>").html(v.text).css("width", "80%");
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
    console.log("selections", selections);
    this.$q(".option").children().each(function(idx, ans) {
      if ($.inArray(idx, selections) >= 0) {
        $(ans).addClass('toggleon');
      }
    });
  },

  checkAnswer: function(selections) {
    var self = this
    var question = self.question
    var answers = self.question.answers
    self.result.correct = true;
    self.result.selections = selections;

    self.$q(".option").children().each(function(idx, ans) {
      if ($.inArray(idx, question.correctAnswer) >= 0) {
        $(ans).addClass("correct");
      } else {
        $(ans).addClass("incorrect");
      }
      //Set correct
      if ($.inArray(idx, question.correctAnswer) >= 0 && $.inArray(idx, selections) >=0 ||
          $.inArray(idx, question.correctAnswer) == -1 && $.inArray(idx, selections) == -1) {
      }
      else {
          self.result.correct = false;
          self.result.incorrect = true;
      }
      if (answers[idx].feedback) {
        var $div = $("<div>").attr("id", "fb").appendTo(ans)
        $("<span>").html(answers[idx].feedback).appendTo($div);
        $div.addClass("fill")
      }
    });
    self.$q(".option").removeClass("enabled");
    self.$q(".option").children().unbind("click");
    self.$q("#check-button").hide();
    self.$q("#send-button").show();
    Questionnaire.trigger("check");
  }
}

Questionnaire.registerType(MCQ);
