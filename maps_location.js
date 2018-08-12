// Example: 
// {
//   location: [1.34628255696, 103.68084355793],
//   floorplan: 'http://maps.ntu.edu.sg/static/floorplans/NS%205TH%20LEVEL.gif',
//   unit: 'NS2-05-30',
//   name: 'Tutorial Room + 37'
// }

var request = require("request");

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

const locCache = {};

exports.getResults = () => locCache;

exports.getDetails = location => {
  return new Promise((res,rej) => {
    if (location in locCache) {
      console.log("Returning from Cache");
      return res(locCache[location]);
    }

    // Replace acronyms
    let processed = location.toLowerCase()
      .replace('swlab', 'Software Lab ')
      .replace('hwlab', 'Hardware Lab ')
      .replace('tr+', 'Tutorial Room + ')

    var options = {
      method: 'GET',
      url: 'http://maps.ntu.edu.sg/a/search',
      qs: { q: processed },
      
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      const json = JSON.parse(body);  
      const result = json.what.businesses[0];

      locCache[location] = {
        location: result.location.geometry.location,
        floorplan: result.more_info.floorplan == '' ? 
          '' :
          `http://maps.ntu.edu.sg/static/floorplans/${result.more_info.floorplan.replaceAll(' ', '%20')}.gif`,
        unit: result.unit_number,
        name: result.name,
      };

      return res(locCache[location]);
    });
  });
};