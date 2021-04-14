const express = require('express')
let mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const app = express();
const bodyParser = require('body-parser');
var cors = require('cors');
var multer = require('multer')
const fs = require('fs')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        if (file.mimetype == 'image/png') {
            cb(null, Date.now() + '.png') //Appending .jpg
        }
        else if (file.mimetype == 'image/jpeg') {
            cb(null, Date.now() + '.jpg') //Appending .jpg
        }
    }
})

var upload = multer({ storage: storage });

var userstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/UserImages/')
    },
    // filename: function (req, file, cb) {
    //     if (file.mimetype == 'image/png') {
    //         cb(null, Date.now() + '.png') //Appending .jpg
    //     }
    //     else if (file.mimetype == 'image/jpeg') {
    //         cb(null, Date.now() + '.jpg') //Appending .jpg
    //     }
    // }
})

var userupload = multer({ storage: userstorage }).single('file');

app.use(cors({origin: 'http://192.168.0.14:3001'}));

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

router.post('/register', async (req, res) => {
    console.log(req.body)
    let username = req.body.username;
    let password = req.body.password;
    console.log(username)
    console.log(password)
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
            console.log(typeof (resul));
            if (typeof (resul) === 'object') {
                userupload(req, res).filename((req_2, file, cb) => {
                    if (file.mimetype == 'image/png') {
                        cb(null, username + '.png'); //Appending .jpg
                    }
                    else if (file.mimetype == 'image/jpeg') {
                        cb(null, username + '.jpg'); //Appending .jpg
                    }
                });
                con.query("INSERT INTO users(id, username, password) VALUES (?, ?, ?)", [uuidv4(), username, password]);
                res.send("Succesful!");
                return;
            }
            else if (result.length > 0) {
                res.statusMessage = "Alredy exists";
                res.status(400).end("Alredy exists");
            }
        });
    } catch (e) {
        res.end('no no no');
    }
});

router.post("/login", async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.replace(/:/g, '');
    ip = ip.replace(/f/g, '');
    ip = ip.replace(/\./g, '');
    con.query("SELECT id, username, password FROM users WHERE username=? AND password=?", [username, password], function (err, resu) {
        if (resu.length > 0) {
            res.statusMessage = "Succesful";
            id = resu[0].id + ip * 293
            res.cookie('lid', id, { expire: 360000 + Date.now() });

            con.query('SELECT id,date FROM logged WHERE id=?', [id], (err, resu2) => {
                if (!resu2[0]) {
                    con.query("INSERT INTO logged(id, date) VALUES (?, CURRENT_DATE())", [id]);
                    res.status(200).end(id);
                }
                else if (resu2[0]) {
                    res.statusMessage = 'Just click login again.'
                    res.status(400).end();
                    con.query("DELETE FROM logged WHERE id=?", [id])
                    // return;
                }
            })


        }
        else if (resu.length == 0) {
            res.statusMessage = "Check your password or username";
            res.status(400).end();
        }
    })
});

router.post('/checklogin', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var id = req.headers['lid'];
    if (id == []) {
        res.end('Eee');
        return;
    }
    id = id.slice(4)
    ip = ip.replace(/:/g, '');
    ip = ip.replace(/f/g, '');
    ip = ip.replace(/\./g, '');
    con.query("SELECT * FROM logged WHERE id=?", [id], function (err, resu) {
        //console.log(resu)
        //console.log(resu.length)
        if (typeof (resu) != "undefined") {
            if (resu[0].id == id) {
                res.send('Aaa')
                res.status(200).end();
            }
            else {
                res.send('Eee');
            }
        }
        else {
            res.send('Eee')
        }
    })
    //checklogin(req,res,ip,id)
});

router.post('/upload', upload.single('file'), async (req, res, next) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var id = req.body.lid
    //console.log(req.body)
    promise(ip, id).then(value => {
        if (req.file && req.body.posttext != '' && value) {
            //console.log(req.file)
            //console.log(req.body)
            con.query('INSERT INTO posts(id,userid,img,text,likes,date) VALUES (?,?,?,?,0,CURRENT_DATE())', [
                uuidv4(),
                id.slice(4, 40),
                req.file.filename,
                req.body.posttext
            ])
            res.redirect('http://192.168.0.14:3001')
        }
    }).catch(err => {
        res.send('Auth failed')
        res.redirect('http://192.168.0.14:3001')
    })
})

router.get('/uploads/:file', async (req, res) => {
    //Auth images in future
    res.sendFile('E:/Nova mapa/Programing/Node.js/express-demo/uploads/' + req.params.file);
});

app.get('/uploads/userimg/:file', (req, res) => {
    res.sendFile('E:/Nova mapa/Programing/Node.js/express-demo/uploads/UserImages/' + req.params.file);
});

app.get('/posts', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var id = req.headers['lid']
    promise(ip, id).then(value => {
        // console.log(value)
        con.query('SELECT posts.id, users.username, posts.img, posts.text, posts.likes, posts.date FROM posts INNER JOIN users ON posts.userid=users.id', function (err, resq) {
            //console.log(resq)
            res.send(resq)
        })
    })
        .catch(err => {
            // console.log(err)
            res.send('Auth failed')
        })
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
});

const promise = (ip, id) => {
    return new Promise((res, rej) => {
        if (id == [] || !id || typeof (id) == 'undefined' || typeof (id) == undefined) {
            rej(false);
        }
        id = id.slice(4)
        ip = ip.replace(/:/g, '');
        ip = ip.replace(/f/g, '');
        ip = ip.replace(/\./g, '');
        con.query("SELECT * FROM logged WHERE id=?", id, (err, resu) => {
            if (typeof (resu[0]) != 'undefined') {
                if (resu[0].id == id) {
                    res(true)
                }
                else {
                    rej(false)
                }
            }
        })
    })
}
