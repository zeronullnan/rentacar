
exports.up = function(knex) {
    return knex.raw(`
        CREATE TABLE cars (
            id SERIAL,
            license_plate VARCHAR(10),
            base_price DECIMAL(7,2) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE
        );

        CREATE TABLE car_sessions (
            id SERIAL,
            car_id INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            price DECIMAL(7,2) NOT NULL
        );
    `);
};

exports.down = function(knex) {
    return knex.raw(`
        DROP TABLE cars_sessions;
        DROP TABLE cars;
    `);
};
