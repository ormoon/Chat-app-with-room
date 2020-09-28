const users = [];

//addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, name }) => {
    //validate the data
    if (!name) {
        return {
            error: 'Username is required'
        }
    }

    username = name.trim().toLowerCase();

    //check for existing user
    const existingUser = users.find((user) => {
        return user.username === username;
    })

    //validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    //store user
    const user = { id, username }
    users.push(user);
    return { user }
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index != -1) {
        return users.splice(index, 1)[0] //splice returns array of removed items, since we have object inside array thus to get object we add [0] 0 index
    }
}


const getUsers = () => {
    return users;
}

const getUser = (name) => {
    const user = users.find(user => user.username === name)
    return user.id;
}


module.exports = {
    addUser,
    removeUser,
    getUsers,
    getUser
}

