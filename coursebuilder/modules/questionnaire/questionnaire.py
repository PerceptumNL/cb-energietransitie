# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Module for implementing question tags."""

__author__ = 'sergio@perceptum.nl'


import os

from common import jinja_utils
from common import schema_fields
from common import tags
import jinja2
from models import custom_modules
from models import transforms
from xml.etree import cElementTree
from controllers.utils import BaseRESTHandler
from models.models import Student, StudentPropertyEntity, EventEntity
from controllers import sites
import models.courses
from models.counters import PerfCounter
import urllib
import urlparse
from google.appengine.ext import db
from models.progress import UnitLessonCompletionTracker
from tools import verify


RESOURCES_PATH = '/modules/questionnaire/resources'

COURSE_EVENTS_RECEIVED = PerfCounter(
    'gcb-course-events-received',
    'A number of activity/assessment events received by the server.')

COURSE_EVENTS_RECORDED = PerfCounter(
    'gcb-course-events-recorded',
    'A number of activity/assessment events recorded in a datastore.')

def extract_unit_and_lesson(handler):
    """Loads unit and lesson specified in the request."""

    # Finds unit requested or a first unit in the course.
    u = handler.request.get('unit')
    unit = handler.get_course().find_unit_by_id(u)
    if not unit:
        units = handler.get_course().get_units()
        for current_unit in units:
            if verify.UNIT_TYPE_UNIT == current_unit.type:
                unit = current_unit
                break
    if not unit:
        return None, None

    # Find lesson requested or a first lesson in the unit.
    l = handler.request.get('lesson')
    lesson = None
    if not l:
        lesson = get_first_lesson(handler, unit.unit_id)
    else:
        lesson = handler.get_course().find_lesson_by_id(unit, l)
    return unit, lesson

def get_first_lesson(course, unit_id):
    """Returns the first lesson in the unit."""
    lessons = course.get_lessons(unit_id)
    return lessons[0] if lessons else None

def get_unit_and_lesson_id_from_url(course, url):
    """Extracts unit and lesson ids from a URL."""
    url_components = urlparse.urlparse(url)
    query_dict = urlparse.parse_qs(url_components.query)

    if 'unit' not in query_dict:
        return None, None

    unit_id = query_dict['unit'][0]

    lesson_id = None
    if 'lesson' in query_dict:
        lesson_id = query_dict['lesson'][0]
    else:
        lesson_id = get_first_lesson(course, unit_id).lesson_id

    return unit_id, lesson_id

class StudentProgress():

    PROPERTY_KEY = 'course-questionnaire'

    def __init__(self, app_context, progress, student):
        self.app_context = app_context
        self.progress = progress
        self.student = student

    @property
    def value(self, progress_dict=None):
        if progress_dict:
            self.progress.value = transforms.dumps(progress_dict)
            self.progress.put()
        return transforms.loads(self.progress.value)
        

    def load_lesson(self, lesson_id):
        lesson_id = str(lesson_id)
        
        lesson_attempts = None
        for unit, lessons in self.value.iteritems():
            if lesson_id in lessons:
                lesson_attempts = self.value[unit][lesson_id]
                break

        if lesson_attempts == None or len(lesson_attempts) == 0: return []

        lesson_attempts = lesson_attempts[-1]

        event_keys = []
        for attempt in lesson_attempts:
            if len(attempt):
                event_keys.append(attempt['event_key'])

        events = db.get(event_keys)
        data = []
        for e in events:
            data.append(transforms.loads(e.data))

        return data

    def set_lesson_status(self, unit_id, lesson_id, status):
        course = models.courses.Course(None, self.app_context)
        tracker = UnitLessonCompletionTracker(course)
        if status == 1:
            p = UnitLessonCompletionTracker.get_or_create_progress(self.student)
            unit_status = tracker.get_unit_status(p, unit_id)
            if unit_status == None:
                _key = tracker._get_unit_key(unit_id)
                tracker._set_entity_value(p, _key, 1)
            _key = tracker._get_html_key(unit_id, lesson_id)
            tracker._set_entity_value(p, _key, status)
            p.put()
        elif status == 2:
            tracker._put_event(
                self.student, 'html', tracker._get_html_key(unit_id, lesson_id))

    def get_lesson_status(self, unit_id, lesson_id):
        course = models.courses.Course(None, self.app_context)
        tracker = UnitLessonCompletionTracker(course)
        p = UnitLessonCompletionTracker.get_or_create_progress(self.student)
        status = tracker.get_html_status(p, unit_id, lesson_id)
        return status or 0

    def add(self, unit_id, lesson_id, nround, index, count, event_key, correct):
        progress_dict = transforms.loads(self.progress.value)
        current_progress = progress_dict[str(unit_id)][str(lesson_id)]

        if len(current_progress) == 0:
            self.set_lesson_status(unit_id, lesson_id, 1)

        #ensure that a list of tries exists
        if nround >= len(current_progress):
            current_progress.append([{}] * count)

        current_progress[nround][index] = {
            "event_key": event_key,
            "correct": correct
        }

        self.progress.value = transforms.dumps(progress_dict)
        self.progress.put()
        
    @classmethod
    def _empty_progress(self, app_context):
        progress_dict = dict()
        course = models.courses.Course(None, app_context=app_context)
        units = course.get_units()
        for unit in units:
            progress_dict[unit.unit_id] = dict()
            lessons = course.get_lessons(unit.unit_id)
            for lesson in lessons:
                progress_dict[unit.unit_id][lesson.lesson_id] = []
        return progress_dict

    @classmethod
    def get_or_create_progress(cls, app_context, student):
        progress = StudentPropertyEntity.get(student, cls.PROPERTY_KEY)
        if not progress:
            progress = StudentPropertyEntity.create(
                student=student, property_name=cls.PROPERTY_KEY)
            progress.value = transforms.dumps(cls._empty_progress(app_context))
            progress.put()

        return cls(app_context, progress, student)


class QuestionnaireTag(tags.BaseTag):

    @classmethod
    def vendor(cls):
        return 'gcb'

    @classmethod
    def name(cls):
        return'Questionnaire'

    def render(self, node, handler):
        questionnaire_url = node.attrib.get('url')
        app_context = sites.get_course_for_current_request()
        unit, lesson = extract_unit_and_lesson(handler)

        user = handler.get_user()
        if user == None:
            saved_questionnaire = []
            status = 0
        else:
            student = Student.get_enrolled_student_by_email(user.email())
            progress = StudentProgress.get_or_create_progress(app_context, student)
            saved_questionnaire = progress.load_lesson(lesson.lesson_id)
            status = progress.get_lesson_status(unit.unit_id, lesson.lesson_id)

        #quickfix-char-errors
        for q in saved_questionnaire:
            q['location'] = ""

        script = """
<script>
    var lesson_questionnaire_%s = %s;
    var lesson_status_%s = %s;
</script>
""" % (lesson.lesson_id, transforms.dumps(saved_questionnaire), lesson.lesson_id, status)
        questionnaire = cElementTree.XML("""
<div id='activityContents' class='video'>
    %s
    <div class='questionnaire' src='%s' data="lesson_questionnaire_%s" status="%s"></div>
</div>
""" % (script, questionnaire_url, lesson.lesson_id, status))
        return questionnaire

    def get_icon_url(self):
        return '/modules/questionnaire/resources/gear.png'

    def get_schema(self, unused_handler):
        reg = schema_fields.FieldRegistry(QuestionnaireTag.name())
        reg.add_property(
            schema_fields.SchemaField('url', 'Questionnaire Url', 'string',
            optional=False,
            description='Provide a Questionnaire Url (e.g. \'assets/lib/questionnaire-1.js\')'))
        return reg

class QuestionnaireRESTHandler(BaseRESTHandler):
    """Provides REST API for an Event."""

    def get(self):
        """Returns a 404 error; this handler should not be GET-accessible."""
        self.error(404)
        return

    def post(self):
        """Receives event and puts it into datastore."""

        COURSE_EVENTS_RECEIVED.inc()
        #can = (
        #    CAN_PERSIST_ACTIVITY_EVENTS.value or
        #    CAN_PERSIST_PAGE_EVENTS.value or
        #    CAN_PERSIST_TAG_EVENTS.value)
        #if not can:
        #    return

        request = transforms.loads(self.request.get('request'))
        if not self.assert_xsrf_token_or_fail(request, 'event-post', {}):
            return

        user = self.get_user()
        if not user:
            return

        source = request.get('source')
        payload_json = request.get('payload')
        payload = transforms.loads(payload_json)

        def record(source, user, data):
            """Records new event into a datastore."""
            event = EventEntity()
            event.source = source
            event.user_id = user.user_id()
            event.data = data
            event.put()
            return event
            
        event = record(source, user, payload_json)
        COURSE_EVENTS_RECORDED.inc()

        source_url = payload['location']
        courses = sites.get_all_courses()

        for app_context in courses:
            if source_url == app_context.get_slug() or source_url.startswith(
                    '%s/' % app_context.get_slug()) or app_context.get_slug() == '/':
                break

        course = models.courses.Course(None, app_context)
        unit_id, lesson_id = get_unit_and_lesson_id_from_url(
            course, source_url)

        student = Student.get_enrolled_student_by_email(user.email())
        progress = StudentProgress.get_or_create_progress(app_context, student)
        if source == "video-end":
            progress.set_lesson_status(unit_id, lesson_id, 2)
            return

        count = int(payload['count']) or 1
        index = int(payload['index']) or 0
        nround = int(payload['nround']) or 0
        correct = bool(payload['correct']) or False
        progress.add(unit_id, lesson_id, nround, index, count, str(event.key()), correct)


custom_module = None


def register_module():
    """Registers this module in the registry."""

    def when_module_enabled():
        # Register custom tags.
        tags.Registry.add_tag_binding('questionnaire', QuestionnaireTag)

    def when_module_disabled():
        # Unregister custom tags.
        tags.Registry.remove_tag_binding('questionnaire', QuestionnaireTag)

    # Add a static handler for icons shown in the rich text editor.
    global_routes = [(
        os.path.join(RESOURCES_PATH, '.*'), tags.ResourcesHandler)]

    questionnaire_handlers = [
#        ('/questionnaire/start', QuestionnaireStartRESTHandler),
#        ('/questionnaire/end', QuestionnaireEndRESTHandler),
        ('/questionnaire/save', QuestionnaireRESTHandler)]

    import modules.dashboard  # pylint: disable-msg=g-import-not-at-top
    from modules.questionnaire import stats  # pylint: disable-msg=g-import-not-at-top
    # register custom dashboard section
    modules.dashboard.dashboard.DashboardRegistry.add_custom_analytics_section(
        stats.PeerReviewStatsHandler)

    global custom_module
    custom_module = custom_modules.Module(
        'Questionnaire tag',
        'A set of tags for rendering questionnaire and gather the results.',
        global_routes + questionnaire_handlers,
        [],
        notify_module_enabled=when_module_enabled,
        notify_module_disabled=when_module_disabled)
    return custom_module
