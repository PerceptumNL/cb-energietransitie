var activity = [
  '<question name="tfq_activity"></question>',
];

var tfq_activity = {
  questionsList: [
    { 
      type: 'text',
      text: 'Due to deliberate misinformation from governments and large corporations most people are still unaware of the necessity of change.',
      correctAnswer: 0,
      answerMaybe: true,
      hint: 'Freedom of the press?',
     questionType: 'tfq',
      answers: [{
        type: 'text',
        text: 'True',
        feedback: 'Unfortunately, most people are not aware of the problem.',
      },{
        type: 'text',
        text: 'False',
        feedback: 'You might be one of them. You should get informed!!',
      }]
    },
    {
      type: 'image',
      text: 'Is the energy represented in this picture safe?',
      image: 'http://images4.wikia.nocookie.net/__cb20100331223557/simpsons/images/0/0c/Springfield_Nuclear_Power_Plant_1.PNG',
      correctAnswer: 1,
      answerMaybe: true,
      questionType: 'tfq',
      hint: 'Think about Chernobyl (1986).',
      answers: [{
        type: 'text',
        text: 'Yes',
        feedback: 'The picture represents nuclear energy: radioactive waste, nuclear accidents, nuclear radiation.',
      },{
        type: 'text',
        text: 'No',
        feedback: 'Disasters and accidents are very often related to nuclear energy.',
      }]
    },
    {
      type: 'text',
     text: 'What are the consequences of the greenhouse effect?',
     correctAnswer: [0,2] ,
      answerMaybe: false,
      hint: 'Think about what the greenhouse effect is: the increase in temperature when when the loss of heat from the system is inhibited.',
      questionType: 'mcq',
      answers: [{
        type: 'text',
       text: 'The Earth will become warmer',
        feedback: "On average, Earth will become warmer. Some regions may welcome warmer temperatures, but others may not.",
      },{
        type: 'text',
        text: 'People will get more easily tanned.',
        feedback: "There's no relationship between getting tanned and greenhouse effect.",
      },{
        type: 'text',
        text: 'The retreat of glaciers.',
        feedback: "According to some glaciologists, retreat of glaciers has increased because of the increase of atmospheric greenhouse gases.",
      },{
        type: 'text',
       text: 'Several factors such as deforestation, burning fossil fuels, release of industrial gasses, among others.',
        feedback: "These factors are some of causes of the greenhouse effect, not consequences.",
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