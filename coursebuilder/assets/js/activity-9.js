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
      text: ' The transition to a sustainable world is not only unnecessary but also avoidable. ',
      correctAnswer: 1,
      answerMaybe: true,
       hint: 'Think about the diminishing of the global oil reserves, the risks of runaway climate change and political unrest in the Middle East',
      answers: [{
        type: 'text',
        text: 'Yes',
      },{
        type: 'text',
        text: 'No',
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