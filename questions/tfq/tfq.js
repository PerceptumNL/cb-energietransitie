var TFQ = function(question) {
  return Trait.create(
    Object.prototype,
    Trait.compose(
      QuestionTrait,
      Trait({

        questionType: "tfq",
        question: null,
        result: {},

        create_question: function(q) {
          question = q;
          result = {
            incorrect: false,
            correct: false,
            maybe: "",
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
          $("#targets").html("");
          $.each(a, function(k, v) {
            div = $("<div>").text(v.text).css("width", per + "%");
            $("#targets").append(div);
            div.click(function() { self.check_answer(k) });
            $("#targets").children().hover(
              function() {
                $(this).css({ 
                  backgroundColor: 'grey',
                  borderColor: 'yellow',
                  color: 'yellow'
                });
              },
              function() {
                $(this).css({
                  backgroundColor: 'white',
                  borderColor: 'black',
                  color: 'black'
                });
              }
            )
          });
          if (q.answerMaybe) {
              var div = $("<div>Maybe</div>")
                  .css("width", "95%")
                  .css("margin-top", "10px")
                  .click(function() {
                      self.prompt_maybe();
                  });
              $("#targets").append(div)    
          }
        },

        prompt_maybe: function() {
          this.question.maybeText = prompt("Enter your thoughts!");
          this.question.attemps.push(this.question.maybeText);
          this.question.maybe = true;
          this.results.push(this.question);
          this.next_question();
        },


        feedback_correct: function(answer_idx) {
          var self = this;
          var $ele = $($("#targets").children()[answer_idx]);
          $ele.animate({
            backgroundColor: "green"
          },{
            duration: 100
          }).animate({
            backgroundColor: "gray"
          },{
            duration: 100,
            complete: function() {
              self.next_question();
            }
          });
        },
        
        feedback_incorrect: function(answer_idx) {
          var self = this;
          $("#targets").css("z-index", "0");
          var $ele = $($("#targets").children()[answer_idx]);
          $ele.css("z-index", 100)
          $ele.animate({
            backgroundColor: "red",
            left: "-=20px"
          },{
            duration: 50
          }).animate({
            left: "+=40px"
          },{
            duration: 100
          }).animate({
            backgroundColor: "gray",
            left: "-=20px"
          },{
            duration: 50,
            complete: function() {
              self.next_question();
            }
          });
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
        }
     })
    )
  )
}

Questionary.registerType(TFQ);
