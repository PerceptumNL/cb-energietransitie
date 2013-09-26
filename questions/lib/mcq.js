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
      self.check_answer();
      self.$q("#check-button").hide();
      self.$q("#send-button").show();
    });
  },

  feedback_correct: function(answer_idx) {
    //console.log("feedback_Correct");
    var ele = $q(".option").children()[answer_idx];
    $(ele).addClass("correct");
    $q(".right").show();
    answer_text = answers[answer_idx].feedback;
    if (typeof answer_text != "undefined")
      $q(".feedback-text").append("<div>" + answer_text + "</div>")
    $q(".feedback").fadeIn();
  },
  
  feedback_incorrect: function(answer_idx) {
    //console.log("feedback_Incorrect");
    var ele = $q(".option").children()[answer_idx];
    $(ele).addClass("incorrect");        
    $q(".wrong").show();
    answer_text = answers[answer_idx].feedback;
    if (typeof answer_text != "undefined")
      $q(".feedback-text").append("<div>" + answer_text + "</div>")
    $q(".feedback").fadeIn();
  },
    
  check_answer: function(answer_idx) {
    var self = this
    var current_answers = [];
    self.$q(".option").children().each(function(idx) {
      current_answers[idx] = $(this).hasClass("toggleon");
    });
    self.result.correct = true;
    var anstext = answer_idx
    var answers = self.question.answers

    $.each(answers, function(idx, ans) {
      //console.log(question.answers)
      //console.log("aa "+idx, ans)
      var answer_text = answers[idx].feedback || "";
      newentry = self.result.selections.length;
      if ($.inArray(idx, question.correctAnswer) >= 0 && current_answers[idx] == true) {
          //console.log("aa "+idx) //selected correctly
          self.result.selections[newentry] = idx;
          $(self.$q(".option").children()[idx]).append("<div id='fb'><img src='http://bit.ly/11iXTZG'/>"+ answer_text +"</div>");
          ans.correct = true; 
          //self.feedback_correct(idx);

      }
      else if ($.inArray(idx, question.correctAnswer) == -1 && current_answers[idx] == false) {
          //console.log(idx)
          $(self.$q(".option").children()[idx]).append("<div id='fb'><img src='http://bit.ly/11iXTZG'/>"+ answer_text +"</div>");
          ans.correct = true;
          //self.feedback_correct(idx);
      }
      else if ($.inArray(idx, question.correctAnswer) == -1 && current_answers[idx] == true) {
          //console.log("bb "+idx) //selected wrongly
          self.result.selections[newentry] = idx;
          $(self.$q(".option").children()[idx]).append("<div id='fb'><img src='http://bit.ly/11iXTZG'/>"+ answer_text +"</div>");
          ans.correct = true;
          //self.feedback_correct(idx);
      }
      else {
          ans.incorrect = true; 
          //console.log(idx)                
          $(self.$q(".option").children()[idx]).append("<div id='fb'><img src='http://bit.ly/1aMHTSK'/>"+ answer_text +"</div>");
          self.result.correct = false;
          self.result.incorrect = true;
          //self.feedback_incorrect(idx);
      }
      //console.log("aa "+idx, ans.incorrect)
    });
    //console.log(result)
    self.$q(".option").removeClass("enabled");
    self.$q(".option").children().unbind("click");
    //this.next_question();
  }
}

Questionnaire.registerType(MCQ);
