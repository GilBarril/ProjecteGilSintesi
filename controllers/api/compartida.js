module.exports = function(http) {
    var Compartida = require("../../models/Compartida");
    var User = require("../../models/users");
    
    var router = require("express").Router();
  

    router.get("/:id", function(req, res, next) {
        console.log(req.params);

        User.find({
            "username": req.params.id
        }).populate('Localitzacio').exec(function(err, user) {
            if (err) {
                return next(err);
            }
            var Userjson = {"user": user};
            res.json(Userjson);
        })

    });

    router.get("/", function(req, res, next) {
        Compartida.find().sort('-date').populate('User').exec(function(err, compartida) {
            if (err) {
                return next(err);
            }
            res.json(compartida);
        });

    });



    router.post("/", function(req, res, next) {
        console.log("Guardes compartida");

        var compartida = new Compartida(req.body);
        compartida.save(function(err, compartida) {
            if (err) {
                return next(err)
            }
            res.status(201).json(compartida);
        });
    });



  /*  router.delete("/:id", function(req, res, next) {

        console.log("localitzacio a borrar");
        console.log(req.params.id);

        Compartida.findById(req.params.id).populate('User').exec(function(err, compartida) {

            console.log(compartida.usuari);
            compartida.usuari.localitzacions.splice(compartida.usuari.localitzacions.indexOf(compartida), 1);
            console.log(compartida.usuari);

            User.findByIdAndUpdate(compartida.usuari._id, {
                "localitzacions": compartida.usuari.localitzacions
            }, function(err, user) {

                if (err) return next(err);

                console.log(user);

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

        });



    });*/
    return router;
}