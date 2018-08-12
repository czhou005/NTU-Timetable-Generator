// Search for Class Schedule - https://wish.wis.ntu.edu.sg/webexe/owa/aus_schedule.main
// Example: {
//   '10267':
//   [{
//     type: 'LEC/STUDIO',
//     group: 'CS3',
//     day: 'THU',
//     time: '1430-1530',
//     venue: 'LT11',
//     remark: ''
//   },
//   {
//     type: 'LEC/STUDIO',
//     group: 'CS3',
//     day: 'TUE',
//     time: '1530-1630',
//     venue: 'LT11',
//     remark: ''
//   }]
// }

var request = require("request");
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser');

// Processing for fetching timetable data
const removeBold = data => data.map(d => d.replace('<b>', '').replace('</b>', ''));

const getIndexes = data => {
  const indexes = removeBold(data[0]);
  const arr = indexes.filter(index => index.length > 0);
  arr.shift();
  return arr.map(curr => ({
    index: indexes.indexOf(curr),
    text: curr
  }));
}

const getContent = data => {
  const indexes = getIndexes(data);
  const lastInd = data[0].length - 1;
  const content = {};

  indexes.map((index, i) => {
    const currIndex = indexes[i].index;
    const nextIndex = i + 1 == indexes.length ?
      data[0].length :
      indexes[i + 1].index;

    const types = removeBold(data[1]).slice(currIndex, nextIndex);
    const groups = removeBold(data[2]).slice(currIndex, nextIndex);
    const days = removeBold(data[3]).slice(currIndex, nextIndex);
    const times = removeBold(data[4]).slice(currIndex, nextIndex);
    const venues = removeBold(data[5]).slice(currIndex, nextIndex);
    const remarks = removeBold(data[6]).slice(currIndex, nextIndex);

    content[index.text] = types.map((type, i) => ({
      type,
      group: groups[i],
      day: days[i],
      time: times[i],
      venue: venues[i],
      remark: remarks[i],
    }));
  })

  return content;
}


exports.fetchTimetable = (acadYear, acadSem, code) => {
  return new Promise((res, rej) => {
    var options = {
      method: 'POST',
      url: 'https://wish.wis.ntu.edu.sg/webexe/owa/AUS_SCHEDULE.main_display1',
      headers:
      {
        'Postman-Token': '5477c25a-a659-4e72-aaf3-ace4cc63103c',
        'Cache-Control': 'no-cache',
        'content-type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
      },
      formData:
      {
        acadsem: `${acadYear} ${acadSem}`,
        r_course_yr: '',
        r_subj_code: code,
        r_search_type: 'F',
        boption: 'Search',
        staff_access: 'false'
      }
    };

    // Fetching Request
    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      const $ = cheerio.load(body)
      cheerioTableparser($);
      var data = $("table").eq(1).parsetable();

      res(getContent(data));
    });
  });
};


