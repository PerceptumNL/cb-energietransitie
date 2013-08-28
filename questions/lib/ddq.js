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
        submissionList: [],
        targets: [],

        create_question: function(q) {
          question = q;
          targetList = q.targetList;
          //submissionList = targetList.extend();
          //this.activity = a = $.extend(true, [], this.activity_original);
          submissionList = $.extend(true,[],targetList);
          console.log(submissionList)
          $.each(submissionList, function(k, v) {
            submissionList[k].conceptList=[];
            //console.log(k, v.text);
            console.log(submissionList[k].conceptList)
          });

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
                //console.log(target_div[0])
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
              //console.log(v.text,_v.text)
              //console.log(v,_v)
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
              console.log(k, $(answer).attr("answer_idx"), $(answer).attr("target_idx"))
              //console.log($(answer).attr("target_idx") );
              console.log($(answer)[0].innerText)//eg "A fridge"

              newentry = submissionList[k].conceptList.length;
              submissionList[k].conceptList[newentry]={}
              submissionList[k].conceptList[newentry].type="text"
              submissionList[k].conceptList[newentry].text=$(answer)[0].innerText;
              //submissionList[k].conceptList[newentry].correct=$(answer)[0].innerText;

              console.log(newentry);

              if ($(answer).attr("answer_idx") != $(answer).attr("target_idx")) {
                result.correct = false;
                result.incorrect = true;
                $(answer).css("border-color", "red");
                //targetList[0].conceptList[0].correct=false;
                //console.log(targetList[$(answer).attr("answer_idx")].text)//eg "electricity"
                //console.log($(answer)[0].innerText)//eg "A fridge"

                

                $.each(targetList, function(kk, v) {
                  $.each(v.conceptList, function(_kk, _v){
                    if(_v.text == $(answer)[0].innerText){
                      submissionList[k].conceptList[newentry].correct=false;
                      _v.correct=false;
                      _v.concept_idx=k;
                      console.log(_v.correct, _v.concept_idx)                      
                    }
                  });
                });
              } 
              else{
                $(answer).css("border-color", "green");
                //console.log($(answer)[0].innerText)
                $.each(targetList, function(kk, v) {
                  $.each(v.conceptList, function(_kk, _v) {
                    if(_v.text == $(answer)[0].innerText){
                      submissionList[k].conceptList[newentry].correct=true;
                      _v.correct=true;
                      _v.concept_idx=k;
                      console.log(_v.correct, _v.concept_idx)                      
                    }
                  });
                });
              }
                
            });
          });
          return true;
        }
      })
    )
  )
}

Questionary.registerType(DDQ);
