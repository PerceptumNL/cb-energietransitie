import sys
sys.path.insert(0,'/Users/Vaidas/Dropbox/programming/clones/cb-energietransitie/coursebuilder')
sys.path.insert(0,'/Users/Vaidas/Dropbox/programming/clones/cb-energietransitie')
sys.path.insert(0,'/Users/Vaidas/Desktop/GoogleAppEngineLauncher.app/Contents/Resources/GoogleAppEngine-default.bundle/Contents/Resources/google_appengine')
sys.path.insert(0,'/Applications/GoogleAppEngineLauncher.app/Contents/Resources/GoogleAppEngine-default.bundle/Contents/Resources/google_appengine/lib/fancy_urllib')
sys.path.insert(0,'/Users/Vaidas/Desktop/GoogleAppEngineLauncher.app/Contents/Resources/GoogleAppEngine-default.bundle/Contents/Resources/google_appengine/lib/jinja2-2.6')
sys.path.insert(0,'/Users/Vaidas/Desktop/GoogleAppEngineLauncher.app/Contents/Resources/GoogleAppEngine-default.bundle/Contents/Resources/google_appengine/lib/webapp2-2.5.2')
sys.path.insert(0,'/Users/Vaidas/Desktop/GoogleAppEngineLauncher.app/Contents/Resources/GoogleAppEngine-default.bundle/Contents/Resources/google_appengine/lib/webob-1.2.3')
sys.path.insert(0,'/Users/Vaidas/Desktop/GoogleAppEngineLauncher.app/Contents/Resources/GoogleAppEngine-default.bundle/Contents/Resources/google_appengine/lib/yaml/lib')

import argparse
import etl
if __name__ =='__main__':
    PARSER = argparse.ArgumentParser(add_help=False, parents=[etl.PARSER])
    etl.main(PARSER.parse_args())

