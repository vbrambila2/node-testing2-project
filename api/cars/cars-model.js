const db = require('../../data/db-config')

module.exports = {
  insert,
  update,
  remove,
  getAll,
  getById,
}

function getAll() {
  return db('cars')
}

function getById(id) {
  return db('cars')
    .where('id', id)
    .first();
}

async function insert(car) {
  return db('cars')
    .insert(car)
    .then(([id]) => getById(id));
}

async function update(id, changes) {
  return db('cars')
    .update(changes)
    .where('id', id)
    .then(() => getById(id));
}

async function remove(id) {
  const result = await getById(id);
  await db('cars').del().where('id', id);
  return result;
}