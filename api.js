"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
let mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const app = express();
const bodyParser = require('body-parser');
var cors = require('cors');
const multer = require("multer");
const fs = require("fs");
const webp = require("webp-converter");
const sharp = require("sharp");
// require('express-http2-workaround')({ express:express, http2:http2, app:app });
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        if (file.mimetype == 'image/png') {
            cb(null, Date.now() + '.png'); //Appending .jpg
        }
        else if (file.mimetype == 'image/jpeg') {
            cb(null, Date.now() + '.jpg'); //Appending .jpg
        }
    }
});
var upload = multer({ storage: storage });
var userstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/UserImages/');
    },
    filename: function (req, file, cb) {
        if (file.mimetype == 'image/png') {
            cb(null, Date.now() + '.png'); //Appending .jpg
        }
        else if (file.mimetype == 'image/jpeg') {
            cb(null, Date.now() + '.jpg'); //Appending .jpg
        }
    }
});
var userupload = multer({ storage: userstorage });
app.use(cors(/*{ origin: 'http://192.168.0.14:3001' }*/ { origin: 'http://192.168.0.14:5000' }));
var cookieParser = require('cookie-parser');
app.use(cookieParser());
let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sisp"
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", router);
router.get('/', function (req, res) {
    res.send('GET OUT OF HERE!!!');
});
router.post('/register', userupload.single('file'), async (req, res, next) => {
    let username = req.body.username;
    let password = req.body.password;
    try {
        const result = await new Promise((resolve, reject) => {
            if (username !== '' && password !== '' && req.file) {
                resolve(true);
            }
            else {
                reject(false);
            }
        });
        con.query("SELECT username FROM users WHERE username=?", [username], async (err, resul) => {
            if (typeof (resul) === 'object') {
                fs.rename(req.file.path, `uploads\\UserImages\\${username}.${ext(req.file.mimetype)}`, (err) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        const result = webp.cwebp(`uploads\\UserImages\\${username}.${ext(req.file.mimetype)}`, `uploads\\UserImages\\${username}.webp`, "-q 80");
                        result.then((response) => {
                            console.log(response);
                        });
                        con.query("INSERT INTO users(id, username, password) VALUES (?, ?, ?)", [uuidv4(), username, password]);
                        res.send("Succesful!");
                    }
                });
            }
            else if (resul.length > 0) {
                res.statusMessage = "Alredy exists";
                res.status(400).end("Alredy exists");
            }
        });
    }
    catch (e) {
        res.end('no no no');
    }
});
router.post("/login", async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip[0].replace(/:/g, '');
    ip = ip.replace(/f/g, '');
    ip = ip.replace(/\./g, '');
    con.query("SELECT id, username, password FROM users WHERE username=? AND password=?", [username, password], function (err, resu) {
        if (resu.length > 0) {
            res.statusMessage = "Succesful";
            let id = resu[0].id + parseInt(ip[0]) * 293;
            res.cookie('lid', id, { maxAge: 1296000 });
            con.query('SELECT id,date FROM logged WHERE id=?', [id], (err, resu2) => {
                if (!resu2[0]) {
                    con.query("INSERT INTO logged(id, date) VALUES (?, CURRENT_DATE())", [id]);
                    res.status(200).end(id);
                }
                else if (resu2[0]) {
                    res.statusMessage = 'Just click login again.';
                    res.status(400).end();
                    con.query("DELETE FROM logged WHERE id=?", [id]);
                    // return;
                }
            });
        }
        else if (resu.length == 0) {
            res.statusMessage = "Check your password or username";
            res.status(400).end();
        }
    });
});
router.post('/checklogin', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var id = req.headers['lid'];
    if (id == []) {
        res.end('Eee');
        return;
    }
    id = id.slice(4);
    ip = ip[0].replace(/:/g, '');
    ip = ip.replace(/f/g, '');
    ip = ip.replace(/\./g, '');
    con.query("SELECT * FROM logged WHERE id=?", [id], function (err, resu) {
        if (typeof (resu) != "undefined") {
            if (resu[0].id == id) {
                res.send('Aaa');
                res.status(200).end();
            }
            else {
                res.send('Eee');
            }
        }
        else {
            res.send('Eee');
        }
    });
    //checklogin(req,res,ip,id)
});
router.post('/upload', upload.single('file'), async (req, res, next) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var id = req.body.lid;
    promise(ip, id).then(value => {
        if (req.file && req.body.posttext != '' && value) {
            imgproc(req.file.path, `uploads/${req.file.filename.split('.').slice(0, -1).join('.')}.webp`, req.file);
            con.query('INSERT INTO posts(id,userid,img,text,likes,date) VALUES (?,?,?,?,0,?)', [
                uuidv4(),
                id.slice(4, 40),
                `${req.file.filename.split('.').slice(0, -1).join('.')}.webp`,
                req.body.posttext,
                getDate()
            ]);
            res.redirect('http://192.168.0.14:5000');
        }
    }).catch(err => {
        res.send('Auth failed');
        res.redirect('http://192.168.0.14:3001');
    });
});
router.get('/uploads/:file', async (req, res) => {
    //Auth images in future
    res.sendFile(__dirname + '/uploads/' + req.params.file);
});
app.get('/uploads/userimg/:file', (req, res) => {
    res.sendFile(__dirname + '/uploads/UserImages/' + req.params.file);
});
app.get('/posts', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var id = req.headers['lid'];
    promise(ip, id).then(value => {
        con.query('SELECT posts.id, users.username, posts.img, posts.text, posts.likes, posts.date FROM posts INNER JOIN users ON posts.userid=users.id ORDER BY posts.date DESC', function (err, resq) {
            res.send(resq);
        });
    })
        .catch(err => {
        res.send('Auth failed');
    });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});
// var http2Server = http2.createServer(app);
// http2Server.listen(port, function(){
//   console.log("Express HTTP/2 server started");
// });
const promise = (ip, id) => {
    return new Promise((res, rej) => {
        if (id == [] || !id || typeof (id) == 'undefined' || typeof (id) == undefined) {
            rej(false);
        }
        id = id.slice(4);
        ip = ip.replace(/:/g, '');
        ip = ip.replace(/f/g, '');
        ip = ip.replace(/\./g, '');
        con.query("SELECT * FROM logged WHERE id=?", id, (err, resu) => {
            if (typeof (resu[0]) != 'undefined') {
                if (resu[0].id == id) {
                    res(true);
                }
                else {
                    rej(false);
                }
            }
        });
    });
};
const ext = (mimetype) => {
    if (mimetype === 'image/png') {
        return 'png';
    }
    else if (mimetype === 'image/jpeg') {
        return 'jpg';
    }
};
const imgproc = (path, name, img) => {
    let image = sharp(path);
    image
        .rotate()
        .webp()
        .toFile(name);
};
const getDate = () => {
    let date = new Date();
    let fin = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return fin;
};
//# sourceMappingURL=api.js.map