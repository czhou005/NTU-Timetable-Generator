// With the following params specified, search for the respective timetables.
const fs = require('fs');
var moment = require('moment');

// Params
const modules = [
  {
    index: '10068',
    code: 'CE3006'
  },
  {
    index: '10070',
    code: 'CE3007'
  },
  {
    index: '10077',
    code: 'CE4032'
  },
  {
    index: '10079',
    code: 'CE4045'
  }
]

const dept = 'CE'
const acadYear = '2018';
const acadSem = '1';
const acadStartDate = '2018-08-13';
var startDate = moment('2018-08-13'); // First day of school (Monday)
var breakDate = moment('2018-10-01'); // This week will not be counted
const timetable = require('./timetable');
const exams = require('./exams');
const maps = require('../maps_location');
const convert = require('./convert');
const calendar = require('./tocal');

let cal, examDates;

// Fetch Timetable Structure
Promise.all(
  modules.map(mod => timetable.fetchTimetable(acadYear, acadSem, mod.code))
)
.then(results => {
  cal = modules.reduce((obj, mod, i) => {
    obj[mod.code] = results[i][mod.index];
    return obj;
  }, {});
  // Fetch Exam Dates
  return exams.getExams(dept, acadYear, acadSem, modules.map(mod => mod.code));
})
.then(results => {
  examDates = results;
  // Fetch venue lat lng
  const venues = Object.keys(cal)
    .map(key => cal[key])
    .reduce((acc, val) => acc.concat(val), [])
    .map(obj => obj.venue)
    .filter((v, i, a) => a.indexOf(v) === i);

  console.log(venues);
  return Promise.all(venues.map(venue => maps.getDetails(venue)));
})
.then(results => {
  const locs = maps.getResults();
  // Write the location object into the array
  for (var key in cal) {
    console.log(key);
    for (var obj of cal[key]) {
      obj.loc = locs[obj.venue];
      console.log(obj);
    }
  }

  fs.writeFile('calendar.json', JSON.stringify({
    timetable: cal,
    exams: examDates,
  }));

  // Process for NTU Timetable Generator Format
  const converted = convert.convertFormat({
    timetable: cal,
    exams: examDates,
  });

  calendar.convert(startDate, breakDate, converted);
  fs.writeFile('converted.json', JSON.stringify(converted));
  console.log("Calendar Written");
});



