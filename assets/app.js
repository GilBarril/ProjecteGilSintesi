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
            item.headers={
                'x-auth':UserSvc.getAuth()
            }
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
        var xauth;
        
        srv.getAuth = function(){
            
            return xauth;
        }
        
        
        srv.cookie = function(token) {

            console.log("ara hauria d'enviar el broadcast")
            xauth=token;
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
                xauth=data;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsIlNvY2tldFNydi5qcyIsImFwcGxpY2F0aW9uLmN0cmwuanMiLCJjb21wYXJ0aWRhLnNydi5qcyIsImVkaXRhY29uZmlndXJhY2lvdXNlci5jdHJsLmpzIiwiaW5pY2ljb250cm9sbGVyLmN0cmwuanMiLCJsb2NhbGl0emFjaW8uc3J2LmpzIiwibG9jYWxpdHphY2lvbnMuY3RybC5qcyIsImxvZ2luLmN0cmwuanMiLCJub3ZhbG9jYWxpdHphY2lvLmN0cmwuanMiLCJyZWdpc3RyZS5jdHJsLmpzIiwicm91dGVzLmpzIiwidXNlci5zcnYuanMiLCJ1c3IuY3RybC5qcyIsImRpcmVjdGl2ZXMvZGlyZWNjaW9ucy5kaXJlY3RpdmUuanMiLCJkaXJlY3RpdmVzL21hcC5kaXJlY3RpdmUuanMiLCJkaXJlY3RpdmVzL3NlbGVjdC51c3VhcmlzLmRpcmVjdGl2ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbFlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicsIFsnbmdSZXNvdXJjZScsJ25nUm91dGUnLCduZ0Nvb2tpZXMnLCdhbmd1bGFyRmlsZVVwbG9hZCddKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuICAgIC5zZXJ2aWNlKCdTb2NrZXRTcnYnLCBmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICAgXG4gICAgdmFyIHNvY2tldCA9IGlvKCkuY29ubmVjdCgpO1xuICAgIFxuICAgIHNvY2tldC5vbignbmV3UHJvZHVjdCcsZnVuY3Rpb24ocHJvZHVjdGUpIHtcbiAgICAgIFxuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ld1Byb2R1Y3QnLHByb2R1Y3RlKTtcbiAgICAgICAgXG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCd1cGRhdGVQcm9kdWN0JyxmdW5jdGlvbihwcm9kdWN0ZSkge1xuICAgICAgXG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndXBkYXRlUHJvZHVjdCcscHJvZHVjdGUpO1xuICAgICAgICBcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ2RlbGV0ZVByb2R1Y3QnLGZ1bmN0aW9uKHByb2R1Y3RlKSB7XG4gICAgICBcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkZWxldGVQcm9kdWN0Jyxwcm9kdWN0ZSk7XG4gICAgICAgIFxuICAgIH0pO1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIkFwcGxpY2F0aW9uQ29udHJvbGxlclwiLCBmdW5jdGlvbigkcm91dGUsICRzY29wZSwkbG9jYXRpb24sVXNlclN2YywkY29va2llcykge1xuICAgICAgICBcbiAgICAgICAgJHNjb3BlLiRvbignbG9naW4nLCBmdW5jdGlvbihlLHVzZXIpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUXVhbiBzJ2hhIGZldCBsb2dpbiBzJ2VtZXQgbCdldmVudCBcImxvZ2luXCJcbiAgICAgICAgICAgICAgICBpIGFpeMOyIGZhIHF1ZSBsYSB2YXJpYWJsZSBkZSBsJ3Njb3BlIFwiY3VycmVudFVzZXJcIlxuICAgICAgICAgICAgICAgIGxpIGRpZW0gcXVpbiB1c3VhcmkgcydoYSBhdXRlbnRpY2FudCwgZCdhcXVlc3RhIG1hbmVyYVxuICAgICAgICAgICAgICAgIGZlbSBxdWUgYXBhcmVndWluIGRpZmVyZW50cyBvcGNpb25zIGFsIG1lbsO6XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRVc2VyID0gdXNlcjtcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLmRlZmluaXJVc2VyVmlzdGEgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICBVc2VyU3ZjLnNldFVzZXJWaWV3KHVzZXIpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAgJHNjb3BlLlBlcmZpbFVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL3VzZXJsb2NhbGl0emFjaW9uc1wiKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICRzY29wZS4kb24oJ3VzZXJkZWZpbmVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkcm91dGUucmVsb2FkKCk7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnL3VzdWFyaScpO1xuICAgICAgICB9KVxuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBRdWFuIGZlbSBsb2dvdXQgZXNib3JyZW0gZWwgdG9rZW4gaSBsYSB2YXJpYWJsZVxuICAgICAgICAgICAgICAgIGRlIGwnJHNjb3BlIFwiY3VycmVudFVzZXJcIiwgZCdhcXVlc3RhIGZvcm1hIGRlc2FwYXJlaXhlblxuICAgICAgICAgICAgICAgIGVscyBtZW7DunMgc2Vuc2libGVzIGEgbGEgYXV0ZW50aWNhY2nDs1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFVzZXJTdmMpO1xuICAgICAgICAgICAgVXNlclN2Yy5sb2dPdXQoKTtcbiAgICAgICAgICAgIGRlbGV0ZSAkc2NvcGUuY3VycmVudFVzZXI7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xuICAgICAgICB9O1xuICAgIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4uc2VydmljZShcIkNvbXBhcnRpZGFTZXJ2ZWlcIiwgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgIHRoaXMuc3J2ID0gJHJlc291cmNlKCcvYXBpL2NvbXBhcnRpZGVzLzppZCcsIG51bGwsIHtcbiAgICAgICAgICAndXBkYXRlJzoge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgdGhpcy5lZGl0YSA9IG51bGw7XG4gIHJldHVybiB0aGlzO1xuICAgIFxuICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuICAgIC5jb250cm9sbGVyKFwiRWRpdGFDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRyb3V0ZSwgJHNjb3BlLCAkbG9jYXRpb24sIFVzZXJTdmMsICRjb29raWVzLCBGaWxlVXBsb2FkZXIpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciB1cGxvYWRlciA9ICRzY29wZS51cGxvYWRlciA9IG5ldyBGaWxlVXBsb2FkZXIoe1xuICAgICAgICAgICAgdXJsOiBcIi9hcGkvdXNlcnMvcHVqYXJJbWF0Z2VcIixcbiAgICAgICAgICAgIGFsaWFzOiBcImltYWdlXCIsXG4gICAgICAgICAgICByZW1vdmVBZnRlclVwbG9hZDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICBcbiAgICAgICAgdXBsb2FkZXIub25CZWZvcmVVcGxvYWRJdGVtID0gZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgaXRlbS5oZWFkZXJzPXtcbiAgICAgICAgICAgICAgICAneC1hdXRoJzpVc2VyU3ZjLmdldEF1dGgoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbS5mb3JtRGF0YS5wdXNoKHtcbiAgICAgICAgICAgICAgICBvcmlnaW5hbG5hbWU6ICRzY29wZS5jdXJyZW50VXNlci5faWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLmVkaXRhdXNlciA9IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuZnJhc2UpIHtcbiAgICAgICAgICAgICAgICB1c2VyLmZyYXNlID0gJHNjb3BlLmZyYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB1c2VyLmZyYXNlID0gXCJNJ2FncmFkYSBTZWFyY2hZb3VyUGxhY2VcIjtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCRzY29wZS5hZmljaW9ucykge1xuICAgICAgICAgICAgICAgIHVzZXIuYWZpY2lvbnMgPSAkc2NvcGUuYWZpY2lvbnM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHVzZXIuYWZpY2lvbnMgPSBcIkJ1c2NhciBsbG9jcyBwZXIgdG90IGVsIG3Ds25cIjtcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCRzY29wZS5tZW5qYXIpIHtcbiAgICAgICAgICAgICAgICB1c2VyLm1lbmphciA9ICRzY29wZS5tZW5qYXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHVzZXIubWVuamFyID0gXCJFbCBxdWUgZW0gcG9zaW4gYWwgcGxhdFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCRzY29wZS5sbG9jKSB7XG4gICAgICAgICAgICAgICAgdXNlci5sbG9jID0gJHNjb3BlLmxsb2M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHVzZXIubGxvYyA9IFwiU29icmUgbGVzIG1vbnRhbnllc1wiO1xuXG4gICAgICAgICAgICB9XG5cblxuXG4gICAgICAgICAgICBVc2VyU3ZjLmVkaXRhY29uZmlndXJhY2lvKHVzZXIpO1xuXG4gICAgICAgICAgICBsb2NhdGlvbi5wYXRoKFwiL3VzZXJsb2NhbGl0emFjaW9uc1wiKTtcbiAgICAgICAgfVxuXG5cbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuICAgIC5jb250cm9sbGVyKFwiSW5pY2lDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRzY29wZSwkbG9jYXRpb24pIHtcbiAgICAgICAgXG4gICAgICBcbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuLnNlcnZpY2UoXCJMb2NhbGl0emFjaW9TZXJ2ZWlcIiwgZnVuY3Rpb24oJHJlc291cmNlKSB7XG4gICAgIHRoaXMuc3J2ID0gJHJlc291cmNlKCcvYXBpL2xvY2FsaXR6YWNpby86aWQnLCBudWxsLCB7XG4gICAgICAgICAgJ3VwZGF0ZSc6IHtcbiAgICAgICAgICAgICAgbWV0aG9kOiAnUFVUJ1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuXG4gIHRoaXMuZWRpdGEgPSBudWxsO1xuICByZXR1cm4gdGhpcztcbiAgICBcbiAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcignTG9jYWxpdHphY2lvbnNDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCBMb2NhbGl0emFjaW9TZXJ2ZWksICRsb2NhdGlvbiwgVXNlclN2YywgJHJvb3RTY29wZSxDb21wYXJ0aWRhU2VydmVpKSB7XG5cblxuICAgICAgICAkc2NvcGUubG9jYWxpdHphY2lvbnMgPSBbXTtcbiAgICAgICAgVXNlclN2Yy5idXNjYSgkc2NvcGUuY3VycmVudFVzZXIuX2lkKTtcblxuICAgICAgICAkc2NvcGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICBVc2VyU3ZjLmJ1c2NhKCRzY29wZS5jdXJyZW50VXNlci5faWQpO1xuICAgICAgICB9O1xuXG5cbiAgICAgICAgJHNjb3BlLiRvbigndXN1YXJpJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlciA9IFVzZXJTdmMuZ2V0VXN1YXJpQWN0dWFsKCk7XG4gICAgICAgIH0pO1xuXG5cblxuICAgICAgICAkc2NvcGUuYm9ycmFyQXJyYXlsb2NhbGl0emFjaW8gPSBmdW5jdGlvbihsb2NhbGl0emFjaW8pIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLnVzZXIubG9jYWxpdHphY2lvbnMuc3BsaWNlKCRzY29wZS51c2VyLmxvY2FsaXR6YWNpb25zLmluZGV4T2YobG9jYWxpdHphY2lvKSwxKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgVXNlclN2Yy5tb2RpZmljYWFycmF5KCRzY29wZS51c2VyLCRzY29wZS51c2VyLmxvY2FsaXR6YWNpb25zKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLmJvcnJhcmxvY2FsaXR6YWNpbyhsb2NhbGl0emFjaW8pO1xuICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLmJvcnJhcmxvY2FsaXR6YWNpbyA9IGZ1bmN0aW9uKGxvY2FsaXR6YWNpbyl7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBMb2NhbGl0emFjaW9TZXJ2ZWkuc3J2LnJlbW92ZSh7XG4gICAgICAgICAgICAgICAgaWQ6IGxvY2FsaXR6YWNpby5faWQsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LCBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgICAgICBcblxuICAgICAgICAkc2NvcGUuY29tcGFydGlybG9jYWxpdHphY2lvID0gZnVuY3Rpb24obG9jYWxpdHphY2lvKSB7XG5cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgQ29tcGFydGlkYVNlcnZlaS5zcnYuc2F2ZSh7XG4gICAgICAgICAgICAgICAgdXN1YXJpOiAkc2NvcGUuVXN1YXJpYWNvbXBhcnRpcixcbiAgICAgICAgICAgICAgICBsb2NhbGl0emFjaW86IGxvY2FsaXR6YWNpbyxcbiAgICAgICAgICAgICAgICB1c3VhcmlwcmltZXI6IFwiR2lsXCJcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGxvY2FsaXR6YWNpbykge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL3VzZXJsb2NhbGl0emFjaW9uc1wiKTtcbiAgICAgICAgICAgIH0pO1xuXG4gIFxuXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgICRzY29wZS5QZXJBcnJpYmFyPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBnZW9sb2NhbGl0emFtKGUpO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cblxuXG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIkxvZ2luQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsJGxvY2F0aW9uLFVzZXJTdmMpe1xuICAgICAgICAgXG4gICAgXG4gICAgICAgICAkc2NvcGUuJHdhdGNoR3JvdXAoWyd1c2VybmFtZScsJ3Bhc3N3b3JkJ10sZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIFZpZ2lsZW0gbGVzIHZhcmlhYmxlcyBkZSBsJyRzY29wZSBcInVzZXJuYW1lXCJcbiAgICAgICAgICAgICAgICAgKiBpIFwicGFzc3dvcmRcIiBwZXIgZXNib3JyYXIgZWwgbWlzc2F0Z2UgZCdlcnJvclxuICAgICAgICAgICAgICAgICAqIHNpIGhpIGhhLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChuZXdWYWwhPW9sZFZhbClcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yPW51bGw7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24odXNlcm5hbWUscGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGlmICghdXNlcm5hbWUgfHwgIXBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gXCJIYXMgZCdlbXBsZW5hciB0b3RzIGVscyBjYW1wc1wiO1xuICAgICAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgICAgIFVzZXJTdmMubG9naW4odXNlcm5hbWUscGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yLHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBGdW5jacOzIHF1ZSBzJ2V4ZWN1dGFyw6Agc2kgaGkgaGEgdW4gZXJyb3IgZW4gZWwgbG9naW5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IDQwMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBlcnJvci5taXNzYXRnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkuc3VjY2VzcyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJTdmMuZ2V0VXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2kgdG90IHZhIGLDqSwgYW5lbSBhIGxhIHDDoGdpbmEgcHJpbmNpcGFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgZW1ldGVuIHVuIG1pc3NhdGdlIGRlIFwibG9naW5cIiBwZXIgYXZpc2FyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgbGEgbm9zdHJhIGFwcCBxdWUgbCd1c3VhcmkgaGEgZmV0IGxvZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcnJlY3RhbWVudC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgnbG9naW4nLCB1c2VyLmRhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvdXNlcmxvY2FsaXR6YWNpb25zJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJykuY29udHJvbGxlcignTm92YWxvY2FsaXR6YWNpb2NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgTG9jYWxpdHphY2lvU2VydmVpLCBVc2VyU3ZjKSB7XG5cblxuXG4gICAgJHNjb3BlLnRlc3QgPSBmdW5jdGlvbihlLCBmKSB7XG4gICAgICAgIGlmKGUhPW51bGwmJmYhPW51bGwpe1xuICAgICAgICAkc2NvcGUubm9tID0gZS5uYW1lO1xuICAgICAgICAkc2NvcGUubG9nbyA9IGUuaWNvbjtcbiAgICAgICAgJHNjb3BlLmFkcmVjYSA9IGYucm91dGVzWzBdLmxlZ3NbMF0uZW5kX2FkZHJlc3M7XG4gICAgICAgICRzY29wZS50ZWwgPSBlLmZvcm1hdHRlZF9waG9uZV9udW1iZXI7XG4gICAgICAgICRzY29wZS5sYXRpdHVkID0gZS5nZW9tZXRyeS5sb2NhdGlvbi5BO1xuICAgICAgICAkc2NvcGUubG9uZ2l0dWQgPSBlLmdlb21ldHJ5LmxvY2F0aW9uLkY7XG4gICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZyhcIkhlIGVudHJhdCBhICAgIFNPUlRcIilcbiAgICAgICAgJHNjb3BlLmFmZWdpcmxvY2FsaXR6YWNpbygpO1xuICAgIH1cbn1cblxuXG4gICAgJHNjb3BlLmFmZWdpcmxvY2FsaXR6YWNpbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBMb2NhbGl0emFjaW9TZXJ2ZWkuc3J2LnNhdmUoe1xuICAgICAgICAgICAgdXN1YXJpOiAkc2NvcGUuY3VycmVudFVzZXIuX2lkLFxuICAgICAgICAgICAgbm9tOiAkc2NvcGUubm9tLFxuICAgICAgICAgICAgbG9nbzogJHNjb3BlLmxvZ28sXG4gICAgICAgICAgICBhZHJlY2E6ICRzY29wZS5hZHJlY2EsXG4gICAgICAgICAgICB0ZWxlZm9uOiAkc2NvcGUudGVsLFxuICAgICAgICAgICAgbGF0aXR1ZDogJHNjb3BlLmxhdGl0dWQsXG4gICAgICAgICAgICBsb25naXR1ZDogJHNjb3BlLmxvbmdpdHVkLFxuICAgICAgICB9LCBmdW5jdGlvbihsb2NhbGl0emFjaW8pIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGxvY2FsaXR6YWNpbyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFVzZXJTdmMucHV0KCRzY29wZS5jdXJyZW50VXNlciwgbG9jYWxpdHphY2lvKTtcblxuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvbm92YWxvY2FsaXR6YWNpb1wiKTtcbiAgICAgICAgfSk7XG4gICAgfVxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIlJlZ2lzdHJlQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsJGxvY2F0aW9uLFVzZXJTdmMpIHtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5yZWdpc3RyZSA9IGZ1bmN0aW9uKHVzZXJuYW1lLHBhc3N3b3JkLHBhc3N3b3JkMikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoR3JvdXAoWyd1c2VybmFtZScsJ3Bhc3N3b3JkJywncGFzc3dvcmQyJ10sZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICAgICAgICBpZiAobmV3VmFsIT1vbGRWYWwpXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvcj1udWxsO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXBhc3N3b3JkIHx8ICFwYXNzd29yZDIgfHwgIXVzZXJuYW1lKXtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBcIkhhcyBkJ2VtcGxlbmFyIHRvdHMgZWxzIGNhbXBzXCI7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9ZWxzZSBpZiAocGFzc3dvcmQgPT09IHBhc3N3b3JkMil7XG4gICAgICAgICAgICAgICAgVXNlclN2Yy5yZWdpc3RyZSh1c2VybmFtZSxwYXNzd29yZClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyb3Isc3RhdHVzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gNDA5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvciA9IGVycm9yLm1pc3NhdGdlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gXCJMZXMgY29udHJhc2VueWVzIG5vIHPDs24gaWd1YWxzXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgLndoZW4oXCIvXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogJ0luaWNpQ29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncHJpbmNpcGFsLmh0bWwnLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLndoZW4oXCIvbm92YWxvY2FsaXR6YWNpb1wiLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6IFwiTm92YWxvY2FsaXR6YWNpb2NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwiY3JlYXJsb2NhbGl0emFjaW8uaHRtbFwiLFxuICAgICAgICBhdXRvcml0emF0OiB0cnVlXG4gICAgfSkud2hlbihcIi9sb2dpblwiLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6IFwiTG9naW5Db250cm9sbGVyXCIsXG4gICAgICAgIHRlbXBsYXRlVXJsOiBcImxvZ2luLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogZmFsc2VcbiAgICB9KS53aGVuKFwiL3JlZ2lzdHJlXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJSZWdpc3RyZUNvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicmVnaXN0cmUuaHRtbFwiLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLndoZW4oXCIvdXNlcmxvY2FsaXR6YWNpb25zXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJMb2NhbGl0emFjaW9uc0NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwidXNlcmxvY2FsaXR6YWNpb25zLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogdHJ1ZVxuICAgIH0pLndoZW4oXCIvc2VsZWNjaW9uYWNhdGVnb3JpZXNcIiwge1xuICAgICAgICBjb250cm9sbGVyOiBcIkluaWNpQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJzZWxlY2Npb25hY2F0ZWdvcmlhLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogdHJ1ZVxuICAgIH0pLndoZW4oXCIvZWRpdGFVc2VyXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJFZGl0YUNvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwiRWRpdGFVc2VyLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogdHJ1ZVxuICAgIH0pLndoZW4oXCIvdXN1YXJpXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJVc2VyQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJ1c3VhcmkuaHRtbFwiLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLm90aGVyd2lzZSh7XG4gICAgICAgIHJlZGlyZWN0VG86ICcvJ1xuICAgIH0pO1xuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHJlcXVpcmVCYXNlOiBmYWxzZVxuICAgIH0pO1xufSkucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsIFVzZXJTdmMsJGxvY2F0aW9uKSB7XG4gICAgXG4gICAgICAvKiAgQ2FkYSB2ZWdhZGEgcXVlIGNhbnZpZW0gZGUgcMOgZ2luYSBzZSBkaXNwYXJhIGVsXG4gICAgICAgIGV2ZW50ICRyb3V0ZUNoYW5nZVN0YXJ0LFxuICAgICAgICBTaSBsYSBww6BnaW5hIHF1ZSB2b2xlbSB2ZXVyZSB0w6kgbGEgcHJvcGlldGF0IFxuICAgICAgICBcImF1dG9yaXR6YXRcIjogYSB0cnVlIGkgbm8gaG8gZXN0w6AgbGxhdm9ycyBubyBcbiAgICAgICAgZmFyw6AgZWwgY2FudmkqL1xuICAgIFxuICAgICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0KSB7XG4gICAgICAgIGlmIChuZXh0KVxuICAgICAgICAgICAgaWYgKCFVc2VyU3ZjLmF1dGggJiBuZXh0LmF1dG9yaXR6YXQpe1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcbiAgICAgICAgICAgIH1cbiAgICB9KTtcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4gICAgLnNlcnZpY2UoJ1VzZXJTdmMnLCBmdW5jdGlvbigkaHR0cCwgJGNvb2tpZXMsICRyb290U2NvcGUpIHtcbiAgICAgICAgdmFyIHNydiA9IHRoaXM7XG4gICAgICAgIHNydi5hdXRoID0gZmFsc2U7XG4gICAgICAgIHNydi5Vc3VhcmkgPSBcIiBcIjtcbiAgICAgICAgc3J2LlVzdWFyaUFjdHVhbDtcbiAgICAgICAgc3J2LlVzdWFyaVZpZXc7XG4gICAgICAgIHZhciB4YXV0aDtcbiAgICAgICAgXG4gICAgICAgIHNydi5nZXRBdXRoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHhhdXRoO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgc3J2LmNvb2tpZSA9IGZ1bmN0aW9uKHRva2VuKSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYXJhIGhhdXJpYSBkJ2VudmlhciBlbCBicm9hZGNhc3RcIilcbiAgICAgICAgICAgIHhhdXRoPXRva2VuO1xuICAgICAgICAgICAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ3gtYXV0aCddID0gdG9rZW47XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3VzZXJzJykuc3VjY2VzcyhmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgc3J2LmF1dGggPSB0cnVlO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4nLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoJGNvb2tpZXNbXCJfTWFRXCJdKSB7XG4gICAgICAgICAgICB2YXIgdG9rZW4gPSAkY29va2llc1tcIl9NYVFcIl07XG4gICAgICAgICAgICBzcnYuY29va2llKHRva2VuKTtcblxuXG4gICAgICAgIH1cblxuICAgICAgICBzcnYuc2V0VXNlclZpZXcgPSBmdW5jdGlvbih1c2VyKSB7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibGEgaWRcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh1c2VyKTtcblxuICAgICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL3VzZXJzLycgKyB1c2VyICsgJycpLnN1Y2Nlc3MoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVXN1YXJpdXNlclwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgICAgICBzcnYuVXN1YXJpVmlldyA9IGU7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd1c2VyZGVmaW5lZCcpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHNydi5nZXRVc2VyVmlldyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNydi5Vc3VhcmlWaWV3O1xuICAgICAgICB9XG5cblxuICAgICAgICBzcnYuZ2V0VXN1YXJpQWN0dWFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gc3J2LlVzdWFyaUFjdHVhbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHNydi5nZXRVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3VzZXJzJyk7XG4gICAgICAgIH07XG5cbiAgICAgICAgc3J2LmJ1c2NhID0gZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgXG4gICAgICAgICAgICAkaHR0cC5nZXQoJy9hcGkvdXNlcnMnLCB7XG4gICAgICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBpZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHNydi5Vc3VhcmlBY3R1YWwgPSBlO1xuXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd1c3VhcmknKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNydi5sb2dpbiA9IGZ1bmN0aW9uKHVzZXJuYW1lLCBwYXNzd29yZCwgbm9Mb2dpbikge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc2Vzc2lvbnMnLCB7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICAgICAgfSkuc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBTaSBsJ2F1dGVudGljYWNpw7Mgw6lzIGNvcnJlY3RlIGxpIGRpZW0gYSBsJ2FuZ3VsYXIgcXVlIGNhZGEgXG4gICAgICAgICAgICAgICAgICAgIHZlZ2FkYSBxdWUgZXMgY29tdW5pcXVpIGFtYiBlbCBzZXJ2aWRvciBhZmVnZWl4aSBlbCB0b2tlbiBcbiAgICAgICAgICAgICAgICAgICAgYWwgaGVhZGVyICd4LWF1dGgnXG4gICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgICAgIHNydi5Vc3VhcmkgPSB1c2VybmFtZTtcbiAgICAgICAgICAgICAgICB4YXV0aD1kYXRhO1xuICAgICAgICAgICAgICAgICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWyd4LWF1dGgnXSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEpIHNydi5hdXRoID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pLmVycm9yKGZ1bmN0aW9uKGVycm9yLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBTaSBsJ3VzdWFyaSBpIGNvbnRyYXNlbnlhIG5vIMOpcyBjb3JyZWN0ZSBleGVjdXRhIGxhXG4gICAgICAgICAgICAgICAgICAgIGZ1bmNpw7NuIGNhbGxiYWNrIHF1ZSBsaSBoZW0gcGFzc2F0IGNvbSBwYXLDoG1ldHJlXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBub0xvZ2luKGVycm9yLCBzdGF0dXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMucmVnaXN0cmUgPSBmdW5jdGlvbih1c2VybmFtZSwgcGFzc3dvcmQpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUGVyIHJlZ2lzdHJhciB1biB1c3Vhcmkgbm91LCBub23DqXMgaGVtIGRlIGZlciB1biBwb3N0XG4gICAgICAgICAgICAgICAgYSBsJ2FwaSBkJ3VzdWFyaXNcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRU5UUkVNIFVOIFVTVUFSSVwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvdXNlcnMnLCB7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubG9nT3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFF1YW4gbCd1c3VhcmkgZmEgbG9nb3V0IHMnZXNib3JyYSBlbCB0b2tlblxuICAgICAgICAgICAgICAgIGkgcG9zZW0gbGEgcHJvcGlldGF0IGRlbCBzZXJ2ZWkgXCJhdXRoXCIgYSBmYWxzZVxuICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgc3J2LmF1dGggPSBmYWxzZTtcbiAgICAgICAgICAgIGRlbGV0ZSAkY29va2llc1tcIl9NYVFcIl07XG4gICAgICAgICAgICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsneC1hdXRoJ10gPSBcIlwiO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubW9kaWZpY2FhcnJheSA9IGZ1bmN0aW9uKHVzZXIsIGFycmF5KSB7XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoXCJhcGkvdXNlcnMvYXJyYXlsb2NhbGl0emFjaW9uc1wiLCB7XG4gICAgICAgICAgICAgICAgXCJ1c1wiOiB1c2VyLFxuICAgICAgICAgICAgICAgIFwiYXJyYXlcIjogYXJyYXlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lZGl0YWNvbmZpZ3VyYWNpbyA9IGZ1bmN0aW9uKHVzZXIpIHtcblxuICAgICAgICAgICAgdmFyIGNvcyA9IHtcbiAgICAgICAgICAgICAgICBcInVzdWFyaVwiOiB1c2VyXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KFwiL2FwaS91c2Vycy9lZGl0YWNvbmZpZ3VyYWNpb1wiLCB7XG4gICAgICAgICAgICAgICAgXCJjb3NcIjogY29zXG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucHV0ID0gZnVuY3Rpb24odXNlciwgbG9jYWxpdHphY2lvKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucHV0KFwiL2FwaS91c2Vyc1wiLCB7XG4gICAgICAgICAgICAgICAgXCJ1c2VyXCI6IHVzZXIsXG4gICAgICAgICAgICAgICAgXCJsb2NhbGl0emFjaW9cIjogbG9jYWxpdHphY2lvXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuXG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIlVzZXJDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRzY29wZSwkbG9jYXRpb24sVXNlclN2YyxMb2NhbGl0emFjaW9TZXJ2ZWkpIHtcbiAgICAgICAgJHNjb3BlLnVzdWFyaSA9IFVzZXJTdmMuZ2V0VXNlclZpZXcoKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgJHNjb3BlLmNvbXBhcnRpckxvY2FsaXR6YWNpbyA9IGZ1bmN0aW9uKGUsdSkge1xuICAgICAgICAgICAgIFxuICAgICAgICAgICAgIFxuICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRW50cmVzIGEgQ29tcGFydGlyXCIpO1xuICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICAgICAgIGNvbnNvbGUubG9nKHUpO1xuICAgICAgTG9jYWxpdHphY2lvU2VydmVpLnNydi5zYXZlKHtcbiAgICAgICAgICAgIHVzdWFyaTogJHNjb3BlLmN1cnJlbnRVc2VyLl9pZCxcbiAgICAgICAgICAgIG5vbTogZS5ub20sXG4gICAgICAgICAgICBsb2dvOiBlLmxvZ28sXG4gICAgICAgICAgICBhZHJlY2E6IGUuYWRyZWNhLFxuICAgICAgICAgICAgdGVsZWZvbjogZS50ZWxlZm9uLFxuICAgICAgICAgICAgbGF0aXR1ZDogZS5sYXRpdHVkLFxuICAgICAgICAgICAgbG9uZ2l0dWQ6IGUubG9uZ2l0dWQsXG4gICAgICAgICAgICB1c3VhcmlPcmlnZW46dS51c2VybmFtZSxcbiAgICAgICAgfSwgZnVuY3Rpb24obG9jYWxpdHphY2lvKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkd1YXJkYWRhIEJlXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cobG9jYWxpdHphY2lvKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgVXNlclN2Yy5wdXQoJHNjb3BlLmN1cnJlbnRVc2VyLCBsb2NhbGl0emFjaW8pO1xuXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aChcIi91c2VybG9jYWxpdHphY2lvbnNcIik7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpLmRpcmVjdGl2ZSgnY29tcGFydGlyJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHNvcnRieTogXCJAXCIsXG4gICAgICAgICAgICBvbnNvcnQ6IFwiPVwiXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBpZD1cInBhbmVsLWRpcmVjY2lvbnNcIj48cCBpZD1cImRhZGVzSW5pY2lEaXJlY2Npb25zXCI+QWRyZcOnYSBJbmljaSAocGVyIGRlZmVjdGUgbGEgdGV2YSBnZW9sb2NhbGl0emFjaW8pIDxzcGFuIGlkPVwiYm90b0JvcnJhRGlyZWNjaW9uc1wiIG9uY2xpY2s9XCJuZXRlamEoKVwiIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1yZW1vdmVcIj48L3NwYW4+PC9wPjxpbnB1dCB0eXBlPVwidGV4dFwiIG9uY2hhbmdlPVwibm92YWRpcmVjY2lvKClcIiBpZD1cImluaWNpXCI+PC9pbnB1dD48ZGl2PjxzZWxlY3QgY2xhc3M9XCJmb3JtLWNvbnRyb2xcIiBvbmNoYW5nZT1cIm5vdmFkaXJlY2NpbygpXCIgaWQ9XCJtb2RlXCI+PG9wdGlvbiB2YWx1ZT1cIkRSSVZJTkdcIj5Db3R4ZTwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCJXQUxLSU5HXCI+Q2FtaW5hbnQ8L29wdGlvbj48b3B0aW9uIHZhbHVlPVwiVFJBTlNJVFwiPlRyYXNwb3J0IFDDumJsaWM8L29wdGlvbj48L3NlbGVjdD48L2Rpdj48L2Rpdj48ZGl2IGlkPVwiZGlyZWN0aW9ucy1wYW5lbFwiPjwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KSB7XG5cblxuXG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uc0Rpc3BsYXkgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1JlbmRlcmVyKCk7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uc1NlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1NlcnZpY2UoKTtcbiAgICAgICAgICAgIHZhciBnZW9jb2RlcjtcbiAgICAgICAgICAgIC8qQUlYTyBITyBJR1VBTE8gQSBMJ09CSkVDVEUgTE9DQUxJVFpBQ0lPIFBFUlFVRSBRVUFOIEVYRUNVVEkgTEEgRlVOQ0lPIE5PVkFESVJFQ0NJTyBFU1RJR1VJIEwnQURSRUNBIEdVQVJEQURBKi9cbiAgICAgICAgICAgIHZhciBvYmplY3RlQWRyZWNhRmluYWw7XG4gICAgICAgICAgICB2YXIgcG9zaWNpb2luaWNpYWxSb3V0ZTtcbiAgICAgICAgICAgIHZhciBhZHJlY2FpbmljaWFsO1xuICAgICAgICAgICAgdmFyIGFkcmVjYWZpbmFsO1xuICAgICAgICAgICAgdmFyIGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhPWZhbHNlO1xuICAgICAgICAgICAgdmFyIHRpcHVzZGV0cmFuc3BvcnQ7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHN1Y2Nlc3MocG9zKSB7XG4gICAgICAgICAgICAgICAgZ2VvbG9jYWxpdHphY2lvRGVuZWdhZGE9ZmFsc2U7XG4gICAgICAgICAgICAgICAgcG9zaWNpb2luaWNpYWxSb3V0ZSA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcocG9zLmNvb3Jkcy5sYXRpdHVkZSwgcG9zLmNvb3Jkcy5sb25naXR1ZGUpO1xuICAgICAgICAgICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7XG4gICAgICAgICAgICAgICAgICAgICdsYXRMbmcnOiBwb3NpY2lvaW5pY2lhbFJvdXRlXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0spIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgYWRyZWNhaW5pY2lhbCA9IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3M7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibGEgbWV2YSBcIiArIGFkcmVjYWluaWNpYWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luaWNpJykuc2V0QXR0cmlidXRlKCd2YWx1ZScsIGFkcmVjYWluaWNpYWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2luaWNpJykuc2V0QXR0cmlidXRlKCdwbGFjZWhvbGRlcicsIGFkcmVjYWluaWNpYWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGlwdXNkZXRyYW5zcG9ydCA9ICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kZScpLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY2Npb25zKCk7XG5cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcblxuXG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgZnVuY3Rpb24gZXJyb3IoZXJyKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoXCJObyBoaSBoYSBnZW9sb2NhbGl0emFjacOzIVwiKTtcbiAgICAgICAgICAgICAgICBnZW9sb2NhbGl0emFjaW9EZW5lZ2FkYT10cnVlO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignRVJST1IoJyArIGVyci5jb2RlICsgJyk6ICcgKyBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB3aW5kb3cuZ2VvbG9jYWxpdHphbSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBvYmplY3RlQWRyZWNhRmluYWwgPSBlO1xuICAgICAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICAgICAgfVxuXG5cblxuXG5cbiAgICAgICAgICAgIHdpbmRvdy5kaXJlY2Npb25zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBpZihnZW9sb2NhbGl0emFjaW9EZW5lZ2FkYT09ZmFsc2Upe1xuICAgICAgICAgICAgICAgIGFkcmVjYWZpbmFsID0gb2JqZWN0ZUFkcmVjYUZpbmFsLmFkcmVjYTtcbiAgICAgICAgICAgICAgICB2YXIgYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYW5lbC1kaXJlY2Npb25zJyk7XG4gICAgICAgICAgICAgICAgIGEuc3R5bGUub3BhY2l0eSA9IFwiMVwiO1xuICAgICAgICAgICAvLyAgICB0aXB1c2RldHJhbnNwb3J0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGUnKS52YWx1ZTtcbiAgICAgICAgICAgXG4gICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXRQYW5lbChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlyZWN0aW9ucy1wYW5lbCcpKTtcblxuXG4gICAgICAgICAgICAgICAgY2FsY1JvdXRlKGFkcmVjYWZpbmFsLCBhZHJlY2FpbmljaWFsLHRpcHVzZGV0cmFuc3BvcnQpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgICAgIHdpbmRvdy5ub3ZhZGlyZWNjaW8gPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGFkcmVjYWluaWNpYWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5pY2knKS52YWx1ZTtcbiAgICAgICAgICAgICAgICB0aXB1c2RldHJhbnNwb3J0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGUnKS52YWx1ZTtcbiAgICAgICAgICAgICAgICBkaXJlY2Npb25zKCk7XG4gICAgICAgICAgICB9XG5cblxuXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGNSb3V0ZShhLCBlLHQpIHtcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGEpO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbjogZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzdGluYXRpb246IGEsXG4gICAgICAgICAgICAgICAgICAgIHRyYXZlbE1vZGU6IGdvb2dsZS5tYXBzLlRyYXZlbE1vZGVbdF1cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNTZXJ2aWNlLnJvdXRlKHJlcXVlc3QsIGZ1bmN0aW9uKHJlc3BvbnNlLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5EaXJlY3Rpb25zU3RhdHVzLk9LKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXREaXJlY3Rpb25zKHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB3aW5kb3cubmV0ZWphID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncGFuZWwtZGlyZWNjaW9ucycpLnN0eWxlLm9wYWNpdHkgPSBcIjBcIjtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb25zRGlzcGxheS5zZXRQYW5lbChudWxsKTtcblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XG59KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKS5kaXJlY3RpdmUoJ21hcCcsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhdXRvY29tcGxldGU7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHNvcnRieTogXCJAXCIsXG4gICAgICAgICAgICBvbnNvcnQ6IFwiPVwiXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBpZD1cIm1hcC1jYW52YXNcIj48L2Rpdj48ZGl2IGlkPVwic3VjY2Vzc1wiPjwvZGl2PjxkaXYgY2xhc3M9XCJjb2wtbWQtb2Zmc2V0LTUgY29sLW1kLTIgY29sLXhzLTEyXCI+PGJ1dHRvbiBpZD1cImJvdG9QZXJHdWFyZGFyXCIgY2xhc3M9XCJidG4gYnRuLXdhcm5pbmdcIiBuZy1jbGljaz1cInNvcnQoKVwiPkd1YXJkYXIgQ2VyY2EgIDxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1zYXZlXCI+PC9zcGFuPjwvYnV0dG9uPjwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KSB7XG5cblxuICAgICAgICAgICAgdmFyIE9iamVjdGVHdWFyZGFyO1xuICAgICAgICAgICAgdmFyIE9iamVjdGVSZXNwb25zZUd1YWRhcjtcbiAgICAgICAgICAgIHZhciBnZW9sb2NhbGl0emFjaW9EZW5lZ2FkYT1mYWxzZTtcbiAgICAgICAgICAgIHZhciBnZW9jb2RlcjtcbiAgICAgICAgICAgIHZhciBtYXA7XG4gICAgICAgICAgICB2YXIgbWFwUm91dGU7XG4gICAgICAgICAgICB2YXIgTUFSS0VSX1BBVEggPSAnaHR0cHM6Ly9tYXBzLmdzdGF0aWMuY29tL2ludGwvZW5fdXMvbWFwZmlsZXMvbWFya2VyX29yYW5nZSc7XG4gICAgICAgICAgICB2YXIgbWFya2VyTGV0dGVyO1xuICAgICAgICAgICAgdmFyIG1hcmtlckljb247XG4gICAgICAgICAgICB2YXIgc2VydmljZTtcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb25zRGlzcGxheTtcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb25zU2VydmljZSA9IG5ldyBnb29nbGUubWFwcy5EaXJlY3Rpb25zU2VydmljZSgpO1xuICAgICAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgICAgIHZhciBhcnJheW1hcmNhZG9ycyA9IFtdO1xuICAgICAgICAgICAgdmFyIGFycmF5RGlyZWNjaW9ucyA9IFtdO1xuXG5cblxuICAgICAgICAgICAgXG5cbi8qQVFVSSBDUkVPIEwnQVVUT0NPTVBMRVRBVCBERSBHT09HTEUgUEVSIEwnSU5QVVQqL1xuICAgICAgICAgICAgYXV0b2NvbXBsZXRlID0gbmV3IGdvb2dsZS5tYXBzLnBsYWNlcy5BdXRvY29tcGxldGUoXG4gICAgICAgICAgICAgICAgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGRyZXNzJykpLCB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGVzOiBbJ2dlb2NvZGUnXVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihhdXRvY29tcGxldGUsICdwbGFjZV9jaGFuZ2VkJywgb25QbGFjZUNoYW5nZWQpO1xuXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUGxhY2VDaGFuZ2VkKCkge1xuICAgICAgICAgICAgICAgIHZhciBwbGFjZSA9IGF1dG9jb21wbGV0ZS5nZXRQbGFjZSgpO1xuICAgICAgICAgICAgICAgIGlmIChwbGFjZS5nZW9tZXRyeSkge1xuICAgICAgICAgICAgICAgICAgICBtYXAucGFuVG8ocGxhY2UuZ2VvbWV0cnkubG9jYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBtYXAuc2V0Wm9vbSgxNSk7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FkZHJlc3MnKS5wbGFjZWhvbGRlciA9ICdFbnRlciBhIGNpdHknO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4vKiBBUVVJIENSRU8gRUwgU0VMRUNUIEFNQiBMRVMgT1BDSU9OUyBRVUUgSk8gVlVJIFBFUiBQT0RFUiBQT1NBUi1MTyBBIFVOIFNFTEVDVCAyKi9cbiAgICAgICAgICAgIHZhciBhcnJheVRpcHVzID0gW1wiQWVyb3BvcnRcIiwgXCJBcXVhcmlcIiwgXCJHYWxlcmlhIGQnQXJ0XCIsIFwiRmxlY2FcIiwgXCJCYW5jXCIsIFwiQmFyXCIsIFwiQnVzXCIsIFwiQm90aWdhXCIsIFwiUmVzdGF1cmFudHNcIiwgXCJIb3NwaXRhbFwiLCBcIkNhc2lub1wiLCBcIkVzcG9ydFwiLCBcIlVuaXZlcnNpdGF0XCIsIFwiSG90ZWxcIl07XG4gICAgICAgICAgICB2YXIgYXJyYXlUeXBlcyA9IFtcImFpcnBvcnRcIiwgXCJhcXVhcml1bVwiLCBcImFydF9nYWxsZXJ5XCIsIFwiYmFrZXJ5XCIsIFwiYmFua1wiLCBcImJhclwiLCBcImJ1c19zdGF0aW9uXCIsIFwic3RvcmVcIiwgXCJyZXN0YXVyYW50XCIsIFwiaG9zcGl0YWxcIiwgXCJjYXNpbm9cIiwgXCJzdGFkaXVtXCIsIFwidW5pdmVyc2l0eVwiLCBcImxvZGdpbmdcIl07XG4gICAgICAgICAgICB2YXIgc2VsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RpcHVzJyk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5VGlwdXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgb3B0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG4gICAgICAgICAgICAgICAgb3B0LmlubmVySFRNTCA9IGFycmF5VGlwdXNbaV07XG4gICAgICAgICAgICAgICAgb3B0LnZhbHVlID0gYXJyYXlUeXBlc1tpXTtcbiAgICAgICAgICAgICAgICBzZWwuYXBwZW5kQ2hpbGQob3B0KTtcbiAgICAgICAgICAgIH1cblxuXG5cbiAvKiBBUVVJIENSRU8gRUwgTUFQQSBBTUIgVU5FUyBDT09SREVOQURFUyBDT05DUkVURVMgSSBVTiBaT09NICovXG4gICAgICAgICAgICB3aW5kb3cuY3JlYXJNYXBhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxhdGxuZyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoNDIuMjY2NywgMi45NjY3KTtcbiAgICAgICAgICAgICAgICB2YXIgbWFwT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgem9vbTogMTAsXG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogbGF0bG5nXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtYXAtY2FudmFzXCIpLCBtYXBPcHRpb25zKTtcbiAgICAgICAgICAgICAgICB2YXIgdyA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFwLWNhbnZhc1wiKS5zdHlsZS53aWR0aCA9IHc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjcmVhck1hcGEoKTtcblxuXG5cblxuXG4gICAgICAgICAgICB2YXIgbG9jYWxpdHphY2lvO1xuXG4gICAgICAgICAgICB2YXIgaW5mb3dpbmRvdztcbiAgICAgICAgICAgIHZhciBwb3NpY2lvaW5pY2lhbFJvdXRlO1xuXG5cblxuICAgICAgICAgICAgLypBUVVJIEVUIERJVSBTSSBIQSBUUk9CQVQgQsOJIExBIFRFVkEgR0VPTE9DQUxJVFpBQ0lPKi9cblxuICAgICAgICAgICAgZnVuY3Rpb24gc3VjY2Vzcyhwb3MpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlBPU0lDSU9cIilcbiAgICAgICAgICAgICAgICBwb3NpY2lvaW5pY2lhbFJvdXRlID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhwb3MuY29vcmRzLmxhdGl0dWRlLCBwb3MuY29vcmRzLmxvbmdpdHVkZSk7XG4gICAgICAgICAgICAgICAgZ2VvbG9jYWxpdHphY2lvRGVuZWdhZGE9ZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBlcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0VSUk9SKCcgKyBlcnIuY29kZSArICcpOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwiTm8gZXMgcG90IGFjY2VkaXIgYSBsYSB0ZXZhIGdlb2xvY2FsaXR6YWNpb1wiKTtcbiAgICAgICAgICAgICAgICBnZW9sb2NhbGl0emFjaW9EZW5lZ2FkYT10cnVlO1xuICAgICAgICAgICAgfTtcblxuXG4gICAgICAgICAgICAvKkFRVUVTVEEgRlVOQ0lPIFNFUlZFSVggUEVSIFRSRVVSRSBFTFMgTUFSQ0FET1JTIERFTCBNQVBBKi9cblxuXG4gICAgICAgICAgICBmdW5jdGlvbiBUcmV1cmVNYXJjYWRvcnMoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheW1hcmNhZG9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBhcnJheW1hcmNhZG9yc1tpXS5zZXRNYXAobnVsbCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhcnJheW1hcmNhZG9ycyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKkFRVUVTVEEgRlVOQ0lPIFNFUlZFSVggUEVSIFRSRVVSRSBMRVMgUlVURVMgREVMIE1BUEEqL1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBUcmV1cmVEaXJlY2Npb25zKCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlEaXJlY2Npb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5RGlyZWNjaW9uc1tpXS5zZXRNYXAobnVsbCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhcnJheURpcmVjY2lvbnMgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogQVFVRVNUQSAgRlVOQ0lPIFNFUlZFSVggUEVSIEFHQUZBUiBMJ0FEUkXDh0EgUVVFIExJIFBPU0VTIEkgRVQgVFJBTlNGT1JNQSBMQSBESVJFQ0NJTyBFTiBHRU9MT0NBTElUWkFDSU8gVU4gQ09QXG4gICAgICAgICAgICBGRVQgQUlYw5IgRVNYRUNVVEEgTEEgRlVOQ0lPIFFVRSBDUkVBIEVMUyBNQVJDQURPUlMqL1xuICAgICAgICAgICAgd2luZG93LmNvZGVBZGRyZXNzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGFycmF5bWFyY2Fkb3JzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgVHJldXJlTWFyY2Fkb3JzKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICBpZiAoYXJyYXlEaXJlY2Npb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRyZXVyZURpcmVjY2lvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgICAgICAgICAgdmFyIGFkcmVjYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkcmVzc1wiKS52YWx1ZTtcbiAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHtcbiAgICAgICAgICAgICAgICAgICAgJ2FkZHJlc3MnOiBhZHJlY2FcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oMTQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFwLnNldENlbnRlcihyZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvY2FsaXR6YWNpbyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYXRpdHVkOiByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uLkEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ2l0dWQ6IHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb24uRlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmNhZG9ycygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWxlcnQoXCJHZW9jb2RlIHdhcyBub3Qgc3VjY2Vzc2Z1bCBmb3IgdGhlIGZvbGxvd2luZyByZWFzb246IFwiICsgc3RhdHVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgIC8qIEFRVUVTVEEgRlVOQ0lPIEVUIFBJTlRBIFRPVFMgRUxTIExMT0NTIFFVRSBIQVMgRklMVFJBVCBBIFBBUlRJUiBERSBMJ0FEUkXDh0EgUVVFIEhBUyBQQVNTQVQgQUJBTlMqL1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBtYXJjYWRvcnMoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHB5cm1vbnQgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGxvY2FsaXR6YWNpby5sYXRpdHVkLCBsb2NhbGl0emFjaW8ubG9uZ2l0dWQpO1xuICAgICAgICAgICAgICAgIHZhciByYWRpID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyYWRpXCIpLnZhbHVlO1xuICAgICAgICAgICAgICAgIHZhciB0aXB1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGlwdXNcIikudmFsdWU7XG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uOiBweXJtb250LFxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IHJhZGksXG4gICAgICAgICAgICAgICAgICAgIHR5cGVzOiBbdGlwdXNdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpbmZvd2luZG93ID0gbmV3IGdvb2dsZS5tYXBzLkluZm9XaW5kb3coKTtcbiAgICAgICAgICAgICAgICBzZXJ2aWNlID0gbmV3IGdvb2dsZS5tYXBzLnBsYWNlcy5QbGFjZXNTZXJ2aWNlKG1hcCk7XG4gICAgICAgICAgICAgICAgc2VydmljZS5uZWFyYnlTZWFyY2gocmVxdWVzdCwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxsYmFjayhyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLnBsYWNlcy5QbGFjZXNTZXJ2aWNlU3RhdHVzLk9LKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VyTGV0dGVyID0gU3RyaW5nLmZyb21DaGFyQ29kZSgnQScuY2hhckNvZGVBdCgwKSArIGkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFya2VySWNvbiA9IE1BUktFUl9QQVRIICsgbWFya2VyTGV0dGVyICsgJy5wbmcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzdWx0c1tpXS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNyZWF0ZU1hcmtlcihyZXN1bHRzW2ldKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogQVFVSSBFVCBDUkVBIEVMUyBNQVJDQURPUlMgQUwgTUFQQSAqL1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBjcmVhdGVNYXJrZXIocGxhY2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGxhY2VMb2MgPSBwbGFjZS5nZW9tZXRyeS5sb2NhdGlvbjtcbiAgICAgICAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb246IGdvb2dsZS5tYXBzLkFuaW1hdGlvbi5EUk9QLFxuICAgICAgICAgICAgICAgICAgICBpY29uOiBtYXJrZXJJY29uLFxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogcGxhY2UuZ2VvbWV0cnkubG9jYXRpb25cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBhcnJheW1hcmNhZG9ycy5wdXNoKG1hcmtlcik7XG5cbiAgICAgICAgICAgICAgICBnb29nbGUubWFwcy5ldmVudC5hZGRMaXN0ZW5lcihtYXJrZXIsICdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmF0aW5nSHRtbCA9ICdObyBoaSBoYSBQdW50cyc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwbGFjZS5yYXRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByYXRpbmdIdG1sID0gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGFjZS5yYXRpbmcgPCAoaSArIDAuNSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF0aW5nSHRtbCArPSAnJiMxMDAyNTsnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF0aW5nSHRtbCArPSAnJiMxMDAyOTsnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGluZm93aW5kb3cuc2V0Q29udGVudChcIjxkaXYgPjxpbWcgY2xhc3M9J2ltYWdlSWNvbicgc3JjPSdcIiArIHBsYWNlLmljb24gKyBcIicvPlwiICsgcGxhY2UubmFtZSArIFwiPC9kaXY+PGRpdj5cIiArIHJhdGluZ0h0bWwgKyBcIjwvZGl2PjxidXR0b24gaWQ9J2JvdG9BcnJpYmFyJyBjbGFzcz0nYnRuIGJ0bi1kZWZhdWx0Jz5Db20gaGkgYXJyaWJvPC9idXR0b24+XCIpO1xuICAgICAgICAgICAgICAgICAgICBpbmZvd2luZG93Lm9wZW4obWFwLCB0aGlzKTtcblxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cucGxhY2UgPSBwbGFjZTtcbiAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JvdG9BcnJpYmFyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBDb21BcnJpYm8pO1xuXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aW5kb3cuQ29tQXJyaWJvID0gZnVuY3Rpb24ocikge1xuICAgICAgICAgICAgICAgIGlmKGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhPT1mYWxzZSl7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXJlY3Rpb24tcGFuZWxcIikuc3R5bGUub3BhY2l0eSA9IFwiMVwiOyAgICBcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm90b1Blckd1YXJkYXInKS5zdHlsZS5vcGFjaXR5ID0gJzEnO1xuICAgICAgICAgICAgICAgIHIgPSB3aW5kb3cucGxhY2U7XG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYWNlSWQ6IHIucGxhY2VfaWRcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgc2VydmljZS5nZXREZXRhaWxzKHJlcXVlc3QsIGZ1bmN0aW9uKHBsYWNlLCBzdGF0dXMpIHtcblxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBoYWlnaHQgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKDM3Ljc2OTkyOTgsIC0xMjIuNDQ2OTE1Nyk7XG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5ID0gbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNSZW5kZXJlcigpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWFwT3B0aW9ucyA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHpvb206IDE0LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBoYWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoYXJyYXlEaXJlY2Npb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFRyZXVyZURpcmVjY2lvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhcnJheURpcmVjY2lvbnMucHVzaChkaXJlY3Rpb25zRGlzcGxheSk7XG4gICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldE1hcChtYXApO1xuICAgICAgICAgICAgICAgICAgICBjYWxjUm91dGUocGxhY2UpO1xuXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxjUm91dGUoZikge1xuICAgICAgICAgICAgICAgIE9iamVjdGVHdWFyZGFyID0gZjtcbiAgICAgICAgICAgICAgICB2YXIgc2VsZWN0ZWRNb2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vZGUnKS52YWx1ZTtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBwb3NpY2lvaW5pY2lhbFJvdXRlO1xuICAgICAgICAgICAgICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgICAgICAgICBvcmlnaW46IHN0YXJ0LFxuICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbjogZi5nZW9tZXRyeS5sb2NhdGlvbixcbiAgICAgICAgICAgICAgICAgICAgdHJhdmVsTW9kZTogZ29vZ2xlLm1hcHMuVHJhdmVsTW9kZVtzZWxlY3RlZE1vZGVdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNTZXJ2aWNlLnJvdXRlKHJlcXVlc3QsIGZ1bmN0aW9uKHJlc3BvbnNlLCBzdGF0dXMpIHtcblxuICAgICAgICAgICAgICAgICAgICBPYmplY3RlUmVzcG9uc2VHdWFkYXIgPSByZXNwb25zZTtcblxuICAgICAgICAgICAgICAgICAgICAvKkFRVUkgRU1QTEVOTyBMRVMgREFERVMgREVMIExMT0MgRU4gRUwgUFJJTUVSIERJViovXG5cblxuICAgICAgICAgICAgICAgICAgICB2YXIgYiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYW5lbC0xJyk7XG4gICAgICAgICAgICAgICAgICAgIGIuaW5uZXJIVE1MID0gXCIgXCI7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGExID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYTMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGE0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhNSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgICAgICAgICAvLyBhLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnbGlzdC1ncm91cC1pdGVtJyk7XG4gICAgICAgICAgICAgICAgICAgIGIuYXBwZW5kQ2hpbGQoYSk7XG4gICAgICAgICAgICAgICAgICAgIGExLmlubmVySFRNTCA9IFwiPGltZyBjbGFzcz0naW1hZ2VJY29uJyBzcmM9J1wiICsgZi5pY29uICsgXCInLz48Yj4gXCIgKyBmLm5hbWUgKyBcIjwvYj5cIjtcbiAgICAgICAgICAgICAgICAgICAgYTIuaW5uZXJIVE1MID0gXCI8c3BhbiBjbGFzcz0nbm9tRGFkYSc+QWRyZcOnYTogPC9zcGFuPlwiICsgcmVzcG9uc2Uucm91dGVzWzBdLmxlZ3NbMF0uZW5kX2FkZHJlc3M7XG4gICAgICAgICAgICAgICAgICAgIGEzLmlubmVySFRNTCA9IFwiPHNwYW4gY2xhc3M9J25vbURhZGEnPkR1cmFkYTogPC9zcGFuPlwiICsgcmVzcG9uc2Uucm91dGVzWzBdLmxlZ3NbMF0uZHVyYXRpb24udGV4dDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGYub3BlbmluZ19ob3VycyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZi5vcGVuaW5nX2hvdXJzLm9wZW5fbm93ID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhNC5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSdub21EYWRhJz5Ib3Jhcmk6IDwvc3Bhbj48c3BhbiBzdHlsZT0nY29sb3I6Z3JlZW4nPkxvY2FsIE9iZXJ0PC9zcGFuPlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYTQuaW5uZXJIVE1MID0gXCI8c3BhbiBjbGFzcz0nbm9tRGFkYSc+SG9yYXJpOiA8L3NwYW4+PHNwYW4gc3R5bGU9J2NvbG9yOnJlZCc+TG9jYWwgVGFuY2F0PC9zcGFuPlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmKGYuZm9ybWF0dGVkX3Bob25lX251bWJlciB8fCBmLmludGVybmF0aW9uYWxfcGhvbmVfbnVtYmVyKXtcbiAgICAgICAgICAgICAgICAgICAgYTUuaW5uZXJIVE1MID0gXCI8c3BhbiBjbGFzcz0nbm9tRGFkYSc+VGVsOiA8L3NwYW4+XCIgKyBmLmZvcm1hdHRlZF9waG9uZV9udW1iZXIgKyBcIiwgXCIgKyBmLmludGVybmF0aW9uYWxfcGhvbmVfbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXthNS5pbm5lckhUTUwgPVwiTm8gaGkgaGEgYXF1ZXN0YSBpbmZvcm1hY2nDs1wiO307XG4gICAgICAgICAgICAgICAgICAgIGEuYXBwZW5kQ2hpbGQoYTEpO1xuICAgICAgICAgICAgICAgICAgICBhLmFwcGVuZENoaWxkKGEyKTtcbiAgICAgICAgICAgICAgICAgICAgYS5hcHBlbmRDaGlsZChhMyk7XG4gICAgICAgICAgICAgICAgICAgIGEuYXBwZW5kQ2hpbGQoYTQpO1xuICAgICAgICAgICAgICAgICAgICBhLmFwcGVuZENoaWxkKGE1KTtcblxuICAgICAgICAgICAgICAgICAgICAvKkFRVUkgRU1QTEVOTyBMRVMgREFERVMgREVMIExMT0MgRU4gRUwgU0VHT04gRElWKi9cblxuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYW5lbC0yJyk7XG4gICAgICAgICAgICAgICAgICAgIGQuaW5uZXJIVE1MID0gXCIgXCI7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGMxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgYzMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgYzUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2xpc3QtZ3JvdXAtaXRlbScpO1xuICAgICAgICAgICAgICAgICAgICBkLmFwcGVuZENoaWxkKGMpO1xuICAgICAgICAgICAgICAgICAgICBpZihmLndlYnNpdGUpe1xuICAgICAgICAgICAgICAgICAgICBjMS5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSdub21EYWRhJz5XZWI6IDwvc3Bhbj48YSBocmVmPSdcIiArIGYud2Vic2l0ZSArIFwiJz5cIiArIGYud2Vic2l0ZSArIFwiPC9hPlwiO1xuICAgICAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICBjMS5pbm5lckhUTUwgPVwiTm8gaGkgaGEgYXF1ZXN0YSBpbmZvcm1hY2nDs1wiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGMyLmlubmVySFRNTCA9IFwiPHNwYW4gY2xhc3M9J25vbURhZGEnPkVzcGFpIEdvb2dsZTogPC9zcGFuPjxhIGhyZWY9J1wiICsgZi51cmwgKyBcIic+XCIgKyBmLnVybCArIFwiPC9hPlwiO1xuICAgICAgICAgICAgICAgICAgICBjMy5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSdub21EYWRhJz5EaXN0YW5jaWE6IDwvc3Bhbj5cIiArIHJlc3BvbnNlLnJvdXRlc1swXS5sZWdzWzBdLmRpc3RhbmNlLnRleHQ7XG4gICAgICAgICAgICAgICAgICAgIHZhciByYXRpbmcgPSAnTm8gaGkgaGEgUHVudHMnO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZi5yYXRpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByYXRpbmcgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYWNlLnJhdGluZyA8IChpICsgMC41KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXRpbmcgKz0gJyYjMTAwMjU7JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdGluZyArPSAnJiMxMDAyOTsnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGM1LmlubmVySFRNTCA9IFwiPHNwYW4gY2xhc3M9J25vbURhZGEnPlB1bnRzOiA8L3NwYW4+XCIgKyByYXRpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjLmFwcGVuZENoaWxkKGM1KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGMuYXBwZW5kQ2hpbGQoYzEpO1xuICAgICAgICAgICAgICAgICAgICBjLmFwcGVuZENoaWxkKGMyKTtcbiAgICAgICAgICAgICAgICAgICAgYy5hcHBlbmRDaGlsZChjMyk7XG5cblxuXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGYucGhvdG9zICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3RvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZvdG8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvdG8uaW5uZXJIVE1MID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGYucGhvdG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpdmltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGl2aW1hZ2Uuc2V0QXR0cmlidXRlKCdjbGFzcycsICdjb2wteHMtMTIgY29sLW1kLTMgZGl2ZGVsZXNpbWF0Z2VzJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpdmltYWdlLmFwcGVuZENoaWxkKHVybCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmwuc2V0QXR0cmlidXRlKCdjbGFzcycsICdpbWctdGh1bWJuYWlsIGZvdG9zJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsLnNldEF0dHJpYnV0ZSgnc3JjJywgZi5waG90b3NbaV0uZ2V0VXJsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21heFdpZHRoJzogMzAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnbWF4SGVpZ2h0JzogMjAwXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvdG8uYXBwZW5kQ2hpbGQoZGl2aW1hZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgXG5cblxuXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1N0YXR1cy5PSykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aW9uc0Rpc3BsYXkuc2V0RGlyZWN0aW9ucyhyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBzY29wZS5zb3J0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN1Y2Nlc3MgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3VjY2VzcycpO1xuICAgICAgICAgICAgICAgIHZhciBtaXNzYXRnZVN1Y2Nlc0d1YXJkYXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBtaXNzYXRnZVN1Y2Nlc0d1YXJkYXQuc2V0QXR0cmlidXRlKCdpZCcsJ21pc3NhdGdlU3VjY2VzR3VhcmRhdCcpO1xuICAgICAgICAgICAgICAgIG1pc3NhdGdlU3VjY2VzR3VhcmRhdC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywnYWxlcnQgYWxlcnQtc3VjY2VzcycpO1xuICAgICAgICAgICAgICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgICAgICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdocmVmJywnIycpO1xuICAgICAgICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKCdjbGFzcycsJ2Nsb3NlJyk7XG4gICAgICAgICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoJ2RhdGEtZGlzbWlzcycsJ2FsZXJ0Jyk7XG4gICAgICAgICAgICAgICAgbGluay5pbm5lckhUTUw9XCImdGltZXM7XCI7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbWlzc2F0Z2VTdWNjZXNHdWFyZGF0LmlubmVySFRNTD1cIjxzdHJvbmc+U3VjY2VzcyE8L3N0cm9uZz4gTGEgdGV2YSBsb2NhbGl0emFjaW8gaGEgZXN0YXQgZ3VhcmRhZGFcIjtcbiAgICAgICAgICAgICAgICBtaXNzYXRnZVN1Y2Nlc0d1YXJkYXQuYXBwZW5kQ2hpbGQobGluayk7XG4gICAgICAgICAgICAgICAgc3VjY2Vzcy5hcHBlbmRDaGlsZChtaXNzYXRnZVN1Y2Nlc0d1YXJkYXQpO1xuICAgICAgICAgICAgICAgIHNjb3BlLiRwYXJlbnQudGVzdChPYmplY3RlR3VhcmRhciwgT2JqZWN0ZVJlc3BvbnNlR3VhZGFyKTtcblxuICAgICAgICAgICAgfTtcblxuICAgICAgICB9XG4gICAgfVxufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJykuZGlyZWN0aXZlKCdzZWxlY3QyJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcblxuICAgICAgICB0ZW1wbGF0ZTogJzxzZWxlY3QgaWQ9XCJzZWxlY3QyXCIgY2xhc3M9XCJqcy1kYXRhLWV4YW1wbGUtYWpheFwiPiAgPG9wdGlvbiB2YWx1ZT1cIjM2MjAxOTRcIiBzZWxlY3RlZD1cInNlbGVjdGVkXCI+VXN1YXJpPC9vcHRpb24+PC9zZWxlY3Q+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcblxuICAgICAgICAgICAgJChcIi5qcy1kYXRhLWV4YW1wbGUtYWpheFwiKS5zZWxlY3QyKHtcbiAgICAgICAgICAgICAgICBhamF4OiB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBpL3VzZXJzL2xsZXRyYVwiLFxuICAgICAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICAgICAgICAgICAgICBkZWxheTogMjUwLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBmdW5jdGlvbihwYXJhbXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHBhcmFtcy50ZXJtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2U6IHBhcmFtcy5wYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzUmVzdWx0czogZnVuY3Rpb24oZGF0YSwgcGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlc2NhcGVNYXJrdXA6IGZ1bmN0aW9uKG1hcmt1cCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWFya3VwO1xuICAgICAgICAgICAgICAgIH0sIC8vIGxldCBvdXIgY3VzdG9tIGZvcm1hdHRlciB3b3JrXG4gICAgICAgICAgICAgICAgbWluaW11bUlucHV0TGVuZ3RoOiAxLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlUmVzdWx0OiBmb3JtYXRSZXBvLCAvLyBvbWl0dGVkIGZvciBicmV2aXR5LCBzZWUgdGhlIHNvdXJjZSBvZiB0aGlzIHBhZ2VcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVNlbGVjdGlvbjogZm9ybWF0UmVwb1NlbGVjdGlvbiAvLyBvbWl0dGVkIGZvciBicmV2aXR5LCBzZWUgdGhlIHNvdXJjZSBvZiB0aGlzIHBhZ2VcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBmb3JtYXRSZXBvKHJlcG8pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzY29wZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcG8ubG9hZGluZykgcmV0dXJuIHJlcG8udGV4dDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgbWFya3VwID0gJzxkaXYgY2xhc3M9XCJjbGVhcmZpeFwiPicgK1xuICAgICAgICAgICAgICAgICAgICAnPGEgc3R5bGU9XCJjdXJzb3I6cG9pbnRlclwiIGlkPVwiJyArIHJlcG8uX2lkICsnXCJvbmNsaWNrPVwiYnVzY2EodGhpcy5pZClcIj4nICsgcmVwby51c2VybmFtZSArICc8L2E+JyArXG4gICAgICAgICAgICAgICAgICAgICc8L2Rpdj4nO1xuXG4gICAgICAgICAgICAgICAgaWYgKHJlcG8uZGVzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbWFya3VwICs9ICc8ZGl2PicgKyByZXBvLmRlc2NyaXB0aW9uICsgJzwvZGl2Pic7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbWFya3VwICs9ICc8L2Rpdj48L2Rpdj4nO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG1hcmt1cDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gZm9ybWF0UmVwb1NlbGVjdGlvbihyZXBvKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcG8uZnVsbF9uYW1lIHx8IHJlcG8udGV4dDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgd2luZG93LmJ1c2NhID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmKHNjb3BlLmN1cnJlbnRVc2VyJiZlPT1zY29wZS5jdXJyZW50VXNlci5faWQpe1xuICAgICAgICAgICAgICAgICAgc2NvcGUuUGVyZmlsVXNlcigpO1xuICAgICAgICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgICAgIHNjb3BlLmRlZmluaXJVc2VyVmlzdGEoZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9