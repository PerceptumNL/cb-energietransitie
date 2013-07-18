var TFQ = {
  randomize: false,
  question_idx: 0,
  questionsList: null,
  question: null,
  results: [],
  done_concepts: [],
  list_concepts: [],

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

//  next_question: function() {
//    if (this.question == null) {
//      if (this.randomize) {
//      }
//      this.question == "ble";
//    }
//    this.question = this.questionsList[this.question_idx];
//    this.question.attemps = [];
//    this.draw_question(this.question);
//    this.draw_answers(this.question.answers);
//  },
  next_question: function() {
    var self = this;
    if (this.question == null) {
      $.each(this.questionsList, function(k,v) {
        v.incorrect = false;
        v.correct = false;
        v.attemps = [];
        self.list_concepts.push(v);
      });
    }

    if (self.list_concepts.length == 0) {
      $("#activity").hide();
      $("#results").show();
      var correct=0, incorrect=0;
      $.each(self.results, function(k, v) {
        if (v.correct) 
            correct += 1;
        else if (v.incorrect)
            incorrect += 1;
      });
      $("#correct").html(correct);
      $("#incorrect").html(incorrect);
      if (!self.isTesting()) {
        var evt = {"source":"true-false-question", "payload": JSON.stringify(results), xsrf_token: eventXsrfToken}
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
  
    this.draw_question(this.question);
    this.draw_answers(this.question.answers);
  
    //update lists
    this.list_concepts.splice(this.question_idx,1);
    this.done_concepts.push(this.question);

    if (!this.randomize) {
      //go to next question
      this.question_idx += 1;
    } 
  },

  draw_question: function(q) {
    if (q.type == "text") {
      $("#concepts").html(q.text);
    } else if (q.type == "image") {
      $("#concepts").html("<img id='concept_img' src='"+q.image+"'/>");
      $("#concepts").append("<div>"+q.text+"</div>");
    }
  },

  draw_answers: function(a) {
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
  },

  log: function(str) { 
    console.log(str) 
  },

  create: function(activity) {
    console.log(activity.randomize);
    console.log(activity.questionsList);
    var self = this;
    this.randomize = activity.randomize || false;
    this.questionsList = activity.questionsList;
  
    $.ajax({
      url: this.getLibUrl() + 'tfq.html',
      type: 'get',
      dataType: 'html',
      async: false,
      success: function(data) {
        $('#activityContents').append(data);
      } 
    });
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
      duration: 50 
    });
  },
    
  check_answer: function(answer_idx) {
    this.question.attemps.push(answer_idx);
    if (this.question.correctAnswer == answer_idx) {
      if (!this.question.incorrect) {
        this.question.correct = true;
      }
      this.log("Good! continue with next concept");
      this.feedback_correct(answer_idx);
      this.results.push(this.question);
    } else {
      this.question.incorrect = true;
      this.log("Wrong... Try again!");
      this.feedback_incorrect(answer_idx);
    }
  }
}

function generateTrueFalseQuestion() {
  if (tfq_activity.questionsList.length) {
    TFQ.create(tfq_activity);
  }
}
