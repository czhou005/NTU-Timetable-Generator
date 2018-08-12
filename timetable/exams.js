// Search for Exam Schedule - https://wis.ntu.edu.sg/webexe/owa/exam_timetable_und.main
// Fetches all CE dept exams
// Example: {
//   'CZ2001':
//   {
//     date: '27 November 2018',
//     day: 'Tuesday',
//     time: '9.00 am',
//     course: 'CZ2001',
//     title: 'ALGORITHMS',
//     duration: '2'
//   }
// }

// PARAMS
// const dept = 'CE'
// const acadYear = '2018';
// const acadSem = '1';

var request = require("request");
var fs = require("fs");
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');

exports.getExams = (dept, acadYear, acadSem, modules) => {
  return new Promise((res,rej) => {
    var options = {
      method: 'POST',
      url: 'https://wis.ntu.edu.sg/webexe/owa/exam_timetable_und.Get_detail',
      headers:
      {
        'Postman-Token': '247734fc-ba72-418c-9fd7-8bdf6a56d1c1',
        'Cache-Control': 'no-cache',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
      },
      formData:
      {
        p_exam_dt: '',
        p_start_time: '',
        p_dept: dept,
        p_subj: '',
        p_venue: '',
        p_matric: '',
        academic_session: `Semester+${acadSem}+Academic+Year+${acadYear}-${acadYear + 1}`,
        p_plan_no: '3',
        p_exam_yr: acadYear,
        p_semester: acadSem,
        bOption: 'Next'
      }
    };

    const trimData = data => data.map(d => d.trim());

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      const $ = cheerio.load(body)
      cheerioTableparser($);
      var data = $("table").parsetable();

      const dates = trimData(data[0]);
      const days = trimData(data[1]);
      const times = trimData(data[2]);
      const courses = trimData(data[3]);
      const titles = trimData(data[4]);
      const durations = trimData(data[5]);

      const content = courses.reduce((obj, course, i) => {
        obj[course] = {
          date: dates[i],
          day: days[i],
          time: times[i],
          course: courses[i],
          title: titles[i],
          duration: durations[i],
        }
        return obj;
      }, {});

      fs.writeFile('exams.json', JSON.stringify(content));
      console.log("File Written");

      return res(Object.keys(content)
        .filter(key => modules.includes(key))
        .reduce((obj, key) => {
          obj[key] = content[key];
          return obj;
        }, {}));
    });

  });
}