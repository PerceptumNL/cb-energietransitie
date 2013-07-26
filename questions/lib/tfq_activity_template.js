var activity = [
  '<div>True/False questionary test!</div>',
  '<question name="tfq_activity"></question>',
];

var tfq_activity = {
  randomize: true,
  questionsType: 'tfq',
  questionsList: [
    { 
      type: 'text',
      text: 'Are you human?',
      correctAnswer: 0,
      answerMaybe: true,
      hint: 'You are stupid :P',
      answers: [{
        type: 'text',
        text: 'Yes',
        feedback: 'Correct!',
      },{
        type: 'text',
        text: 'No',
        feedback: 'What kind of matter you think you are! haha',
      }]
    },
    {
      type: 'image',
      text: 'Is this a dog?',
      image: 'http://eofdreams.com/data_images/dreams/dog/dog-01.jpg',
      correctAnswer: 0,
      answerMaybe: true,
      answers: [{
        type: 'text',
        text: 'True',
      },{
        type: 'text',
        text: 'False',
      }]
    },
    {
      type: 'text',
      text: 'Are you a pet?',
      correctAnswer: 1,
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
