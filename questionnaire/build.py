import os
import datetime


def build():
    filedir = os.path.dirname(os.path.realpath(__file__))
    directory=os.path.join(filedir, "build")
    if not os.path.exists(directory):
        os.makedirs(directory)
    
    #js
    #os.system("node_modules/uglify-js/bin/uglifyjs -c -o %s %s " % ('build/questionnaire_nolibs.js', " ".join(libs)))
    #filenames = ['build/questionnaire_nolibs.js', 'js_vendor/swfobject.js', 'js_vendor/jquery-ui-1.10.3.custom.min.js', 'js_vendor/mediaelement/mediaelement-and-player.min.js']
    libs = ['lib/custom_activity_loader.js', 'lib/ddq.js', 'lib/mcq.js', 'lib/tfq.js', 'lib/ddq_tree.js', 'lib/html5_questionnaire.js', 'lib/tiq.js']
    filenames = libs + ['js_vendor/jquery-ui-1.10.3.custom.min.js', 'js_vendor/mediaelement/mediaelement-and-player.min.js']
    #print "node_modules/uglify-js/bin/uglifyjs -c -o %s %s " % ('build/questionnaire_nolibs.js', " ".join(libs))
    with open(os.path.join(filedir, 'build/questionnaire.js'), 'w') as outfile:
        outfile.write("//Build time: %s\n\n" % datetime.datetime.now().isoformat())
        for fname in filenames:
            with open(os.path.join(filedir, fname)) as infile:
                for line in infile:
                    outfile.write(line)
    #os.system("rm build/questionnaire_nolibs.js")
    
    #css
    os.system("sass -t compressed stylesheets/main.scss:build/questionnaire_nolibs.css")
    filenames = ['js_vendor/mediaelement/mediaelementplayer.min.css','build/questionnaire_nolibs.css']
    with open(os.path.join(filedir, 'build/questionnaire.css'), 'w') as outfile:
        outfile.write("/* Build time: %s*/\n\n" % datetime.datetime.now().isoformat())
        for fname in filenames:
            with open(os.path.join(filedir, fname)) as infile:
                for line in infile:
                    outfile.write(line)
    

if __name__ == "__main__":
    build()
