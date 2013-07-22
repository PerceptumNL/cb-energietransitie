var DDQ = {
  randomize: false,
  question_idx: 0,
  questionsList: null,
  question: null,
  results: [],
  targets: [],
  done_concepts: [],
  list_concepts: [],
  current_answer: [],

  isTesting: function() {
    return (typeof testing !== "undefined" && testing);
  },

  getLibUrl: function() {
    if (this.isTesting()) {
      return "";
    } else {
      return "assets/lib/";
    }
  },

  next_question: function() {
    var self = this;
    if (this.question == null) {
      $.each(this.questionsList, function(k,v) {
        v.incorrect = false;
        v.correct = false;
        v.maybe = false;
        v.attemps = [];
        self.list_concepts.push(v);
      });
    }

    if (self.list_concepts.length == 0) {
      $("#activity").hide();
      $("#results").show();
      var correct=0, incorrect=0, maybe=0;
      $.each(self.results, function(k, v) {
        if (v.correct) 
            correct += 1;
        else if (v.incorrect)
            incorrect += 1;
        else if (v.maybe) 
            maybe += 1;
      });
      $("#correct").html(correct);
      $("#incorrect").html(incorrect);
      $("#maybe").html(maybe);
      if (!self.isTesting()) {
        var evt = {"source":"true-false-question", "payload": JSON.stringify(self.results), xsrf_token: eventXsrfToken}
        //{"source":"tag-youtube-milestone","payload":"{\"video_id\":\"983DwAOCXRI\",\"instance_id\":0,\"event_id\":1,\"position\":31,\"location\":\"http://127.0.0.1:8080/unit?unit=2\"}","xsrf_token":"1374137555/cUFulwtXw5jAYKT5TKM_hA=="}
        $.post('/rest/events', {request: JSON.stringify(evt)}, function() {
          self.log("Activity results sent");
        }).fail(function() { 
          self.log("Error sending activity results");
        });
        
        //alert("Activity finished");
      }
      return;
    }
  
    if (this.randomize) {
      //calculate random question
      this.question_idx = Math.floor(Math.random()*(this.list_concepts.length))
    } 
    this.question = this.list_concepts[this.question_idx];
  
    this.draw_question();
    this.draw_answers();
  
    //update lists
    this.list_concepts.splice(this.question_idx,1);
    this.done_concepts.push(this.question);

    if (!this.randomize) {
      //go to next question
      this.question_idx += 1;
    } 
  },

  draw_question: function() {
    var q = this.question;
    if (q.type == "text") {
      $("#concepts").html(q.text);
    } else if (q.type == "image") {
      $("#concepts").html("<img id='concept_img' src='"+q.image+"'/>");
      $("#concepts").append("<div>"+q.text+"</div>");
    }
  },

  create: function(activity) {
    var self = this;
    this.randomize = activity.randomize || false;
    this.targetList = activity.targetList;

    var per = 90 / this.targetList.length
    $('body').append("<div class='concepts'></div>");
    $('body').append("<div class='targets'></div>");
    $('body').append("<div id='check_answer'><span>Check!</span></div>");
    $.each(this.targetList, function(k, v) {
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
    $.each(this.targets, function(k, v) {
      $.each(v.answers, function(_k, answer) {
        if ($(answer).attr("answer_idx") != k)
            $(answer).css("border-color", "red");
        else
            $(answer).css("border-color", "green");
      });
    });
    //this.question.attemps.push(answer_idx);
    //if (this.question.correctAnswer == answer_idx) {
    //  if (!this.question.incorrect) {
    //    this.question.correct = true;
    //  }
    //  this.log("Good! continue with next concept");
    //  this.feedback_correct(answer_idx);
    //  this.results.push(this.question);
    //} else {
    //  this.question.incorrect = true;
    //  this.log("Wrong... Try again!");
    //  this.feedback_incorrect(answer_idx);
    //}
  }
}

function generateDragDropQuestion() {
  if (ddq_activity.targetList.length) {
    DDQ.create(ddq_activity);
  }
}
