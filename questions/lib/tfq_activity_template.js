var activity = [
  '<div>True-False questionary test!</div>',
  '<question name="tfq_activity"></question>',
];

var tfq_activity = {
  questionsType: 'tfq',
  questionsList: [
    { 
      type: 'image',
      text: ' The transition to a sustainable world is not only unnecessary but also avoidable. ',
      image: 'http://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/599px-The_Earth_seen_from_Apollo_17.jpg',
      correctAnswer: 1,
      answerMaybe: true,
       hint: 'Think about the diminishing of the global oil reserves, the risks of runaway climate change and political unrest in the Middle East',
      answers: [{
        type: 'text',
        text: 'Yes',
        feedback: 'Incorrect',

      },{
        type: 'text',
        text: 'No',
        feedback: 'Correct!',

      }]
    },
    {
      type: 'text',
      text: 'Due to deliberate misinformation from governments and large corporations most people are still unaware of the necessity of change.',
      correctAnswer: 0,
      answerMaybe: true,
      answers: [{
        type: 'text',
        text: 'YES',
      },{
        type: 'text',
        text: 'NO',
      }]
    },
    {
      type: 'text',
      text: 'Proper education is the first step towards a sustainable society.',
      correctAnswer: 0,
      answerMaybe: true,
      answers: [{
        type: 'text',
        text: 'YES',
      },{
        type: 'text',
        text: 'NO',
      }]
    }
  ]
}
