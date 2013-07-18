window.addEventListener("load", function() {
  for (var i=0; i<activity.length; i++) {
    $('body').append(activity[i]);
    if (activity[i].indexOf("<script>")) {
      $('body').append("<div id='activityContents'></div>");
      var script   = document.createElement("script");
      script.type  = "text/javascript";
      script.src   = "";  
      script.text  = activity[i];            
      document.body.appendChild(script);
    }
  }
})

var testing = true;




