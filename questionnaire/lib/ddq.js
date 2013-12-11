function DDQ(question, qEle, savedQuestion) {
  this.question = question;
  this.qEle = qEle;
  this.savedQuestion = savedQuestion;

  if (savedQuestion && "result" in savedQuestion) {
    this.result = savedQuestion.result;
  } else {
    this.result = {
      incorrect: false,
      correct: false,
      maybe: false,
      hint: false,
      selections: Array(this.question.targetList.length)
    }
  }

  //this.lastAnswerHeight = 0;
  this.$q = function(selector) {
    return $(this.qEle).find(selector);
  }
  this.targetList = this.question.targetList;
  this.$targets = [];
  this.$concepts = [];
}

DDQ.questionType = "ddq";
DDQ.prototype = {

  create: function() {
    var self = this;

    this.drawQuestion();
    this.drawAnswers();

    if (this.savedQuestion) {
      var total = 0, totalEnd = 0;
      $.each(this.result.selections, function(tIdx, targetArray) {
        $.each(targetArray, function(cIdx, conceptIndex) {
            total++;
            setTimeout(function() {
                self.addConcept(self.$concepts[conceptIndex], self.$targets[tIdx]);
                totalEnd++;
                if (total == totalEnd) 
                    self.checkAnswer();
            }, 1);
        });
      });
    }
  },

  drawQuestion: function() {
    var self = this;
    var per = 90 / this.targetList.length
    self.$q(".target").each(function(k, target) {
      $target = $(target).data("targetIdx", k);
      $target.css("width", per + "%");
      $target.droppable({
        greedy: true,
        activeClass: "ui-state-hover",
        hoverClass: "ui-state-active",
        drop: function( event, ui ) {
          self.addConcept(ui.draggable[0], event.target);
        }
      });
      self.$targets.push($target);
    });
  },

  addConcept: function(concept, target) {
    var self = this;
    //self.lastAnswerHeight = self.$q("#top-answer").height();
    $(target).append(concept);
    $(concept)
      .css("left", "0px")
      .css("top", "0px");
    $(concept).data("targetIdx", $(target).data("index"));
    $(concept).addClass("dropped");

    self.checkDone();
  },

  drawAnswers: function() {
    var self = this;
    var $a = self.$q("#top-answer");
    
    var idx = 0;
    $.each(self.targetList, function(tIdx, target) {
      $.each(target.conceptList, function(cIdx, concept) {
        var $concept = $("<div class='concept'>" + concept.text + "</div>")
          .data("targetIdx", tIdx)
          .data("idx", idx++)
          .draggable({
            start: function(event, ui) {
                $(event.target).css("z-index","100");
            },
            stop: function(event, ui) {
                $(event.target).css("z-index","0");
            },
          });
        if (concept.image) {
          $("<img>").attr("src", concept.image).prependTo($concept);
        }
        self.$concepts.push($concept);
      });
    });
    
    _array = shuffleRange(this.$concepts.length);
    $.each(_array, function(i, index) {
      $a.append(self.$concepts[index]);
    });

    $(self.qEle).droppable({
      activeClass: "ui-state-hover",
      hoverClass: "ui-state-active",
      drop: function( event, ui ) {
        $a.append(ui.draggable[0]);
        $(ui.draggable[0])
            .css("left", "0")
            .css("top", "0");
        self.checkDone();
      }
    });
  
    self.$q("#send-button").hide(); 
    self.$q(".table-feedback")
        .css("border", "none")
        .show();

    self.$q("#check-button").click(function(){
      self.checkAnswer();
      self.submit();
    });
  },

  checkDone: function() {
    var self = this;
    var done=true;
    self.$q(".concept").each(function(k,concept) {
      if ($(concept).parent().hasClass("target") == false) {
        done = false;
      }
    });
    self.$q("#check-button").toggle(done);
    //if (done && self.lastAnswerHeight > 0)
    //    self.$q("#top-answer").height(self.lastAnswerHeight);
    return done;
  },

  getSelections: function() {
    var self = this;
    var selections = [];
    self.$q(".target").each(function(tIdx, target) {
      selections[tIdx] = [] 
      $(target).find(".concept").each(function(cIdx, concept) {
        selections[tIdx].push($(concept).data("idx"));
      });
    });
    return selections;
  },
        
  checkAnswer: function(selections) {
    var self = this;
    this.result.correct = true;
    this.result.selections = this.getSelections();
    
    this.$q(".target").each(function(tIdx, target) {
      $(target).find(".concept").each(function(cIdx, concept) {
        try {
            $(concept).draggable( "destroy" );
        } catch(e) {}

        if ($(concept).data("targetIdx") != $(target).data("targetIdx")) {
          $(this).addClass("incorrect");
          $(this).append("<div class='ddq-solution'>"+($(concept).data("targetIdx")+1)+"</div>"); 
          self.result.correct = false;
          self.result.incorrect = true;
        } 
        else{
          $(concept).addClass("correct");
        }
      });
    });
    self.$q("#check-button").hide();
    self.$q("#send-button").show();
    return true;
  },
  
  test_correct: function() {
    var self = this;
    self.$q('.concept').each(function(k,concept) {
        setTimeout(function() {
            self.addConcept(concept, self.$q(".target").first());
        }, 1);
    });
    this.checkDone();
  }
}

Questionnaire.registerType(DDQ);
