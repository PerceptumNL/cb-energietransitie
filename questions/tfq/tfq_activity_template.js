var activity = [
  '<div>True/False questionary test!</div>',
  '<script>generateTrueFalseQuestion();</script>',
];

var tfq_activity = [
  { 
    type: 'text',
    text: 'YES',
    concepts: [{
      type: 'text',
      text: 'Are you human?'
    },{
      type: 'image',
      text: 'Is this a dog?',
      image: 'http://eofdreams.com/data_images/dreams/dog/dog-01.jpg',
    }]
  },
  {
    type: 'text',
    text: 'NO',
    concepts: [{
      type: 'text',
      text: 'Are you a pet?',
    }]
  }
]
