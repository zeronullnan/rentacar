import { KnexModuleOptions } from 'nest-knexjs';

const {
    PG_CONN_STRING = 'postgresql://nest:nest@localhost/rentacar',
} = process.env;

export const KNEX_CONFIG: KnexModuleOptions = {
    config: {
        client: 'pg',
        connection: PG_CONN_STRING,
    },
};