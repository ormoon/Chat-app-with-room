const socket = io();

const Form = document.getElementById('send-container');
const msgInput = document.getElementById('message-input');
const msgContainer = document.getElementById('message-container');
const sendLocation = document.getElementById('send-location');


const user = document.getElementById('new-user').innerHTML;
const room = document.querySelector('#room').innerHTML;


// console.log("user >> ", user);
// console.log("room >> ", room);



socket.on("msg", msg => {
    console.log("msg >> ", msg)
    showMessage(msg.message.text, msg.message.createdAt);
})

socket.emit("join", ({ user, room }));

socket.on("locationmsg", msg => {
    console.log("message >> ", msg)
    var sender = document.createTextNode(`${msg.name} : `);
    msgContainer.appendChild(sender);
    displayUrl(msg.message.text, msg.message.createdAt);
})

Form.addEventListener('submit', e => {
    e.preventDefault();
    const msg = msgInput.value;
    if (msg) {
        showMessage(`You : ${msg}`, moment().calendar());

        socket.emit("sendMsg", msg, (error) => {
            if (error) {
                return console.log(error)
            }
            console.log("Message delivered successfully")
        });
        msgInput.value = '';
        msgInput.focus()
    }
})


document.querySelector('#send-location').addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by your browser")
    }

    sendLocation.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((location) => {
        if (!location) {
            console.log("Error");
        } else {
            // console.log(location)
            const latitude = location.coords.latitude;
            const longitude = location.coords.longitude;
            const url = `https://www.google.com/maps/@${latitude},${longitude}`

            var sender = document.createTextNode("You : ");
            msgContainer.appendChild(sender);

            displayUrl(url, moment().calendar());
            socket.emit("location", `${url}`, () => {
                console.log("Your location has been shared successfully");
                sendLocation.removeAttribute('disabled');
            })
        }
    })
})


socket.on("disconnected", data => {
    showMessage(`${data.name} disconnected`, data.time);
})


function showMessage(msg, time) {
    const msgElement = document.createElement('div');
    msgElement.innerText = msg;
    msgContainer.append(msgElement);

    displayTime(time)
}


function displayUrl(url, time) {
    var a = document.createElement('a');
    var linkText = document.createTextNode(url);
    a.appendChild(linkText);
    a.href = url;
    msgContainer.appendChild(a);

    displayTime(time)

}

function displayTime(time) {
    var s = document.createElement('div');
    s.classList.add('time');
    // s.setAttribute("class", "time"); 
    var text = document.createTextNode(time);
    s.appendChild(text);
    msgContainer.appendChild(s)
}


