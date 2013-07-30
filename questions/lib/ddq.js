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
          //if (question.type == "image") {
          //  $("#q-image").attr("src", question.image);
          //$("#tr-image").html("<div>asdf</div>");
          //$("#tr-image").show();
          //}
          $("#tr-text").show();
          var per = 90 / targetList.length
          $.each(targetList, function(k, v) {
            var target_div = $("<div class='target'>" + v.text + "</div>");
            target_div.idx = k
            target_div.answers = [];
            self.targets.push(target_div);
            $(target_div).css("width", per + "%");
            $('#tr-text').append(target_div);
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
            //accept: "",
            activeClass: "ui-state-hover",
            hoverClass: "ui-state-active",
            drop: function( event, ui ) {
              $(ui.draggable[0]).css("border", "2px dashed orange");
            }
          });
      
          $("#send-button").hide(); 
          $(".table-feedback").show();
          $(".table-feedback").css("border", "none");
          $("#check-button").show();

          $("#check-button").click(function(){
            if (self.check_answer()) {
              $("#check-button").hide();
              $("#send-button").show();
            }
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
