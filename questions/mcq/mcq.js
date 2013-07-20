var MCQ = {
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

  draw_answers: function() {
    var q = this.question;
    var a = q.answers;
    var self = this;
    var per = 95 / a.length
    var selected = [];
    $("#targets").html("");
    $.each(a, function(k, v) {
      div = $("<div>").text(v.text).css("width", per + "%");
      $("#targets").append(div);
      $(div).click(
        function(evt) {
          if(!$(evt.target).hasClass("toggleon")){
            $(evt.target).addClass("toggleon");
          }
          else {
            $(evt.target).removeClass("toggleon");
          }
        }
      )
    });

    $("input").click(function(){
      $("div.toggleon").each(function(){
        console.log(q.correctAnswer);
        console.log($(this).index());
        selected.push($(this).index());
        console.log(selected);
        console.log(MCQ.listcompare(selected, q.correctAnswer));
      });
    });
    if (q.answerMaybe) {
        var div = $("<div>Maybe</div>")
            .css("width", "95%")
            .css("margin-top", "10px")
            .click(function() {
                self.prompt_maybe();
            });
        $("#targets").append(div)    
    }
  },

  prompt_maybe: function() {
    this.question.maybeText = prompt("Enter your thoughts!");
    this.question.attemps.push(this.question.maybeText);
    this.question.maybe = true;
    this.results.push(this.question);
    this.next_question();
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
      url: this.getLibUrl() + 'mcq.html',
      type: 'get',
      dataType: 'html',
      async: false,
      success: function(data) {
        $('#activityContents').append(data);
      } 
    });
    this.next_question();
  },
    
  
  check_answer: function(answer_idx) {
    this.question.attemps.push(answer_idx);
    if (this.member(this.question.correctAnswer,answer_idx)) {
      if (!this.question.incorrect) {
        this.question.correct = true;
      }
      this.log("Good! continue with next concept");
      this.results.push(this.question);
      this.log(this.question);
    } else {
      this.question.incorrect = true;
      this.log("Wrong... Try again!");
      this.log(this.question);
    }
  },

  member: function(list, element) {
    for(var i=0; i<list.length; i++){
      if(list[i]==element){
        return true;
      }
    }
  },
//this may not be the most efficient way to do it
  listcompare: function(selected, answers) {
    correct = [];
    incorrect = [];
    for(var i=0; i<selected.length; i++){
      checkel = 0;
      for(var j=0; j<answers.length; j++){
        if(selected[i] == answers[j]){
          if(correct.indexOf(selected[i]) == -1){
            correct.push(selected[i]);
          }
          checkel =checkel+1;
          console.log("correct in the loop:" + selected[i]);
        }
      if(checkel == 0){ 
          if(incorrect.indexOf(selected[i]) == -1){
            incorrect.push(selected[i]);
          }
          console.log("incorrect in the loop:" + selected[i]);
        }
      }
    }
    console.log("correct:" + correct);
    console.log("incorrect:" + incorrect);
  }
}

function generateMultipleChoiceQuestion() {
  if (mcq_activity.questionsList.length) {
    MCQ.create(mcq_activity);
  }
}
