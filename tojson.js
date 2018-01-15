const fs = require('fs');
const cheerio = require('cheerio');

const c = console.log;
const $ = cheerio.load(fs.readFileSync('./timetable.html'));

const timetable = $('table').eq(1);
const details = $('table').eq(2);

// Handle Timetable
const timetableData = timetable.find('tr').map(function (i, el) {
  return [$(this).find('td').map(function (i, el) {
    if ($(this).text().trim() === '') {
      return ''
    } else {
      return {
        text: $(this).text().trim(),
        size: $(this).attr('rowspan') ? $(this).attr('rowspan') : 1
      }
    }
  }).get()];
}).get();

timetableData.splice(0, 1);
const columns = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const time = ['0830-0930', '0930-1030', '1030-1130', '1130-1230', '1230-1330', '1330-1430', '1430-1530', '1530-1630', '1630-1730', '1730-1830', '1830-1930', '1930-2030', '2030-2130', '2130-2230', '2230-2330'];
var i = 0;
var struct = {};

for (i = 0; i < columns.length; i++) {
  struct[columns[i]] = {};

  var q = 0;
  for (q = 0; q < timetableData.length; q++) {
    const d = timetableData[q];

    if (d[i + 1]) {
      // When the size is bigger than one add extra padding to the next row
      if (d[i + 1].size == 2) {
        timetableData[q + 1].splice(i + 1, 0, '');
      } else if (d[i + 1].size == 3) {
        timetableData[q + 1].splice(i + 1, 0, '');
        timetableData[q + 2].splice(i + 1, 0, '');
      }

      struct[columns[i]][d[0].text] = {
        text: d[i + 1].text,
        size: d[i + 1].size,
      }
    }
  }
}

// var time = null;
// var final = {};
// var result = timetableData.splice(1).reduce(function (re, row) {
//   re[row[0].text] = row.reduce(function (su, field, index) {
//     if (field !== '' && index != 0)
//       su[columns[index]] = field;
//     return su
//   }, {});
//   return re;
// }, {});

// c(result);

// Further processing on json
columns.map(col => {
  const day = struct[col];
  struct[col] = Object.keys(day).map(time => {
    var lesson = day[time];
    var hasWeeks = lesson.text.match("Wk(.)");
    var startWeek = 1;
    var altWeek = false;
    
    if (hasWeeks) {
      startWeek = hasWeeks[1];
      if (lesson.text.match("3,5,7") || lesson.text.match("2,4,6")) { // Alternate weeks
        altWeek = true;
      }
    }

    return {
      time: time.split('-')[0],
      text: lesson.text,
      size: lesson.size,
      startWeek,
      altWeek
    }
  })
});

// Handle exams
const detailsData = details.find('tr').map(function (i, el) {
  return [$(this).find('td').map(function (i, el) {
    return $(this).text().trim();
  }).get()];
}).get();

struct['EXAMS'] = detailsData.slice(1, detailsData.length - 1).map(data => ({
  text: data[1] + " " + data[2],
  date: data[4].substr(0, data[4].lastIndexOf('-')),
  size: 2,
})).filter(data => data.date.length > 5);

fs.writeFileSync('timetable-new.json', JSON.stringify(struct));