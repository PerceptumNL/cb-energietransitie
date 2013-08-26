var TFQ = function(question) {
  return Trait.create(
    Object.prototype,
    Trait.compose(
      QuestionTrait,
      Trait({

        questionType: "tfq",
        question: null,
        answers: null,
        result: {},

        create_question: function(q) {
          question = q;
          answers = q.answers;
          result = {
            incorrect: false,
            correct: false,
            maybe: false,
            maybeText: "",
            hint: false,
          }
          this.draw_question();
          this.draw_answers();
        },

        draw_question: function() {
          $("#q-text").html(question.text);
          if (question.type == "image") {
            $("#q-image").attr("src", question.image);
            $("#tr-image").show();
          }
        },

        draw_answers: function(res) {
          var q = question;
          var a = q.answers;
          var self = this;
          $(".table-feedback").hide();
          $(".feedback-text").html("");
          $(".right").hide();
          $(".wrong").hide();
          $(".option").html("").addClass("tfq");
          $.each(a, function(k, v) {
            div = $("<div>").text(v.text);
            $(".option").append(div);
            if (!res) {
              div.click(function() { 
                self.prompt_maybe(false); 
                self.check_answer(k) 
              });
            }
          });
          if (q.answerMaybe) {
            div = $("<div>").text("Maybe").attr("id", "maybe-button");
            $(".option").append(div);
            if (!res) {
              div.click(function() {
                  self.prompt_maybe(true)
              });  
              $("#submit-button").click(function() {
                $(this).hide()
                $("#send-button").show();
                $("#tr-fb-input").hide();
                $("#feedback-input").hide();
                result.maybe = true;
                result.maybeText = $("#feedback-input").val();
                self.next_question();
              });
              $("#feedback-input").keyup(function() {
                if ($(this).val().length > 1) {
                  $("#submit-button").show();
                } else {
                  $("#submit-button").hide();
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
            $("#feedback-input").show();
            $("#tr-fb-input").show();
            $("#send-button").hide();
            $("#maybe-button").addClass("selected");
            $(".table-feedback").fadeIn();
            $("#feedback-input").focus();
          } else {
            $(".table-feedback").hide();
            $("#feedback-input").hide();
            $("#tr-fb-input").hide();
            $("#send-button").show();
            $("#submit-button").hide();
            $("#maybe-button").removeClass("selected");
          }
        },

        feedback_correct: function(answer_idx) {
          var ele = $(".option").children()[answer_idx];
          $(ele).addClass("correct");
          $(".right").show();
          answer_text = answers[answer_idx].feedback;
          if (typeof answer_text != "undefined")
            $(".feedback-text").html("<div>" + answer_text + "</div>")
          $(".table-feedback").fadeIn();
        },
        
        feedback_incorrect: function(answer_idx) {
          var ele = $(".option").children()[answer_idx];
          $(ele).addClass("incorrect");        
          $(".wrong").show();
          answer_text = answers[answer_idx].feedback;
          if (typeof answer_text != "undefined")
            $(".feedback-text").append("<div>" + answer_text + "</div>")
          $(".table-feedback").fadeIn();
        },
          
        check_answer: function(answer_idx) {
          result.answerIdx = answer_idx
          if (question.correctAnswer == answer_idx) {
            if (!result.incorrect) {
              result.correct = true;
            }
            console.log("Good! continue with next concept");
            this.feedback_correct(answer_idx);
          } else {
            result.incorrect = true;
            console.log("Wrong... Try again!");
            this.feedback_incorrect(answer_idx);
          }
          
          $(".option").children().each(function(idx, ele) {
            if (idx != answer_idx) {
              $(ele).addClass("disabled");
            }
          });
          $(".option").children().unbind("click");
        }
     })
    )
  )
}

Questionary.registerType(TFQ);

