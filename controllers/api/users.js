var router = require("express").Router();
var bcrypt = require("bcrypt");
var jwt = require('jwt-simple');
var User = require("../../models/users");
var config = require("../../config");
var path = require('path');

var compressor = path.resolve(__dirname, '../../compressor.js'); // Fitxer que manipules les imatges
function compressAndResize(imageUrl) {
    // Creem un "child process" d'aquesta manera no 
    // fem un bloqueig del EventLoop amb un ús intens de la CPU
    // al processar les imatges
    var childProcess = require('child_process').fork(compressor);
    childProcess.on('message', function(message) {
        console.log(message);
    });
    childProcess.on('error', function(error) { // Si el procés rep un missatge l'escriurà a la consola
        console.error(error.stack);
    });
    childProcess.on('exit', function() { //Quan el procés rep l'event exit mostra un missatge a la consola
        console.log('process exited');
    });
    childProcess.send(imageUrl);
}






router.get('/lletra', function(req, res, next) {
    
    User.find({
        "username": new RegExp(req.query.id)
    }, function(err, user) {
        
        if (err) return next(err);
        
        res.status(200).json(user);
    });
});

router.get('/', function(req, res, next) {

    if (!req.headers['x-auth']) return res.status(401).json({
        "missatge": "Error autenticació"
    });
    var auth = jwt.decode(req.headers['x-auth'], config.secret);
   
    User.findOne({
        username: auth.username
    }, function(err, user) {

        if (err) return next(err);


        res.status(200).json(user);

    });
});


router.get('/:id', function(req, res, next) {


    User.findById(req.params.id, function(err, user) {
        if (err) return next(err);

        res.status(200).json(user);
    });
});




router.post('/', function(req, res, next) {
    /* Primer cerquem l'usuari a la mongo */
    
        
        User.findOne({
            username: req.body.username
        }, function(err, user) {
            if (err) return next(err);
            if (user) {
                res.status(409).json({
                    "missatge": "l'usuari ja existeix"
                });
            }
            else {
                var nouUser = new User({
                    username: req.body.username
                });
                bcrypt.hash(req.body.password, 11, function(err, hash) {
                    if (err) return next(err);
                    nouUser.password = hash;
                    nouUser.frase = "M'agrada SearchYourPlace";
                    nouUser.aficions = "Buscar llocs per tot el món";
                    nouUser.lloc = "Sobre les montanyes";
                    nouUser.menjar = "El que em posin al plat";

                    nouUser.save(function(err) {
                        if (err) return next(err);

                        res.status(201).json({
                            "missatge": "Usuari autenticat"
                        });
                    });
                });
            }
        });

});


router.post('/pujarImatge', function(req, res, next) {
    if (req.auth) {
        User.findByIdAndUpdate(req.body.originalname, {
            imatgeUser: "images/120/" + req.files.image.name
        }, function(err, p) {
            if (err) return next(err);

            res.status(201).json({
                "missatge": "usuari modificat"

            });
            compressAndResize(__dirname + "/../../assets/uploads/" + req.files.image.name);

        });
    }
    else {

        res.status(403).json({
            "missatge": "Nessecites autentificació"
        });
    }

});



router.put("/", function(req, res, next) {
    


});

router.put("/editaconfiguracio", function(req, res, next) {
    if (req.auth) {
        User.findByIdAndUpdate(req.body.cos.usuari._id, {
            frase: req.body.cos.usuari.frase,
            lloc: req.body.cos.usuari.lloc,
            aficions: req.body.cos.usuari.aficions,
            menjar: req.body.cos.usuari.menjar
        }, function(err, p) {
            if (err) return next(err);

            res.status(201).json({
                "missatge": "usuari modificat"
            });


        });
    }
    else {
        res.status(403).json({
            "missatge": "Nessecites autentificació"
        });

    }


});



router.put("/arraylocalitzacions", function(req, res, next) {
    if (req.auth) {
        User.findByIdAndUpdate(req.body.us._id, {
            localitzacions: req.body.array

        }, function(err, p) {
            if (err) return next(err);

            res.status(201).json({
                "missatge": "usuari modificat"
            });


        });

    }
    else {
        res.status(403).json({
            "missatge": "Nessecites autentificació"
        });

    }


});



module.exports = router;