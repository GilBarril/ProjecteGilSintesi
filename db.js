var mongoose = require("mongoose");
var config = require('./config');
/*mongolab user:gilgr1990@gmail.com pass:Willfreud41558234*/


mongoose.connect('mongodb://' + config.userMongo +':' + config.passMongo + '@' + config.urlMongo,function(err) {
          if(err) throw err;  
          console.log("connected to mongolab");
});



module.exports = mongoose;