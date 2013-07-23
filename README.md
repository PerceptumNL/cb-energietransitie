### Running and upload application

Tested with Google App Engine 1.8.1.

Create the `tools` directory and unpack Google App Engine inside the directory.

Run `source activate` to load the environment variables, and then run GAE as usual.

Run `./apprun` to run the development server using a persistent datastorage.


### Using customs activity

1. In the menu `Dashboard` > `Assets` upload the following files:

* From `questions/js_vendor` to `assets/libs` path:
  * jquery.color.js
  * traits-0.4.mini.js

* From `questions/lib` to `assets/libs` path:
  * custom_activity_loader.js
  * tfq.html
  * tfq.js
  
* From `questions/lib` to `assets/libs` path:
  * tfq.css


2. Edit the course file `activity.html`:
```html
    {% block main_content %}

    <script src="assets/lib/traits-0.4.mini.js"></script>
    <script src="assets/lib/custom_activity_loader.js"></script>
    <script src="assets/lib/tfq.js"></script>
    <script src="assets/lib/jquery.color.js"></script>
    <link rel="stylesheet" type="text/css" href="assets/lib/tfq.css">


    {% endblock main_content %}
```

3. Add an activity to a lesson based on the example template:

* `questions/lib/tfq_activity_template.js`


### Testing and developing questions

In the path `questions` run:
    
  `python -m SimpleHTTPServer`

Then you can test and edit the custom question outside the course-builder environment.
