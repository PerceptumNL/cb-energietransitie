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
from google.appengine.api import users


class ActivityHandler(ApplicationHandler):

    def get_activity_student(self, ref):
        act = EventEntity().get_by_id(int(ref))
        st = Student.get_student_by_user_id(act.user_id)
        return st.key().name()

    def get_activity_html(self, ref):

        sub_values = {}
        ent = {}

        act = EventEntity().get_by_id(int(ref))
        entries = transforms.loads(act.data)['results']
        for e in entries:
            if e.get('text'):
                ent[e['text']] = {}
                ent[e['text']]['hint'] = e['result']['hint']
                if e['result'].get('maybe'):
                    ent[e['text']]['answer'] = e['result']['maybeText']
                else:
                    ent[e['text']]['answer'] = e['result']['correct']
                    
        sub_values['date'] = act.recorded_on.strftime('%d/%m/%y')
        sub_values['ent'] = ent

        return jinja2.utils.Markup(self.get_template(
            'activity.html', [os.path.dirname(__file__)]
        ).render(sub_values, autoescape=True))

    def get_questionary_activity(self):
        ref = self.request.get('ref')
        exit_url = self.canonicalize_url('/dashboard?action=get_activity&ref=%s') % ref
        template_values = {}
        template_values['page_title'] = self.get_activity_student(ref)
        template_values['page_description'] = ''
        template_values['main_content'] = self.get_activity_html(ref)
        self.render_page(template_values)


