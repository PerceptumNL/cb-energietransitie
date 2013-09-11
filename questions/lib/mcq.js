var MCQ = function(question, qEle) {
  return Trait.create(
    Object.prototype,
    Trait.compose(
      QuestionTrait,
      Trait({
        answers: null,
        questionType: "mcq",
        question: null,
        //submissionList: [],
        result: {},
        qEle: qEle,
      
        create_question: function() {
          answers= question.answers;
          result = {
            incorrect: false,
            correct: false,
            hint: false,
            selections: [],
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
      
        draw_answers: function() {
          var self = this,
            q = question,
            a = q.answers,
            per = 95 / a.length,
            selected = [];
          $q(".option").html("").addClass("mcq").addClass("enabled");
          $.each(a, function(k, v) {
            div = $("<div>").text(v.text).css("width", "80%");
            $q(".option").append(div);
            $(div).click(
              function(evt) {
                $(this).toggleClass("toggleon")
              }
            )
          });

          $q("#send-button").hide(); 
          $q(".table-feedback").show();
          $q(".table-feedback").css("border", "none");
          $q("#check-button").show();

          $q("#check-button").click(function(){
            self.check_answer();
            $q("#check-button").hide();
            $q("#send-button").show();
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
          $q(".option").children().each(function(idx) {
            current_answers[idx] = $(this).hasClass("toggleon");
          });
          result.correct = true;
          var anstext = answer_idx

          $.each(question.answers, function(idx, ans) {
            //console.log(question.answers)
            //console.log("aa "+idx, ans)
            var answer_text = answers[idx].feedback || "";
            newentry = result.selections.length;
            if ($.inArray(idx, question.correctAnswer) >= 0 && current_answers[idx] == true) {
                //console.log("aa "+idx) //selected correctly
                result.selections[newentry] = idx;
                $($q(".option").children()[idx]).append("<div id='fb'><img src='http://bit.ly/11iXTZG'/>"+ answer_text +"</div>");
                ans.correct = true; 
                //self.feedback_correct(idx);

            }
            else if ($.inArray(idx, question.correctAnswer) == -1 && current_answers[idx] == false) {
                //console.log(idx)
                $($q(".option").children()[idx]).append("<div id='fb'><img src='http://bit.ly/11iXTZG'/>"+ answer_text +"</div>");
                ans.correct = true;
                //self.feedback_correct(idx);
            }
            else if ($.inArray(idx, question.correctAnswer) == -1 && current_answers[idx] == true) {
                //console.log("bb "+idx) //selected wrongly
                result.selections[newentry] = idx;
                $($q(".option").children()[idx]).append("<div id='fb'><img src='http://bit.ly/11iXTZG'/>"+ answer_text +"</div>");
                ans.correct = true;
                //self.feedback_correct(idx);
            }
            else {
                ans.incorrect = true; 
                //console.log(idx)                
                $($q(".option").children()[idx]).append("<div id='fb'><img src='http://bit.ly/1aMHTSK'/>"+ answer_text +"</div>");
                result.correct = false;
                result.incorrect = true;
                //self.feedback_incorrect(idx);
            }
            //console.log("aa "+idx, ans.incorrect)
          });
          //console.log(result)
          $q(".option").removeClass("enabled");
          $q(".option").children().unbind("click");
          //this.next_question();
        }

      
      })
    )
  )
}

Questionnaire.registerType(MCQ);
