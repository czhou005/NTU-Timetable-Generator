String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

exports.convertFormat = cal => {
  const columns = {
    'MON': [], 'TUE': [], 'WED': [], 'THU': [], 'FRI': []
  };

  for (key in cal.timetable) {
    for (obj of cal.timetable[key]) {
      columns[obj.day].push({
        time: obj.time.split('-')[0],
        text: `${key}-${obj.venue}-${obj.type.slice(0, 3)}-${obj.group}`,
        size: 1,
        startWeek: obj.remark == '' ? 1 : obj.remark[obj.remark.indexOf('Wk') + 2],
        altWeek: obj.remark.indexOf('3,5,7') != -1 || obj.remark.indexOf('4,6,8') != -1,
        loc: obj.loc,
      });
    }
  }

  function getAllIndexes(arr, val) {
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i + 1)) != -1) {
      indexes.push(i);
    }
    return indexes.sort((a,b) => a < b);
  }

  for (key in columns) {
    columns[key].sort((a,b) => a.time > b.time)
    let prev;
    let allTexts = columns[key].map(d => d.text);
    for (let i = 0; i < columns[key].length; i++) {
      const indexes = getAllIndexes(allTexts, columns[key][i].text);
      
      columns[key][i].size = indexes.length;
      for (let q = 0; q < indexes.length - 1; q++) {
        columns[key].splice(indexes[q], 1);
        allTexts = columns[key].map(d => d.text);
      }
    }
  }

  const convertDate = date => {
    const results = date.split(' ');
    results[1] = results[1].slice(0, 3);
    results[2] = results[2].slice(2, 4);
    return results.join('-').toUpperCase()
  }

  const convertTime = time => {
    let hours = parseInt(time.split('.')[0]);
    const mins = time.split('.')[1].split(' ')[0];
    if (time.indexOf('am') == -1)
      hours += 12;
    return `${("0" + hours).slice(-2)}:${mins}`;
  }

  columns['EXAMS'] = Object.keys(cal.exams)
    .map(key => cal.exams[key])
    .map(exam => ({
      // "text": "CE3007 Digital Signal Processing",
      text: `${exam.course} ${exam.title}`,
      // "date": "28-NOV-18 1300",
      date: `${convertDate(exam.date)} ${convertTime(exam.time)}`,

      size: parseInt(exam.duration),
    }));

  return columns;
};

// const fs = require('fs');
// fs.writeFile(
//   'converted.json',
//   JSON.stringify(
//     exports.convertFormat(require('./cal.json'))
//   )
// );
