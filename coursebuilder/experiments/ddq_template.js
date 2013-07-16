var activity = [
  '<div id="activity_wrapper"></div><script>generateDDQ()</script>',
];

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
        image: "http://eofdreams.com/data_images/dreams/dog/dog-01.jpg",
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

function generateDDQ() {
  $("#activity_wrapper").html('<div id="results" style="display:none">Correct: <span id="correct"></span><br />Incorrect: <span id="incorrect"></span></div><div id="activity"><div id="concepts"></div><div id="targets"></div></div>');
  create_questions(targets, config);
}
