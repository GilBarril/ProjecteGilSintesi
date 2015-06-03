angular.module('appLearn')
    .service('UserSvc', function($http, $cookies, $rootScope) {
        var srv = this;
        srv.auth = false;
        srv.Usuari = " ";
        srv.UsuariActual;
        srv.UsuariView;
        srv.cookie = function(token) {

            console.log("ara hauria d'enviar el broadcast")

            $http.defaults.headers.common['x-auth'] = token;
            return $http.get('/api/users').success(function(e) {
                srv.auth = true;
                $rootScope.$broadcast('login', e);
            });
        }


        if ($cookies["_MaQ"]) {
            var token = $cookies["_MaQ"];
            srv.cookie(token);


        }

        srv.setUserView = function(user) {

            console.log("la id");
            console.log(user);

            $http.get('/api/users/' + user + '').success(function(e) {
                console.log("Usuariuser");
                console.log(e);
                srv.UsuariView = e;
                $rootScope.$broadcast('userdefined');
            });

        }

        srv.getUserView = function() {
            return srv.UsuariView;
        }


        srv.getUsuariActual = function() {
            return srv.UsuariActual;
        }

        srv.getUser = function() {
            return $http.get('/api/users');
        };

        srv.busca = function(id) {
        
            $http.get('/api/users', {
                params: {
                    id: id
                }
            }).success(function(e) {
                srv.UsuariActual = e;

                $rootScope.$broadcast('usuari');
            });
        };

        srv.login = function(username, password, noLogin) {
            return $http.post('/api/sessions', {
                username: username,
                password: password
            }).success(function(data, status) {
                /*
                    Si l'autenticació és correcte li diem a l'angular que cada 
                    vegada que es comuniqui amb el servidor afegeixi el token 
                    al header 'x-auth'
                */

                srv.Usuari = username;
                $http.defaults.headers.common['x-auth'] = data;
                if (data) srv.auth = true;
            }).error(function(error, status) {
                /*
                    Si l'usuari i contrasenya no és correcte executa la
                    función callback que li hem passat com paràmetre
                */
                noLogin(error, status);
            });
        };
        this.registre = function(username, password) {
            /*
                Per registrar un usuari nou, només hem de fer un post
                a l'api d'usuaris
            */
            
            console.log("ENTREM UN USUARI");
            
            return $http.post('/api/users', {
                username: username,
                password: password,
               
            });
        };
        this.logOut = function() {
            /*
                Quan l'usuari fa logout s'esborra el token
                i posem la propietat del servei "auth" a false
            */

            srv.auth = false;
            delete $cookies["_MaQ"];
            $http.defaults.headers.common['x-auth'] = "";
        };

        this.modificaarray = function(user, array) {

            return $http.put("api/users/arraylocalitzacions", {
                "us": user,
                "array": array
            });
        }

        this.editaconfiguracio = function(user) {

            var cos = {
                "usuari": user
            };

            return $http.put("/api/users/editaconfiguracio", {
                "cos": cos
            })
        };

        this.put = function(user, localitzacio) {
            return $http.put("/api/users", {
                "user": user,
                "localitzacio": localitzacio
            });
        };


    });