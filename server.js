const http = require('http');
const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const path = require('path');
var Filter = require('bad-words');
const { generateMsg } = require('./utils/messages');
const moment = require('moment');


const app = express();

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.set('view engine', 'html');
app.engine('html', require('hbs').__express);


app.get('/room', (req, res, next) => {
    res.render('roomLogin')
})

app.use('/chatroom', (req, res, next) => {
    res.render('chatroom', { room: req.body.room, name: req.body.username })
})

app.get('/chat', (req, res, next) => {
    res.render('chat', { name: "CHAT APP" })
})

//creating server
const server = http.createServer(app);

//socket.io

users = {};

const io = require('socket.io')(server);

io.on("connection", socket => {
    console.log("New user connected");


    //for chat app
    //chat-app server

    socket.on("new-user", name => {
        users[socket.id] = name;
        socket.broadcast.emit("user-connected", ({ name, time: moment().calendar() }))
    })

    socket.on("sendMessage", (msg, cb) => {
        const filter = new Filter();
        if (filter.isProfane(msg)) {
            return cb('Profanity is not allowed!')
        }
        socket.broadcast.emit("messages", { message: generateMsg(msg), name: users[socket.id] })
        cb()
    })
    socket.on("loc", (url, cb) => {
        socket.broadcast.emit("loc-msg", { message: generateMsg(url), name: users[socket.id] })
        cb()
    })
    socket.on("user-disconnect", () => {
        socket.broadcast.emit("user-disconnected", ({ name: users[socket.id], time: moment().calendar() }));
        delete users[socket.id];
    })

    //chat-app server 

    //chat-room
    //chat-room server


    socket.on("join", ({ user, room }) => {
        socket.join(room);
        socket.emit("msg", { message: generateMsg('Welcome!') });
        socket.broadcast.to(room).emit("msg", { message: generateMsg(`${user} has joined the group`) })


        socket.on("sendMsg", (msg, cb) => {
            const filter = new Filter();
            if (filter.isProfane(msg)) {
                return cb('Profanity is not allowed!')
            }
            socket.broadcast.to(room).emit("msg", { message: generateMsg(`${user} : ${msg}`) })
            // console.log(generateMsg(msg))
            cb()
        })

        socket.on("location", (url, cb) => {
            socket.broadcast.to(room).emit("locationmsg", { name: user, message: generateMsg(url) })
            cb()
        })

        socket.on("disconnect", () => {
            socket.broadcast.to(room).emit("disconnected", ({ name: user, time: moment().calendar() }));
        })
    })

    //     //chat-room server
})

server.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`----Server is started at http://${process.env.HOST}:${process.env.PORT}`)
})
