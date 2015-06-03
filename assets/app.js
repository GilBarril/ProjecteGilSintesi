angular.module('appLearn', ['ngResource','ngRoute','ngCookies','angularFileUpload']);
angular.module('appLearn')
    .service('SocketSrv', function($rootScope) {
    
    var socket = io().connect();
    
    socket.on('newProduct',function(producte) {
      
        $rootScope.$broadcast('newProduct',producte);
        
    });
    socket.on('updateProduct',function(producte) {
      
        $rootScope.$broadcast('updateProduct',producte);
        
    });
    socket.on('deleteProduct',function(producte) {
      
        $rootScope.$broadcast('deleteProduct',producte);
        
    });
});
angular.module('appLearn')
    .controller("ApplicationController", function($route, $scope,$location,UserSvc,$cookies) {
        
        $scope.$on('login', function(e,user) {
            /*
                Quan s'ha fet login s'emet l'event "login"
                i això fa que la variable de l'scope "currentUser"
                li diem quin usuari s'ha autenticant, d'aquesta manera
                fem que apareguin diferents opcions al menú
            */
            $scope.currentUser = user;
        });
        
        
        $scope.definirUserVista = function(user) {
            UserSvc.setUserView(user);
        }
        
         $scope.PerfilUser = function() {
            $location.path("/userlocalitzacions");
        }
        
        
        $scope.$on('userdefined', function() {
            $route.reload();
            $location.path('/usuari');
        })
        
        
        $scope.logout = function(){
            /*
                Quan fem logout esborrem el token i la variable
                de l'$scope "currentUser", d'aquesta forma desapareixen
                els menús sensibles a la autenticació
            */
            console.log(UserSvc);
            UserSvc.logOut();
            delete $scope.currentUser;
            $location.path('/');
        };
    });
angular.module('appLearn')
.service("CompartidaServei", function($resource) {
     this.srv = $resource('/api/compartides/:id', null, {
          'update': {
              method: 'PUT'
          }
      });

  this.edita = null;
  return this;
    
  });
angular.module('appLearn')
    .controller("EditaController", function($route, $scope, $location, UserSvc, $cookies, FileUploader) {
        
        var uploader = $scope.uploader = new FileUploader({
            url: "/api/users/pujarImatge",
            alias: "image",
            removeAfterUpload: true
        });
       
        uploader.onBeforeUploadItem = function(item) {
            item.formData.push({
                originalname: $scope.currentUser._id
            });
            
        };

        $scope.editauser = function(user) {
            if ($scope.frase) {
                user.frase = $scope.frase;
            }
            else {

                user.frase = "M'agrada SearchYourPlace";

            }
            if ($scope.aficions) {
                user.aficions = $scope.aficions;
            }
            else {

                user.aficions = "Buscar llocs per tot el món";

            }
            if ($scope.menjar) {
                user.menjar = $scope.menjar;
            }
            else {

                user.menjar = "El que em posin al plat";
            }
            if ($scope.lloc) {
                user.lloc = $scope.lloc;
            }
            else {

                user.lloc = "Sobre les montanyes";

            }



            UserSvc.editaconfiguracio(user);

            location.path("/userlocalitzacions");
        }


    });
angular.module('appLearn')
    .controller("IniciController", function($scope,$location) {
        
      
    });
angular.module('appLearn')
.service("LocalitzacioServei", function($resource) {
     this.srv = $resource('/api/localitzacio/:id', null, {
          'update': {
              method: 'PUT'
          }
      });

  this.edita = null;
  return this;
    
  });
angular.module('appLearn')
    .controller('LocalitzacionsController', function($scope, LocalitzacioServei, $location, UserSvc, $rootScope,CompartidaServei) {


        $scope.localitzacions = [];
        UserSvc.busca($scope.currentUser._id);

        $scope.refresh = function() {
           UserSvc.busca($scope.currentUser._id);
        };


        $scope.$on('usuari', function() {
            $scope.user = UserSvc.getUsuariActual();
        });



        $scope.borrarArraylocalitzacio = function(localitzacio) {
            
            $scope.user.localitzacions.splice($scope.user.localitzacions.indexOf(localitzacio),1);
            
            UserSvc.modificaarray($scope.user,$scope.user.localitzacions);
            
            $scope.borrarlocalitzacio(localitzacio);
          
        }
        
        
        $scope.borrarlocalitzacio = function(localitzacio){
            
               
              LocalitzacioServei.srv.remove({
                id: localitzacio._id,
                
            }, function() {

            });

        }
        

        $scope.compartirlocalitzacio = function(localitzacio) {

            
            CompartidaServei.srv.save({
                usuari: $scope.Usuariacompartir,
                localitzacio: localitzacio,
                usuariprimer: "Gil"
            }, function(localitzacio) {
                
                $location.path("/userlocalitzacions");
            });

  

        }
        
        $scope.PerArribar= function(e) {
            geolocalitzam(e);
            
        }


    });
angular.module('appLearn')
    .controller("LoginController", function($scope,$location,UserSvc){
         
    
         $scope.$watchGroup(['username','password'],function(newVal, oldVal) {
                /*
                 * Vigilem les variables de l'$scope "username"
                 * i "password" per esborrar el missatge d'error
                 * si hi ha.
                 */
                if (newVal!=oldVal)
                    $scope.error=null;
                
            });
        $scope.login = function(username,password) {
            if (!username || !password) {
                $scope.error = "Has d'emplenar tots els camps";
            } else{
                UserSvc.login(username,password,
                    function(error,status) {
                        /*
                            Funció que s'executarà si hi ha un error en el login
                        */
                        if (status == 401) {
                                $scope.error = error.missatge;
                        }
                    }).success(function() {
                        UserSvc.getUser().then(function(user){
                            /*
                                Si tot va bé, anem a la pàgina principal
                                i emeten un missatge de "login" per avisar
                                a la nostra app que l'usuari ha fet login
                                correctament.
                            */
                            console.log(user);
                            $scope.$emit('login', user.data);
                            $location.path('/userlocalitzacions');
                        });
                    });
            }
        };
    });
angular.module('appLearn').controller('Novalocalitzaciocontroller', function($scope, $location, LocalitzacioServei, UserSvc) {



    $scope.test = function(e, f) {
        if(e!=null&&f!=null){
        $scope.nom = e.name;
        $scope.logo = e.icon;
        $scope.adreca = f.routes[0].legs[0].end_address;
        $scope.tel = e.formatted_phone_number;
        $scope.latitud = e.geometry.location.A;
        $scope.longitud = e.geometry.location.F;
        
        console.log("He entrat a    SORT")
        $scope.afegirlocalitzacio();
    }
}


    $scope.afegirlocalitzacio = function() {
        LocalitzacioServei.srv.save({
            usuari: $scope.currentUser._id,
            nom: $scope.nom,
            logo: $scope.logo,
            adreca: $scope.adreca,
            telefon: $scope.tel,
            latitud: $scope.latitud,
            longitud: $scope.longitud,
        }, function(localitzacio) {
            console.log(localitzacio);
            
            UserSvc.put($scope.currentUser, localitzacio);

            $location.path("/novalocalitzacio");
        });
    }
});
angular.module('appLearn')
    .controller("RegistreController", function($scope,$location,UserSvc) {
        
        $scope.registre = function(username,password,password2) {
            
            $scope.$watchGroup(['username','password','password2'],function(newVal, oldVal) {
                if (newVal!=oldVal)
                    $scope.error=null;
                
            });
            if (!password || !password2 || !username){
                $scope.error = "Has d'emplenar tots els camps";
                
            }else if (password === password2){
                UserSvc.registre(username,password)
                    .success(function(user) {
                        $location.path('/login');
                    })
                    .error(function(error,status){
                        if (status == 409)
                            $scope.error = error.missatge;
                    });
            } else {
                $scope.error = "Les contrasenyes no són iguals";
            }
        };
    });
angular.module('appLearn').config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when("/", {
        controller: 'IniciController',
        templateUrl: 'principal.html',
        autoritzat: false
    }).when("/novalocalitzacio", {
        controller: "Novalocalitzaciocontroller",
        templateUrl: "crearlocalitzacio.html",
        autoritzat: true
    }).when("/login", {
        controller: "LoginController",
        templateUrl: "login.html",
        autoritzat: false
    }).when("/registre", {
        controller: "RegistreController",
        templateUrl: "registre.html",
        autoritzat: false
    }).when("/userlocalitzacions", {
        controller: "LocalitzacionsController",
        templateUrl: "userlocalitzacions.html",
        autoritzat: true
    }).when("/seleccionacategories", {
        controller: "IniciController",
        templateUrl: "seleccionacategoria.html",
        autoritzat: true
    }).when("/editaUser", {
        controller: "EditaController",
        templateUrl: "EditaUser.html",
        autoritzat: true
    }).when("/usuari", {
        controller: "UserController",
        templateUrl: "usuari.html",
        autoritzat: false
    }).otherwise({
        redirectTo: '/'
    });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}).run(function($rootScope, UserSvc,$location) {
    
      /*  Cada vegada que canviem de pàgina se dispara el
        event $routeChangeStart,
        Si la pàgina que volem veure té la propietat 
        "autoritzat": a true i no ho està llavors no 
        farà el canvi*/
    
    $rootScope.$on('$routeChangeStart', function(event, next) {
        if (next)
            if (!UserSvc.auth & next.autoritzat){
                event.preventDefault();
                $location.path('/');
            }
    });
});
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
angular.module('appLearn')
    .controller("UserController", function($scope,$location,UserSvc,LocalitzacioServei) {
        $scope.usuari = UserSvc.getUserView();
        
        
         $scope.compartirLocalitzacio = function(e,u) {
             
             
             console.log("Entres a Compartir");
             console.log(e);
             console.log(u);
      LocalitzacioServei.srv.save({
            usuari: $scope.currentUser._id,
            nom: e.nom,
            logo: e.logo,
            adreca: e.adreca,
            telefon: e.telefon,
            latitud: e.latitud,
            longitud: e.longitud,
            usuariOrigen:u.username,
        }, function(localitzacio) {
            console.log("Guardada Be");
            console.log(localitzacio);
            
            UserSvc.put($scope.currentUser, localitzacio);

            $location.path("/userlocalitzacions");
        });
    }
        
        
    });
angular.module('appLearn').directive('compartir', function() {
    return {
        restrict: 'E',
        scope: {
            sortby: "@",
            onsort: "="
        },
        template: '<div id="panel-direccions"><p id="dadesIniciDireccions">Adreça Inici (per defecte la teva geolocalitzacio) <span id="botoBorraDireccions" onclick="neteja()" class="glyphicon glyphicon-remove"></span></p><input type="text" onchange="novadireccio()" id="inici"></input><div><select class="form-control" onchange="novadireccio()" id="mode"><option value="DRIVING">Cotxe</option><option value="WALKING">Caminant</option><option value="TRANSIT">Trasport Públic</option></select></div></div><div id="directions-panel"></div>',
        link: function(scope, element) {



            var directionsDisplay = new google.maps.DirectionsRenderer();
            var directionsService = new google.maps.DirectionsService();
            var geocoder;
            /*AIXO HO IGUALO A L'OBJECTE LOCALITZACIO PERQUE QUAN EXECUTI LA FUNCIO NOVADIRECCIO ESTIGUI L'ADRECA GUARDADA*/
            var objecteAdrecaFinal;
            var posicioinicialRoute;
            var adrecainicial;
            var adrecafinal;
            var geolocalitzacioDenegada=false;
            var tipusdetransport;

            function success(pos) {
                geolocalitzacioDenegada=false;
                posicioinicialRoute = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    'latLng': posicioinicialRoute
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {

                        adrecainicial = results[0].formatted_address;

                        console.log("la meva " + adrecainicial);
                        document.getElementById('inici').setAttribute('value', adrecainicial);
                        document.getElementById('inici').setAttribute('placeholder', adrecainicial);
                        tipusdetransport =  document.getElementById('mode').value;

                        direccions();


                    }
                })


            }


            function error(err) {
                alert("No hi ha geolocalització!");
                geolocalitzacioDenegada=true;
                console.warn('ERROR(' + err.code + '): ' + err.message);
                
            };

            window.geolocalitzam = function(e) {
                objecteAdrecaFinal = e;
                navigator.geolocation.getCurrentPosition(success, error);
            }





            window.direccions = function() {
                
            if(geolocalitzacioDenegada==false){
                adrecafinal = objecteAdrecaFinal.adreca;
                var a = document.getElementById('panel-direccions');
                 a.style.opacity = "1";
           //    tipusdetransport = document.getElementById('mode').value;
           
               
                directionsDisplay.setPanel(document.getElementById('directions-panel'));


                calcRoute(adrecafinal, adrecainicial,tipusdetransport)
              }
            }



            window.novadireccio = function() {

                adrecainicial = document.getElementById('inici').value;
                tipusdetransport = document.getElementById('mode').value;
                direccions();
            }




            function calcRoute(a, e,t) {

                console.log(a);

                var request = {
                    origin: e,
                    destination: a,
                    travelMode: google.maps.TravelMode[t]
                };
                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });
            }

            window.neteja = function() {

                document.getElementById('panel-direccions').style.opacity = "0";
                directionsDisplay.setPanel(null);

            }
        }

    }
});
angular.module('appLearn').directive('map', function() {
    var autocomplete;
    return {
        restrict: 'E',
        scope: {
            sortby: "@",
            onsort: "="
        },
        template: '<div id="map-canvas"></div><div id="success"></div><div class="col-md-offset-5 col-md-2 col-xs-12"><button id="botoPerGuardar" class="btn btn-warning" ng-click="sort()">Guardar Cerca  <span class="glyphicon glyphicon-save"></span></button></div>',
        link: function(scope, element) {


            var ObjecteGuardar;
            var ObjecteResponseGuadar;
            var geolocalitzacioDenegada=false;
            var geocoder;
            var map;
            var mapRoute;
            var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_orange';
            var markerLetter;
            var markerIcon;
            var service;
            var directionsDisplay;
            var directionsService = new google.maps.DirectionsService();
            geocoder = new google.maps.Geocoder();
            var arraymarcadors = [];
            var arrayDireccions = [];



            

/*AQUI CREO L'AUTOCOMPLETAT DE GOOGLE PER L'INPUT*/
            autocomplete = new google.maps.places.Autocomplete(
                (document.getElementById('address')), {
                    types: ['geocode']
                });

            google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);


            function onPlaceChanged() {
                var place = autocomplete.getPlace();
                if (place.geometry) {
                    map.panTo(place.geometry.location);
                    map.setZoom(15);
                    search();
                }
                else {
                    document.getElementById('address').placeholder = 'Enter a city';
                }

            }

/* AQUI CREO EL SELECT AMB LES OPCIONS QUE JO VUI PER PODER POSAR-LO A UN SELECT 2*/
            var arrayTipus = ["Aeroport", "Aquari", "Galeria d'Art", "Fleca", "Banc", "Bar", "Bus", "Botiga", "Restaurants", "Hospital", "Casino", "Esport", "Universitat", "Hotel"];
            var arrayTypes = ["airport", "aquarium", "art_gallery", "bakery", "bank", "bar", "bus_station", "store", "restaurant", "hospital", "casino", "stadium", "university", "lodging"];
            var sel = document.getElementById('tipus');
            for (var i = 0; i < arrayTipus.length; i++) {
                var opt = document.createElement('option');
                opt.innerHTML = arrayTipus[i];
                opt.value = arrayTypes[i];
                sel.appendChild(opt);
            }



 /* AQUI CREO EL MAPA AMB UNES COORDENADES CONCRETES I UN ZOOM */
            window.crearMapa = function() {
                var latlng = new google.maps.LatLng(42.2667, 2.9667);
                var mapOptions = {
                    zoom: 10,
                    center: latlng
                }
                map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                var w = window.innerWidth;
                document.getElementById("map-canvas").style.width = w;
            }
            crearMapa();





            var localitzacio;

            var infowindow;
            var posicioinicialRoute;



            /*AQUI ET DIU SI HA TROBAT BÉ LA TEVA GEOLOCALITZACIO*/

            function success(pos) {
                console.log("POSICIO")
                posicioinicialRoute = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                geolocalitzacioDenegada=false;
            };

            function error(err) {
                console.warn('ERROR(' + err.code + '): ' + err.message);
                alert("No es pot accedir a la teva geolocalitzacio");
                geolocalitzacioDenegada=true;
            };


            /*AQUESTA FUNCIO SERVEIX PER TREURE ELS MARCADORS DEL MAPA*/


            function TreureMarcadors() {
                for (var i = 0; i < arraymarcadors.length; i++) {
                    arraymarcadors[i].setMap(null);
                };
                arraymarcadors = [];
            }

            /*AQUESTA FUNCIO SERVEIX PER TREURE LES RUTES DEL MAPA*/

            function TreureDireccions() {
                for (var i = 0; i < arrayDireccions.length; i++) {
                    arrayDireccions[i].setMap(null);
                };
                arrayDireccions = [];
            }

            /* AQUESTA  FUNCIO SERVEIX PER AGAFAR L'ADREÇA QUE LI POSES I ET TRANSFORMA LA DIRECCIO EN GEOLOCALITZACIO UN COP
            FET AIXÒ ESXECUTA LA FUNCIO QUE CREA ELS MARCADORS*/
            window.codeAddress = function() {
                
                if (arraymarcadors.length > 0) {
                    TreureMarcadors();
                }
                 if (arrayDireccions.length > 0) {
                        TreureDireccions();
                    }
                navigator.geolocation.getCurrentPosition(success, error);
                geocoder = new google.maps.Geocoder();
                var adreca = document.getElementById("address").value;
                geocoder.geocode({
                    'address': adreca
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        map.setZoom(14);
                        map.setCenter(results[0].geometry.location);
                        localitzacio = {
                            latitud: results[0].geometry.location.A,
                            longitud: results[0].geometry.location.F
                        };
                        marcadors();
                    }
                    else {
                        alert("Geocode was not successful for the following reason: " + status);
                    }
                });
            }


            /* AQUESTA FUNCIO ET PINTA TOTS ELS LLOCS QUE HAS FILTRAT A PARTIR DE L'ADREÇA QUE HAS PASSAT ABANS*/

            function marcadors() {
                var pyrmont = new google.maps.LatLng(localitzacio.latitud, localitzacio.longitud);
                var radi = document.getElementById("radi").value;
                var tipus = document.getElementById("tipus").value;
                var request = {
                    location: pyrmont,
                    radius: radi,
                    types: [tipus]
                };
                infowindow = new google.maps.InfoWindow();
                service = new google.maps.places.PlacesService(map);
                service.nearbySearch(request, callback);
            }

            function callback(results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
                        markerIcon = MARKER_PATH + markerLetter + '.png';
                        console.log(results[i].name);
                        createMarker(results[i]);


                    }
                    results = [];
                }
            }

            /* AQUI ET CREA ELS MARCADORS AL MAPA */

            function createMarker(place) {
                var placeLoc = place.geometry.location;
                var marker = new google.maps.Marker({
                    map: map,
                    animation: google.maps.Animation.DROP,
                    icon: markerIcon,
                    position: place.geometry.location
                });
                arraymarcadors.push(marker);

                google.maps.event.addListener(marker, 'click', function() {
                    var ratingHtml = 'No hi ha Punts';
                    if (place.rating) {
                        var ratingHtml = '';
                        for (var i = 0; i < 5; i++) {
                            if (place.rating < (i + 0.5)) {
                                ratingHtml += '&#10025;';
                            }
                            else {
                                ratingHtml += '&#10029;';
                            }
                        }
                    }

                    infowindow.setContent("<div ><img class='imageIcon' src='" + place.icon + "'/>" + place.name + "</div><div>" + ratingHtml + "</div><button id='botoArribar' class='btn btn-default'>Com hi arribo</button>");
                    infowindow.open(map, this);

                    window.place = place;
                    document.getElementById('botoArribar').addEventListener('click', ComArribo);

                });
            }
            window.ComArribo = function(r) {
                if(geolocalitzacioDenegada==false){
                document.getElementById("direction-panel").style.opacity = "1";    
                document.getElementById('botoPerGuardar').style.opacity = '1';
                r = window.place;
                var request = {
                    placeId: r.place_id
                };

                service.getDetails(request, function(place, status) {


                    var haight = new google.maps.LatLng(37.7699298, -122.4469157);
                    directionsDisplay = new google.maps.DirectionsRenderer();
                    var mapOptions = {
                        zoom: 14,
                        center: haight
                    }
                    if (arrayDireccions.length > 0) {
                        TreureDireccions();
                    }
                    arrayDireccions.push(directionsDisplay);
                    directionsDisplay.setMap(map);
                    calcRoute(place);

                });
                }
            }

            function calcRoute(f) {
                ObjecteGuardar = f;
                var selectedMode = document.getElementById('mode').value;
                var start = posicioinicialRoute;
                var request = {
                    origin: start,
                    destination: f.geometry.location,
                    travelMode: google.maps.TravelMode[selectedMode]
                }
                directionsService.route(request, function(response, status) {

                    ObjecteResponseGuadar = response;

                    /*AQUI EMPLENO LES DADES DEL LLOC EN EL PRIMER DIV*/


                    var b = document.getElementById('panel-1');
                    b.innerHTML = " ";
                    var a = document.createElement("div");
                    var a1 = document.createElement("p");
                    var a2 = document.createElement("p");
                    var a3 = document.createElement("p");
                    var a4 = document.createElement("p");
                    var a5 = document.createElement("p");
                    // a.setAttribute('class', 'list-group-item');
                    b.appendChild(a);
                    a1.innerHTML = "<img class='imageIcon' src='" + f.icon + "'/><b> " + f.name + "</b>";
                    a2.innerHTML = "<span class='nomDada'>Adreça: </span>" + response.routes[0].legs[0].end_address;
                    a3.innerHTML = "<span class='nomDada'>Durada: </span>" + response.routes[0].legs[0].duration.text;
                    if (f.opening_hours != null) {
                        if (f.opening_hours.open_now == true) {
                            a4.innerHTML = "<span class='nomDada'>Horari: </span><span style='color:green'>Local Obert</span>";
                        }
                        else {
                            a4.innerHTML = "<span class='nomDada'>Horari: </span><span style='color:red'>Local Tancat</span>";
                        }
                    }
                    if(f.formatted_phone_number || f.international_phone_number){
                    a5.innerHTML = "<span class='nomDada'>Tel: </span>" + f.formatted_phone_number + ", " + f.international_phone_number;
                    }else{a5.innerHTML ="No hi ha aquesta informació";};
                    a.appendChild(a1);
                    a.appendChild(a2);
                    a.appendChild(a3);
                    a.appendChild(a4);
                    a.appendChild(a5);

                    /*AQUI EMPLENO LES DADES DEL LLOC EN EL SEGON DIV*/

                    var d = document.getElementById('panel-2');
                    d.innerHTML = " ";
                    var c = document.createElement("div");
                    var c1 = document.createElement("p");
                    var c2 = document.createElement("p");
                    var c3 = document.createElement("p");

                    var c5 = document.createElement("p");
                    // a.setAttribute('class', 'list-group-item');
                    d.appendChild(c);
                    if(f.website){
                    c1.innerHTML = "<span class='nomDada'>Web: </span><a href='" + f.website + "'>" + f.website + "</a>";
                    }else{
                         c1.innerHTML ="No hi ha aquesta informació";
                    }
                    c2.innerHTML = "<span class='nomDada'>Espai Google: </span><a href='" + f.url + "'>" + f.url + "</a>";
                    c3.innerHTML = "<span class='nomDada'>Distancia: </span>" + response.routes[0].legs[0].distance.text;
                    var rating = 'No hi ha Punts';
                    if (f.rating) {
                        var rating = '';
                        for (var i = 0; i < 5; i++) {
                            if (place.rating < (i + 0.5)) {
                                rating += '&#10025;';
                            }
                            else {
                                rating += '&#10029;';
                            }
                        }
                        c5.innerHTML = "<span class='nomDada'>Punts: </span>" + rating;
                        c.appendChild(c5);
                    }

                    c.appendChild(c1);
                    c.appendChild(c2);
                    c.appendChild(c3);




                    if (f.photos != null) {
                        var foto = document.getElementById('foto');
                        foto.innerHTML = "";
                    
                        for (var i = 0; i < f.photos.length; i++) {
                            var divimage = document.createElement('div');
                            divimage.setAttribute('class', 'col-xs-12 col-md-3 divdelesimatges');
                            var url = document.createElement('img');
                            divimage.appendChild(url);

                            url.setAttribute('class', 'img-thumbnail fotos');
                            url.setAttribute('src', f.photos[i].getUrl({
                                'maxWidth': 300,
                                'maxHeight': 200
                            }));
                            foto.appendChild(divimage);
                        }
                    }
                   



                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });
            }


            scope.sort = function() {
                var success = document.getElementById('success');
                var missatgeSuccesGuardat = document.createElement('div');
                missatgeSuccesGuardat.setAttribute('id','missatgeSuccesGuardat');
                missatgeSuccesGuardat.setAttribute('class','alert alert-success');
                var link = document.createElement('a');
                link.setAttribute('href','#');
                link.setAttribute('class','close');
                link.setAttribute('data-dismiss','alert');
                link.innerHTML="&times;";
                
                missatgeSuccesGuardat.innerHTML="<strong>Success!</strong> La teva localitzacio ha estat guardada";
                missatgeSuccesGuardat.appendChild(link);
                success.appendChild(missatgeSuccesGuardat);
                scope.$parent.test(ObjecteGuardar, ObjecteResponseGuadar);

            };

        }
    }
});
angular.module('appLearn').directive('select2', function() {
    return {
        restrict: 'E',

        template: '<select id="select2" class="js-data-example-ajax">  <option value="3620194" selected="selected">Usuari</option></select>',
        link: function(scope, element) {

            $(".js-data-example-ajax").select2({
                ajax: {
                    url: "/api/users/lletra",
                    dataType: 'json',
                    delay: 250,
                    data: function(params) {
                        return {
                            id: params.term,
                            page: params.page
                        };
                    },
                    processResults: function(data, page) {
                        console.log(data);
                        return {
                            results: data
                        };
                    },
                    cache: true
                },
                escapeMarkup: function(markup) {
                    return markup;
                }, // let our custom formatter work
                minimumInputLength: 1,
                templateResult: formatRepo, // omitted for brevity, see the source of this page
                templateSelection: formatRepoSelection // omitted for brevity, see the source of this page
            });

            function formatRepo(repo) {
                console.log(scope);
                if (repo.loading) return repo.text;
                
                var markup = '<div class="clearfix">' +
                    '<a style="cursor:pointer" id="' + repo._id +'"onclick="busca(this.id)">' + repo.username + '</a>' +
                    '</div>';

                if (repo.description) {
                    markup += '<div>' + repo.description + '</div>';
                }

                markup += '</div></div>';

                return markup;
            }

            function formatRepoSelection(repo) {
                return repo.full_name || repo.text;
            }
            
            window.busca = function(e) {
                
                if(scope.currentUser&&e==scope.currentUser._id){
                  scope.PerfilUser();
                }else{
                scope.definirUserVista(e);
                }
                
            }
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsIlNvY2tldFNydi5qcyIsImFwcGxpY2F0aW9uLmN0cmwuanMiLCJjb21wYXJ0aWRhLnNydi5qcyIsImVkaXRhY29uZmlndXJhY2lvdXNlci5jdHJsLmpzIiwiaW5pY2ljb250cm9sbGVyLmN0cmwuanMiLCJsb2NhbGl0emFjaW8uc3J2LmpzIiwibG9jYWxpdHphY2lvbnMuY3RybC5qcyIsImxvZ2luLmN0cmwuanMiLCJub3ZhbG9jYWxpdHphY2lvLmN0cmwuanMiLCJyZWdpc3RyZS5jdHJsLmpzIiwicm91dGVzLmpzIiwidXNlci5zcnYuanMiLCJ1c3IuY3RybC5qcyIsImRpcmVjdGl2ZXMvZGlyZWNjaW9ucy5kaXJlY3RpdmUuanMiLCJkaXJlY3RpdmVzL21hcC5kaXJlY3RpdmUuanMiLCJkaXJlY3RpdmVzL3NlbGVjdC51c3VhcmlzLmRpcmVjdGl2ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicsIFsnbmdSZXNvdXJjZScsJ25nUm91dGUnLCduZ0Nvb2tpZXMnLCdhbmd1bGFyRmlsZVVwbG9hZCddKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuICAgIC5zZXJ2aWNlKCdTb2NrZXRTcnYnLCBmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICAgXG4gICAgdmFyIHNvY2tldCA9IGlvKCkuY29ubmVjdCgpO1xuICAgIFxuICAgIHNvY2tldC5vbignbmV3UHJvZHVjdCcsZnVuY3Rpb24ocHJvZHVjdGUpIHtcbiAgICAgIFxuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ld1Byb2R1Y3QnLHByb2R1Y3RlKTtcbiAgICAgICAgXG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCd1cGRhdGVQcm9kdWN0JyxmdW5jdGlvbihwcm9kdWN0ZSkge1xuICAgICAgXG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndXBkYXRlUHJvZHVjdCcscHJvZHVjdGUpO1xuICAgICAgICBcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ2RlbGV0ZVByb2R1Y3QnLGZ1bmN0aW9uKHByb2R1Y3RlKSB7XG4gICAgICBcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkZWxldGVQcm9kdWN0Jyxwcm9kdWN0ZSk7XG4gICAgICAgIFxuICAgIH0pO1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIkFwcGxpY2F0aW9uQ29udHJvbGxlclwiLCBmdW5jdGlvbigkcm91dGUsICRzY29wZSwkbG9jYXRpb24sVXNlclN2YywkY29va2llcykge1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLiRvbignbG9naW4nLCBmdW5jdGlvbihlLHVzZXIpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUXVhbiBzJ2hhIGZldCBsb2dpbiBzJ2VtZXQgbCdldmVudCBcImxvZ2luXCJcbiAgICAgICAgICAgICAgICBpIGFpeMOyIGZhIHF1ZSBsYSB2YXJpYWJsZSBkZSBsJ3Njb3BlIFwiY3VycmVudFVzZXJcIlxuICAgICAgICAgICAgICAgIGxpIGRpZW0gcXVpbiB1c3VhcmkgcydoYSBhdXRlbnRpY2FudCwgZCdhcXVlc3RhIG1hbmVyYVxuICAgICAgICAgICAgICAgIGZlbSBxdWUgYXBhcmVndWluIGRpZmVyZW50cyBvcGNpb25zIGFsIG1lbsO6XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRVc2VyID0gdXNlcjtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLmRlZmluaXJVc2VyVmlzdGEgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICBVc2VyU3ZjLnNldFVzZXJWaWV3KHVzZXIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAgJHNjb3BlLlBlcmZpbFVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL3VzZXJsb2NhbGl0emFjaW9uc1wiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICRzY29wZS4kb24oJ3VzZXJkZWZpbmVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkcm91dGUucmVsb2FkKCk7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3VzdWFyaScpO1xuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBRdWFuIGZlbSBsb2dvdXQgZXNib3JyZW0gZWwgdG9rZW4gaSBsYSB2YXJpYWJsZVxuICAgICAgICAgICAgICAgIGRlIGwnJHNjb3BlIFwiY3VycmVudFVzZXJcIiwgZCdhcXVlc3RhIGZvcm1hIGRlc2FwYXJlaXhlblxuICAgICAgICAgICAgICAgIGVscyBtZW7DunMgc2Vuc2libGVzIGEgbGEgYXV0ZW50aWNhY2nDs1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFVzZXJTdmMpO1xuICAgICAgICAgICAgVXNlclN2Yy5sb2dPdXQoKTtcbiAgICAgICAgICAgIGRlbGV0ZSAkc2NvcGUuY3VycmVudFVzZXI7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xuICAgICAgICB9O1xuICAgIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4uc2VydmljZShcIkNvbXBhcnRpZGFTZXJ2ZWlcIiwgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgIHRoaXMuc3J2ID0gJHJlc291cmNlKCcvYXBpL2NvbXBhcnRpZGVzLzppZCcsIG51bGwsIHtcbiAgICAgICAgICAndXBkYXRlJzoge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgdGhpcy5lZGl0YSA9IG51bGw7XG4gIHJldHVybiB0aGlzO1xuICAgIFxuICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuICAgIC5jb250cm9sbGVyKFwiRWRpdGFDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRyb3V0ZSwgJHNjb3BlLCAkbG9jYXRpb24sIFVzZXJTdmMsICRjb29raWVzLCBGaWxlVXBsb2FkZXIpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciB1cGxvYWRlciA9ICRzY29wZS51cGxvYWRlciA9IG5ldyBGaWxlVXBsb2FkZXIoe1xuICAgICAgICAgICAgdXJsOiBcIi9hcGkvdXNlcnMvcHVqYXJJbWF0Z2VcIixcbiAgICAgICAgICAgIGFsaWFzOiBcImltYWdlXCIsXG4gICAgICAgICAgICByZW1vdmVBZnRlclVwbG9hZDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICBcbiAgICAgICAgdXBsb2FkZXIub25CZWZvcmVVcGxvYWRJdGVtID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5mb3JtRGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbG5hbWU6ICRzY29wZS5jdXJyZW50VXNlci5faWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmVkaXRhdXNlciA9IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuZnJhc2UpIHtcbiAgICAgICAgICAgICAgICB1c2VyLmZyYXNlID0gJHNjb3BlLmZyYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB1c2VyLmZyYXNlID0gXCJNJ2FncmFkYSBTZWFyY2hZb3VyUGxhY2VcIjtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCRzY29wZS5hZmljaW9ucykge1xuICAgICAgICAgICAgICAgIHVzZXIuYWZpY2lvbnMgPSAkc2NvcGUuYWZpY2lvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHVzZXIuYWZpY2lvbnMgPSBcIkJ1c2NhciBsbG9jcyBwZXIgdG90IGVsIG3Ds25cIjtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCRzY29wZS5tZW5qYXIpIHtcbiAgICAgICAgICAgICAgICB1c2VyLm1lbmphciA9ICRzY29wZS5tZW5qYXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHVzZXIubWVuamFyID0gXCJFbCBxdWUgZW0gcG9zaW4gYWwgcGxhdFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCRzY29wZS5sbG9jKSB7XG4gICAgICAgICAgICAgICAgdXNlci5sbG9jID0gJHNjb3BlLmxsb2M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHVzZXIubGxvYyA9IFwiU29icmUgbGVzIG1vbnRhbnllc1wiO1xuXG4gICAgICAgICAgICB9XG5cblxuXG4gICAgICAgICAgICBVc2VyU3ZjLmVkaXRhY29uZmlndXJhY2lvKHVzZXIpO1xuXG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRoKFwiL3VzZXJsb2NhbGl0emFjaW9uc1wiKTtcbiAgICAgICAgfVxuXG5cbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuICAgIC5jb250cm9sbGVyKFwiSW5pY2lDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRzY29wZSwkbG9jYXRpb24pIHtcbiAgICAgICAgXG4gICAgICBcbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuLnNlcnZpY2UoXCJMb2NhbGl0emFjaW9TZXJ2ZWlcIiwgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgIHRoaXMuc3J2ID0gJHJlc291cmNlKCcvYXBpL2xvY2FsaXR6YWNpby86aWQnLCBudWxsLCB7XG4gICAgICAgICAgJ3VwZGF0ZSc6IHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG4gIHRoaXMuZWRpdGEgPSBudWxsO1xuICByZXR1cm4gdGhpcztcbiAgICBcbiAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcignTG9jYWxpdHphY2lvbnNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBMb2NhbGl0emFjaW9TZXJ2ZWksICRsb2NhdGlvbiwgVXNlclN2YywgJHJvb3RTY29wZSxDb21wYXJ0aWRhU2VydmVpKSB7XG5cblxuICAgICAgICAkc2NvcGUubG9jYWxpdHphY2lvbnMgPSBbXTtcbiAgICAgICAgVXNlclN2Yy5idXNjYSgkc2NvcGUuY3VycmVudFVzZXIuX2lkKTtcblxuICAgICAgICAkc2NvcGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICBVc2VyU3ZjLmJ1c2NhKCRzY29wZS5jdXJyZW50VXNlci5faWQpO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgJHNjb3BlLiRvbigndXN1YXJpJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlciA9IFVzZXJTdmMuZ2V0VXN1YXJpQWN0dWFsKCk7XG4gICAgICAgIH0pO1xuXG5cblxuICAgICAgICAkc2NvcGUuYm9ycmFyQXJyYXlsb2NhbGl0emFjaW8gPSBmdW5jdGlvbihsb2NhbGl0emFjaW8pIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLnVzZXIubG9jYWxpdHphY2lvbnMuc3BsaWNlKCRzY29wZS51c2VyLmxvY2FsaXR6YWNpb25zLmluZGV4T2YobG9jYWxpdHphY2lvKSwxKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgVXNlclN2Yy5tb2RpZmljYWFycmF5KCRzY29wZS51c2VyLCRzY29wZS51c2VyLmxvY2FsaXR6YWNpb25zKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLmJvcnJhcmxvY2FsaXR6YWNpbyhsb2NhbGl0emFjaW8pO1xuICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLmJvcnJhcmxvY2FsaXR6YWNpbyA9IGZ1bmN0aW9uKGxvY2FsaXR6YWNpbyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBMb2NhbGl0emFjaW9TZXJ2ZWkuc3J2LnJlbW92ZSh7XG4gICAgICAgICAgICAgICAgaWQ6IGxvY2FsaXR6YWNpby5faWQsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgICAgICBcblxuICAgICAgICAkc2NvcGUuY29tcGFydGlybG9jYWxpdHphY2lvID0gZnVuY3Rpb24obG9jYWxpdHphY2lvKSB7XG5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQ29tcGFydGlkYVNlcnZlaS5zcnYuc2F2ZSh7XG4gICAgICAgICAgICAgICAgdXN1YXJpOiAkc2NvcGUuVXN1YXJpYWNvbXBhcnRpcixcbiAgICAgICAgICAgICAgICBsb2NhbGl0emFjaW86IGxvY2FsaXR6YWNpbyxcbiAgICAgICAgICAgICAgICB1c3VhcmlwcmltZXI6IFwiR2lsXCJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGxvY2FsaXR6YWNpbykge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL3VzZXJsb2NhbGl0emFjaW9uc1wiKTtcbiAgICAgICAgICAgIH0pO1xuXG4gIFxuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICRzY29wZS5QZXJBcnJpYmFyPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBnZW9sb2NhbGl0emFtKGUpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cblxuXG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIkxvZ2luQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsJGxvY2F0aW9uLFVzZXJTdmMpe1xuICAgICAgICAgXG4gICAgXG4gICAgICAgICAkc2NvcGUuJHdhdGNoR3JvdXAoWyd1c2VybmFtZScsJ3Bhc3N3b3JkJ10sZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIFZpZ2lsZW0gbGVzIHZhcmlhYmxlcyBkZSBsJyRzY29wZSBcInVzZXJuYW1lXCJcbiAgICAgICAgICAgICAgICAgKiBpIFwicGFzc3dvcmRcIiBwZXIgZXNib3JyYXIgZWwgbWlzc2F0Z2UgZCdlcnJvclxuICAgICAgICAgICAgICAgICAqIHNpIGhpIGhhLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChuZXdWYWwhPW9sZFZhbClcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yPW51bGw7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24odXNlcm5hbWUscGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGlmICghdXNlcm5hbWUgfHwgIXBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gXCJIYXMgZCdlbXBsZW5hciB0b3RzIGVscyBjYW1wc1wiO1xuICAgICAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgICAgIFVzZXJTdmMubG9naW4odXNlcm5hbWUscGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yLHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBGdW5jacOzIHF1ZSBzJ2V4ZWN1dGFyw6Agc2kgaGkgaGEgdW4gZXJyb3IgZW4gZWwgbG9naW5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IDQwMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBlcnJvci5taXNzYXRnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkuc3VjY2VzcyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJTdmMuZ2V0VXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2kgdG90IHZhIGLDqSwgYW5lbSBhIGxhIHDDoGdpbmEgcHJpbmNpcGFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgZW1ldGVuIHVuIG1pc3NhdGdlIGRlIFwibG9naW5cIiBwZXIgYXZpc2FyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgbGEgbm9zdHJhIGFwcCBxdWUgbCd1c3VhcmkgaGEgZmV0IGxvZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcnJlY3RhbWVudC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgnbG9naW4nLCB1c2VyLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvdXNlcmxvY2FsaXR6YWNpb25zJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJykuY29udHJvbGxlcignTm92YWxvY2FsaXR6YWNpb2NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgTG9jYWxpdHphY2lvU2VydmVpLCBVc2VyU3ZjKSB7XG5cblxuXG4gICAgJHNjb3BlLnRlc3QgPSBmdW5jdGlvbihlLCBmKSB7XG4gICAgICAgIGlmKGUhPW51bGwmJmYhPW51bGwpe1xuICAgICAgICAkc2NvcGUubm9tID0gZS5uYW1lO1xuICAgICAgICAkc2NvcGUubG9nbyA9IGUuaWNvbjtcbiAgICAgICAgJHNjb3BlLmFkcmVjYSA9IGYucm91dGVzWzBdLmxlZ3NbMF0uZW5kX2FkZHJlc3M7XG4gICAgICAgICRzY29wZS50ZWwgPSBlLmZvcm1hdHRlZF9waG9uZV9udW1iZXI7XG4gICAgICAgICRzY29wZS5sYXRpdHVkID0gZS5nZW9tZXRyeS5sb2NhdGlvbi5BO1xuICAgICAgICAkc2NvcGUubG9uZ2l0dWQgPSBlLmdlb21ldHJ5LmxvY2F0aW9uLkY7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIkhlIGVudHJhdCBhICAgIFNPUlRcIilcbiAgICAgICAgJHNjb3BlLmFmZWdpcmxvY2FsaXR6YWNpbygpO1xuICAgIH1cbn1cblxuXG4gICAgJHNjb3BlLmFmZWdpcmxvY2FsaXR6YWNpbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBMb2NhbGl0emFjaW9TZXJ2ZWkuc3J2LnNhdmUoe1xuICAgICAgICAgICAgdXN1YXJpOiAkc2NvcGUuY3VycmVudFVzZXIuX2lkLFxuICAgICAgICAgICAgbm9tOiAkc2NvcGUubm9tLFxuICAgICAgICAgICAgbG9nbzogJHNjb3BlLmxvZ28sXG4gICAgICAgICAgICBhZHJlY2E6ICRzY29wZS5hZHJlY2EsXG4gICAgICAgICAgICB0ZWxlZm9uOiAkc2NvcGUudGVsLFxuICAgICAgICAgICAgbGF0aXR1ZDogJHNjb3BlLmxhdGl0dWQsXG4gICAgICAgICAgICBsb25naXR1ZDogJHNjb3BlLmxvbmdpdHVkLFxuICAgICAgICB9LCBmdW5jdGlvbihsb2NhbGl0emFjaW8pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGxvY2FsaXR6YWNpbyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFVzZXJTdmMucHV0KCRzY29wZS5jdXJyZW50VXNlciwgbG9jYWxpdHphY2lvKTtcblxuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvbm92YWxvY2FsaXR6YWNpb1wiKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIlJlZ2lzdHJlQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsJGxvY2F0aW9uLFVzZXJTdmMpIHtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5yZWdpc3RyZSA9IGZ1bmN0aW9uKHVzZXJuYW1lLHBhc3N3b3JkLHBhc3N3b3JkMikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoR3JvdXAoWyd1c2VybmFtZScsJ3Bhc3N3b3JkJywncGFzc3dvcmQyJ10sZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICAgICAgICBpZiAobmV3VmFsIT1vbGRWYWwpXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvcj1udWxsO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXBhc3N3b3JkIHx8ICFwYXNzd29yZDIgfHwgIXVzZXJuYW1lKXtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBcIkhhcyBkJ2VtcGxlbmFyIHRvdHMgZWxzIGNhbXBzXCI7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9ZWxzZSBpZiAocGFzc3dvcmQgPT09IHBhc3N3b3JkMil7XG4gICAgICAgICAgICAgICAgVXNlclN2Yy5yZWdpc3RyZSh1c2VybmFtZSxwYXNzd29yZClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyb3Isc3RhdHVzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gNDA5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvciA9IGVycm9yLm1pc3NhdGdlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gXCJMZXMgY29udHJhc2VueWVzIG5vIHPDs24gaWd1YWxzXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgLndoZW4oXCIvXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogJ0luaWNpQ29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncHJpbmNpcGFsLmh0bWwnLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLndoZW4oXCIvbm92YWxvY2FsaXR6YWNpb1wiLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6IFwiTm92YWxvY2FsaXR6YWNpb2NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwiY3JlYXJsb2NhbGl0emFjaW8uaHRtbFwiLFxuICAgICAgICBhdXRvcml0emF0OiB0cnVlXG4gICAgfSkud2hlbihcIi9sb2dpblwiLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6IFwiTG9naW5Db250cm9sbGVyXCIsXG4gICAgICAgIHRlbXBsYXRlVXJsOiBcImxvZ2luLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogZmFsc2VcbiAgICB9KS53aGVuKFwiL3JlZ2lzdHJlXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJSZWdpc3RyZUNvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicmVnaXN0cmUuaHRtbFwiLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLndoZW4oXCIvdXNlcmxvY2FsaXR6YWNpb25zXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJMb2NhbGl0emFjaW9uc0NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwidXNlcmxvY2FsaXR6YWNpb25zLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogdHJ1ZVxuICAgIH0pLndoZW4oXCIvc2VsZWNjaW9uYWNhdGVnb3JpZXNcIiwge1xuICAgICAgICBjb250cm9sbGVyOiBcIkluaWNpQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJzZWxlY2Npb25hY2F0ZWdvcmlhLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogdHJ1ZVxuICAgIH0pLndoZW4oXCIvZWRpdGFVc2VyXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJFZGl0YUNvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwiRWRpdGFVc2VyLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogdHJ1ZVxuICAgIH0pLndoZW4oXCIvdXN1YXJpXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJVc2VyQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJ1c3VhcmkuaHRtbFwiLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLm90aGVyd2lzZSh7XG4gICAgICAgIHJlZGlyZWN0VG86ICcvJ1xuICAgIH0pO1xuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHJlcXVpcmVCYXNlOiBmYWxzZVxuICAgIH0pO1xufSkucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsIFVzZXJTdmMsJGxvY2F0aW9uKSB7XG4gICAgXG4gICAgICAvKiAgQ2FkYSB2ZWdhZGEgcXVlIGNhbnZpZW0gZGUgcMOgZ2luYSBzZSBkaXNwYXJhIGVsXG4gICAgICAgIGV2ZW50ICRyb3V0ZUNoYW5nZVN0YXJ0LFxuICAgICAgICBTaSBsYSBww6BnaW5hIHF1ZSB2b2xlbSB2ZXVyZSB0w6kgbGEgcHJvcGlldGF0IFxuICAgICAgICBcImF1dG9yaXR6YXRcIjogYSB0cnVlIGkgbm8gaG8gZXN0w6AgbGxhdm9ycyBubyBcbiAgICAgICAgZmFyw6AgZWwgY2FudmkqL1xuICAgIFxuICAgICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0KSB7XG4gICAgICAgIGlmIChuZXh0KVxuICAgICAgICAgICAgaWYgKCFVc2VyU3ZjLmF1dGggJiBuZXh0LmF1dG9yaXR6YXQpe1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcbiAgICAgICAgICAgIH1cbiAgICB9KTtcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4gICAgLnNlcnZpY2UoJ1VzZXJTdmMnLCBmdW5jdGlvbigkaHR0cCwgJGNvb2tpZXMsICRyb290U2NvcGUpIHtcbiAgICAgICAgdmFyIHNydiA9IHRoaXM7XG4gICAgICAgIHNydi5hdXRoID0gZmFsc2U7XG4gICAgICAgIHNydi5Vc3VhcmkgPSBcIiBcIjtcbiAgICAgICAgc3J2LlVzdWFyaUFjdHVhbDtcbiAgICAgICAgc3J2LlVzdWFyaVZpZXc7XG4gICAgICAgIHNydi5jb29raWUgPSBmdW5jdGlvbih0b2tlbikge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImFyYSBoYXVyaWEgZCdlbnZpYXIgZWwgYnJvYWRjYXN0XCIpXG5cbiAgICAgICAgICAgICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWyd4LWF1dGgnXSA9IHRva2VuO1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2VycycpLnN1Y2Nlc3MoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHNydi5hdXRoID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2xvZ2luJywgZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKCRjb29raWVzW1wiX01hUVwiXSkge1xuICAgICAgICAgICAgdmFyIHRva2VuID0gJGNvb2tpZXNbXCJfTWFRXCJdO1xuICAgICAgICAgICAgc3J2LmNvb2tpZSh0b2tlbik7XG5cblxuICAgICAgICB9XG5cbiAgICAgICAgc3J2LnNldFVzZXJWaWV3ID0gZnVuY3Rpb24odXNlcikge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImxhIGlkXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codXNlcik7XG5cbiAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS91c2Vycy8nICsgdXNlciArICcnKS5zdWNjZXNzKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVzdWFyaXVzZXJcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgICAgc3J2LlVzdWFyaVZpZXcgPSBlO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndXNlcmRlZmluZWQnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBzcnYuZ2V0VXNlclZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBzcnYuVXN1YXJpVmlldztcbiAgICAgICAgfVxuXG5cbiAgICAgICAgc3J2LmdldFVzdWFyaUFjdHVhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNydi5Vc3VhcmlBY3R1YWw7XG4gICAgICAgIH1cblxuICAgICAgICBzcnYuZ2V0VXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2VycycpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNydi5idXNjYSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIFxuICAgICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL3VzZXJzJywge1xuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBzcnYuVXN1YXJpQWN0dWFsID0gZTtcblxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndXN1YXJpJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzcnYubG9naW4gPSBmdW5jdGlvbih1c2VybmFtZSwgcGFzc3dvcmQsIG5vTG9naW4pIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3Nlc3Npb25zJywge1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgU2kgbCdhdXRlbnRpY2FjacOzIMOpcyBjb3JyZWN0ZSBsaSBkaWVtIGEgbCdhbmd1bGFyIHF1ZSBjYWRhIFxuICAgICAgICAgICAgICAgICAgICB2ZWdhZGEgcXVlIGVzIGNvbXVuaXF1aSBhbWIgZWwgc2Vydmlkb3IgYWZlZ2VpeGkgZWwgdG9rZW4gXG4gICAgICAgICAgICAgICAgICAgIGFsIGhlYWRlciAneC1hdXRoJ1xuICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICBzcnYuVXN1YXJpID0gdXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ3gtYXV0aCddID0gZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSkgc3J2LmF1dGggPSB0cnVlO1xuICAgICAgICAgICAgfSkuZXJyb3IoZnVuY3Rpb24oZXJyb3IsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIFNpIGwndXN1YXJpIGkgY29udHJhc2VueWEgbm8gw6lzIGNvcnJlY3RlIGV4ZWN1dGEgbGFcbiAgICAgICAgICAgICAgICAgICAgZnVuY2nDs24gY2FsbGJhY2sgcXVlIGxpIGhlbSBwYXNzYXQgY29tIHBhcsOgbWV0cmVcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIG5vTG9naW4oZXJyb3IsIHN0YXR1cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yZWdpc3RyZSA9IGZ1bmN0aW9uKHVzZXJuYW1lLCBwYXNzd29yZCkge1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBQZXIgcmVnaXN0cmFyIHVuIHVzdWFyaSBub3UsIG5vbcOpcyBoZW0gZGUgZmVyIHVuIHBvc3RcbiAgICAgICAgICAgICAgICBhIGwnYXBpIGQndXN1YXJpc1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJFTlRSRU0gVU4gVVNVQVJJXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2VycycsIHtcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkLFxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5sb2dPdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUXVhbiBsJ3VzdWFyaSBmYSBsb2dvdXQgcydlc2JvcnJhIGVsIHRva2VuXG4gICAgICAgICAgICAgICAgaSBwb3NlbSBsYSBwcm9waWV0YXQgZGVsIHNlcnZlaSBcImF1dGhcIiBhIGZhbHNlXG4gICAgICAgICAgICAqL1xuXG4gICAgICAgICAgICBzcnYuYXV0aCA9IGZhbHNlO1xuICAgICAgICAgICAgZGVsZXRlICRjb29raWVzW1wiX01hUVwiXTtcbiAgICAgICAgICAgICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWyd4LWF1dGgnXSA9IFwiXCI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5tb2RpZmljYWFycmF5ID0gZnVuY3Rpb24odXNlciwgYXJyYXkpIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dChcImFwaS91c2Vycy9hcnJheWxvY2FsaXR6YWNpb25zXCIsIHtcbiAgICAgICAgICAgICAgICBcInVzXCI6IHVzZXIsXG4gICAgICAgICAgICAgICAgXCJhcnJheVwiOiBhcnJheVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVkaXRhY29uZmlndXJhY2lvID0gZnVuY3Rpb24odXNlcikge1xuXG4gICAgICAgICAgICB2YXIgY29zID0ge1xuICAgICAgICAgICAgICAgIFwidXN1YXJpXCI6IHVzZXJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoXCIvYXBpL3VzZXJzL2VkaXRhY29uZmlndXJhY2lvXCIsIHtcbiAgICAgICAgICAgICAgICBcImNvc1wiOiBjb3NcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5wdXQgPSBmdW5jdGlvbih1c2VyLCBsb2NhbGl0emFjaW8pIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoXCIvYXBpL3VzZXJzXCIsIHtcbiAgICAgICAgICAgICAgICBcInVzZXJcIjogdXNlcixcbiAgICAgICAgICAgICAgICBcImxvY2FsaXR6YWNpb1wiOiBsb2NhbGl0emFjaW9cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG5cbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuICAgIC5jb250cm9sbGVyKFwiVXNlckNvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHNjb3BlLCRsb2NhdGlvbixVc2VyU3ZjLExvY2FsaXR6YWNpb1NlcnZlaSkge1xuICAgICAgICAkc2NvcGUudXN1YXJpID0gVXNlclN2Yy5nZXRVc2VyVmlldygpO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICAkc2NvcGUuY29tcGFydGlyTG9jYWxpdHphY2lvID0gZnVuY3Rpb24oZSx1KSB7XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgY29uc29sZS5sb2coXCJFbnRyZXMgYSBDb21wYXJ0aXJcIik7XG4gICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgICAgY29uc29sZS5sb2codSk7XG4gICAgICBMb2NhbGl0emFjaW9TZXJ2ZWkuc3J2LnNhdmUoe1xuICAgICAgICAgICAgdXN1YXJpOiAkc2NvcGUuY3VycmVudFVzZXIuX2lkLFxuICAgICAgICAgICAgbm9tOiBlLm5vbSxcbiAgICAgICAgICAgIGxvZ286IGUubG9nbyxcbiAgICAgICAgICAgIGFkcmVjYTogZS5hZHJlY2EsXG4gICAgICAgICAgICB0ZWxlZm9uOiBlLnRlbGVmb24sXG4gICAgICAgICAgICBsYXRpdHVkOiBlLmxhdGl0dWQsXG4gICAgICAgICAgICBsb25naXR1ZDogZS5sb25naXR1ZCxcbiAgICAgICAgICAgIHVzdWFyaU9yaWdlbjp1LnVzZXJuYW1lLFxuICAgICAgICB9LCBmdW5jdGlvbihsb2NhbGl0emFjaW8pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiR3VhcmRhZGEgQmVcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhsb2NhbGl0emFjaW8pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBVc2VyU3ZjLnB1dCgkc2NvcGUuY3VycmVudFVzZXIsIGxvY2FsaXR6YWNpbyk7XG5cbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL3VzZXJsb2NhbGl0emFjaW9uc1wiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJykuZGlyZWN0aXZlKCdjb21wYXJ0aXInLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgc29ydGJ5OiBcIkBcIixcbiAgICAgICAgICAgIG9uc29ydDogXCI9XCJcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGlkPVwicGFuZWwtZGlyZWNjaW9uc1wiPjxwIGlkPVwiZGFkZXNJbmljaURpcmVjY2lvbnNcIj5BZHJlw6dhIEluaWNpIChwZXIgZGVmZWN0ZSBsYSB0ZXZhIGdlb2xvY2FsaXR6YWNpbykgPHNwYW4gaWQ9XCJib3RvQm9ycmFEaXJlY2Npb25zXCIgb25jbGljaz1cIm5ldGVqYSgpXCIgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVwiPjwvc3Bhbj48L3A+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgb25jaGFuZ2U9XCJub3ZhZGlyZWNjaW8oKVwiIGlkPVwiaW5pY2lcIj48L2lucHV0PjxkaXY+PHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIG9uY2hhbmdlPVwibm92YWRpcmVjY2lvKClcIiBpZD1cIm1vZGVcIj48b3B0aW9uIHZhbHVlPVwiRFJJVklOR1wiPkNvdHhlPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cIldBTEtJTkdcIj5DYW1pbmFudDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCJUUkFOU0lUXCI+VHJhc3BvcnQgUMO6YmxpYzwvb3B0aW9uPjwvc2VsZWN0PjwvZGl2PjwvZGl2PjxkaXYgaWQ9XCJkaXJlY3Rpb25zLXBhbmVsXCI+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcblxuXG5cbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb25zRGlzcGxheSA9IG5ldyBnb29nbGUubWFwcy5EaXJlY3Rpb25zUmVuZGVyZXIoKTtcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb25zU2VydmljZSA9IG5ldyBnb29nbGUubWFwcy5EaXJlY3Rpb25zU2VydmljZSgpO1xuICAgICAgICAgICAgdmFyIGdlb2NvZGVyO1xuICAgICAgICAgICAgLypBSVhPIEhPIElHVUFMTyBBIEwnT0JKRUNURSBMT0NBTElUWkFDSU8gUEVSUVVFIFFVQU4gRVhFQ1VUSSBMQSBGVU5DSU8gTk9WQURJUkVDQ0lPIEVTVElHVUkgTCdBRFJFQ0EgR1VBUkRBREEqL1xuICAgICAgICAgICAgdmFyIG9iamVjdGVBZHJlY2FGaW5hbDtcbiAgICAgICAgICAgIHZhciBwb3NpY2lvaW5pY2lhbFJvdXRlO1xuICAgICAgICAgICAgdmFyIGFkcmVjYWluaWNpYWw7XG4gICAgICAgICAgICB2YXIgYWRyZWNhZmluYWw7XG4gICAgICAgICAgICB2YXIgZ2VvbG9jYWxpdHphY2lvRGVuZWdhZGE9ZmFsc2U7XG4gICAgICAgICAgICB2YXIgdGlwdXNkZXRyYW5zcG9ydDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gc3VjY2Vzcyhwb3MpIHtcbiAgICAgICAgICAgICAgICBnZW9sb2NhbGl0emFjaW9EZW5lZ2FkYT1mYWxzZTtcbiAgICAgICAgICAgICAgICBwb3NpY2lvaW5pY2lhbFJvdXRlID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhwb3MuY29vcmRzLmxhdGl0dWRlLCBwb3MuY29vcmRzLmxvbmdpdHVkZSk7XG4gICAgICAgICAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHtcbiAgICAgICAgICAgICAgICAgICAgJ2xhdExuZyc6IHBvc2ljaW9pbmljaWFsUm91dGVcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhZHJlY2FpbmljaWFsID0gcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzcztcblxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJsYSBtZXZhIFwiICsgYWRyZWNhaW5pY2lhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5pY2knKS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgYWRyZWNhaW5pY2lhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5pY2knKS5zZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJywgYWRyZWNhaW5pY2lhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXB1c2RldHJhbnNwb3J0ID0gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RlJykudmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjY2lvbnMoKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuXG5cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBmdW5jdGlvbiBlcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgICBhbGVydChcIk5vIGhpIGhhIGdlb2xvY2FsaXR6YWNpw7MhXCIpO1xuICAgICAgICAgICAgICAgIGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhPXRydWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFUlJPUignICsgZXJyLmNvZGUgKyAnKTogJyArIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdpbmRvdy5nZW9sb2NhbGl0emFtID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIG9iamVjdGVBZHJlY2FGaW5hbCA9IGU7XG4gICAgICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgICAgICB9XG5cblxuXG5cblxuICAgICAgICAgICAgd2luZG93LmRpcmVjY2lvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhPT1mYWxzZSl7XG4gICAgICAgICAgICAgICAgYWRyZWNhZmluYWwgPSBvYmplY3RlQWRyZWNhRmluYWwuYWRyZWNhO1xuICAgICAgICAgICAgICAgIHZhciBhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhbmVsLWRpcmVjY2lvbnMnKTtcbiAgICAgICAgICAgICAgICAgYS5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7XG4gICAgICAgICAgIC8vICAgIHRpcHVzZGV0cmFuc3BvcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kZScpLnZhbHVlO1xuICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldFBhbmVsKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXJlY3Rpb25zLXBhbmVsJykpO1xuXG5cbiAgICAgICAgICAgICAgICBjYWxjUm91dGUoYWRyZWNhZmluYWwsIGFkcmVjYWluaWNpYWwsdGlwdXNkZXRyYW5zcG9ydClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICAgICAgd2luZG93Lm5vdmFkaXJlY2NpbyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgYWRyZWNhaW5pY2lhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbmljaScpLnZhbHVlO1xuICAgICAgICAgICAgICAgIHRpcHVzZGV0cmFuc3BvcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kZScpLnZhbHVlO1xuICAgICAgICAgICAgICAgIGRpcmVjY2lvbnMoKTtcbiAgICAgICAgICAgIH1cblxuXG5cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsY1JvdXRlKGEsIGUsdCkge1xuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiBlLFxuICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbjogYSxcbiAgICAgICAgICAgICAgICAgICAgdHJhdmVsTW9kZTogZ29vZ2xlLm1hcHMuVHJhdmVsTW9kZVt0XVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUocmVxdWVzdCwgZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNTdGF0dXMuT0spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldERpcmVjdGlvbnMocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpbmRvdy5uZXRlamEgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYW5lbC1kaXJlY2Npb25zJykuc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldFBhbmVsKG51bGwpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpLmRpcmVjdGl2ZSgnbWFwJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1dG9jb21wbGV0ZTtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgc29ydGJ5OiBcIkBcIixcbiAgICAgICAgICAgIG9uc29ydDogXCI9XCJcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGlkPVwibWFwLWNhbnZhc1wiPjwvZGl2PjxkaXYgaWQ9XCJzdWNjZXNzXCI+PC9kaXY+PGRpdiBjbGFzcz1cImNvbC1tZC1vZmZzZXQtNSBjb2wtbWQtMiBjb2wteHMtMTJcIj48YnV0dG9uIGlkPVwiYm90b1Blckd1YXJkYXJcIiBjbGFzcz1cImJ0biBidG4td2FybmluZ1wiIG5nLWNsaWNrPVwic29ydCgpXCI+R3VhcmRhciBDZXJjYSAgPHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXNhdmVcIj48L3NwYW4+PC9idXR0b24+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcblxuXG4gICAgICAgICAgICB2YXIgT2JqZWN0ZUd1YXJkYXI7XG4gICAgICAgICAgICB2YXIgT2JqZWN0ZVJlc3BvbnNlR3VhZGFyO1xuICAgICAgICAgICAgdmFyIGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhPWZhbHNlO1xuICAgICAgICAgICAgdmFyIGdlb2NvZGVyO1xuICAgICAgICAgICAgdmFyIG1hcDtcbiAgICAgICAgICAgIHZhciBtYXBSb3V0ZTtcbiAgICAgICAgICAgIHZhciBNQVJLRVJfUEFUSCA9ICdodHRwczovL21hcHMuZ3N0YXRpYy5jb20vaW50bC9lbl91cy9tYXBmaWxlcy9tYXJrZXJfb3JhbmdlJztcbiAgICAgICAgICAgIHZhciBtYXJrZXJMZXR0ZXI7XG4gICAgICAgICAgICB2YXIgbWFya2VySWNvbjtcbiAgICAgICAgICAgIHZhciBzZXJ2aWNlO1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbnNEaXNwbGF5O1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbnNTZXJ2aWNlID0gbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNTZXJ2aWNlKCk7XG4gICAgICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICAgICAgdmFyIGFycmF5bWFyY2Fkb3JzID0gW107XG4gICAgICAgICAgICB2YXIgYXJyYXlEaXJlY2Npb25zID0gW107XG5cblxuXG4gICAgICAgICAgICBcblxuLypBUVVJIENSRU8gTCdBVVRPQ09NUExFVEFUIERFIEdPT0dMRSBQRVIgTCdJTlBVVCovXG4gICAgICAgICAgICBhdXRvY29tcGxldGUgPSBuZXcgZ29vZ2xlLm1hcHMucGxhY2VzLkF1dG9jb21wbGV0ZShcbiAgICAgICAgICAgICAgICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZHJlc3MnKSksIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZXM6IFsnZ2VvY29kZSddXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKGF1dG9jb21wbGV0ZSwgJ3BsYWNlX2NoYW5nZWQnLCBvblBsYWNlQ2hhbmdlZCk7XG5cblxuICAgICAgICAgICAgZnVuY3Rpb24gb25QbGFjZUNoYW5nZWQoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsYWNlID0gYXV0b2NvbXBsZXRlLmdldFBsYWNlKCk7XG4gICAgICAgICAgICAgICAgaWYgKHBsYWNlLmdlb21ldHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5wYW5UbyhwbGFjZS5nZW9tZXRyeS5sb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKDE1KTtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkcmVzcycpLnBsYWNlaG9sZGVyID0gJ0VudGVyIGEgY2l0eSc7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbi8qIEFRVUkgQ1JFTyBFTCBTRUxFQ1QgQU1CIExFUyBPUENJT05TIFFVRSBKTyBWVUkgUEVSIFBPREVSIFBPU0FSLUxPIEEgVU4gU0VMRUNUIDIqL1xuICAgICAgICAgICAgdmFyIGFycmF5VGlwdXMgPSBbXCJBZXJvcG9ydFwiLCBcIkFxdWFyaVwiLCBcIkdhbGVyaWEgZCdBcnRcIiwgXCJGbGVjYVwiLCBcIkJhbmNcIiwgXCJCYXJcIiwgXCJCdXNcIiwgXCJCb3RpZ2FcIiwgXCJSZXN0YXVyYW50c1wiLCBcIkhvc3BpdGFsXCIsIFwiQ2FzaW5vXCIsIFwiRXNwb3J0XCIsIFwiVW5pdmVyc2l0YXRcIiwgXCJIb3RlbFwiXTtcbiAgICAgICAgICAgIHZhciBhcnJheVR5cGVzID0gW1wiYWlycG9ydFwiLCBcImFxdWFyaXVtXCIsIFwiYXJ0X2dhbGxlcnlcIiwgXCJiYWtlcnlcIiwgXCJiYW5rXCIsIFwiYmFyXCIsIFwiYnVzX3N0YXRpb25cIiwgXCJzdG9yZVwiLCBcInJlc3RhdXJhbnRcIiwgXCJob3NwaXRhbFwiLCBcImNhc2lub1wiLCBcInN0YWRpdW1cIiwgXCJ1bml2ZXJzaXR5XCIsIFwibG9kZ2luZ1wiXTtcbiAgICAgICAgICAgIHZhciBzZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGlwdXMnKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlUaXB1cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBvcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICAgICAgICAgICAgICBvcHQuaW5uZXJIVE1MID0gYXJyYXlUaXB1c1tpXTtcbiAgICAgICAgICAgICAgICBvcHQudmFsdWUgPSBhcnJheVR5cGVzW2ldO1xuICAgICAgICAgICAgICAgIHNlbC5hcHBlbmRDaGlsZChvcHQpO1xuICAgICAgICAgICAgfVxuXG5cblxuIC8qIEFRVUkgQ1JFTyBFTCBNQVBBIEFNQiBVTkVTIENPT1JERU5BREVTIENPTkNSRVRFUyBJIFVOIFpPT00gKi9cbiAgICAgICAgICAgIHdpbmRvdy5jcmVhck1hcGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGF0bG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyg0Mi4yNjY3LCAyLjk2NjcpO1xuICAgICAgICAgICAgICAgIHZhciBtYXBPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICB6b29tOiAxMCxcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBsYXRsbmdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1hcC1jYW52YXNcIiksIG1hcE9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHZhciB3ID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYXAtY2FudmFzXCIpLnN0eWxlLndpZHRoID0gdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyZWFyTWFwYSgpO1xuXG5cblxuXG5cbiAgICAgICAgICAgIHZhciBsb2NhbGl0emFjaW87XG5cbiAgICAgICAgICAgIHZhciBpbmZvd2luZG93O1xuICAgICAgICAgICAgdmFyIHBvc2ljaW9pbmljaWFsUm91dGU7XG5cblxuXG4gICAgICAgICAgICAvKkFRVUkgRVQgRElVIFNJIEhBIFRST0JBVCBCw4kgTEEgVEVWQSBHRU9MT0NBTElUWkFDSU8qL1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBzdWNjZXNzKHBvcykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUE9TSUNJT1wiKVxuICAgICAgICAgICAgICAgIHBvc2ljaW9pbmljaWFsUm91dGUgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKHBvcy5jb29yZHMubGF0aXR1ZGUsIHBvcy5jb29yZHMubG9uZ2l0dWRlKTtcbiAgICAgICAgICAgICAgICBnZW9sb2NhbGl0emFjaW9EZW5lZ2FkYT1mYWxzZTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGVycm9yKGVycikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRVJST1IoJyArIGVyci5jb2RlICsgJyk6ICcgKyBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgYWxlcnQoXCJObyBlcyBwb3QgYWNjZWRpciBhIGxhIHRldmEgZ2VvbG9jYWxpdHphY2lvXCIpO1xuICAgICAgICAgICAgICAgIGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhPXRydWU7XG4gICAgICAgICAgICB9O1xuXG5cbiAgICAgICAgICAgIC8qQVFVRVNUQSBGVU5DSU8gU0VSVkVJWCBQRVIgVFJFVVJFIEVMUyBNQVJDQURPUlMgREVMIE1BUEEqL1xuXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIFRyZXVyZU1hcmNhZG9ycygpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5bWFyY2Fkb3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5bWFyY2Fkb3JzW2ldLnNldE1hcChudWxsKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFycmF5bWFyY2Fkb3JzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qQVFVRVNUQSBGVU5DSU8gU0VSVkVJWCBQRVIgVFJFVVJFIExFUyBSVVRFUyBERUwgTUFQQSovXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIFRyZXVyZURpcmVjY2lvbnMoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheURpcmVjY2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyYXlEaXJlY2Npb25zW2ldLnNldE1hcChudWxsKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFycmF5RGlyZWNjaW9ucyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBBUVVFU1RBICBGVU5DSU8gU0VSVkVJWCBQRVIgQUdBRkFSIEwnQURSRcOHQSBRVUUgTEkgUE9TRVMgSSBFVCBUUkFOU0ZPUk1BIExBIERJUkVDQ0lPIEVOIEdFT0xPQ0FMSVRaQUNJTyBVTiBDT1BcbiAgICAgICAgICAgIEZFVCBBSVjDkiBFU1hFQ1VUQSBMQSBGVU5DSU8gUVVFIENSRUEgRUxTIE1BUkNBRE9SUyovXG4gICAgICAgICAgICB3aW5kb3cuY29kZUFkZHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoYXJyYXltYXJjYWRvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBUcmV1cmVNYXJjYWRvcnMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIGlmIChhcnJheURpcmVjY2lvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgVHJldXJlRGlyZWNjaW9ucygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgICAgICAgICB2YXIgYWRyZWNhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGRyZXNzXCIpLnZhbHVlO1xuICAgICAgICAgICAgICAgIGdlb2NvZGVyLmdlb2NvZGUoe1xuICAgICAgICAgICAgICAgICAgICAnYWRkcmVzcyc6IGFkcmVjYVxuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSgxNCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Q2VudGVyKHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxpdHphY2lvID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhdGl0dWQ6IHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb24uQSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb25naXR1ZDogcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvbi5GXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFyY2Fkb3JzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydChcIkdlb2NvZGUgd2FzIG5vdCBzdWNjZXNzZnVsIGZvciB0aGUgZm9sbG93aW5nIHJlYXNvbjogXCIgKyBzdGF0dXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgLyogQVFVRVNUQSBGVU5DSU8gRVQgUElOVEEgVE9UUyBFTFMgTExPQ1MgUVVFIEhBUyBGSUxUUkFUIEEgUEFSVElSIERFIEwnQURSRcOHQSBRVUUgSEFTIFBBU1NBVCBBQkFOUyovXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG1hcmNhZG9ycygpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHlybW9udCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcobG9jYWxpdHphY2lvLmxhdGl0dWQsIGxvY2FsaXR6YWNpby5sb25naXR1ZCk7XG4gICAgICAgICAgICAgICAgdmFyIHJhZGkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJhZGlcIikudmFsdWU7XG4gICAgICAgICAgICAgICAgdmFyIHRpcHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXB1c1wiKS52YWx1ZTtcbiAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb246IHB5cm1vbnQsXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogcmFkaSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZXM6IFt0aXB1c11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGluZm93aW5kb3cgPSBuZXcgZ29vZ2xlLm1hcHMuSW5mb1dpbmRvdygpO1xuICAgICAgICAgICAgICAgIHNlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMucGxhY2VzLlBsYWNlc1NlcnZpY2UobWFwKTtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlLm5lYXJieVNlYXJjaChyZXF1ZXN0LCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMucGxhY2VzLlBsYWNlc1NlcnZpY2VTdGF0dXMuT0spIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCdBJy5jaGFyQ29kZUF0KDApICsgaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJJY29uID0gTUFSS0VSX1BBVEggKyBtYXJrZXJMZXR0ZXIgKyAnLnBuZyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHRzW2ldLm5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3JlYXRlTWFya2VyKHJlc3VsdHNbaV0pO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBBUVVJIEVUIENSRUEgRUxTIE1BUkNBRE9SUyBBTCBNQVBBICovXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZU1hcmtlcihwbGFjZSkge1xuICAgICAgICAgICAgICAgIHZhciBwbGFjZUxvYyA9IHBsYWNlLmdlb21ldHJ5LmxvY2F0aW9uO1xuICAgICAgICAgICAgICAgIHZhciBtYXJrZXIgPSBuZXcgZ29vZ2xlLm1hcHMuTWFya2VyKHtcbiAgICAgICAgICAgICAgICAgICAgbWFwOiBtYXAsXG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjogZ29vZ2xlLm1hcHMuQW5pbWF0aW9uLkRST1AsXG4gICAgICAgICAgICAgICAgICAgIGljb246IG1hcmtlckljb24sXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBwbGFjZS5nZW9tZXRyeS5sb2NhdGlvblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFycmF5bWFyY2Fkb3JzLnB1c2gobWFya2VyKTtcblxuICAgICAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmFkZExpc3RlbmVyKG1hcmtlciwgJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByYXRpbmdIdG1sID0gJ05vIGhpIGhhIFB1bnRzJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYWNlLnJhdGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJhdGluZ0h0bWwgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYWNlLnJhdGluZyA8IChpICsgMC41KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXRpbmdIdG1sICs9ICcmIzEwMDI1Oyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXRpbmdIdG1sICs9ICcmIzEwMDI5Oyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaW5mb3dpbmRvdy5zZXRDb250ZW50KFwiPGRpdiA+PGltZyBjbGFzcz0naW1hZ2VJY29uJyBzcmM9J1wiICsgcGxhY2UuaWNvbiArIFwiJy8+XCIgKyBwbGFjZS5uYW1lICsgXCI8L2Rpdj48ZGl2PlwiICsgcmF0aW5nSHRtbCArIFwiPC9kaXY+PGJ1dHRvbiBpZD0nYm90b0FycmliYXInIGNsYXNzPSdidG4gYnRuLWRlZmF1bHQnPkNvbSBoaSBhcnJpYm88L2J1dHRvbj5cIik7XG4gICAgICAgICAgICAgICAgICAgIGluZm93aW5kb3cub3BlbihtYXAsIHRoaXMpO1xuXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5wbGFjZSA9IHBsYWNlO1xuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm90b0FycmliYXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIENvbUFycmlibyk7XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdpbmRvdy5Db21BcnJpYm8gPSBmdW5jdGlvbihyKSB7XG4gICAgICAgICAgICAgICAgaWYoZ2VvbG9jYWxpdHphY2lvRGVuZWdhZGE9PWZhbHNlKXtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpcmVjdGlvbi1wYW5lbFwiKS5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7ICAgIFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3RvUGVyR3VhcmRhcicpLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgICAgICAgICAgICAgciA9IHdpbmRvdy5wbGFjZTtcbiAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgcGxhY2VJZDogci5wbGFjZV9pZFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBzZXJ2aWNlLmdldERldGFpbHMocmVxdWVzdCwgZnVuY3Rpb24ocGxhY2UsIHN0YXR1cykge1xuXG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGhhaWdodCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoMzcuNzY5OTI5OCwgLTEyMi40NDY5MTU3KTtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uc0Rpc3BsYXkgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1JlbmRlcmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXBPcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMTQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IGhhaWdodFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcnJheURpcmVjY2lvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgVHJldXJlRGlyZWNjaW9ucygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFycmF5RGlyZWNjaW9ucy5wdXNoKGRpcmVjdGlvbnNEaXNwbGF5KTtcbiAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uc0Rpc3BsYXkuc2V0TWFwKG1hcCk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGNSb3V0ZShwbGFjZSk7XG5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGNSb3V0ZShmKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0ZUd1YXJkYXIgPSBmO1xuICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZE1vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kZScpLnZhbHVlO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IHBvc2ljaW9pbmljaWFsUm91dGU7XG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbjogc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uOiBmLmdlb21ldHJ5LmxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICB0cmF2ZWxNb2RlOiBnb29nbGUubWFwcy5UcmF2ZWxNb2RlW3NlbGVjdGVkTW9kZV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUocmVxdWVzdCwgZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cykge1xuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdGVSZXNwb25zZUd1YWRhciA9IHJlc3BvbnNlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qQVFVSSBFTVBMRU5PIExFUyBEQURFUyBERUwgTExPQyBFTiBFTCBQUklNRVIgRElWKi9cblxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhbmVsLTEnKTtcbiAgICAgICAgICAgICAgICAgICAgYi5pbm5lckhUTUwgPSBcIiBcIjtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYTEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGEyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYTQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGE1ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgICAgICAgICAgICAgIC8vIGEuc2V0QXR0cmlidXRlKCdjbGFzcycsICdsaXN0LWdyb3VwLWl0ZW0nKTtcbiAgICAgICAgICAgICAgICAgICAgYi5hcHBlbmRDaGlsZChhKTtcbiAgICAgICAgICAgICAgICAgICAgYTEuaW5uZXJIVE1MID0gXCI8aW1nIGNsYXNzPSdpbWFnZUljb24nIHNyYz0nXCIgKyBmLmljb24gKyBcIicvPjxiPiBcIiArIGYubmFtZSArIFwiPC9iPlwiO1xuICAgICAgICAgICAgICAgICAgICBhMi5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSdub21EYWRhJz5BZHJlw6dhOiA8L3NwYW4+XCIgKyByZXNwb25zZS5yb3V0ZXNbMF0ubGVnc1swXS5lbmRfYWRkcmVzcztcbiAgICAgICAgICAgICAgICAgICAgYTMuaW5uZXJIVE1MID0gXCI8c3BhbiBjbGFzcz0nbm9tRGFkYSc+RHVyYWRhOiA8L3NwYW4+XCIgKyByZXNwb25zZS5yb3V0ZXNbMF0ubGVnc1swXS5kdXJhdGlvbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoZi5vcGVuaW5nX2hvdXJzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmLm9wZW5pbmdfaG91cnMub3Blbl9ub3cgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGE0LmlubmVySFRNTCA9IFwiPHNwYW4gY2xhc3M9J25vbURhZGEnPkhvcmFyaTogPC9zcGFuPjxzcGFuIHN0eWxlPSdjb2xvcjpncmVlbic+TG9jYWwgT2JlcnQ8L3NwYW4+XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhNC5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSdub21EYWRhJz5Ib3Jhcmk6IDwvc3Bhbj48c3BhbiBzdHlsZT0nY29sb3I6cmVkJz5Mb2NhbCBUYW5jYXQ8L3NwYW4+XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYoZi5mb3JtYXR0ZWRfcGhvbmVfbnVtYmVyIHx8IGYuaW50ZXJuYXRpb25hbF9waG9uZV9udW1iZXIpe1xuICAgICAgICAgICAgICAgICAgICBhNS5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSdub21EYWRhJz5UZWw6IDwvc3Bhbj5cIiArIGYuZm9ybWF0dGVkX3Bob25lX251bWJlciArIFwiLCBcIiArIGYuaW50ZXJuYXRpb25hbF9waG9uZV9udW1iZXI7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle2E1LmlubmVySFRNTCA9XCJObyBoaSBoYSBhcXVlc3RhIGluZm9ybWFjacOzXCI7fTtcbiAgICAgICAgICAgICAgICAgICAgYS5hcHBlbmRDaGlsZChhMSk7XG4gICAgICAgICAgICAgICAgICAgIGEuYXBwZW5kQ2hpbGQoYTIpO1xuICAgICAgICAgICAgICAgICAgICBhLmFwcGVuZENoaWxkKGEzKTtcbiAgICAgICAgICAgICAgICAgICAgYS5hcHBlbmRDaGlsZChhNCk7XG4gICAgICAgICAgICAgICAgICAgIGEuYXBwZW5kQ2hpbGQoYTUpO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qQVFVSSBFTVBMRU5PIExFUyBEQURFUyBERUwgTExPQyBFTiBFTCBTRUdPTiBESVYqL1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhbmVsLTInKTtcbiAgICAgICAgICAgICAgICAgICAgZC5pbm5lckhUTUwgPSBcIiBcIjtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYzEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGMyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjMyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBjNSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBhLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnbGlzdC1ncm91cC1pdGVtJyk7XG4gICAgICAgICAgICAgICAgICAgIGQuYXBwZW5kQ2hpbGQoYyk7XG4gICAgICAgICAgICAgICAgICAgIGlmKGYud2Vic2l0ZSl7XG4gICAgICAgICAgICAgICAgICAgIGMxLmlubmVySFRNTCA9IFwiPHNwYW4gY2xhc3M9J25vbURhZGEnPldlYjogPC9zcGFuPjxhIGhyZWY9J1wiICsgZi53ZWJzaXRlICsgXCInPlwiICsgZi53ZWJzaXRlICsgXCI8L2E+XCI7XG4gICAgICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgICAgICAgICAgIGMxLmlubmVySFRNTCA9XCJObyBoaSBoYSBhcXVlc3RhIGluZm9ybWFjacOzXCI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYzIuaW5uZXJIVE1MID0gXCI8c3BhbiBjbGFzcz0nbm9tRGFkYSc+RXNwYWkgR29vZ2xlOiA8L3NwYW4+PGEgaHJlZj0nXCIgKyBmLnVybCArIFwiJz5cIiArIGYudXJsICsgXCI8L2E+XCI7XG4gICAgICAgICAgICAgICAgICAgIGMzLmlubmVySFRNTCA9IFwiPHNwYW4gY2xhc3M9J25vbURhZGEnPkRpc3RhbmNpYTogPC9zcGFuPlwiICsgcmVzcG9uc2Uucm91dGVzWzBdLmxlZ3NbMF0uZGlzdGFuY2UudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJhdGluZyA9ICdObyBoaSBoYSBQdW50cyc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmLnJhdGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJhdGluZyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGxhY2UucmF0aW5nIDwgKGkgKyAwLjUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdGluZyArPSAnJiMxMDAyNTsnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF0aW5nICs9ICcmIzEwMDI5Oyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYzUuaW5uZXJIVE1MID0gXCI8c3BhbiBjbGFzcz0nbm9tRGFkYSc+UHVudHM6IDwvc3Bhbj5cIiArIHJhdGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIGMuYXBwZW5kQ2hpbGQoYzUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYy5hcHBlbmRDaGlsZChjMSk7XG4gICAgICAgICAgICAgICAgICAgIGMuYXBwZW5kQ2hpbGQoYzIpO1xuICAgICAgICAgICAgICAgICAgICBjLmFwcGVuZENoaWxkKGMzKTtcblxuXG5cblxuICAgICAgICAgICAgICAgICAgICBpZiAoZi5waG90b3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvdG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZm90bycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm90by5pbm5lckhUTUwgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZi5waG90b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGl2aW1hZ2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXZpbWFnZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2NvbC14cy0xMiBjb2wtbWQtMyBkaXZkZWxlc2ltYXRnZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdXJsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGl2aW1hZ2UuYXBwZW5kQ2hpbGQodXJsKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2ltZy10aHVtYm5haWwgZm90b3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwuc2V0QXR0cmlidXRlKCdzcmMnLCBmLnBob3Rvc1tpXS5nZXRVcmwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWF4V2lkdGgnOiAzMDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYXhIZWlnaHQnOiAyMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm90by5hcHBlbmRDaGlsZChkaXZpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICBcblxuXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5EaXJlY3Rpb25zU3RhdHVzLk9LKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXREaXJlY3Rpb25zKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIHNjb3BlLnNvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3VjY2VzcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdWNjZXNzJyk7XG4gICAgICAgICAgICAgICAgdmFyIG1pc3NhdGdlU3VjY2VzR3VhcmRhdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgIG1pc3NhdGdlU3VjY2VzR3VhcmRhdC5zZXRBdHRyaWJ1dGUoJ2lkJywnbWlzc2F0Z2VTdWNjZXNHdWFyZGF0Jyk7XG4gICAgICAgICAgICAgICAgbWlzc2F0Z2VTdWNjZXNHdWFyZGF0LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCdhbGVydCBhbGVydC1zdWNjZXNzJyk7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgICAgICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCcjJyk7XG4gICAgICAgICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywnY2xvc2UnKTtcbiAgICAgICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZSgnZGF0YS1kaXNtaXNzJywnYWxlcnQnKTtcbiAgICAgICAgICAgICAgICBsaW5rLmlubmVySFRNTD1cIiZ0aW1lcztcIjtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtaXNzYXRnZVN1Y2Nlc0d1YXJkYXQuaW5uZXJIVE1MPVwiPHN0cm9uZz5TdWNjZXNzITwvc3Ryb25nPiBMYSB0ZXZhIGxvY2FsaXR6YWNpbyBoYSBlc3RhdCBndWFyZGFkYVwiO1xuICAgICAgICAgICAgICAgIG1pc3NhdGdlU3VjY2VzR3VhcmRhdC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgICAgICAgICBzdWNjZXNzLmFwcGVuZENoaWxkKG1pc3NhdGdlU3VjY2VzR3VhcmRhdCk7XG4gICAgICAgICAgICAgICAgc2NvcGUuJHBhcmVudC50ZXN0KE9iamVjdGVHdWFyZGFyLCBPYmplY3RlUmVzcG9uc2VHdWFkYXIpO1xuXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH1cbiAgICB9XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKS5kaXJlY3RpdmUoJ3NlbGVjdDInLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuXG4gICAgICAgIHRlbXBsYXRlOiAnPHNlbGVjdCBpZD1cInNlbGVjdDJcIiBjbGFzcz1cImpzLWRhdGEtZXhhbXBsZS1hamF4XCI+ICA8b3B0aW9uIHZhbHVlPVwiMzYyMDE5NFwiIHNlbGVjdGVkPVwic2VsZWN0ZWRcIj5Vc3Vhcmk8L29wdGlvbj48L3NlbGVjdD4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCkge1xuXG4gICAgICAgICAgICAkKFwiLmpzLWRhdGEtZXhhbXBsZS1hamF4XCIpLnNlbGVjdDIoe1xuICAgICAgICAgICAgICAgIGFqYXg6IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvdXNlcnMvbGxldHJhXCIsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbicsXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiAyNTAsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uKHBhcmFtcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogcGFyYW1zLnRlcm0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogcGFyYW1zLnBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NSZXN1bHRzOiBmdW5jdGlvbihkYXRhLCBwYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0czogZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY2FjaGU6IHRydWVcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVzY2FwZU1hcmt1cDogZnVuY3Rpb24obWFya3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXJrdXA7XG4gICAgICAgICAgICAgICAgfSwgLy8gbGV0IG91ciBjdXN0b20gZm9ybWF0dGVyIHdvcmtcbiAgICAgICAgICAgICAgICBtaW5pbXVtSW5wdXRMZW5ndGg6IDEsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVSZXN1bHQ6IGZvcm1hdFJlcG8sIC8vIG9taXR0ZWQgZm9yIGJyZXZpdHksIHNlZSB0aGUgc291cmNlIG9mIHRoaXMgcGFnZVxuICAgICAgICAgICAgICAgIHRlbXBsYXRlU2VsZWN0aW9uOiBmb3JtYXRSZXBvU2VsZWN0aW9uIC8vIG9taXR0ZWQgZm9yIGJyZXZpdHksIHNlZSB0aGUgc291cmNlIG9mIHRoaXMgcGFnZVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGZvcm1hdFJlcG8ocmVwbykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHNjb3BlKTtcbiAgICAgICAgICAgICAgICBpZiAocmVwby5sb2FkaW5nKSByZXR1cm4gcmVwby50ZXh0O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBtYXJrdXAgPSAnPGRpdiBjbGFzcz1cImNsZWFyZml4XCI+JyArXG4gICAgICAgICAgICAgICAgICAgICc8YSBzdHlsZT1cImN1cnNvcjpwb2ludGVyXCIgaWQ9XCInICsgcmVwby5faWQgKydcIm9uY2xpY2s9XCJidXNjYSh0aGlzLmlkKVwiPicgKyByZXBvLnVzZXJuYW1lICsgJzwvYT4nICtcbiAgICAgICAgICAgICAgICAgICAgJzwvZGl2Pic7XG5cbiAgICAgICAgICAgICAgICBpZiAocmVwby5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBtYXJrdXAgKz0gJzxkaXY+JyArIHJlcG8uZGVzY3JpcHRpb24gKyAnPC9kaXY+JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtYXJrdXAgKz0gJzwvZGl2PjwvZGl2Pic7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbWFya3VwO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBmb3JtYXRSZXBvU2VsZWN0aW9uKHJlcG8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwby5mdWxsX25hbWUgfHwgcmVwby50ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB3aW5kb3cuYnVzY2EgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYoc2NvcGUuY3VycmVudFVzZXImJmU9PXNjb3BlLmN1cnJlbnRVc2VyLl9pZCl7XG4gICAgICAgICAgICAgICAgICBzY29wZS5QZXJmaWxVc2VyKCk7XG4gICAgICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgICAgc2NvcGUuZGVmaW5pclVzZXJWaXN0YShlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=