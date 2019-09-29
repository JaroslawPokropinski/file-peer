const Sequelize = require('sequelize');

module.exports = new Sequelize(
  `${process.env.DATABASE_URL}?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory`
);
