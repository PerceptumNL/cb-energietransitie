var activity = [
  '<div>True/False questionary test!</div>',
  '<script>generateTrueFalseQuestion();</script>',
];

//var tfq_activity = [
//  { 
//    type: 'text',
//    text: 'YES',
//    concepts: [{
//      type: 'text',
//      text: 'Are you human?'
//    },{
//      type: 'image',
//      text: 'Is this a dog?',
//      image: 'http://eofdreams.com/data_images/dreams/dog/dog-01.jpg',
//    }]
//  },
//  {
//    type: 'text',
//    text: 'NO',
//    concepts: [{
//      type: 'text',
//      text: 'Are you a pet?',
//    }]
//  }
//]

var tfq_activity = {
  randomize: true,
  questionsList: [
    { 
      type: 'text',
      text: 'Are you human?',
      correctAnswer: 1,
      answerMaybe: true,
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
