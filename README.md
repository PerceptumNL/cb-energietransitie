### Running and upload application

Tested with Google App Engine 1.8.1.

Create the `tools` directory and unpack Google App Engine inside the directory.

Run `source activate` to load the environment variables, and then run GAE as usual.

Run `./apprun` to run the development server using a persistent datastorage.


### Customs exercises

1. In the menu `Dashboard` > `Assets` upload the following files:

* To the `assets/libs` path:
  * tfq.html
  * tfq.js

* To the  `assets/css` path:
  * tfq.css


2. Edit the course file `activity.html`:
```html
    {% block main_content %}

    <script src="assets/lib/tfq.js"></script>
    <script src="assets/lib/jquery.color.js"></script>
    <link rel="stylesheet" type="text/css" href="assets/css/tfq.css">

    {% endblock main_content %}
```

3. Add an activity to a lesson based on the example template:

* `questions/tfq/tfq_activity_template.js`


### Developing exercises

In the path `questions` run:
    
    `python -m SimpleHTTPServer`

Then you test and edit the custom question outside the course-builder environment.
