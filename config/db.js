var Bookshelf = require('bookshelf');

var config = {
   host: '192.168.188.146',  // your host
   user: 'root', // your database user
   password: '1234', // your database password
   database: 'earbud',
   charset: 'UTF8_GENERAL_CI'
};

var DB = Bookshelf.initialize({
   client: 'mysql', 
   connection: config
});

module.exports.DB = DB;