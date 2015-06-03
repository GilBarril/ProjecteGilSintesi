module.exports = function() {
    var Localitzacio = require("../../models/Localitzacio");
    var User = require("../../models/users");
    var router = require("express").Router();
  //  var socket = require("../../controllers/api/localitzador")(http);

    router.get("/:id", function(req, res, next) {
        console.log(req.params);

        User.find({
            "username": req.params.id
        }).populate('Localitzacio').exec(function(err, user) {
            if (err) {
                return next(err);
            }
           
            res.json(user);
        })

    });

    router.get("/", function(req, res, next) {
        
        Localitzacio.find().sort('-date').populate('User').exec(function(err, localitzacio) {
            if (err) {
                return next(err);
            }
            res.json(localitzacio);
        });

    });



    router.post("/", function(req, res, next) {
        console.log("ENTRA A POST");
        var localitzacio = new Localitzacio(req.body);
        localitzacio.save(function(err, localitzacio) {
            if (err) {
                console.log('error en Localitzacio');
                return next(err)
            }
            
           /* Localitzacio.findById(localitzacio._id).populate('User').exec(function(err, loc) {
                socket.nou(loc);
            })*/

            console.log("GUARDAT AMB EXIT")

            res.status(201).json(localitzacio);
        });
    });


    router.put("/:id", function(req, res, next) {

        console.log(req.params.id);
    });


    router.delete("/:id", function(req, res, next) {

         Localitzacio.remove({
            "_id": req.params.id
        }, function(err) {
            if (err) {
                return next(err);
            }
            res.status(200);
            console.log("Borra localitzacio");

        });


        res.status(201).json({
            "missatge": "usuari modificat"
        });


    });
    return router;
}