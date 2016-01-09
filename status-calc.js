var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get('/', function(req, res){
  //res.send('Hello World');
  var filename = "index.html";
  fs.readFile(filename, 'utf8', function(err, data) {
    data = data.replace(/@result-.*@/g,"");
    res.write(data);
    res.end();
  });
});

function getRankRev(rank) {
  switch(rank){
    case 'S': return 30;
    case 'A+': return 28;
    case 'A': return 26;
    case 'A-': return 24;
    case 'B+': return 22;
    case 'B': return 20;
    case 'B-': return 18;
    case 'C+': return 16;
    case 'C': return 14;
    case 'C-': return 12;
    case 'D+': return 10;
    case 'D': return 8;
    case 'D-': return 6;
    case 'E+': return 4;
    case 'E': return 2;
    case 'E-': return 0;
  }
  return 0;
}
function calcHP(lv, statusHp,revHp, ppHp){
  return (Math.ceil((statusHp - 10 - lv) * 100 / lv) - revHp - ppHp)/2;
}

function calcStatus(lv, status, rev, pp, seal){
  var st = (seal)?Math.ceil(status/1.1):status;
  return (Math.ceil((st - 5)*100/lv) - rev - pp)/2;
}

app.post('/calc', function(req, res){
  // ランク補正
  var revHp = getRankRev(req.body['rank-hp']);
  var revAtk = getRankRev(req.body['rank-atk']);
  var revDef = getRankRev(req.body['rank-def']);
  var revSatk = getRankRev(req.body['rank-satk']);
  var revSdef = getRankRev(req.body['rank-sdef']);
  var revSpd = getRankRev(req.body['rank-spd']);
  // ステータス計算
  var lv = req.body['status-lv'];
  var hp = calcHP(lv, req.body['status-hp'], 
                revHp, req.body['pp-hp']);
  var atk = calcStatus(lv, req.body['status-atk'], 
                revAtk, req.body['pp-atk'],
                req.body['seal'] === "red-seal");
  var def = calcStatus(lv, req.body['status-def'], 
                revDef, req.body['pp-def'],
                req.body['seal'] === "blue-seal");
  var satk = calcStatus(lv, req.body['status-satk'], 
                revSatk, req.body['pp-satk'],
                req.body['seal'] === "dark-seal");
  var sdef = calcStatus(lv, req.body['status-sdef'], 
                revSdef, req.body['pp-sdef'],
                req.body['seal'] === "white-seal");
  var spd = calcStatus(lv, req.body['status-spd'], 
                revSpd, req.body['pp-spd'],
                req.body['seal'] === "green-seal");
  var filename = "index.html";
  fs.readFile(filename, 'utf8', function(err, data) {
    data = data.replace(/@result-hp@/g,Math.ceil(hp));
    data = data.replace(/@result-atk@/g,Math.ceil(atk));
    data = data.replace(/@result-def@/g,Math.ceil(def));
    data = data.replace(/@result-satk@/g,Math.ceil(satk));
    data = data.replace(/@result-sdef@/g,Math.ceil(sdef));
    data = data.replace(/@result-spd@/g,Math.ceil(spd));
    res.write(data);
    res.end();
  });
});

http.createServer(app).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');
