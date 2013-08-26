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
          var self = this;
          $("#q-text").html(question.text || "");
          $("#tr-text").show();
          var per = 90 / targetList.length
          $.each(targetList, function(k, v) {
            var target_div = $("<div class='target'><div class='target-title'>"+v.text+"</div></div>");
            target_div.idx = k
            target_div.answers = [];
            self.targets.push(target_div);
            $(target_div).css("width", per + "%");
            $('#tr-text').append(target_div);
            $(target_div).droppable({
              greedy: true,
              activeClass: "ui-state-hover",
              hoverClass: "ui-state-active",
              drop: function( event, ui ) {
                target_div.answers.push(ui.draggable[0]);
                $(target_div).append(ui.draggable[0]);
                $(ui.draggable[0]).css("left", "0px");
                $(ui.draggable[0]).css("top", "0px");
                $(ui.draggable[0]).attr("target_idx", target_div.idx);
                $(ui.draggable[0]).css("border", "2px solid orange");
                self.check_done();
              }
            });
          });
          self.check_done();
          //$("#tr-image").show();
        },

        draw_answers: function() {
          var self = this;
          $(".option").html("");
          $.each(targetList, function(k, v) {
            $.each(v.conceptList, function(_k, _v) {
              var concept_div = $("<div class='concept'>" + _v.text + "</div>");
              concept_div.attr("answer_idx", k);
              $(concept_div).draggable();
              $('.option').append(concept_div);
            });
          });
          $('body').droppable({
            activeClass: "ui-state-hover",
            hoverClass: "ui-state-active",
            drop: function( event, ui ) {
              $(".option").append(ui.draggable[0]);
              $(ui.draggable[0]).css("border", "2px dashed orange");
              $(ui.draggable[0]).css("left", "0");
              $(ui.draggable[0]).css("top", "0");
            }
          });
      
          $("#send-button").hide(); 
          $(".table-feedback").show();
          $(".table-feedback").css("border", "none");

          $("#check-button").click(function(){
            if (self.check_answer()) {
              $("#check-button").hide();
              $("#send-button").show();
            }
          });
        },

        check_done: function() {
          var count_answered = 0;
          $.each(this.targets, function(k, v) {
            $.each(v.answers, function(_k, answer) {
                count_answered++;
            });
          });
          num_concepts = 0;
          $.each(targetList, function(k, v) {
            $.each(v.conceptList, function(_k, _v) {
                num_concepts++;
            })
          });
          if (count_answered < num_concepts) {
            $("#check-button").hide();
            return false;
          } else {
            $("#check-button").show();
            return true;
          }
        },
      
        check_answer: function() {
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
          return true;
        }
      })
    )
  )
}

Questionary.registerType(DDQ);
