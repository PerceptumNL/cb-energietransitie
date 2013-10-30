function DDQ(question, qEle) {
  this.question = question;
  this.qEle = qEle;
  this.result = {
    incorrect: false,
    correct: false,
    maybe: false,
    hint: false,
    selections: []
  }
  this.lastAnswerHeight = 0;
  this.$q = function(selector) {
    return $(this.qEle).find(selector);
  }
  this.targetList = [];
  this.$targets = [];
  this.$concepts = [];
}

DDQ.questionType = "ddq";
DDQ.prototype = {

  create: function(data) {
    var self = this;
    $(this.qEle).addClass("ddq");
    this.targetList = this.question.targetList;

    this.drawQuestion();
    this.drawAnswers();
    self.$q(".table-feedback").appendTo(self.$q("#top-answer"));
    self.$q(".table-feedback").hide();

    if (data) { 
      this.data = data;
      this.setSelections(this.data.result.selections);
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
      this.result = this.data.result;
    } else {
      this.result.selections = Array(this.targetList.length);
    }
  },

  drawQuestion: function() {
    var self = this;
    this.$q("#question-text").html(this.question.text);
    this.$q("#q-text").html("");
    this.$q("#tr-text").show();
    var per = 90 / this.targetList.length
    $.each(this.targetList, function(k, v) {
      var $target = $("<td>").addClass("target").data("targetIdx", k);
      if (v.image) {
        $("<img>").addClass('target-image')
            .attr("src", v.image)
            .appendTo($target);
      }
      $("<div>").addClass('target-title')
            .html(v.text)
            .appendTo($target);
      $target.css("width", per + "%");
      self.$q('#tr-text').append($target);

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
    self.lastAnswerHeight = self.$q("#top-answer").height();
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
    
    $.each(self.targetList, function(tIdx, target) {
      $.each(target.conceptList, function(cIdx, concept) {
        var $concept = $("<div class='concept'>" + concept.text + "</div>")
          .data("targetIdx", tIdx)
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
    });
  },

  checkDone: function() {
    var self = this;
    var done=true;
    self.$q(".concept").each(function(k,concept) {
      if ($(concept).parent().hasClass("target") == false) {
        done=false;
      }
    });
    self.$q("#check-button").toggle(done);
    self.$q(".table-feedback").toggle(done);
    if (done && self.lastAnswerHeight > 0)
        self.$q("#top-answer").height(self.lastAnswerHeight);
    return done;
  },

  setSelections: function(selections) {
    this.result.selections = selections;
  },

  getSelections: function() {
    var self = this;
    var selections = [];
    $(".target").each(function(tIdx, target) {
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
    
    $(".target").each(function(tIdx, target) {
      $(target).find(".concept").each(function(cIdx, concept) {
        try {
            $(concept).draggable( "destroy" );
        } catch(e) {}

        if ($(concept).data("targetIdx") != $(target).data("targetIdx")) {
          $(concept).addClass("incorrect");
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
  
  test: function() {
    var self = this;
    self.$q('.concept').each(function(k,concept) {
        setTimeout(function() {
            self.addConcept(concept, $(".target").first());
        }, 1);
    });
    this.checkDone();
  }


}

Questionnaire.registerType(DDQ);
