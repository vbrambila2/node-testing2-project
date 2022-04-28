
exports.seed = function(knex) {
  return knex('cars')
    .truncate()
    .then(function() {
      return knex('cars').insert([
        { name: 'Toyota' },
        { name: 'Ford' },
        { name: 'Chevy' },
      ]);
    });
};
