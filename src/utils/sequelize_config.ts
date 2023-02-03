import * as config from '../../database/config';

interface SequelizeConfig {
    development: { dialect: string, storage: string; };
    test: { dialect: string, storage: string; };
    production: { dialect: string, storage: string; };
}

const sequelizeConfig = config as SequelizeConfig;

export function getSequelizeConfiguration(): any {
    if (process.env.NODE_ENV === 'test') return sequelizeConfig.test;
    if (process.env.NODE_ENV === 'production') return sequelizeConfig.production;
    return sequelizeConfig.development;
}
