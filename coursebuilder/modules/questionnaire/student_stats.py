# Copyright 2012 Google Inc. All Rights Reserved.
#
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

"""Classes for displaying peer review analytics."""

__author__ = 'Sean Lip (sll@google.com)'


import os

from common import safe_dom
from controllers.utils import ApplicationHandler
from controllers.utils import HUMAN_READABLE_TIME_FORMAT
import jinja2
from models import courses
from models import jobs
from models import transforms
from models import utils
from modules.review import peer


class ReviewStatsAggregator(object):
    """Aggregates peer review statistics."""

    def __init__(self):
        # This dict records, for each unit, how many submissions have a given
        # number of completed reviews. The format of each key-value pair is
        #     unit_id: {num_reviews: count_of_submissions}
        self.counts_by_completed_reviews = {}

    def visit(self, review_summary):
        unit_id = review_summary.unit_id
        if unit_id not in self.counts_by_completed_reviews:
            self.counts_by_completed_reviews[unit_id] = {}

        count = review_summary.completed_count
        if count not in self.counts_by_completed_reviews[unit_id]:
            self.counts_by_completed_reviews[unit_id][count] = 1
        else:
            self.counts_by_completed_reviews[unit_id][count] += 1


class ComputeQuestionnaireStats():
    """A job for computing peer review statistics."""
    def __init__(self, app_context):
        self.app_context = app_context

    def run(self):
        pass

    def submit(self):
        return None
    
    def load(self): 
        return None


class PeerReviewStatsHandler(ApplicationHandler):
    """Shows peer review analytics on the dashboard."""

    # The key used in the statistics dict that generates the dashboard page.
    # Must be unique.
    name = 'questionnaire_stats'
    # The class that generates the data to be displayed. It should have a
    # get_stats() method.
    stats_computer = ComputeQuestionnaireStats

    def get_markup(self, job=None):
        """Returns Jinja markup for peer review analytics."""
        from models.models import Student
        from modules.questionnaire.questionnaire import StudentProgress
        students = Student.all().fetch(10000)
        for s in students:
            progress = StudentProgress.get_or_create_progress(self.app_context, s)
            setattr(s, "progress", progress)

        from models.courses import Course
        self.course = Course(self)
        units = self.course.get_units()
        for _unit in units:
            lessons = self.course.get_lessons(_unit.unit_id)
            setattr(_unit, "lessons",  lessons)

        return jinja2.utils.Markup(self.get_template(
            'student_stats.html', [os.path.dirname(__file__)]
        ).render({
            'students': students,
            'units': units
        }, autoescape=True))
