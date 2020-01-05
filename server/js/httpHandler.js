const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');
const queue = require('./messageQueue');

// Path for the background image ///////////////////////
module.exports.backgroundImageFile = path.join('.', 'background.jpg');
////////////////////////////////////////////////////////

let messageQueue = null;
module.exports.initialize = (queue) => {
  messageQueue = queue;
};

module.exports.router = (req, res, next = ()=>{}) => {
  // console.log('Serving request type ' + req.method + ' for url ' + req.url);

  if(req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  }
  if(req.url === '/?move') {
    res.writeHead(200, headers);
    res.write(['up','down','left','right'][Math.floor(Math.random() * 4)]);
    res.end();
  }
  if(req.url === '/?serverInput') {
    res.writeHead(200, headers);
    res.write(queue.dequeue());
    res.end();
  }
  if(req.url === '/background.jpg' && req.method === 'GET') {
    fs.readFile(module.exports.backgroundImageFile, (err, fileData) => {
      if (err) {
        res.writeHead(404);
      } else {
        res.writeHead(200, {
          'Content-Type': 'image/jepg',
          'Content-Length': fileData.length
        });
        res.write(fileData, 'binary');
      }
      res.end();
    });

    // var file = path.join(__dirname, 'background.jpg');
    // var image = fs.readFileSync(file);
    // if(image === undefined) {
    //   res.writeHead(404, headers);
    // } else {
    //   headers['content-type'] = 'image/jpeg';
    //   res.writeHead(200, headers);
    //   res.write(image)
    // }
    // res.end();
  }
  if(req.url === '/background.jpg' && req.method === 'POST') {

    var picData = Buffer.alloc(0);

    req.on('data', function (chunk){

      picData = Buffer.concat([picData, chunk]);
    });
    req.on('end', function(){

      var file = multipart.getFile(picData);

      fs.writeFile(module.exports.backgroundImageFile, file.data, function(err){
        if(err) {
          res.writeHead(404, headers);
        } else {
          res.writeHead(200, headers);
        }
        res.end();
        next();
      });
    });
  }
  next(); // invoke next() at the end of a request to help with testing!
};
