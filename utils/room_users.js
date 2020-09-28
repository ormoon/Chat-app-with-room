const users = [];

//addUser, removeUser, getUser, getUsersInRoom

const addUsers = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //validate the data
    if (!username || !room) {
        return {
            error: 'Username And Room are required'
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    })

    //validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    //store user
    const user = { id, username, room }
    users.push(user);
    return { user }
}


const removeUsers = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index != -1) {
        return users.splice(index, 1)[0] //splice returns array of removed items, since we have object inside array thus to get object we add [0] 0 index
    }
}


const getUser = (id) => {
    return users.find(user => user.id === id);
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room);
}


module.exports = {
    addUsers,
    removeUsers,
    getUser,
    getUsersInRoom
}

