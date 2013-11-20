function TIQ(question, qEle) {
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

TIQ.questionType = "tiq";
TIQ.prototype = {
  answers: null,
  
  create: function() {
    $(this.qEle).addClass("tiq");
    this.answers = this.question.answers;
    this.drawQuestion();
    this.drawAnswers();
  },
  
  drawQuestion: function() {
    var self = this;
    self.$q("#question").removeClass("left-col");
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
    $submit = $("<div id='#td-fb-next'>" + self.$q("#td-fb-next").html() + "<div>");

    $submit.appendTo($("body"))
    self.$q("#answer").removeClass("right-col").empty();

    $("<textarea />").attr({
        "id": "textinput",
        "name": "textinput",
    }).keydown(function(evt) {
        words = $(evt.target).val().split(" ")
        for (var i=0;i<(self.question.minWords || 2); i++) {
            if (words[i] && words[i].length > 0) 
                self.$q("#submit-button").toggle(true);
            else 
                self.$q("#submit-button").toggle(false);
        }
    }).appendTo(self.$q("#answer"));

    $submit.appendTo(self.$q("#answer"))
    self.$q("#submit-button").click(function() {
        self.checkAnswer();
        self.submit();
    });

  },
  
  checkAnswer: function() {
    var self = this;
    self.$q("#textinput").prop('disabled', true);
    self.$q("#submit-button").hide();
    self.$q("#send-button").show();
    self.result.correct = true;
    self.result.inputText = self.$q("#textinput").val();
  },
}

Questionnaire.registerType(TIQ);

