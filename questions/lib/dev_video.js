window.addEventListener("load", function() {
  for (var i=0; i<activity.length; i++) {
    //$('body').append(activity[i]);
    $('#ytquestionnaire').append(activity[i]);
  }
  //$('body').append("<div id='activityContents'></div><div id='cover'></div>");
  $('#ytquestionnaire').append("<div id='activityContents'></div><div id='cover'></div>");
})

var testing = true;
var eventXsrfToken = true;
