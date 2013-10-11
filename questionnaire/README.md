REQUIREMENTS:

 * sass
 * npm install uglify-js

DEVELOP:

Run in separate terminals:

# sass -l --watch stylesheets/main.scss:lib/questionnaire.css

And:

# python -m SimpleHTTPServer

Then, access http://localhost:8000/demo.html to some demo



BUILD:

# python build.py
