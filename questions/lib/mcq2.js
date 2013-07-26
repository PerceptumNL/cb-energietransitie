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

        questionType: "mcq",
        question: null,
        result: {},
      
        create_question: function(q) {
          question = q;
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
            $("#concepts").html(q.text);
          } else if (q.type == "image") {
            $("#concepts").html("<img id='concept_img' src='"+q.image+"'/>");
            $("#concepts").append("<div>"+q.text+"</div>");
          }
        },
      
        draw_answers: function() {
          var q = question;
          var a = q.answers;
          var self = this;
          var per = 95 / a.length
          var selected = [];
          $("#targets").html("");
          $.each(a, function(k, v) {
            div = $("<div>").text(v.text).css("width", per + "%");
            $("#targets").append(div);
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
      
          $("input").click(function(){
            self.check_answer();
          });
        },
      
        check_answer: function(answer_idx) {
          var current_answers = [];
          $("#targets").children().each(function(idx) {
            current_answers[idx] = $(this).hasClass("toggleon");
          });
          result.correct = true;
          $.each(question.answers, function(idx, ans) {
            if ($.inArray(idx, question.correctAnswer) >= 0 && 
                current_answers[idx] == true) {
                $($("#targets").children()[idx]).addClass("correct");
                ans.correct = true; 
            }
            else if ($.inArray(idx, question.correctAnswer) == -1 && 
                current_answers[idx] == false) {
                $($("#targets").children()[idx]).addClass("correct");
                ans.correct = true; 
            }
            else {
                $($("#targets").children()[idx]).addClass("incorrect");
                ans.incorrect = true; 
                result.correct = false;
                result.incorrect = true;
            }
          });
          this.next_question();
        }
      
      })
    )
  )
}

Questionary.registerType(MCQ);
