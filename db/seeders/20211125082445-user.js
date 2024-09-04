'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

const passwd = bcrypt.hashSync("admin1234", saltRounds);
const passwd2 = bcrypt.hashSync("user1234", saltRounds);

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Roles', [{
      name: "user",
      createdAt: new Date(),
      updatedAt: new Date()      
    },{
      name: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    }],{});

    const roles = await queryInterface.sequelize.query(
      `SELECT id from roles;`
    );

    const roleRows = roles[0];

    await queryInterface.bulkInsert('Users', [{
      pseudo: 'admin',
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin@example.com',
      password: passwd,
      roleId:roleRows[1].id,
      createdAt: new Date(),
      updatedAt: new Date()
    },{
      pseudo: 'user',
      firstName: 'user',
      lastName: 'user',
      email: 'user@example.com',
      password: passwd2,
      roleId:roleRows[0].id,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};