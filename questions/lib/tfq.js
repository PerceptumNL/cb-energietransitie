$("#button-hint").click(function() {
   $(".hint").show(); 
});

$(".hint").click(function() {
    $(this).hide();
});

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
          $(".feedback").hide();
          $(".feedback-text").html("");
          $(".right").hide();
          $(".wrong").hide();
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

        draw_answers: function() {
          var q = question;
          var a = q.answers;
          var self = this;
          $(".option").html("");
          $.each(a, function(k, v) {
            div = $("<div>").text(v.text);
            $(".option").append(div);
            div.click(function() { self.check_answer(k) });
          });
          if (q.answerMaybe) {
            div = $("<div>").text("Maybe");
            $(".option").append(div);
            div.click(function() {
                self.prompt_maybe(k) 
            });  
          }
        },

        prompt_maybe: function() {
          result.maybeText = prompt("Enter your thoughts!");
          result.maybe = true;
          this.next_question();
        },

        feedback_correct: function(answer_idx) {
          var ele = $(".option").children()[answer_idx];
          $(ele).addClass("correct");
          $(".right").show();
          answer_text = answers[answer_idx].feedback;
          if (typeof answer_text != "undefined")
            $(".feedback-text").html("<div>" + answer_text + "</div>")
          $(".feedback").fadeIn();
        },
        
        feedback_incorrect: function(answer_idx) {
          var ele = $(".option").children()[answer_idx];
          $(ele).addClass("incorrect");        
          $(".wrong").show();
          answer_text = answers[answer_idx].feedback;
          if (typeof answer_text != "undefined")
            $(".feedback-text").append("<div>" + answer_text + "</div>")
          $(".feedback").fadeIn();
        },
          
        check_answer: function(answer_idx) {
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
          this.next_question();
        }
     })
    )
  )
}

Questionary.registerType(TFQ);

