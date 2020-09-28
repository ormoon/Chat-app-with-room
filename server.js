const http = require('http');
const express = require('express');
const morgan = require('morgan');
require('dotenv').config();
const path = require('path');
var Filter = require('bad-words');
const { generateMsg } = require('./utils/messages');
const moment = require('moment');

const { addUsers, removeUsers, getUsersInRoom } = require('./utils/room_users');
const { addUser, removeUser, getUsers, getUser } = require('./utils/chat_users');

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
        const { error, user } = addUser({ id: socket.id, name })

        if (error) {
            socket.emit("errors", error);
        }

        // socket.broadcast.emit("user-connected", ({ name: user.username, time: moment().calendar() }))

        io.emit("aUser", getUsers())


        socket.on("sendMessage", (msg, cb) => {
            const filter = new Filter();
            if (filter.isProfane(msg)) {
                return cb('Profanity is not allowed!')
            }
            socket.broadcast.emit("messages", { message: generateMsg(msg), name: user.username })
            cb()
        })
        socket.on("loc", (url, cb) => {
            socket.broadcast.emit("loc-msg", { message: generateMsg(url), name: user.username })
            cb()
        })
        socket.on("disconnect", () => {
            console.log("disconnect")
            const user = removeUser(socket.id);
            // if (user) {
            //     socket.broadcast.emit("user-disconnected", ({ name: user.username, time: moment().calendar() }));
            // }
            io.emit("aUser", getUsers())
        })

    })



    //chat-app server 

    //chat-room
    //chat-room server


    socket.on("join", ({ username, room }, cb) => {
        const { error, user } = addUsers({ id: socket.id, username, room })

        if (error) {
            return cb(error);
        }

        socket.join(user.room);

        io.to(user.room).emit("aUsers", getUsersInRoom(user.room))

        socket.emit("msg", { message: generateMsg('Welcome!') });
        socket.broadcast.to(user.room).emit("msg", { message: generateMsg(`${user.username} has joined the group`) })


        socket.on("sendMsg", (msg, cb) => {
            const filter = new Filter();
            if (filter.isProfane(msg)) {
                return cb('Profanity is not allowed!')
            }
            socket.broadcast.to(user.room).emit("msg", { message: generateMsg(`${user.username} : ${msg}`) })
            // console.log(generateMsg(msg))
            cb()
        })

        socket.on("location", (url, cb) => {
            socket.broadcast.to(user.room).emit("locationmsg", { name: user.username, message: generateMsg(url) })
            cb()
        })


        socket.on("disconnect", () => {
            const user = removeUsers(socket.id);
            if (user) {
                socket.broadcast.to(user.room).emit("disconnected", ({ name: user.username, time: moment().calendar() }));
            }
            io.to(user.room).emit("aUsers", getUsersInRoom(user.room))
        })

        cb();
    })

    //     //chat-room server
})

server.listen(process.env.PORT, process.env.HOST, () => {
    console.log(`----Server is started at http://${process.env.HOST}:${process.env.PORT}`)
})
