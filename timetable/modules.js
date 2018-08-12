// Search for Modules - https://wish.wis.ntu.edu.sg/webexe/owa/aus_subj_cont.main
// Example: {
//   CZ4062: 'COMPUTER SECURITY (SYSTEM SECURITY)',
//   CZ4064: 'SECURITY MANAGEMENT',
//   CZ4068: 'APPLICATION SECURITY',
// }

const courses = [
  'GLOAD; CE; X; F',
  'GLOAD; CSC; X; F',
]

const acadYear = '2018';
const acadSem = '1';

var request = require("request");
var fs = require("fs");
var moduleList = {};

setTimeout(() => {
  fs.writeFile('modules.json', JSON.stringify(moduleList));
}, 1000);

courses.map(course => {
  var options = {
    method: 'POST',
    url: 'https://wish.wis.ntu.edu.sg/webexe/owa/AUS_SUBJ_CONT.main_display1',
    headers:
    {
      'Postman-Token': 'cf783772-7211-4562-922d-48bc7778dc48',
      'Cache-Control': 'no-cache'
    },
    formData: 
    {
      acadsem: [`${acadYear}_${acadSem}`],
      r_course_yr: course,
      r_subj_code: 'Enter+Keywords+or+Course+Code',
      boption: 'CLoad',
      acad: acadYear,
      semester: acadSem
    }
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    const cheerio = require('cheerio');
    const $ = cheerio.load(body);

    console.log(`Course Done: ${course}`);
    moduleList = Object.assign(moduleList, 
      $('td[width=100]').parent().map(function (i, el) {
        return [$(this).find('font').map(function (i, el) {
          return $(this).text().trim();
        }).get()]
      }).get().reduce((obj, curr) => {
        obj[curr[0]] = curr[1];
        return obj;
      }, {}));
  });

});