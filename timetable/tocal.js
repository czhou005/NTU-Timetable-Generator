var ical = require('ical-generator');
var cal = ical({ name: 'NTU School' });
var moment = require('moment');
var fs = require('fs');

// PARAMETERS 
var numOfWeeks = 13;
// PARAMETERS 

exports.convert = (startDate, breakDate, data) => {
  // var data = JSON.parse(fs.readFileSync('timetable.json'));
  var cWeek; // Current Week
  for (cWeek = 1; cWeek <= numOfWeeks; cWeek++) {
    var q = 0;
    cal.createEvent({
      start: moment(startDate).add(1, 'day').toDate(),
      allDay: true,
      summary: "Week " + cWeek
    });

    const columns = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    for (q = 0; q < columns.length; q++) {
      const col = columns[q];
      data[col].map(lesson => {
        // Start Week must be equal or larger than lesson start week and do not show in alternate weeks
        if (lesson.startWeek <= cWeek && (!lesson.altWeek || lesson.startWeek % 2 == cWeek % 2)) {
          const lessonDate = moment(startDate).add(q, 'days').add(lesson.time.substr(0, 2), 'h').add(parseInt(lesson.time.substr(2, 2)), 'm');
          cal.createEvent({
            start: lessonDate.toDate(),
            end: lessonDate.add(lesson.size, 'h').toDate(),
            summary: lesson.text,
            location: `${lesson.loc.location[0]}, ${lesson.loc.location[1]}`,
          });
        }
      });
    }

    // Increment Dates
    startDate.add(7, 'days');
    // Add break date
    if (startDate.diff(breakDate, 'minutes') == 0) {
      startDate.add(7, 'days');
    }
  }

  // Process Exams
  data['EXAMS'].map(exam => {
    const examDate = moment(exam.date, 'DD-MMM-YY HHmm');
    cal.createEvent({
      start: examDate.toDate(),
      end: examDate.add(exam.size, 'h').toDate(),
      summary: "[EXAM] " + exam.text,
    });
  })

  fs.writeFileSync('ntu.ical', cal.toString());
}

// var startDate = moment('2018-08-13'); // First day of school (Monday)
// var breakDate = moment('2018-10-01'); // This week will not be counted
// exports.convert(startDate, breakDate, require('./converted.json'));