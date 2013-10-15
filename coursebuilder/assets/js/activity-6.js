var activity = [
  '<div>Drag &amp; Drop questionary test!</div><br /><div>Drag the pictures of the different appliances to the right energy source.</div>',
  '<question name="ddq_activity"></question>',
];

var ddq_activity = {
  randomize: true,
  questionsType: 'ddq',
  questionsList: [
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