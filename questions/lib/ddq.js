var DDQ = function(question, qEle) {
  return Trait.create(
    Object.prototype,
    Trait.compose(
      QuestionTrait,
      Trait({

        questionType: "ddq",
        question: question,
        result: {},
        targetList: [],
        submissionList: [],
        targets: [],
        positions:[],
        qEle: qEle,

        create_question: function() {
          targetList = question.targetList;
          var self = this;
          submissionList = $.extend(true,[],targetList);
          $.each(submissionList, function(k, v) {
            submissionList[k].conceptList=[];
          });

          var poscnt=0;
          $.each(targetList, function(k, v) {
            $.each(v.conceptList, function(_k, _v) {
              self.positions[poscnt]={}
              self.positions[poscnt].name=_v.text;
              self.positions[poscnt].pos=-1;
              poscnt++;
            })
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

        //-----------------------------
        //$.fn.draggable2 = function() {        
        //    var offset = null;        
        //    var start = function(e) {          
        //        var orig = e.originalEvent;          
        //        var pos = $(this).position();          
        //        offset = {            
        //            x: orig.changedTouches[0].pageX - pos.left,            
        //            y: orig.changedTouches[0].pageY - pos.top          
        //        };        
        //    };        
        //    var moveMe = function(e) {          
        //        e.preventDefault();          
        //        var orig = e.originalEvent;          
        //        $(this).css({            
        //            top: orig.changedTouches[0].pageY - offset.y,            
        //            left: orig.changedTouches[0].pageX - offset.x          
        //        });        
        //    };        
        //    this.bind("touchstart", start);        
        //   this.bind("touchmove", moveMe);      
        //};          
        //-----------------------------

        draw_question: function() {
          var self = this;
          $q("#q-text").html(question.text || "");
          $q("#tr-text").show();
          var per = 90 / targetList.length
          $.each(targetList, function(k, v) {
            var target_div = $("<div class='target'><div class='target-title'>"+v.text+"</div></div>");
            target_div.idx = k
            target_div.answers = [];
            self.targets.push(target_div);
            $(target_div).css("width", per + "%");
            $q('#tr-text').append(target_div);

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
                //console.log($(ui.draggable[0]).attr("target_idx"), $(ui.draggable[0])[0].innerText )

                var poscnt=0;
                $.each(targetList, function(k, v) {
                  $.each(v.conceptList, function(_k, _v) {
                    if(self.positions[poscnt].name == $(ui.draggable[0])[0].innerText){
                      self.positions[poscnt].pos = $(ui.draggable[0]).attr("target_idx");
                    }                    
                    poscnt++;
                  })
                });

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
          $q(".option").html("");
          $.each(targetList, function(k, v) {
            $.each(v.conceptList, function(_k, _v) {
              var concept_div = $("<div class='concept'>" + _v.text + "</div>");
              concept_div.attr("answer_idx", k);
              $(concept_div).draggable();
              $q('.option').append(concept_div);
            });
          });
          $('body').droppable({
            activeClass: "ui-state-hover",
            hoverClass: "ui-state-active",
            drop: function( event, ui ) {
              $q(".option").append(ui.draggable[0]);
              $(ui.draggable[0]).css("border", "2px dashed orange");
              //console.log("aa " + $(ui.draggable[0]))
              $(ui.draggable[0]).css("left", "0");
              $(ui.draggable[0]).css("top", "0");
            }
          });
      
          $q("#send-button").hide(); 
          $q(".table-feedback").show();
          $q(".table-feedback").css("border", "none");

          $q("#check-button").click(function(){
            if (self.check_answer()) {
              $q("#check-button").hide();
              $q("#send-button").show();
            }
          });
        },

        check_done: function() {
          var self = this;

          num_concepts = 0;
          $.each(targetList, function(k, v) {
            $.each(v.conceptList, function(_k, _v) {
                num_concepts++;
            })
          });

          tot_placed=0
          for (var i=0; i<self.positions.length; i++){
            //console.log(self.positions[i].pos)
            if(self.positions[i].pos >=0 ){
              tot_placed++;
            }
          }
          //console.log("placed: " + tot_placed)
          //console.log("-----")

          if (tot_placed < num_concepts) {
            $q("#check-button").hide();
            return false;
          } else {
            $q("#check-button").show();
            return true;
          }
        },
      
        check_answer: function() {
          result.correct = true;
          
          var self = this;
          for (var i=0; i<self.positions.length;i++){
            //console.log(i, self.positions[i].name, self.positions[i].pos*1)
            newentry2 = submissionList[self.positions[i].pos].conceptList.length;
            submissionList[self.positions[i].pos].conceptList[newentry2]={}
            submissionList[self.positions[i].pos].conceptList[newentry2].type="text"
            submissionList[self.positions[i].pos].conceptList[newentry2].text=self.positions[i].name
          }


          $.each(this.targets, function(k, v) {
            $.each(v.answers, function(_k, answer) {

              $(answer).draggable( "option", "disabled", true );

              if ($(answer).attr("answer_idx") != $(answer).attr("target_idx")) {
                result.correct = false;
                result.incorrect = true;
                $(answer).css("border-color", "red");
                
                $.each(targetList, function(kk, v) {
                  $.each(v.conceptList, function(_kk, _v){
                    if(_v.text == $(answer)[0].innerText){
                      $.each(submissionList, function(k2, v2) {
                        $.each(v2.conceptList, function(_k2, _v2) {
                          if(_v2.text == _v.text){
                            _v2.correct = false
                            _v.concept_idx=k2;
                          }
                        })
                      });
                      _v.correct=false;                 
                    }
                  });
                });
              } 
              else{
                $(answer).css("border-color", "green");
                $.each(targetList, function(kk, v) {
                  $.each(v.conceptList, function(_kk, _v) {
                    if(_v.text == $(answer)[0].innerText){
                      $.each(submissionList, function(k2, v2) {
                        $.each(v2.conceptList, function(_k2, _v2) {
                          if(_v2.text == _v.text){
                            _v2.correct = true
                            _v.concept_idx=k2;
                          }
                        })
                      });
                      _v.correct=true;                    
                    }
                  });
                });
              }
                
            });
          });
          question["submissionList"] = submissionList
          return true;
        }
      })
    )
  )
}

Questionnaire.registerType(DDQ);
