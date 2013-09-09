"""Classes supporting activity tables."""

import os
from controllers.utils import ApplicationHandler
from controllers.utils import BaseRESTHandler
from controllers.utils import XsrfTokenManager
import datetime
from models import courses
from models import roles
from models import transforms
from models import vfs
from models.models import EventEntity
from models.models import Student
from modules.oeditor import oeditor
import jinja2
import yaml
import messages
import logging
import json
import pprint
from google.appengine.api import users


class ActivityHandler(ApplicationHandler):

    def get_activity_student(self, ref):
        act = EventEntity().get_by_id(int(ref))
        st = Student.get_student_by_user_id(act.user_id)
        return st.key().name()

    def get_unit_lesson(self, ref):
        act = EventEntity().get_by_id(int(ref))
        ul = transforms.loads(act.data)
        uni = courses.Course(self).get_units()
        logging.info(pprint.pprint(ul))
        for u in uni:
            logging.info(u._index)
            les = courses.Course(self).get_lessons(u.unit_id)
            for l in les:
                logging.info(l._index)
        return ul['unit'], ul['lesson']

    def get_activity_html(self, ref):

        sub_values = {}
        ent = {}

        act = EventEntity().get_by_id(int(ref))
        entries = transforms.loads(act.data)['results']
        for e in entries:
            if e.get('questionType')=='ddq':
                for category in e['submissionList']:
                    for concept in category['conceptList']:
                        ent[concept['text']] = [category['text'], concept['correct']]
        sub_values['date'] = act.recorded_on.strftime('%c')
        sub_values['ent'] = ent
        sub_values['raw'] = entries

        return jinja2.utils.Markup(self.get_template(
            'activity.html', [os.path.dirname(__file__)]
        ).render(sub_values, autoescape=True))

    def get_questionary_activity(self):
        ref = self.request.get('ref')
        exit_url = self.canonicalize_url('/dashboard?action=get_activity&ref=%s') % ref
        template_values = {}
        template_values['page_title'] = 'Analytics > Activity > Unit %s > Lesson %s' % (self.get_unit_lesson(ref)[0], self.get_unit_lesson(ref)[1])
#        template_values['page_description'] = ''
        template_values['student_ul'] = 'Student: %s' % (self.get_activity_student(ref))
        template_values['main_content'] = self.get_activity_html(ref)
        self.render_page(template_values)


