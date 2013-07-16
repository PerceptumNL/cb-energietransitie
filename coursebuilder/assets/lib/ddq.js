function create_questions(targets, config) {
  var curr_concept = null;
  var done_concepts = [];
  var list_concepts = [];
  var results = [];
  var log = function(str) { console.log(str) };
  
  function next_question() {
    if (curr_concept == null) {
      $.each(targets, function(k,v) {
        $.each(v.concepts, function(_k,_v) {
          _v.correct_idx = k
          _v.incorrect = false;
          _v.correct = false;
          _v.attemps = [];
          list_concepts.push(_v);
        })
      });
    }

    if (list_concepts.length == 0) {
      $("#activity").hide();
      $("#results").show();
      var correct=0, incorrect=0;
      $.each(results, function(k, v) {
        if (v.correct) 
            correct += 1;
        else if (v.incorrect)
            incorrect += 1;
      });
      $("#correct").html(correct);
      $("#incorrect").html(incorrect);
      $.post('/activity', {activity_type: config.activity_type, answers: results, score: correct/(correct+incorrect)}, function() {
        log("Activity results sent");
      }).fail(function() { 
        log("Error sending activity results");
      });
      
      //alert("Activity finished");
      return;
    }
  
    curr_idx = Math.floor(Math.random()*(list_concepts.length))
    curr_concept = list_concepts[curr_idx];
  
    draw_question();
  
    //update lists
    list_concepts.splice(curr_idx,1);
    done_concepts.push(curr_concept);
  }
  
  function draw_question() {
    if (curr_concept.type == "text") {
      $("#concepts").html(curr_concept.text);
    } else if (curr_concept.type == "image") {
      $("#concepts").html("<img id='concept_img' src='"+curr_concept.image+"'/>");
      $("#concepts").append("<div>"+curr_concept.text+"</div>");
    }
  }

  function feedback_correct(answer_idx) {
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
          next_question();
        }
    });
  }

  function feedback_incorrect(answer_idx) {
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
  }
  
  function check_answer(answer_idx) {
    curr_concept.attemps.push(answer_idx);
    if (curr_concept.correct_idx == answer_idx) {
      if (!curr_concept.incorrect) {
        curr_concept.correct = true;
      }
      log("Good! continue with next concept");
      feedback_correct(answer_idx);
      results.push(curr_concept);
    } else {
      curr_concept.incorrect = true;
      log("Wrong... Try again!");
      feedback_incorrect(answer_idx);
    }
  }

  var per = 95 / targets.length
  $.each(targets, function(k, v) {
    div = $("<div>").text(v.text).css("width", per + "%");
    $("#targets").append(div);
    div.click(function() { check_answer(k) });
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
  next_question();
}

