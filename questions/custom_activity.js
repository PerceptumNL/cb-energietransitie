var config = {
  activity_name: "Test"
};
var targets = [
  {
    type: "text",
    text: "YES",
    concepts: [
      { 
        type: "text",
        text: "Are you human?",
      },
      { 
        type: "image",
        text: "Is this a dog?",
        image: "/dog.jpg",
      },
    ]
  },
  {
    type: "text",
    text: "NO",
    concepts: [
      { 
        type: "text",
        text: "Are you a pet?",
      },
    ]
  }
]

function generateDDQ(targets, config) {
    var onload = " onload='create_questions(targets, config)' ";
    return '<div id="results" ' + onload + ' style="display:none">Correct: <span id="correct"></span><br />Incorrect: <span id="incorrect"></span></div><div id="activity"><div id="concepts"></div><div id="targets"></div></div>'
}

var activity = [
  generateDDQ(targets, config),
];


// Note that the following code (that is not part of the definition of the
// 'activity' variable) needs to be surrounded with the commented tags
// '// <gcb-no-verify>' and '// </gcb-no-verify>', so that the verifier script
// in tools/verify.py does not treat the code as invalid. For more details,
// please see https://code.google.com/p/course-builder/wiki/VerifyCode


//<gcb-no-verify>

// JavaScript code to check which area of the image the user clicked on
// and display the appropriate message in the output textarea:
function check24(incoming) {
  if (incoming == 1) {
    document.quiz.output.value = 'You have clicked on the web page title, which is always the first line of text in a result.';
  } else if (incoming == 2) {
    document.quiz.output.value = 'You have clicked on the web address, which is always the green text in a result block.';
  } else {
    document.quiz.output.value = 'You have found the snippet, which is the black text that shows where your search terms appear on the page.';
  }
}

//</gcb-no-verify>
