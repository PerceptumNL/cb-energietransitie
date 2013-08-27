### Running and upload application

Tested with Google App Engine 1.8.1.

Create the `tools` directory and unpack Google App Engine inside the directory.

Create an empty `tmp` for the testing Data Store.

Run `source activate` to load the environment variables, and then run GAE as usual.

Run `./apprun` to run the development server using a persistent datastorage.


### Using the questionary into course-builder


1. From the `questions` path run:
    
  `python build.py`

2. In the menu `Dashboard` > `Assets` upload the following files:

* From `questions/build` to `assets/css` path:
  * questionary.css

* From `questions/build/` to `assets/libs` path:
  * questionary.js

* From `questions/lib/` to `assets/libs` path:
  * base.html
  
3. Insert into `main_content` block, in the course file `activity.html`:
```html
    <script src="assets/lib/questionary.js"></script>
    <link rel="stylesheet" type="text/css" href="assets/css/questionary.css">
```

3. Add an activity to a lesson based on the example templates:

* `questions/samples/activity_template.js` (to be uploaded)


### Testing and developing questions

In the path `questions` run:
    
  `python -m SimpleHTTPServer`

Then, you can access the questionnaires demos from the web URL:
 
  `http://localhost:8000`

This way you can test and edit custom question outside the course-builder environment.
