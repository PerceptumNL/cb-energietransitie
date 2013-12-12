import os
import datetime

FILES = [
    {
        "internal_path": "build/questionnaire.css",
        "external_path": "assets/css/questionnaire.css",
    },
    {
        "internal_path": "lib/base.html",
        "external_path": "assets/lib/base.html",
    },
    {
        "internal_path": "build/questionnaire.js",
        "external_path": "assets/lib/questionnaire.js",
    },
]

filedir = os.path.dirname(os.path.realpath(__file__))
directory=os.path.join(filedir, "build")

def build_css():
    os.system("sass -t compressed stylesheets/main.scss:build/questionnaire_nolibs.css")
    filenames = ['js_vendor/mediaelement/mediaelementplayer.min.css','build/questionnaire_nolibs.css']
    with open(os.path.join(filedir, 'build/questionnaire.css'), 'w') as outfile:
        outfile.write("/* Build time: %s*/\n\n" % datetime.datetime.now().isoformat())
        for fname in filenames:
            with open(os.path.join(filedir, fname)) as infile:
                for line in infile:
                    outfile.write(line)

def build_js():
    libs = ['lib/custom_activity_loader.js', 'lib/ddq.js', 'lib/mcq.js', 'lib/tfq.js', 'lib/ddq_tree.js', 'lib/html5_questionnaire.js', 'lib/tiq.js']
    filenames = libs + ['js_vendor/jquery-ui-1.10.3.custom.min.js', 'js_vendor/mediaelement/mediaelement-and-player.js']
    with open(os.path.join(filedir, 'build/questionnaire.js'), 'w') as outfile:
        outfile.write("//Build time: %s\n\n" % datetime.datetime.now().isoformat())
        for fname in filenames:
            with open(os.path.join(filedir, fname)) as infile:
                for line in infile:
                    outfile.write(line)


def build():
    if not os.path.exists(directory):
        os.makedirs(directory)
    build_css()
    build_js()

if __name__ == "__main__":
    build()
