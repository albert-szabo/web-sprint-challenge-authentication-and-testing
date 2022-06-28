const database = require('../../data/dbConfig');

function findBy(filter) {
    return database('users').where(filter);
}

function findById(user_id) {
    return database('users').where('user_id', user_id).first();
}

async function add(user) {
    const [id] = await database('users').insert(user);
    return findById(id);
}

module.exports = { findBy, add };