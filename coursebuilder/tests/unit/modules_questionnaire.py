__author__ = 'sergio@perceptum.nl'

import unittest
from xml.etree import cElementTree
from common import tags

import re
from models import transforms
import modules.questionnaire.questionnaire as questionnaire 
from modules.questionnaire.questionnaire import StudentProgress
from tests.functional import actions
from models.models import Student, StudentPropertyEntity, EventEntity
from controllers import sites
import models.courses

def save_progress(browser):
    """Views /preview page."""
    response = browser.get('preview')
    assert_contains(' the stakes are high.', response.body)
    assert_contains(
        '<li><p class="gcb-top-content">Pre-course assessment</p></li>',
        response.body)

    assert_contains_none_of(UNIT_HOOK_POINTS, response.body)
    assert_contains_all_of(PREVIEW_HOOK_POINTS, response.body)

    return response

#class QuestionDAOTestCase(actions.TestBase):
#class QuestionnaireTests(unittest.TestCase):
class QuestionnaireTests(actions.TestBase):
    """Unit tests for the custom tag functionality."""

    def setUp(self):
        super(QuestionnaireTests, self).setUp()
        email = "test@example.com"
        name = "test"

        actions.login(email)
        actions.register(self, name)

        self.student = Student.get_enrolled_student_by_email(email)
        self.app_context = sites.get_all_courses()[0]
        self.progress = StudentProgress.get_or_create_progress(self.app_context, self.student)

    def tearDown(self):
        pass

    def test_set_up(self):
        self.assertIsNotNone(self.student)

    def test_get_or_create_progress(self):
        self.assertIsNotNone(self.progress)
        self.assertIsInstance(StudentPropertyEntity.all().get(), StudentPropertyEntity)

        response = self.get('course')
        # Extract XSRF token from the page.
        match = re.search(r'eventXsrfToken = [\']([^\']+)', response.body)
        assert match
        xsrf_token = match.group(1)

        request = { 
            "source": "questionnaire-results",
            "payload": transforms.dumps({
                "results": "bleaa",
                "unit": 4,
                "lesson": 4,
                "nround": 0,
                "index": 0,
                "count": 10,
                "location": "/unit?unit=87",
                "correct": True
            }),
            "xsrf_token": xsrf_token
        }
        response = self.post('questionnaire/save', {"request":transforms.dumps(request)})

        request = { 
            "source": "questionnaire-results",
            "payload": transforms.dumps({
                "results": "ble",
                "unit": 4,
                "lesson": 4,
                "nround": 0,
                "index": 1,
                "count": 10,
                "location": "/unit?unit=87",
                "correct": False
            }),
            "xsrf_token": xsrf_token
        }
        response = self.post('questionnaire/save', {"request":transforms.dumps(request)})

        request = { 
            "source": "questionnaire-results",
            "payload": transforms.dumps({
                "results": "ble",
                "unit": 4,
                "lesson": 4,
                "nround": 0,
                "index": 2,
                "count": 10,
                "location": "/unit?unit=87",
                "correct": False
            }),
            "xsrf_token": xsrf_token
        }
        response = self.post('questionnaire/save', {"request":transforms.dumps(request)})

        progress = StudentProgress.get_or_create_progress(self.app_context, self.student)
        p = progress.value
        self.assertEqual(len(p["87"]["1"]), 1)
        self.assertEqual(len(p["87"]["1"][0]), 10)

        saved_results = progress.load_lesson(1)
        self.assertEqual(len(saved_results), 3)

        saved_results = progress.load_lesson(2)
        self.assertEqual(len(saved_results), 0)

        response = self.get('/unit?unit=87')

    def test_unit_and_lesson_id_from_url(self):
        course = models.courses.Course(None, app_context=self.app_context)
        unit_id, lesson_id = questionnaire.get_unit_and_lesson_id_from_url(course, '/unit?unit=87')
        self.assertEqual(unit_id, "87")
        self.assertEqual(lesson_id, 1)

    def test_load_status(self):
        progress = StudentProgress.get_or_create_progress(self.app_context, self.student)
        course = models.courses.Course(None, app_context=self.app_context)
        unit_id, lesson_id = questionnaire.get_unit_and_lesson_id_from_url(course, '/unit?unit=87')
        status = progress.get_lesson_status(unit_id, lesson_id)
        self.assertEqual(status, 0)
        progress.set_lesson_status(unit_id, lesson_id, 2)
        status = progress.get_lesson_status(unit_id, lesson_id)
        self.assertEqual(status, 2)
    
        

        


