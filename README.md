
### Running and upload application

Create the `tools` directory and unpack Google App Engine inside the directory.

Run `source activate` to load the environment variables, and then run GAE as usual.


### Customs exercises

Add to `activity.html` course file:

    {% block main_content %}


    <script src="assets/lib/ddq.js"></script>
    <script src="assets/lib/jquery.color.js"></script>
    <link rel="stylesheet" type="text/css" href="assets/css/activity.css">


    {% endblock main_content %}


Example file containing true/false question activity template:

`coursebuilder/experiments/ddq_template.js`
