#!/usr/bin/python2.7
from optparse import OptionParser
import shutil
import os
import questionnaire.build

def update_questionnaire(dst):
    print "Build questionnaire into %s " % dst
    os.chdir("./questionnaire")
    print os.getcwd()
    questionnaire.build.build()

    os.chdir("..")
    print "Update questionnaire"
    shutil.copyfile("questionnaire/build/questionnaire.css", os.path.join(dst, "assets/css/questionnaire.css"))
    shutil.copyfile("questionnaire/build/questionnaire.js", os.path.join(dst, "assets/js/questionnaire.js"))
    shutil.copyfile("questionnaire/lib/base.html", os.path.join(dst, "assets/lib/base.html")) 


def main():
    usage = "usage: %prog [options]"
    parser = OptionParser(usage)
    parser.add_option("-f", "--file", dest="filename",
                      help="read data from FILENAME")
    parser.add_option("-v", "--verbose",
                      action="store_true", dest="verbose")
    parser.add_option("-q", "--quiet",
                      action="store_false", dest="verbose")
    parser.add_option("-l", "--questionnaire-local",
                      action="store_true", dest="questionnaire_local")
    parser.add_option("-r", "--questionnaire-remote",
                      action="store_true", dest="questionnaire_remote")

    (options, args) = parser.parse_args()

    #if len(args) == 0:
    #    parser.error("incorrect number of arguments")
    if options.verbose:
        print "reading %s..." % options.filename
    if options.questionnaire_local:
        update_questionnaire('./coursebuilder')
    if options.questionnaire_remote:
        update_questionnaire('./tmp/et-remote/files')

if __name__ == "__main__":
    main()
