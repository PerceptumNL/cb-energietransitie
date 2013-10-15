
import json
f=open("course.json")
course=json.load(f)

units=course['units']
#{u'html_review_form': None, u'html_check_answers': False, u'now_available': False, u'weight': 0, u'title': u'Introductie', u'html_content': None, u'release_date': u'', u'unit_id': 87, u'href': None, u'workflow_yaml': u'grader: auto\n', u'type': u'U'}

u=open("unit.csv","w")
id=1
u.write("id,type,unit_id,title,release_date,now_available\n")
for unit in units:
    u.write("%s,%s,%s,%s,%s,%s\n" % (id, unit['type'], unit['unit_id'], unit['title'], unit['release_date'], 'True'))
    id=id+1
u.close()

def get_by_unit_id(unit_id):
    for unit in units:
        if unit_id == unit['unit_id']:
            return unit
    return False

#{u'scored': False, u'now_available': False, u'title': u'Video questionnaire', u'has_activity': True, u'objectives': u'<gcb-activity activityid="activity-86.js" instanceid="1SKmEMCOlA5V"></gcb-activity><br>', u'unit_id': 43, u'activity_title': u'', u'video': u'', u'lesson_id': 86, u'duration': u'', u'notes': u'', u'activity_listed': True}

id=1
l=open("lesson.csv","w")
l.write("unit_id,unit_title,lesson_id,lesson_title,lesson_activity,lesson_activity_name,lesson_notes,lesson_video_id,lesson_objectives\n")
lessons=course['lessons']
last_unit = {}
for lesson in lessons:
    unit=get_by_unit_id(lesson['unit_id'])
    
    if unit['unit_id'] in last_unit:
        last_unit[unit['unit_id']]= last_unit[unit['unit_id']]+1
    else:
        last_unit[unit['unit_id']]=1
    #if unit != last_unit: 
    #    id = 1
    #last_unit = unit
    l.write("%s,%s,%s,%s,%s,%s,%s,%s,%s\n" % (
        lesson['unit_id'],
        unit['title'],
        last_unit[unit['unit_id']], #lesson['lesson_id'],
        #lesson['lesson_id'],
        lesson['title'],
        "yes" if lesson['activity_listed'] else "",
        lesson['activity_title'],
        lesson['notes'],
        lesson['video'],
        lesson['objectives']))
    
    #print lesson['unit_id'], 
    id = id+1



