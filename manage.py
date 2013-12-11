#!/usr/bin/python2.7
import os
import shutil
import sys
import subprocess
import argparse
import logging
from config import *

def fix_paths():
    os.environ['GAE_SDK_ROOT'] = GAE_PATH
    COURSE_PATH=os.path.join(TMP_PATH, COURSE_ID)
    LIBS=["fancy_urllib", "jinja2-2.6", "webapp2-2.5.2", "webob-1.2.3", "yaml-3.10"]
    for LIB in LIBS:
        sys.path.append(os.path.join(GAE_PATH, "lib", LIB))
        
    sys.path.insert(0, './coursebuilder')
    sys.path.append(GAE_PATH)

fix_paths()

import tools.etl.etl as etl
from tools.etl import remote

import questionnaire.build

class CourseConnection():

    def _connect(self):
        self.environment_class = remote.Environment
        self.environment_class(APP_ID, "%s.appspot.com" % APP_ID).establish()

    def __init__(self):
        etl._import_modules_into_global_scope()
        etl._LOG.setLevel("INFO")
        self._connect()
        self.context = etl.etl_lib.get_context(APP_PATH)

    def upload_files(files, course_url_prefix, force_overwrite):
        if not etl._context_is_for_empty_course(self.context) and not force_overwrite:
            etl._die(
                'Cannot upload to non-empty course with course_url_prefix %s' % (
                    course_url_prefix))
        count = 0
        for _file in files:
            f = open(_file['internal_path'], 'r')
            self.content = f.read()
            self.context.fs.impl._logical_home_folder  = os.path.join(os.getcwd(), 'coursebuilder')
            external_path = os.path.join(os.getcwd(), 'coursebuilder', _file['external_path'])
            #print content
            etl._put(
                self.context, etl._ReadWrapper(content), external_path, False, True)
            count += 1
            etl._LOG.info('Uploaded ' + external_path)
        etl._clear_course_cache(self.context)
        etl._LOG.info(
            'Done; %s entit%s uploaded', count, 'y' if count == 1 else 'ies')

    def download(self):
        etl._download(etl._TYPE_COURSE, "%s/%s.zip" % (TMP_PATH, COURSE_ID), APP_PATH, None, None)


def build_questionnaire():
    print "Build questionnaire"
    os.chdir("./questionnaire")
    questionnaire.build.build()
    os.chdir("..")

def update_questionnaire(dst):
    build_questionnaire()
    shutil.copyfile("questionnaire/build/questionnaire.css", os.path.join(dst, "assets/css/questionnaire.css"))
    shutil.copyfile("questionnaire/build/questionnaire.js", os.path.join(dst, "assets/js/questionnaire.js"))
    shutil.copyfile("questionnaire/lib/base.html", os.path.join(dst, "assets/lib/base.html")) 
    print "Questionnaire updated!"

def fix_pyparsing_testing():
    try:
        shutil.copyfile("coursebuilder/lib/pyparsing-1.5.7.zip-testing", "coursebuilder/lib/pyparsing-1.5.7.zip")
    except:
        pass

def fix_pyparsing_running():
    try:
        shutil.copyfile("coursebuilder/lib/pyparsing-1.5.7.zip-running", "coursebuilder/lib/pyparsing-1.5.7.zip")
    except:
        pass

def run_test(pattern="*"):
    os.system("python coursebuilder/tests/suite.py --pattern %s" % pattern)

def main():
    parser = argparse.ArgumentParser(description='Manage course-builder code/courses')
    subparsers = parser.add_subparsers(title='commands',
                                        description='append "-h" to each command for additional help',
                                        help='')
    
    parser_course= subparsers.add_parser('course',  help='Course utilities')
    parser_course.set_defaults(which='course')
    parser_course.add_argument('--download', action='store_const', const=True, help="Download default course")
    parser_course.add_argument('--upload', help="Upload course from path")

    #parser_upload = subparsers.add_parser('upload',  help='upload course')
    #parser_upload.set_defaults(which='upload')

    parser_update = subparsers.add_parser('update',  help='Upload course-builder code')
    parser_update.set_defaults(which='update')

    parser_questionnaire = subparsers.add_parser('questionnaire',  help='Questionnaire utilities')
    parser_questionnaire.set_defaults(which='questionnaire')
    parser_questionnaire.add_argument('--local', action='store_const', const=True, help="Build questionnaire and copy to the local course")
    parser_questionnaire.add_argument('--upload', action='store_const', const=True,  help="Build questionnaire and upload it to the default course")
    parser_questionnaire.add_argument('--demo', action='store_const', const=True,  help="Run a local demo web service for the questionnaire ")

    parser_run = subparsers.add_parser('run',  help='run')
    parser_run.set_defaults(which='run')

    opts = parser.parse_args(sys.argv[1:])

    if opts.which == "course":
        course_connection = CourseConnection()
        if opts.download:
            course_connection.download()
        if opts.upload:
            update_questionnaire('./coursebuilder')
            FILES = []
            DIRS = ['assets/lib','assets/css','assets/js','views']
            for DIR in DIRS:
                files = os.listdir(os.path.join('./coursebuilder', DIR))
                for f in files:
                    FILES.append({
                        'internal_path': os.path.join('coursebuilder', DIR, f),
                        'external_path': os.path.join(DIR, f),
                    })
            course_connection.upload_files(FILES, APP_PATH, True)

    elif opts.which == "questionnaire":
        if opts.upload:
            update_questionnaire('./coursebuilder')
            course_connection = CourseConnection()
            FILES = questionnaire.build.FILES
            for _f in FILES:
                _f['internal_path'] = os.path.join(os.getcwd(), 'questionnaire', _f['internal_path'])
            course_connection.upload_files(FILES, APP_PATH, True)
        if opts.local:
            update_questionnaire('./coursebuilder')
        if opts.demo:
            os.chdir("./questionnaire")
            subprocess.call("python -m SimpleHTTPServer 8001".split(" "))

    elif opts.which == "run":
        fix_pyparsing_running()
        subprocess.call("python ./tools/google_appengine/dev_appserver.py --datastore_path=./tmp/test_db.sqlite coursebuilder/".split(" "))

    elif opts.which == "update":
        fix_pyparsing_running()
        subprocess.call("python ./tools/google_appengine/appcfg.py update coursebuilder/".split(" "))


if __name__ == "__main__":
    main()
