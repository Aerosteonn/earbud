var DB = require('./db').DB;

var User = DB.Model.extend({
   tableName: 'users',
   idAttribute: 'userId'
});

module.exports = {
   User: User
};