import os
import datetime


def build():
    filedir = os.path.dirname(os.path.realpath(__file__))
    directory=os.path.join(filedir, "build")
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    #js
    libs = ['lib/custom_activity_loader.js', 'lib/ddq.js', 'lib/mcq.js', 'lib/tfq.js', 'lib/ddq_tree.js', 'lib/video_questionnaire.js', 'lib/tiq.js']
    os.system("node_modules/uglify-js/bin/uglifyjs -c -o %s %s " % ('build/questionnaire_nolibs.js', " ".join(libs)))
    filenames = ['build/questionnaire_nolibs.js', 'js_vendor/swfobject.js', 'js_vendor/jquery-ui-1.10.3.custom.min.js']
    with open(os.path.join(filedir, 'build/questionnaire.js'), 'w') as outfile:
        outfile.write("//Build time: %s\n\n" % datetime.datetime.now().isoformat())
        for fname in filenames:
            with open(os.path.join(filedir, fname)) as infile:
                for line in infile:
                    outfile.write(line)
    os.system("rm build/questionnaire_nolibs.js")
    
    #css
    os.system("sass -t compressed stylesheets/main.scss:build/questionnaire.css")
    #filenames = ['lib/common.css', 'lib/ddq.css', 'lib/mcq.css', 'lib/tfq.css', 'lib/ddq_tree.css', 'lib/tiq.css']
    #with open(os.path.join(filedir, 'build/questionnaire.css'), 'w') as outfile:
    #    outfile.write("/* Build time: %s*/\n\n" % datetime.datetime.now().isoformat())
    #    for fname in filenames:
    #        with open(os.path.join(filedir, fname)) as infile:
    #            for line in infile:
    #                outfile.write(line)
    

if __name__ == "__main__":
    build()
