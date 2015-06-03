var db = require("../db");

var user = db.Schema({
    username: {type:String, required: true},
    password: {type:String, required:true, select:false},
    frase: {type:String, required:false},
    aficions: {type:String, required:false},
    menjar: {type:String, required:false},
    lloc: {type:String, required:false},
    localitzacions:[{
                type: db.Schema.Types.Object,
                ref: 'Localitzacio',
                required: false
            }],
    imatgeUser: {type:String, required:false,default:'uploads/perfil.png'},
});

module.exports = db.model('User',user);
