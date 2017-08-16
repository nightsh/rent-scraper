const request = require('request');
const cheerio = require('cheerio');
const async   = require('async');
const format  = require('util').format;

const numberOfRooms = [1, 2];
const minPrice      = 100;
const maxPrice      = 300;
const minSurface    = 30;
const maxSurface    = 60;

const concurrency = 2;

const baseUrl = 'https://www.olx.ro/imobiliare/apartamente-garsoniere-de-inchiriat';

const buildQuery = function(numberOfRooms) {
  numberOfRoomsMap = {
    "1": "1-camera",
    "2": "2-camere",
    "3": "3-camere",
    "4": "4-camere"
  };

  let target = `${baseUrl}/${numberOfRoomsMap[numberOfRooms]}/cluj-napoca/`;
  target += `?search%5Bfilter_float_price%3Afrom%5D=${minPrice}`;
  target += `&search%5Bfilter_float_price%3Ato%5D=${maxPrice}`;
  target += `&search%5Bfilter_float_m%3Afrom%5D=${minSurface}`;
  target += `&search%5Bfilter_float_m%3Ato%5D=${maxSurface}`;

  //console.log(numberOfRooms);

  return target;
};

async.eachLimit(numberOfRooms, concurrency, function (rooms, next) {
    const url = buildQuery(rooms);
    request(url, function (err, response, body) {
      if (err) throw err;
      const $ = cheerio.load(body);
      let result = {};
      $('td.offer').each(function () {
        let link  = $(this).find('a.detailsLink.link').attr('href') || '';
        let title = $(this).find('a.detailsLink.link>strong').text() || '';
        let price = $(this).find('p.price>strong').text();

        let id = link.split('-').pop().split('.html')[0];

        result[id] = {
          title,
          link,
          price
        };
      });
      console.log(result);
      next();
    });
});
