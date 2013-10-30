__author__ = 'sergio@perceptum.nl'

import unittest
from xml.etree import cElementTree
from common import tags

import re
from models import transforms
from modules.questionnaire.questionnaire import StudentProgress
from tests.functional import actions
from models.models import Student, StudentPropertyEntity, EventEntity
from controllers import sites

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

        class SimpleTag(tags.BaseTag):
            def render(self, unused_arg, unused_handler):
                return cElementTree.Element('SimpleTag')

        class ComplexTag(tags.BaseTag):
            def render(self, unused_arg, unused_handler):
                return cElementTree.XML(
                    '<Complex><Child>Text</Child></Complex>')

        class ReRootTag(tags.BaseTag):
            def render(self, node, unused_handler):
                elt = cElementTree.Element('Re')
                root = cElementTree.Element('Root')
                elt.append(root)
                for child in node:
                    root.append(child)
                return elt

        def new_get_tag_bindings():
            return {
                'simple': SimpleTag,
                'complex': ComplexTag,
                'reroot': ReRootTag}

        self.old_get_tag_bindings = tags.get_tag_bindings
        tags.get_tag_bindings = new_get_tag_bindings

        self.mock_handler = object()

    def tearDown(self):
        pass

    def test_get_or_create_progress(self):
        email = "test@example.com"
        name = "test"

        actions.login(email)
        actions.register(self, name)
        student = Student.get_enrolled_student_by_email(email)
        self.assertIsNotNone(student)
        app_context = sites.get_all_courses()[0]
        progress = StudentProgress.get_or_create_progress(app_context, student)
        self.assertIsNotNone(progress)
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

        progress = StudentProgress.get_or_create_progress(app_context, student)
        p = progress.value
        self.assertEqual(len(p["87"]["1"]), 1)
        self.assertEqual(len(p["87"]["1"][0]), 10)

        saved_results = progress.load_lesson(1)
        self.assertEqual(len(saved_results), 3)

        saved_results = progress.load_lesson(2)
        self.assertEqual(len(saved_results), 0)

        response = self.get('/unit?unit=87')
        print response.body
        

        


