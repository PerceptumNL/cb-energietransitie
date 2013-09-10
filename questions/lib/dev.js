window.addEventListener("load", function() {
  for (var i=0; i<activity.length; i++) {
    $('body').append(activity[i]);
  }
  $('body').append("<div id='activityContents'></div><div id='cover'></div>");

  Questionnaire.on("load", function() { 
    this.jumpNext();
  });
 
})

var testing = true;
var eventXsrfToken = true;

