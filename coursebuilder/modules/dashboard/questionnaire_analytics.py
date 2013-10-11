
def calculate():
    stats = transforms.loads(job.output)
    stats_calculated = True

    cr = courses.Course(self).get_units()

    subtemplate_values['enrolled'] = stats['enrollment']['enrolled']
    subtemplate_values['unenrolled'] = (
        stats['enrollment']['unenrolled'])
    subtemplate_values['submissions'] =  stats['id']

    scores = []
    total_records = 0
    names = []
    submissions = {}
    students = {}
    data = []

    for key, value in stats['id'].items():
        students[key] = value

    course = courses.Course(self)
    problems = course.get_assessment_list()
    assessments = dict( (a.unit_id, a.title) for a in problems)

    struct = {}
    unit_list = []
    units = course.get_units()
    for u in units:
        if u.type == 'U':
            lessons = course.get_lessons(u.unit_id)    
            lesson_dict = {}
            for l in lessons:
                single = {}
                single['lesson_unit_idx'] = u._index
                single['lesson_unit'] = l.unit_id
                single['lesson_id'] = l.lesson_id
                single['lesson_title'] = l.title
                lesson_dict[l._index] = single
            struct[u._index] = {}
            struct[u._index]['id'] = u.unit_id
            struct[u._index]['title'] = u.title
            struct[u._index]['lessons'] = lesson_dict
            struct[u._index]['lesson_count'] = len(lesson_dict)

    inv_map = {}
    for k, v in struct.items():
        inv_map[v['id']] = {}
        for l_num, l_con in v['lessons'].items():
            inv_map[v['id']][l_con['lesson_id']] = [k, l_num]

    for sname, sid in students.items():
        st = Student.get_student_by_user_id(sid)
        sc = course.get_all_scores(st)
        data.append({'name': sname, 'scores': sc})
    
    for key, value in stats['scores'].items():
        total_records += value[0]
        avg = round(value[1] / value[0], 1) if value[0] else 0
        scores.append({'key': key, 'completed': value[0],
                       'avg': avg})

    activity = self.get_activity(inv_map)

    att_scores = {}
    avs_st = {}
    for name in activity.keys():
        attempt_scores = []
        av_sum = 0
        count = 0
        for k, v in struct.items():
            for les, les1 in v['lessons'].items():
                idxs = [les1['lesson_unit'], les1['lesson_id']]
                sc = self.get_attempt_scores(name, activity,
                    idxs[0], idxs[1])
                if sc[0] == -1:
                    sc[0] = '-'
                    attempt_scores.append(sc)
                else:
                    av_sum += sc[0]
                    count += 1
                    sc[0] = '{0:.0%}'.format(sc[0])
                    attempt_scores.append(sc)
        att_scores[name] = attempt_scores
        if count != 0:
            avs_st[name] = '{0:.0%}'.format(av_sum/count)
        else:
            avs_st[name] = '-'

    logging.error(len(att_scores))
    count = len(att_scores.itervalues().next())
    sums = [0] * count
    counts = [0] * count
    avs_ex = [0] * count
    for k, v in att_scores.items():
        exer = 0
        for entry in v:
            if entry[0] != '-':
                entry = entry[0].strip('%')
                sums[exer] += float(entry)
                counts[exer] += 1
            exer += 1

    for i in range(0,count):
        if counts[i] != 0:
            avs_ex[i] = float(sums[i]) / float(counts[i])
            avs_ex[i] = '{0:.0%}'.format(avs_ex[i] / float(100))
        else:
            avs_ex[i] = '-'

    subtemplate_values['att_scores'] = att_scores
    subtemplate_values['averages_st'] = avs_st
    subtemplate_values['averages_ex'] = avs_ex
    subtemplate_values['scores'] = scores
    subtemplate_values['total_records'] = total_records
    subtemplate_values['names'] = names
    subtemplate_values['data'] = data
    subtemplate_values['struct'] = struct

    update_message = safe_dom.Text("""
        Enrollment and assessment statistics were last updated at
        %s in about %s second(s).""" % (
            job.updated_on.strftime(HUMAN_READABLE_TIME_FORMAT),
            job.execution_time_sec))
