
exports.seed = function(knex) {
    return knex.raw(`
        DELETE FROM car_sessions;
        DELETE FROM cars;

        INSERT INTO cars (license_plate, base_price) VALUES
        ('а123бв77', 1000),
        ('г456де77', 1000),
        ('е789жз77', 1000),
        ('и357кл77', 1000),
        ('м246но77', 1000);
    `);
};
