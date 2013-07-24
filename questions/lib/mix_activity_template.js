var activity = [
  '<div>True/False questionary test!</div>',
  '<question name="tfq_activity"></question>',
];

var tfq_activity = {
  questionsList: [
    { 
      type: 'text',
      text: 'Are you human?',
      correctAnswer: 0,
      answerMaybe: true,
      questionType: 'tfq',
      answers: [{
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
      image: 'http://eofdreams.com/data_images/dreams/dog/dog-01.jpg',
      correctAnswer: 0,
      answerMaybe: true,
      questionType: 'tfq',
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
      text: 'Are you a pet?',
      correctAnswer: [1],
      answerMaybe: false,
      questionType: 'mcq',
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
      questionType: 'ddq',
      targetList: [
        { 
          type: 'text',
          text: 'electricity',
          conceptList: [{
            type: 'text',
            text: 'A fridge',
          }]
        },
        { 
          type: 'text',
          text: 'biofuel',
          conceptList: [{
            type: 'text',
            text: 'car',
          },{
            type: 'text',
            text: 'A wood oven',
          }]
        },
        { 
          type: 'text',
          text: 'man power',
          conceptList: [{
            type: 'text',
            text: 'A bicycle',
          },{
            type: 'text',
            text: 'A razorblade',
          }]
        }
      ]
    }
  ]
}
