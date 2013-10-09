var activity = [
  '<question name="mcq_activity"></question>',
];

var mcq_activity = {
  randomize: true,
  questionsType: 'mcq',
  questionsList: [
    { 
      type: 'text',
      text: 'Are you human?',
      correctAnswer: [0],
      answerMaybe: false,
      answers: [{
        type: 'text',
        text: 'Yes',
        feedback: "correct Hello this is Marta speaking how are you today fine gentleman. I am so happy that Sergio had coffee.",
      },{
        type: 'text',
        text: 'No',
        feedback: "incorrect",
      },{
        type: 'text',
        text: 'Yes',
        feedback: "correct",
      },{
        type: 'text',
        text: 'No',
        feedback: "incorrect",
      },{
        type: 'text',
        text: 'WHO ARE YOU TO JUDGE',
        feedback: 'so close',
     }]
    },
    {
      type: 'image',
      text: 'Is this a dog?',
      image: 'dog.jpg',
      correctAnswer: [0],
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
      correctAnswer: [0],
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
    },
   {
      type: 'text',
      text: 'Are you NOT a pet?',
      correctAnswer: [0],
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
