const {
    PG_CONN_STRING = 'postgresql://nest:nest@localhost/rentacar',
} = process.env;

module.exports = {
    development: {
        client: 'pg',
        connection: PG_CONN_STRING,
    },
};
