import os

directory="./build"
if not os.path.exists(directory):
    os.makedirs(directory)


filenames = ['js_vendor/swfobject.js', 'js_vendor/jquery-ui-1.10.3.custom.min.js', 'js_vendor/traits-0.4.mini.js', 'lib/custom_activity_loader.js', 'lib/ddq.js', 'lib/mcq.js', 'lib/tfq.js', 'lib/ddq_tree.js', 'lib/video_questionnaire.js']
with open('build/questionary.js', 'w') as outfile:
    for fname in filenames:
        with open(fname) as infile:
            for line in infile:
                outfile.write(line)

filenames = ['lib/common.css', 'lib/ddq.css', 'lib/mcq.css', 'lib/tfq.css', 'lib/ddq_tree.css']
with open('build/questionary.css', 'w') as outfile:
    for fname in filenames:
        with open(fname) as infile:
            for line in infile:
                outfile.write(line)
