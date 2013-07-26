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
        feedback: 'Humans are uniquely adept at utilizing systems of symbolic communication such as language and art for self-expression, the exchange of ideas, and organization. Humans create complex social structures composed of many cooperating and competing groups, from families and kinship networks to states. Social interactions between humans have established an extremely wide variety of values, social norms, and rituals, which together form the basis of human society. The human desire to understand and influence their environment, and to explain and manipulate phenomena has been the foundation for the development of science, philosophy, mythology, and religion.',
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
