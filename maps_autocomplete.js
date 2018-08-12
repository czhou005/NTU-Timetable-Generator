// Example: 
// [ 
//   'hardware & embedded systems lab (hesl)',
//   'hardware lab 1',
//   'hardware lab 2',
//   'hardware lab 3',
// ]

var request = require("request");

var options = {
  method: 'GET',
  url: 'http://maps.ntu.edu.sg/a/otto',
  qs: { q: 'hardware' },
};

request(options, function (error, response, body) {
  if (error) throw new Error(error);

  console.log(body.split('\n'));
});
