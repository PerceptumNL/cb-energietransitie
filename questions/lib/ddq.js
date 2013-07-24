var DDQ = function(question) {
  return Trait.create(
    Object.prototype,
    Trait.compose(
      QuestionTrait,
      Trait({

        questionType: "ddq",
        question: null,
        result: {},
        targetList: [],
        targets: [],

        create_question: function(q) {
          question = q;
          targetList = q.targetList;
          result = {
            incorrect: false,
            correct: false,
            maybe: false,
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
          var self = this;
          var per = 90 / targetList.length
          $('#activity').append("<div id='check_answer'><span>Check!</span></div>");
          $.each(targetList, function(k, v) {
            var target_div = $("<div class='target'>" + v.text + "</div>");
            target_div.idx = k
            target_div.answers = [];
            self.targets.push(target_div);
            $(target_div).css("width", per + "%");
            $('.targets').append(target_div);
            $.each(v.conceptList, function(_k, _v) {
              var concept_div = $("<div class='concept'>" + _v.text + "</div>");
              concept_div.attr("answer_idx", k);
              $(concept_div).draggable();
              $('.concepts').append(concept_div);
            });
            $(target_div).droppable({
              //accept: "",
              greedy: true,
              activeClass: "ui-state-hover",
              hoverClass: "ui-state-active",
              drop: function( event, ui ) {
                target_div.answers.push(ui.draggable[0]);
                $(ui.draggable[0]).attr("target_idx", target_div.idx);
                console.log(target_div.answers);
                $(ui.draggable[0]).css("border", "2px solid orange");
              }
            });
          });
          $('body').droppable({
            //accept: "",
            activeClass: "ui-state-hover",
            hoverClass: "ui-state-active",
            drop: function( event, ui ) {
              $(ui.draggable[0]).css("border", "2px dashed orange");
            }
          });
      
          $("#check_answer").click(function() {
              self.check_answer();
          });

        },
      
        check_answer: function() {
          var count_answered = 0;
          $.each(this.targets, function(k, v) {
            $.each(v.answers, function(_k, answer) {
                count_answered++;
            });
          });

          num_concepts = $('.concepts').children().length;
          if (count_answered < num_concepts) return;
          console.log(count_answered);
          console.log(num_concepts);

          result.correct = true;
          $.each(this.targets, function(k, v) {
            $.each(v.answers, function(_k, answer) {
              if ($(answer).attr("answer_idx") != $(answer).attr("target_idx")) {
                result.correct = false;
                result.incorrect = true;
                $(answer).css("border-color", "red");
              } else
                $(answer).css("border-color", "green");
            });
          });
          this.next_question();
        }
      })
    )
  )
}

Questionary.registerType(DDQ);
