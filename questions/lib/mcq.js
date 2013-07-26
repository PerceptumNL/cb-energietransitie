$("#button-hint").click(function() {
   $(".hint").show(); 
});

$(".hint").click(function() {
    $(this).hide();
});

var MCQ = function(question) {
  return Trait.create(
    Object.prototype,
    Trait.compose(
      QuestionTrait,
      Trait({
        answers: null,
        questionType: "mcq",
        question: null,
        result: {},
      
        create_question: function(q) {
          question = q;
          answers= q.answers;
          result = {
            incorrect: false,
            correct: false,
            hint: false,
          }
          this.draw_question();
          this.draw_answers();
        },
      
        draw_question: function() {
          var q = question;
          if (q.type == "text") {
            console.log("tekst type");
            $("#q-table").html(q.text);
          } else if (q.type == "image") {
            console.log("image type");
            $("#q-table").html("<img id='concept_img' src='"+q.image+"'/>");
            $("#q-table").append("<div>"+q.text+"</div>");
          }
        },
      
        draw_answers: function() {
          var q = question;
          var a = q.answers;
          var self = this;
          var per = 95 / a.length
          var selected = [];
          $(".option").html("");
          $.each(a, function(k, v) {
            div = $("<div>").text(v.text).css("width", "80%");
            $(".option").append(div);
            $(div).click(
              function(evt) {
                if(!$(evt.target).hasClass("toggleon")){
                  $(evt.target).addClass("toggleon");
                }
                else {
                  $(evt.target).removeClass("toggleon");
                }
              }
            )
          });
          $("#send-button").hide(); 
          $("#checkanswer").show();

          $("#checkanswer").click(function(){
            self.check_answer();
            $("#checkanswer").hide();
            $("#send-button").show();
          });
        },
      
        prompt_maybe: function() {
          result.maybeText = prompt("Enter your thoughts!");
          result.maybe = true;
          this.next_question();
        },

        feedback_correct: function(answer_idx) {
          console.log("feedback_Correct");
          var ele = $(".option").children()[answer_idx];
          $(ele).addClass("correct");
          $(".right").show();
          answer_text = answers[answer_idx].feedback;
          if (typeof answer_text != "undefined")
            $(".feedback-text").append("<div>" + answer_text + "</div>")
          $(".feedback").fadeIn();
        },
        
        feedback_incorrect: function(answer_idx) {
          console.log("feedback_Incorrect");
          var ele = $(".option").children()[answer_idx];
          $(ele).addClass("incorrect");        
          $(".wrong").show();
          answer_text = answers[answer_idx].feedback;
          if (typeof answer_text != "undefined")
            $(".feedback-text").append("<div>" + answer_text + "</div>")
          $(".feedback").fadeIn();
        },
          
   check_answer: function(answer_idx) {
          var self = this
          var current_answers = [];
          $(".option").children().each(function(idx) {
            current_answers[idx] = $(this).hasClass("toggleon");
          });
          result.correct = true;

          $.each(question.answers, function(idx, ans) {
            if ($.inArray(idx, question.correctAnswer) >= 0 && 
                current_answers[idx] == true) {
                $($(".option").children()[idx]).addClass("correct");
                ans.correct = true; 
                self.feedback_correct(idx);

            }
            else if ($.inArray(idx, question.correctAnswer) == -1 && 
                current_answers[idx] == false) {
                $($(".option").children()[idx]).addClass("correct");
                ans.correct = true;
                self.feedback_correct(idx);
            }
            else {
                $($(".option").children()[idx]).addClass("incorrect");
                ans.incorrect = true; 
                result.correct = false;
                result.incorrect = true;
                self.feedback_incorrect(idx);
            }
          });
          this.next_question();
        }
      
      })
    )
  )
}

Questionary.registerType(MCQ);
