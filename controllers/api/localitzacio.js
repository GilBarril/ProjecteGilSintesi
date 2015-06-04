module.exports = function() {
    var Localitzacio = require("../../models/Localitzacio");
    var User = require("../../models/users");
    var router = require("express").Router();
    //  var socket = require("../../controllers/api/localitzador")(http);

    router.get("/:id", function(req, res, next) {
        

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
        if (req.auth) {
            
            var localitzacio = new Localitzacio(req.body);
            localitzacio.save(function(err, localitzacio) {
                if (err) {
                    
                    return next(err)
                }

                
                res.status(201).json(localitzacio);
            });

        }
        else {
            res.status(403).json({
                "missatge": "Nessecites autentificació"
            });

        }



    });


    router.put("/:id", function(req, res, next) {


    });


    router.delete("/:id", function(req, res, next) {
        if (req.auth) {
            Localitzacio.remove({
                "_id": req.params.id
            }, function(err) {
                if (err) {
                    return next(err);
                }
               
            });


            res.status(201).json({
                "missatge": "Borra localitzacio"
            });
        }
        else {
            res.status(403).json({
                "missatge": "Nessecites autentificació"
            });

        }


    });
    return router;
}