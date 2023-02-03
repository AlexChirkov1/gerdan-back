const { join } = require('path');
const { cwd } = require('process');

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: join(cwd(), 'database', 'dev-database.sqlite'),
  },
  test: {
    dialect: 'sqlite',
    storage: join(cwd(), 'database', 'test-database.sqlite'),
  },
  production: {
    dialect: 'sqlite',
    storage: join(cwd(), 'database', 'prod-database.sqlite'),
  }
};
