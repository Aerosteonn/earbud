var DB = require('./../config/db').DB;

var User = DB.Model.extend({
   tableName: 'users',
   idAttribute: 'userId'
});

module.exports = {
   User: User
};