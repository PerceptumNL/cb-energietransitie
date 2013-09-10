var TFQ = function(question, qEle) {
  return Trait.create(
    Object.prototype,
    Trait.compose(
      QuestionTrait,
      Trait({
        questionType: "tfq",
        question: question,
        answers: null,
        result: {},
        questioncnt: 0,
        st_answers: [],
        $q: null,
        qEle: qEle,
      
        create_question: function() {
          var self = this;
          self.show()
          
          answers = question.answers;
          result = {
            incorrect: false,
            correct: false,
            maybe: false,
            maybeText: "",
            ans_index: "",
            hint: false,
          }
          this.draw_question();
          this.draw_answers();
        },
      
        draw_question: function() {
          $q("#q-text").html(question.text);
          if (question.type == "image") {
            $q("#q-image").attr("src", question.image);
            $q("#tr-image").show();
          }
        },
      
        draw_answers: function(res) {
          var q = question;
          var a = q.answers;
          var self = this;
          $q(".table-feedback").hide();
          $q(".feedback-text").html("");
          $q(".right").hide();
          $q(".wrong").hide();
          $q(".option").html("").addClass("tfq");
      
          $.each(a, function(k, v) {
            div = $("<div>").text(v.text);
            $q(".option").append(div);
            if (!res) {
              div.click(function() { 
                self.prompt_maybe(false); 
                self.check_answer(k) 
              });
            }
          });
          if (q.answerMaybe) {
            div = $("<div>").text("Maybe").attr("id", "maybe-button");
            $q(".option").append(div);
            if (!res) {
              
              div.click(function() {
                  self.prompt_maybe(true)
              });  
              $q("#submit-button").click(function() {
                $(this).hide()
                $q("#send-button").show();
                $q("#tr-fb-input").hide();
                $q("#feedback-input").hide();
                result.maybe = true;
                result.ans_index=2;
                console.log(result)
                result.maybeText = $q("#feedback-input").val();
                console.log("Blibibib");
                //self.next_question();
              });
              $q("#feedback-input").keyup(function() {
                if ($(this).val().length > 0) {
                  $q("#submit-button").show();
                } else {
                  $q("#submit-button").hide();
                }
              });
            }
          }
          if (res) {
            self.check_answer(res.answerIdx)
            
          }
        },
      
        prompt_maybe: function(show) {
          var self = this;
          if (show) {
            $q("#feedback-input").show();
            $q("#tr-fb-input").show();
            $q("#send-button").hide();
            $q("#maybe-button").addClass("selected");
            $q(".table-feedback").fadeIn();
            $q("#feedback-input").focus();
          } else {
            $q(".table-feedback").hide();
            $q("#feedback-input").hide();
            $q("#tr-fb-input").hide();
            $q("#send-button").show();
            $q("#submit-button").hide();
            $q("#maybe-button").removeClass("selected");
          }
        },
      
        feedback_correct: function(answer_idx) {
          var ele = $q(".option").children()[answer_idx];
          $(ele).addClass("correct");
          $q(".right").show();
          answer_text = answers[answer_idx].feedback;
          if (typeof answer_text != "undefined")
            $q(".feedback-text").html("<div>" + answer_text + "</div>")
          $q(".table-feedback").fadeIn();
        },
        
        feedback_incorrect: function(answer_idx) {
          var ele = $q(".option").children()[answer_idx];
          $(ele).addClass("incorrect");        
          $q(".wrong").show();
          answer_text = answers[answer_idx].feedback;
          if (typeof answer_text != "undefined")
            $q(".feedback-text").html("<div>" + answer_text + "</div>")
          $q(".table-feedback").fadeIn();
        },
          
        check_answer: function(answer_idx) {
          result.ans_index = answer_idx;
          console.log($q(".feedback-text")[0]);
          if (question.correctAnswer == answer_idx) {
            if (!result.incorrect) {
              result.correct = true;
            }
            //console.log("Good! continue with next concept");
            this.feedback_correct(answer_idx);
          } else {
            result.incorrect = true;
            //console.log("Wrong... Try again!");
            this.feedback_incorrect(answer_idx);
          }
          
          $q(".option").children().each(function(idx, ele) {
            if (idx != answer_idx) {
              $q(ele).addClass("disabled");
            }
          });
          $q(".option").children().unbind("click");
        },
      })
    )
  )
}

Questionnaire.registerType(TFQ);

