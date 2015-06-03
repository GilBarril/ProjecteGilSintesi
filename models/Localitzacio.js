var db = require("../db");
var Localitzacio = db.model('Localitzacio', {
            usuari:{
                type: db.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            nom:{
                type: String,
                required: true
            },
            logo: {
                type: String,
                required: false
            },
            adreca:{
                type: String,
                required: false
            },
            telefon:{
                type: String,
                required: false
            },
            latitud:{
                type: String,
                required: true
            },
            longitud:{
                type: String,
                required: true
            },
           usuariOrigen:{
                type: String,
                required: false
            },
           
            data: {
                type: Date,
                required: true,
                default: Date.now
            }
    });

module.exports = Localitzacio;