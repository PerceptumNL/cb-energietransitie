var activity = [
  '<div>Multiple Choice questionary test!</div>',
  '<question name="mcq_activity"></question>',
];

var mcq_activity = {
  randomize: true,
  questionsType: 'mcq',
  questionsList: [
    { 
      type: 'text',
      text: 'Are you human?',
      correctAnswer: [0,2],
      answerMaybe: false,
      answers: [{
        type: 'text',
        text: 'Yes',
      },{
        type: 'text',
        text: 'No',
      },{
        type: 'text',
        text: 'Yes',
      },{
        type: 'text',
        text: 'No',
      }]
    },
    {
      type: 'image',
      text: 'Is this a dog?',
      image: 'dog.jpg',
      correctAnswer: [0,2],
      answerMaybe: false,
      answers: [{
        type: 'text',
        text: 'YES',
      },{
        type: 'text',
        text: 'NO',
      },{
        type: 'text',
        text: 'YES',
      },{
        type: 'text',
        text: 'NO',
      }]
    },
    {
      type: 'text',
      text: 'Are you a pet?',
      correctAnswer: [1],
      answerMaybe: false,
      answers: [{
        type: 'text',
        text: 'YES',
      },{
        type: 'text',
        text: 'derp',
      },{
        type: 'text',
        text: 'herp',
      },{
        type: 'text',
        text: 'schmerp',
      }]
    }
  ]
}
