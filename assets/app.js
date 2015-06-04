angular.module('appLearn', ['ngResource','ngRoute','ngCookies','angularFileUpload']);
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
          
            UserSvc.logOut();
            delete $scope.currentUser;
            $location.path('/');
        };
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
    .controller('LocalitzacionsController', function($scope, LocalitzacioServei, $location, UserSvc, $rootScope) {


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
        }).$promise.then(function(localitzacio) {
            
            
            
            $scope.currentUser.localitzacions.splice(0,0,localitzacio);
            
            UserSvc.modificaarray($scope.currentUser,$scope.currentUser.localitzacions);
                
            $scope.miss="Guardem Correctament";

            $location.path("/novalocalitzacio");
        }, function(error) {
            
            $scope.error="Error al guardar";
            
            
        });
    };
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

          

            $http.get('/api/users/' + user + '').success(function(e) {
               
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

       


    });
angular.module('appLearn')
    .controller("UserController", function($scope,$location,UserSvc,LocalitzacioServei) {
        $scope.usuari = UserSvc.getUserView();
        
        
         $scope.compartirLocalitzacio = function(e,u) {

        
        LocalitzacioServei.srv.save({
            usuari: $scope.currentUser._id,
            nom: e.nom,
            logo: e.logo,
            adreca: e.adreca,
            telefon: e.telefon,
            latitud: e.latitud,
            longitud: e.longitud,
            usuariOrigen:u.username,
        }).$promise.then(function(localitzacio) {
        
            $scope.miss="Compartida Correctament";
              $scope.currentUser.localitzacions.splice(0,0,localitzacio);
            
              UserSvc.modificaarray($scope.currentUser,$scope.currentUser.localitzacions);
        
        }, function(error) {
            
            $scope.error="Error al compartir";
            
            
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
            var geolocalitzacioDenegada = false;
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
            window.crearMapa = function(pos) {
                var mapOptions = {
                    zoom: 10,
                    center: pos
                }
                map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                var w = window.innerWidth;
                document.getElementById("map-canvas").style.width = w;
            }

            function successInicial(pos) {

                pos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                crearMapa(pos);
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(successInicial, error);
            }






            var localitzacio;

            var infowindow;
            var posicioinicialRoute;



            /*AQUI ET DIU SI HA TROBAT BÉ LA TEVA GEOLOCALITZACIO*/

            function success(pos) {

                posicioinicialRoute = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                geolocalitzacioDenegada = false;
            };

            function error(err) {
                console.warn('ERROR(' + err.code + '): ' + err.message);
                alert("No es pot accedir a la teva geolocalitzacio");
                geolocalitzacioDenegada = true;
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
                 navigator.geolocation.getCurrentPosition(success, error);
                document.getElementById("direction-panel").style.opacity = "0";
                document.getElementById('botoPerGuardar').style.opacity = '0';

                if (arraymarcadors.length > 0) {
                    TreureMarcadors();
                }
                if (arrayDireccions.length > 0) {
                    TreureDireccions();
                }

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


                if (geolocalitzacioDenegada == false) {

                    r = window.place;
                    var request = {
                        placeId: r.place_id
                    };

                    service.getDetails(request, function(place, status) {
                        console.log("El que arriba");
                        console.log(place);

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

                    /*MIRO SI LA RUTA ÉS POSSIBLE*/
                    if (response.routes[0].legs[0] != null) {
                        document.getElementById("direction-panel").style.opacity = "1";
                        document.getElementById('botoPerGuardar').style.opacity = '1';

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
                        if (f.formatted_phone_number || f.international_phone_number) {
                            a5.innerHTML = "<span class='nomDada'>Tel: </span>" + f.formatted_phone_number + ", " + f.international_phone_number;
                        }
                        else {
                            a5.innerHTML = "No hi ha aquesta informació";
                        };
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
                        if (f.website) {
                            c1.innerHTML = "<span class='nomDada'>Web: </span><a href='" + f.website + "'>" + f.website + "</a>";
                        }
                        else {
                            c1.innerHTML = "No hi ha aquesta informació";
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
                    }
                });

            }


            scope.sort = function() {

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImFwcGxpY2F0aW9uLmN0cmwuanMiLCJlZGl0YWNvbmZpZ3VyYWNpb3VzZXIuY3RybC5qcyIsImluaWNpY29udHJvbGxlci5jdHJsLmpzIiwibG9jYWxpdHphY2lvLnNydi5qcyIsImxvY2FsaXR6YWNpb25zLmN0cmwuanMiLCJsb2dpbi5jdHJsLmpzIiwibm92YWxvY2FsaXR6YWNpby5jdHJsLmpzIiwicmVnaXN0cmUuY3RybC5qcyIsInJvdXRlcy5qcyIsInVzZXIuc3J2LmpzIiwidXNyLmN0cmwuanMiLCJkaXJlY3RpdmVzL2RpcmVjY2lvbnMuZGlyZWN0aXZlLmpzIiwiZGlyZWN0aXZlcy9tYXAuZGlyZWN0aXZlLmpzIiwiZGlyZWN0aXZlcy9zZWxlY3QudXN1YXJpcy5kaXJlY3RpdmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5WUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJywgWyduZ1Jlc291cmNlJywnbmdSb3V0ZScsJ25nQ29va2llcycsJ2FuZ3VsYXJGaWxlVXBsb2FkJ10pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4gICAgLmNvbnRyb2xsZXIoXCJBcHBsaWNhdGlvbkNvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHJvdXRlLCAkc2NvcGUsJGxvY2F0aW9uLFVzZXJTdmMsJGNvb2tpZXMpIHtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS4kb24oJ2xvZ2luJywgZnVuY3Rpb24oZSx1c2VyKSB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFF1YW4gcydoYSBmZXQgbG9naW4gcydlbWV0IGwnZXZlbnQgXCJsb2dpblwiXG4gICAgICAgICAgICAgICAgaSBhaXjDsiBmYSBxdWUgbGEgdmFyaWFibGUgZGUgbCdzY29wZSBcImN1cnJlbnRVc2VyXCJcbiAgICAgICAgICAgICAgICBsaSBkaWVtIHF1aW4gdXN1YXJpIHMnaGEgYXV0ZW50aWNhbnQsIGQnYXF1ZXN0YSBtYW5lcmFcbiAgICAgICAgICAgICAgICBmZW0gcXVlIGFwYXJlZ3VpbiBkaWZlcmVudHMgb3BjaW9ucyBhbCBtZW7DulxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VXNlciA9IHVzZXI7XG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5kZWZpbmlyVXNlclZpc3RhID0gZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgVXNlclN2Yy5zZXRVc2VyVmlldyh1c2VyKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgICRzY29wZS5QZXJmaWxVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aChcIi91c2VybG9jYWxpdHphY2lvbnNcIik7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuJG9uKCd1c2VyZGVmaW5lZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHJvdXRlLnJlbG9hZCgpO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy91c3VhcmknKTtcbiAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUXVhbiBmZW0gbG9nb3V0IGVzYm9ycmVtIGVsIHRva2VuIGkgbGEgdmFyaWFibGVcbiAgICAgICAgICAgICAgICBkZSBsJyRzY29wZSBcImN1cnJlbnRVc2VyXCIsIGQnYXF1ZXN0YSBmb3JtYSBkZXNhcGFyZWl4ZW5cbiAgICAgICAgICAgICAgICBlbHMgbWVuw7pzIHNlbnNpYmxlcyBhIGxhIGF1dGVudGljYWNpw7NcbiAgICAgICAgICAgICovXG4gICAgICAgICAgXG4gICAgICAgICAgICBVc2VyU3ZjLmxvZ091dCgpO1xuICAgICAgICAgICAgZGVsZXRlICRzY29wZS5jdXJyZW50VXNlcjtcbiAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvJyk7XG4gICAgICAgIH07XG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIkVkaXRhQ29udHJvbGxlclwiLCBmdW5jdGlvbigkcm91dGUsICRzY29wZSwgJGxvY2F0aW9uLCBVc2VyU3ZjLCAkY29va2llcywgRmlsZVVwbG9hZGVyKSB7XG4gICAgICAgIFxuICAgICAgICB2YXIgdXBsb2FkZXIgPSAkc2NvcGUudXBsb2FkZXIgPSBuZXcgRmlsZVVwbG9hZGVyKHtcbiAgICAgICAgICAgIHVybDogXCIvYXBpL3VzZXJzL3B1amFySW1hdGdlXCIsXG4gICAgICAgICAgICBhbGlhczogXCJpbWFnZVwiLFxuICAgICAgICAgICAgcmVtb3ZlQWZ0ZXJVcGxvYWQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgXG4gICAgICAgIHVwbG9hZGVyLm9uQmVmb3JlVXBsb2FkSXRlbSA9IGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIGl0ZW0uaGVhZGVycz17XG4gICAgICAgICAgICAgICAgJ3gtYXV0aCc6VXNlclN2Yy5nZXRBdXRoKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZW0uZm9ybURhdGEucHVzaCh7XG4gICAgICAgICAgICAgICAgb3JpZ2luYWxuYW1lOiAkc2NvcGUuY3VycmVudFVzZXIuX2lkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuXG4gICAgICAgICRzY29wZS5lZGl0YXVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLmZyYXNlKSB7XG4gICAgICAgICAgICAgICAgdXNlci5mcmFzZSA9ICRzY29wZS5mcmFzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuXG4gICAgICAgICAgICAgICAgdXNlci5mcmFzZSA9IFwiTSdhZ3JhZGEgU2VhcmNoWW91clBsYWNlXCI7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkc2NvcGUuYWZpY2lvbnMpIHtcbiAgICAgICAgICAgICAgICB1c2VyLmFmaWNpb25zID0gJHNjb3BlLmFmaWNpb25zO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB1c2VyLmFmaWNpb25zID0gXCJCdXNjYXIgbGxvY3MgcGVyIHRvdCBlbCBtw7NuXCI7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkc2NvcGUubWVuamFyKSB7XG4gICAgICAgICAgICAgICAgdXNlci5tZW5qYXIgPSAkc2NvcGUubWVuamFyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB1c2VyLm1lbmphciA9IFwiRWwgcXVlIGVtIHBvc2luIGFsIHBsYXRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgkc2NvcGUubGxvYykge1xuICAgICAgICAgICAgICAgIHVzZXIubGxvYyA9ICRzY29wZS5sbG9jO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG5cbiAgICAgICAgICAgICAgICB1c2VyLmxsb2MgPSBcIlNvYnJlIGxlcyBtb250YW55ZXNcIjtcblxuICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICAgICAgVXNlclN2Yy5lZGl0YWNvbmZpZ3VyYWNpbyh1c2VyKTtcblxuICAgICAgICAgICAgbG9jYXRpb24ucGF0aChcIi91c2VybG9jYWxpdHphY2lvbnNcIik7XG4gICAgICAgIH1cblxuXG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIkluaWNpQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsJGxvY2F0aW9uKSB7XG4gICAgICAgIFxuICAgICAgXG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbi5zZXJ2aWNlKFwiTG9jYWxpdHphY2lvU2VydmVpXCIsIGZ1bmN0aW9uKCRyZXNvdXJjZSkge1xuICAgICB0aGlzLnNydiA9ICRyZXNvdXJjZSgnL2FwaS9sb2NhbGl0emFjaW8vOmlkJywgbnVsbCwge1xuICAgICAgICAgICd1cGRhdGUnOiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgICAgICB9XG4gICAgICB9KTtcblxuICB0aGlzLmVkaXRhID0gbnVsbDtcbiAgcmV0dXJuIHRoaXM7XG4gICAgXG4gIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4gICAgLmNvbnRyb2xsZXIoJ0xvY2FsaXR6YWNpb25zQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgTG9jYWxpdHphY2lvU2VydmVpLCAkbG9jYXRpb24sIFVzZXJTdmMsICRyb290U2NvcGUpIHtcblxuXG4gICAgICAgICRzY29wZS5sb2NhbGl0emFjaW9ucyA9IFtdO1xuICAgICAgICBVc2VyU3ZjLmJ1c2NhKCRzY29wZS5jdXJyZW50VXNlci5faWQpO1xuXG4gICAgICAgICRzY29wZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgIFVzZXJTdmMuYnVzY2EoJHNjb3BlLmN1cnJlbnRVc2VyLl9pZCk7XG4gICAgICAgIH07XG5cblxuICAgICAgICAkc2NvcGUuJG9uKCd1c3VhcmknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS51c2VyID0gVXNlclN2Yy5nZXRVc3VhcmlBY3R1YWwoKTtcbiAgICAgICAgfSk7XG5cblxuXG4gICAgICAgICRzY29wZS5ib3JyYXJBcnJheWxvY2FsaXR6YWNpbyA9IGZ1bmN0aW9uKGxvY2FsaXR6YWNpbykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUudXNlci5sb2NhbGl0emFjaW9ucy5zcGxpY2UoJHNjb3BlLnVzZXIubG9jYWxpdHphY2lvbnMuaW5kZXhPZihsb2NhbGl0emFjaW8pLDEpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBVc2VyU3ZjLm1vZGlmaWNhYXJyYXkoJHNjb3BlLnVzZXIsJHNjb3BlLnVzZXIubG9jYWxpdHphY2lvbnMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuYm9ycmFybG9jYWxpdHphY2lvKGxvY2FsaXR6YWNpbyk7XG4gICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuYm9ycmFybG9jYWxpdHphY2lvID0gZnVuY3Rpb24obG9jYWxpdHphY2lvKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgTG9jYWxpdHphY2lvU2VydmVpLnNydi5yZW1vdmUoe1xuICAgICAgICAgICAgICAgIGlkOiBsb2NhbGl0emFjaW8uX2lkLFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG5cbiAgICAgICAgfVxuICAgICAgICBcblxuICAgICAgICBcbiAgICAgICAgJHNjb3BlLlBlckFycmliYXI9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGdlb2xvY2FsaXR6YW0oZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuXG5cbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuICAgIC5jb250cm9sbGVyKFwiTG9naW5Db250cm9sbGVyXCIsIGZ1bmN0aW9uKCRzY29wZSwkbG9jYXRpb24sVXNlclN2Yyl7XG4gICAgICAgICBcbiAgICBcbiAgICAgICAgICRzY29wZS4kd2F0Y2hHcm91cChbJ3VzZXJuYW1lJywncGFzc3dvcmQnXSxmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICogVmlnaWxlbSBsZXMgdmFyaWFibGVzIGRlIGwnJHNjb3BlIFwidXNlcm5hbWVcIlxuICAgICAgICAgICAgICAgICAqIGkgXCJwYXNzd29yZFwiIHBlciBlc2JvcnJhciBlbCBtaXNzYXRnZSBkJ2Vycm9yXG4gICAgICAgICAgICAgICAgICogc2kgaGkgaGEuXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKG5ld1ZhbCE9b2xkVmFsKVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3I9bnVsbDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbih1c2VybmFtZSxwYXNzd29yZCkge1xuICAgICAgICAgICAgaWYgKCF1c2VybmFtZSB8fCAhcGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBcIkhhcyBkJ2VtcGxlbmFyIHRvdHMgZWxzIGNhbXBzXCI7XG4gICAgICAgICAgICB9IGVsc2V7XG4gICAgICAgICAgICAgICAgVXNlclN2Yy5sb2dpbih1c2VybmFtZSxwYXNzd29yZCxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oZXJyb3Isc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZ1bmNpw7MgcXVlIHMnZXhlY3V0YXLDoCBzaSBoaSBoYSB1biBlcnJvciBlbiBlbCBsb2dpblxuICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvciA9IGVycm9yLm1pc3NhdGdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgVXNlclN2Yy5nZXRVc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBTaSB0b3QgdmEgYsOpLCBhbmVtIGEgbGEgcMOgZ2luYSBwcmluY2lwYWxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSBlbWV0ZW4gdW4gbWlzc2F0Z2UgZGUgXCJsb2dpblwiIHBlciBhdmlzYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYSBsYSBub3N0cmEgYXBwIHF1ZSBsJ3VzdWFyaSBoYSBmZXQgbG9naW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29ycmVjdGFtZW50LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXNlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRlbWl0KCdsb2dpbicsIHVzZXIuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy91c2VybG9jYWxpdHphY2lvbnMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKS5jb250cm9sbGVyKCdOb3ZhbG9jYWxpdHphY2lvY29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGxvY2F0aW9uLCBMb2NhbGl0emFjaW9TZXJ2ZWksIFVzZXJTdmMpIHtcblxuXG5cbiAgICAkc2NvcGUudGVzdCA9IGZ1bmN0aW9uKGUsIGYpIHtcbiAgICAgICAgaWYoZSE9bnVsbCYmZiE9bnVsbCl7XG4gICAgICAgICRzY29wZS5ub20gPSBlLm5hbWU7XG4gICAgICAgICRzY29wZS5sb2dvID0gZS5pY29uO1xuICAgICAgICAkc2NvcGUuYWRyZWNhID0gZi5yb3V0ZXNbMF0ubGVnc1swXS5lbmRfYWRkcmVzcztcbiAgICAgICAgJHNjb3BlLnRlbCA9IGUuZm9ybWF0dGVkX3Bob25lX251bWJlcjtcbiAgICAgICAgJHNjb3BlLmxhdGl0dWQgPSBlLmdlb21ldHJ5LmxvY2F0aW9uLkE7XG4gICAgICAgICRzY29wZS5sb25naXR1ZCA9IGUuZ2VvbWV0cnkubG9jYXRpb24uRjtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUuYWZlZ2lybG9jYWxpdHphY2lvKCk7XG4gICAgfVxufVxuXG5cbiAgICAkc2NvcGUuYWZlZ2lybG9jYWxpdHphY2lvID0gZnVuY3Rpb24oKSB7XG4gXG4gICAgICAgIFxuICAgICAgICBMb2NhbGl0emFjaW9TZXJ2ZWkuc3J2LnNhdmUoe1xuICAgICAgICAgICAgdXN1YXJpOiAkc2NvcGUuY3VycmVudFVzZXIuX2lkLFxuICAgICAgICAgICAgbm9tOiAkc2NvcGUubm9tLFxuICAgICAgICAgICAgbG9nbzogJHNjb3BlLmxvZ28sXG4gICAgICAgICAgICBhZHJlY2E6ICRzY29wZS5hZHJlY2EsXG4gICAgICAgICAgICB0ZWxlZm9uOiAkc2NvcGUudGVsLFxuICAgICAgICAgICAgbGF0aXR1ZDogJHNjb3BlLmxhdGl0dWQsXG4gICAgICAgICAgICBsb25naXR1ZDogJHNjb3BlLmxvbmdpdHVkLFxuICAgICAgICB9KS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKGxvY2FsaXR6YWNpbykge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRVc2VyLmxvY2FsaXR6YWNpb25zLnNwbGljZSgwLDAsbG9jYWxpdHphY2lvKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgVXNlclN2Yy5tb2RpZmljYWFycmF5KCRzY29wZS5jdXJyZW50VXNlciwkc2NvcGUuY3VycmVudFVzZXIubG9jYWxpdHphY2lvbnMpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLm1pc3M9XCJHdWFyZGVtIENvcnJlY3RhbWVudFwiO1xuXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aChcIi9ub3ZhbG9jYWxpdHphY2lvXCIpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuZXJyb3I9XCJFcnJvciBhbCBndWFyZGFyXCI7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICB9O1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIlJlZ2lzdHJlQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsJGxvY2F0aW9uLFVzZXJTdmMpIHtcbiAgICAgICAgXG4gICAgICAgICRzY29wZS5yZWdpc3RyZSA9IGZ1bmN0aW9uKHVzZXJuYW1lLHBhc3N3b3JkLHBhc3N3b3JkMikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuJHdhdGNoR3JvdXAoWyd1c2VybmFtZScsJ3Bhc3N3b3JkJywncGFzc3dvcmQyJ10sZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICAgICAgICBpZiAobmV3VmFsIT1vbGRWYWwpXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvcj1udWxsO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXBhc3N3b3JkIHx8ICFwYXNzd29yZDIgfHwgIXVzZXJuYW1lKXtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBcIkhhcyBkJ2VtcGxlbmFyIHRvdHMgZWxzIGNhbXBzXCI7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9ZWxzZSBpZiAocGFzc3dvcmQgPT09IHBhc3N3b3JkMil7XG4gICAgICAgICAgICAgICAgVXNlclN2Yy5yZWdpc3RyZSh1c2VybmFtZSxwYXNzd29yZClcbiAgICAgICAgICAgICAgICAgICAgLnN1Y2Nlc3MoZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oZXJyb3Isc3RhdHVzKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gNDA5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvciA9IGVycm9yLm1pc3NhdGdlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gXCJMZXMgY29udHJhc2VueWVzIG5vIHPDs24gaWd1YWxzXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJykuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgLndoZW4oXCIvXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogJ0luaWNpQ29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAncHJpbmNpcGFsLmh0bWwnLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLndoZW4oXCIvbm92YWxvY2FsaXR6YWNpb1wiLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6IFwiTm92YWxvY2FsaXR6YWNpb2NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwiY3JlYXJsb2NhbGl0emFjaW8uaHRtbFwiLFxuICAgICAgICBhdXRvcml0emF0OiB0cnVlXG4gICAgfSkud2hlbihcIi9sb2dpblwiLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6IFwiTG9naW5Db250cm9sbGVyXCIsXG4gICAgICAgIHRlbXBsYXRlVXJsOiBcImxvZ2luLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogZmFsc2VcbiAgICB9KS53aGVuKFwiL3JlZ2lzdHJlXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJSZWdpc3RyZUNvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwicmVnaXN0cmUuaHRtbFwiLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLndoZW4oXCIvdXNlcmxvY2FsaXR6YWNpb25zXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJMb2NhbGl0emFjaW9uc0NvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwidXNlcmxvY2FsaXR6YWNpb25zLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogdHJ1ZVxuICAgIH0pLndoZW4oXCIvc2VsZWNjaW9uYWNhdGVnb3JpZXNcIiwge1xuICAgICAgICBjb250cm9sbGVyOiBcIkluaWNpQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJzZWxlY2Npb25hY2F0ZWdvcmlhLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogdHJ1ZVxuICAgIH0pLndoZW4oXCIvZWRpdGFVc2VyXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJFZGl0YUNvbnRyb2xsZXJcIixcbiAgICAgICAgdGVtcGxhdGVVcmw6IFwiRWRpdGFVc2VyLmh0bWxcIixcbiAgICAgICAgYXV0b3JpdHphdDogdHJ1ZVxuICAgIH0pLndoZW4oXCIvdXN1YXJpXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogXCJVc2VyQ29udHJvbGxlclwiLFxuICAgICAgICB0ZW1wbGF0ZVVybDogXCJ1c3VhcmkuaHRtbFwiLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLm90aGVyd2lzZSh7XG4gICAgICAgIHJlZGlyZWN0VG86ICcvJ1xuICAgIH0pO1xuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh7XG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHJlcXVpcmVCYXNlOiBmYWxzZVxuICAgIH0pO1xufSkucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsIFVzZXJTdmMsJGxvY2F0aW9uKSB7XG4gICAgXG4gICAgICAvKiAgQ2FkYSB2ZWdhZGEgcXVlIGNhbnZpZW0gZGUgcMOgZ2luYSBzZSBkaXNwYXJhIGVsXG4gICAgICAgIGV2ZW50ICRyb3V0ZUNoYW5nZVN0YXJ0LFxuICAgICAgICBTaSBsYSBww6BnaW5hIHF1ZSB2b2xlbSB2ZXVyZSB0w6kgbGEgcHJvcGlldGF0IFxuICAgICAgICBcImF1dG9yaXR6YXRcIjogYSB0cnVlIGkgbm8gaG8gZXN0w6AgbGxhdm9ycyBubyBcbiAgICAgICAgZmFyw6AgZWwgY2FudmkqL1xuICAgIFxuICAgICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0KSB7XG4gICAgICAgIGlmIChuZXh0KVxuICAgICAgICAgICAgaWYgKCFVc2VyU3ZjLmF1dGggJiBuZXh0LmF1dG9yaXR6YXQpe1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcbiAgICAgICAgICAgIH1cbiAgICB9KTtcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4gICAgLnNlcnZpY2UoJ1VzZXJTdmMnLCBmdW5jdGlvbigkaHR0cCwgJGNvb2tpZXMsICRyb290U2NvcGUpIHtcbiAgICAgICAgdmFyIHNydiA9IHRoaXM7XG4gICAgICAgIHNydi5hdXRoID0gZmFsc2U7XG4gICAgICAgIHNydi5Vc3VhcmkgPSBcIiBcIjtcbiAgICAgICAgc3J2LlVzdWFyaUFjdHVhbDtcbiAgICAgICAgc3J2LlVzdWFyaVZpZXc7XG4gICAgICAgIHZhciB4YXV0aDtcbiAgICAgICAgXG4gICAgICAgIHNydi5nZXRBdXRoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuIHhhdXRoO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgc3J2LmNvb2tpZSA9IGZ1bmN0aW9uKHRva2VuKSB7XG5cbiAgICAgICAgICBcbiAgICAgICAgICAgIHhhdXRoPXRva2VuO1xuICAgICAgICAgICAgJGh0dHAuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bJ3gtYXV0aCddID0gdG9rZW47XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3VzZXJzJykuc3VjY2VzcyhmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgc3J2LmF1dGggPSB0cnVlO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbG9naW4nLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAoJGNvb2tpZXNbXCJfTWFRXCJdKSB7XG4gICAgICAgICAgICB2YXIgdG9rZW4gPSAkY29va2llc1tcIl9NYVFcIl07XG4gICAgICAgICAgICBzcnYuY29va2llKHRva2VuKTtcblxuXG4gICAgICAgIH1cblxuICAgICAgICBzcnYuc2V0VXNlclZpZXcgPSBmdW5jdGlvbih1c2VyKSB7XG5cbiAgICAgICAgICBcblxuICAgICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL3VzZXJzLycgKyB1c2VyICsgJycpLnN1Y2Nlc3MoZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc3J2LlVzdWFyaVZpZXcgPSBlO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndXNlcmRlZmluZWQnKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICBzcnYuZ2V0VXNlclZpZXcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBzcnYuVXN1YXJpVmlldztcbiAgICAgICAgfVxuXG5cbiAgICAgICAgc3J2LmdldFVzdWFyaUFjdHVhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNydi5Vc3VhcmlBY3R1YWw7XG4gICAgICAgIH1cblxuICAgICAgICBzcnYuZ2V0VXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2VycycpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHNydi5idXNjYSA9IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIFxuICAgICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL3VzZXJzJywge1xuICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICBpZDogaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBzcnYuVXN1YXJpQWN0dWFsID0gZTtcblxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndXN1YXJpJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICBzcnYubG9naW4gPSBmdW5jdGlvbih1c2VybmFtZSwgcGFzc3dvcmQsIG5vTG9naW4pIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3Nlc3Npb25zJywge1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgU2kgbCdhdXRlbnRpY2FjacOzIMOpcyBjb3JyZWN0ZSBsaSBkaWVtIGEgbCdhbmd1bGFyIHF1ZSBjYWRhIFxuICAgICAgICAgICAgICAgICAgICB2ZWdhZGEgcXVlIGVzIGNvbXVuaXF1aSBhbWIgZWwgc2Vydmlkb3IgYWZlZ2VpeGkgZWwgdG9rZW4gXG4gICAgICAgICAgICAgICAgICAgIGFsIGhlYWRlciAneC1hdXRoJ1xuICAgICAgICAgICAgICAgICovXG5cbiAgICAgICAgICAgICAgICBzcnYuVXN1YXJpID0gdXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgeGF1dGg9ZGF0YTtcbiAgICAgICAgICAgICAgICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsneC1hdXRoJ10gPSBkYXRhO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhKSBzcnYuYXV0aCA9IHRydWU7XG4gICAgICAgICAgICB9KS5lcnJvcihmdW5jdGlvbihlcnJvciwgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgU2kgbCd1c3VhcmkgaSBjb250cmFzZW55YSBubyDDqXMgY29ycmVjdGUgZXhlY3V0YSBsYVxuICAgICAgICAgICAgICAgICAgICBmdW5jacOzbiBjYWxsYmFjayBxdWUgbGkgaGVtIHBhc3NhdCBjb20gcGFyw6BtZXRyZVxuICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgbm9Mb2dpbihlcnJvciwgc3RhdHVzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnJlZ2lzdHJlID0gZnVuY3Rpb24odXNlcm5hbWUsIHBhc3N3b3JkKSB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFBlciByZWdpc3RyYXIgdW4gdXN1YXJpIG5vdSwgbm9tw6lzIGhlbSBkZSBmZXIgdW4gcG9zdFxuICAgICAgICAgICAgICAgIGEgbCdhcGkgZCd1c3VhcmlzXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvdXNlcnMnLCB7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMubG9nT3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIFF1YW4gbCd1c3VhcmkgZmEgbG9nb3V0IHMnZXNib3JyYSBlbCB0b2tlblxuICAgICAgICAgICAgICAgIGkgcG9zZW0gbGEgcHJvcGlldGF0IGRlbCBzZXJ2ZWkgXCJhdXRoXCIgYSBmYWxzZVxuICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgc3J2LmF1dGggPSBmYWxzZTtcbiAgICAgICAgICBcbiAgICAgICAgICAgICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWyd4LWF1dGgnXSA9IFwiXCI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5tb2RpZmljYWFycmF5ID0gZnVuY3Rpb24odXNlciwgYXJyYXkpIHtcblxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnB1dChcImFwaS91c2Vycy9hcnJheWxvY2FsaXR6YWNpb25zXCIsIHtcbiAgICAgICAgICAgICAgICBcInVzXCI6IHVzZXIsXG4gICAgICAgICAgICAgICAgXCJhcnJheVwiOiBhcnJheVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVkaXRhY29uZmlndXJhY2lvID0gZnVuY3Rpb24odXNlcikge1xuXG4gICAgICAgICAgICB2YXIgY29zID0ge1xuICAgICAgICAgICAgICAgIFwidXN1YXJpXCI6IHVzZXJcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wdXQoXCIvYXBpL3VzZXJzL2VkaXRhY29uZmlndXJhY2lvXCIsIHtcbiAgICAgICAgICAgICAgICBcImNvc1wiOiBjb3NcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG5cbiAgICAgICBcblxuXG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIlVzZXJDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRzY29wZSwkbG9jYXRpb24sVXNlclN2YyxMb2NhbGl0emFjaW9TZXJ2ZWkpIHtcbiAgICAgICAgJHNjb3BlLnVzdWFyaSA9IFVzZXJTdmMuZ2V0VXNlclZpZXcoKTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAgJHNjb3BlLmNvbXBhcnRpckxvY2FsaXR6YWNpbyA9IGZ1bmN0aW9uKGUsdSkge1xuXG4gICAgICAgIFxuICAgICAgICBMb2NhbGl0emFjaW9TZXJ2ZWkuc3J2LnNhdmUoe1xuICAgICAgICAgICAgdXN1YXJpOiAkc2NvcGUuY3VycmVudFVzZXIuX2lkLFxuICAgICAgICAgICAgbm9tOiBlLm5vbSxcbiAgICAgICAgICAgIGxvZ286IGUubG9nbyxcbiAgICAgICAgICAgIGFkcmVjYTogZS5hZHJlY2EsXG4gICAgICAgICAgICB0ZWxlZm9uOiBlLnRlbGVmb24sXG4gICAgICAgICAgICBsYXRpdHVkOiBlLmxhdGl0dWQsXG4gICAgICAgICAgICBsb25naXR1ZDogZS5sb25naXR1ZCxcbiAgICAgICAgICAgIHVzdWFyaU9yaWdlbjp1LnVzZXJuYW1lLFxuICAgICAgICB9KS4kcHJvbWlzZS50aGVuKGZ1bmN0aW9uKGxvY2FsaXR6YWNpbykge1xuICAgICAgICBcbiAgICAgICAgICAgICRzY29wZS5taXNzPVwiQ29tcGFydGlkYSBDb3JyZWN0YW1lbnRcIjtcbiAgICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRVc2VyLmxvY2FsaXR6YWNpb25zLnNwbGljZSgwLDAsbG9jYWxpdHphY2lvKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICBVc2VyU3ZjLm1vZGlmaWNhYXJyYXkoJHNjb3BlLmN1cnJlbnRVc2VyLCRzY29wZS5jdXJyZW50VXNlci5sb2NhbGl0emFjaW9ucyk7XG4gICAgICAgIFxuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkc2NvcGUuZXJyb3I9XCJFcnJvciBhbCBjb21wYXJ0aXJcIjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgXG4gICAgfVxuICAgICAgICBcbiAgICAgICAgXG4gICAgfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJykuZGlyZWN0aXZlKCdjb21wYXJ0aXInLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgc29ydGJ5OiBcIkBcIixcbiAgICAgICAgICAgIG9uc29ydDogXCI9XCJcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGlkPVwicGFuZWwtZGlyZWNjaW9uc1wiPjxwIGlkPVwiZGFkZXNJbmljaURpcmVjY2lvbnNcIj5BZHJlw6dhIEluaWNpIChwZXIgZGVmZWN0ZSBsYSB0ZXZhIGdlb2xvY2FsaXR6YWNpbykgPHNwYW4gaWQ9XCJib3RvQm9ycmFEaXJlY2Npb25zXCIgb25jbGljaz1cIm5ldGVqYSgpXCIgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXJlbW92ZVwiPjwvc3Bhbj48L3A+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgb25jaGFuZ2U9XCJub3ZhZGlyZWNjaW8oKVwiIGlkPVwiaW5pY2lcIj48L2lucHV0PjxkaXY+PHNlbGVjdCBjbGFzcz1cImZvcm0tY29udHJvbFwiIG9uY2hhbmdlPVwibm92YWRpcmVjY2lvKClcIiBpZD1cIm1vZGVcIj48b3B0aW9uIHZhbHVlPVwiRFJJVklOR1wiPkNvdHhlPC9vcHRpb24+PG9wdGlvbiB2YWx1ZT1cIldBTEtJTkdcIj5DYW1pbmFudDwvb3B0aW9uPjxvcHRpb24gdmFsdWU9XCJUUkFOU0lUXCI+VHJhc3BvcnQgUMO6YmxpYzwvb3B0aW9uPjwvc2VsZWN0PjwvZGl2PjwvZGl2PjxkaXYgaWQ9XCJkaXJlY3Rpb25zLXBhbmVsXCI+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcblxuXG5cbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb25zRGlzcGxheSA9IG5ldyBnb29nbGUubWFwcy5EaXJlY3Rpb25zUmVuZGVyZXIoKTtcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb25zU2VydmljZSA9IG5ldyBnb29nbGUubWFwcy5EaXJlY3Rpb25zU2VydmljZSgpO1xuICAgICAgICAgICAgdmFyIGdlb2NvZGVyO1xuICAgICAgICAgICAgLypBSVhPIEhPIElHVUFMTyBBIEwnT0JKRUNURSBMT0NBTElUWkFDSU8gUEVSUVVFIFFVQU4gRVhFQ1VUSSBMQSBGVU5DSU8gTk9WQURJUkVDQ0lPIEVTVElHVUkgTCdBRFJFQ0EgR1VBUkRBREEqL1xuICAgICAgICAgICAgdmFyIG9iamVjdGVBZHJlY2FGaW5hbDtcbiAgICAgICAgICAgIHZhciBwb3NpY2lvaW5pY2lhbFJvdXRlO1xuICAgICAgICAgICAgdmFyIGFkcmVjYWluaWNpYWw7XG4gICAgICAgICAgICB2YXIgYWRyZWNhZmluYWw7XG4gICAgICAgICAgICB2YXIgZ2VvbG9jYWxpdHphY2lvRGVuZWdhZGE9ZmFsc2U7XG4gICAgICAgICAgICB2YXIgdGlwdXNkZXRyYW5zcG9ydDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gc3VjY2Vzcyhwb3MpIHtcbiAgICAgICAgICAgICAgICBnZW9sb2NhbGl0emFjaW9EZW5lZ2FkYT1mYWxzZTtcbiAgICAgICAgICAgICAgICBwb3NpY2lvaW5pY2lhbFJvdXRlID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhwb3MuY29vcmRzLmxhdGl0dWRlLCBwb3MuY29vcmRzLmxvbmdpdHVkZSk7XG4gICAgICAgICAgICAgICAgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcbiAgICAgICAgICAgICAgICBnZW9jb2Rlci5nZW9jb2RlKHtcbiAgICAgICAgICAgICAgICAgICAgJ2xhdExuZyc6IHBvc2ljaW9pbmljaWFsUm91dGVcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBhZHJlY2FpbmljaWFsID0gcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzcztcblxuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5pY2knKS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgYWRyZWNhaW5pY2lhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5pY2knKS5zZXRBdHRyaWJ1dGUoJ3BsYWNlaG9sZGVyJywgYWRyZWNhaW5pY2lhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aXB1c2RldHJhbnNwb3J0ID0gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb2RlJykudmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjY2lvbnMoKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KVxuXG5cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBmdW5jdGlvbiBlcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgICBhbGVydChcIk5vIGhpIGhhIGdlb2xvY2FsaXR6YWNpw7MhXCIpO1xuICAgICAgICAgICAgICAgIGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhPXRydWU7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdFUlJPUignICsgZXJyLmNvZGUgKyAnKTogJyArIGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHdpbmRvdy5nZW9sb2NhbGl0emFtID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIG9iamVjdGVBZHJlY2FGaW5hbCA9IGU7XG4gICAgICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgICAgICB9XG5cblxuXG5cblxuICAgICAgICAgICAgd2luZG93LmRpcmVjY2lvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhPT1mYWxzZSl7XG4gICAgICAgICAgICAgICAgYWRyZWNhZmluYWwgPSBvYmplY3RlQWRyZWNhRmluYWwuYWRyZWNhO1xuICAgICAgICAgICAgICAgIHZhciBhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhbmVsLWRpcmVjY2lvbnMnKTtcbiAgICAgICAgICAgICAgICAgYS5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7XG4gICAgICAgICAgIC8vICAgIHRpcHVzZGV0cmFuc3BvcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kZScpLnZhbHVlO1xuICAgICAgICAgICBcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldFBhbmVsKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkaXJlY3Rpb25zLXBhbmVsJykpO1xuXG5cbiAgICAgICAgICAgICAgICBjYWxjUm91dGUoYWRyZWNhZmluYWwsIGFkcmVjYWluaWNpYWwsdGlwdXNkZXRyYW5zcG9ydClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG5cblxuICAgICAgICAgICAgd2luZG93Lm5vdmFkaXJlY2NpbyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgYWRyZWNhaW5pY2lhbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbmljaScpLnZhbHVlO1xuICAgICAgICAgICAgICAgIHRpcHVzZGV0cmFuc3BvcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kZScpLnZhbHVlO1xuICAgICAgICAgICAgICAgIGRpcmVjY2lvbnMoKTtcbiAgICAgICAgICAgIH1cblxuXG5cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsY1JvdXRlKGEsIGUsdCkge1xuXG4gICAgICAgICAgICAgICAgXG5cbiAgICAgICAgICAgICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luOiBlLFxuICAgICAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbjogYSxcbiAgICAgICAgICAgICAgICAgICAgdHJhdmVsTW9kZTogZ29vZ2xlLm1hcHMuVHJhdmVsTW9kZVt0XVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUocmVxdWVzdCwgZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNTdGF0dXMuT0spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldERpcmVjdGlvbnMocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdpbmRvdy5uZXRlamEgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwYW5lbC1kaXJlY2Npb25zJykuc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldFBhbmVsKG51bGwpO1xuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpLmRpcmVjdGl2ZSgnbWFwJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGF1dG9jb21wbGV0ZTtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgc29ydGJ5OiBcIkBcIixcbiAgICAgICAgICAgIG9uc29ydDogXCI9XCJcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGlkPVwibWFwLWNhbnZhc1wiPjwvZGl2PjxkaXYgaWQ9XCJzdWNjZXNzXCI+PC9kaXY+PGRpdiBjbGFzcz1cImNvbC1tZC1vZmZzZXQtNSBjb2wtbWQtMiBjb2wteHMtMTJcIj48YnV0dG9uIGlkPVwiYm90b1Blckd1YXJkYXJcIiBjbGFzcz1cImJ0biBidG4td2FybmluZ1wiIG5nLWNsaWNrPVwic29ydCgpXCI+R3VhcmRhciBDZXJjYSAgPHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLXNhdmVcIj48L3NwYW4+PC9idXR0b24+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQpIHtcblxuXG4gICAgICAgICAgICB2YXIgT2JqZWN0ZUd1YXJkYXI7XG4gICAgICAgICAgICB2YXIgT2JqZWN0ZVJlc3BvbnNlR3VhZGFyO1xuICAgICAgICAgICAgdmFyIGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhID0gZmFsc2U7XG4gICAgICAgICAgICB2YXIgZ2VvY29kZXI7XG4gICAgICAgICAgICB2YXIgbWFwO1xuICAgICAgICAgICAgdmFyIG1hcFJvdXRlO1xuICAgICAgICAgICAgdmFyIE1BUktFUl9QQVRIID0gJ2h0dHBzOi8vbWFwcy5nc3RhdGljLmNvbS9pbnRsL2VuX3VzL21hcGZpbGVzL21hcmtlcl9vcmFuZ2UnO1xuICAgICAgICAgICAgdmFyIG1hcmtlckxldHRlcjtcbiAgICAgICAgICAgIHZhciBtYXJrZXJJY29uO1xuICAgICAgICAgICAgdmFyIHNlcnZpY2U7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uc0Rpc3BsYXk7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uc1NlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1NlcnZpY2UoKTtcbiAgICAgICAgICAgIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XG4gICAgICAgICAgICB2YXIgYXJyYXltYXJjYWRvcnMgPSBbXTtcbiAgICAgICAgICAgIHZhciBhcnJheURpcmVjY2lvbnMgPSBbXTtcblxuXG5cblxuXG4gICAgICAgICAgICAvKkFRVUkgQ1JFTyBMJ0FVVE9DT01QTEVUQVQgREUgR09PR0xFIFBFUiBMJ0lOUFVUKi9cbiAgICAgICAgICAgIGF1dG9jb21wbGV0ZSA9IG5ldyBnb29nbGUubWFwcy5wbGFjZXMuQXV0b2NvbXBsZXRlKFxuICAgICAgICAgICAgICAgIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWRkcmVzcycpKSwge1xuICAgICAgICAgICAgICAgICAgICB0eXBlczogWydnZW9jb2RlJ11cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIoYXV0b2NvbXBsZXRlLCAncGxhY2VfY2hhbmdlZCcsIG9uUGxhY2VDaGFuZ2VkKTtcblxuXG4gICAgICAgICAgICBmdW5jdGlvbiBvblBsYWNlQ2hhbmdlZCgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcGxhY2UgPSBhdXRvY29tcGxldGUuZ2V0UGxhY2UoKTtcbiAgICAgICAgICAgICAgICBpZiAocGxhY2UuZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnBhblRvKHBsYWNlLmdlb21ldHJ5LmxvY2F0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgbWFwLnNldFpvb20oMTUpO1xuICAgICAgICAgICAgICAgICAgICBzZWFyY2goKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZGRyZXNzJykucGxhY2Vob2xkZXIgPSAnRW50ZXIgYSBjaXR5JztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLyogQVFVSSBDUkVPIEVMIFNFTEVDVCBBTUIgTEVTIE9QQ0lPTlMgUVVFIEpPIFZVSSBQRVIgUE9ERVIgUE9TQVItTE8gQSBVTiBTRUxFQ1QgMiovXG4gICAgICAgICAgICB2YXIgYXJyYXlUaXB1cyA9IFtcIkFlcm9wb3J0XCIsIFwiQXF1YXJpXCIsIFwiR2FsZXJpYSBkJ0FydFwiLCBcIkZsZWNhXCIsIFwiQmFuY1wiLCBcIkJhclwiLCBcIkJ1c1wiLCBcIkJvdGlnYVwiLCBcIlJlc3RhdXJhbnRzXCIsIFwiSG9zcGl0YWxcIiwgXCJDYXNpbm9cIiwgXCJFc3BvcnRcIiwgXCJVbml2ZXJzaXRhdFwiLCBcIkhvdGVsXCJdO1xuICAgICAgICAgICAgdmFyIGFycmF5VHlwZXMgPSBbXCJhaXJwb3J0XCIsIFwiYXF1YXJpdW1cIiwgXCJhcnRfZ2FsbGVyeVwiLCBcImJha2VyeVwiLCBcImJhbmtcIiwgXCJiYXJcIiwgXCJidXNfc3RhdGlvblwiLCBcInN0b3JlXCIsIFwicmVzdGF1cmFudFwiLCBcImhvc3BpdGFsXCIsIFwiY2FzaW5vXCIsIFwic3RhZGl1bVwiLCBcInVuaXZlcnNpdHlcIiwgXCJsb2RnaW5nXCJdO1xuICAgICAgICAgICAgdmFyIHNlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0aXB1cycpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheVRpcHVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgICAgICAgICAgICAgIG9wdC5pbm5lckhUTUwgPSBhcnJheVRpcHVzW2ldO1xuICAgICAgICAgICAgICAgIG9wdC52YWx1ZSA9IGFycmF5VHlwZXNbaV07XG4gICAgICAgICAgICAgICAgc2VsLmFwcGVuZENoaWxkKG9wdCk7XG4gICAgICAgICAgICB9XG5cblxuXG4gICAgICAgICAgICAvKiBBUVVJIENSRU8gRUwgTUFQQSBBTUIgVU5FUyBDT09SREVOQURFUyBDT05DUkVURVMgSSBVTiBaT09NICovXG4gICAgICAgICAgICB3aW5kb3cuY3JlYXJNYXBhID0gZnVuY3Rpb24ocG9zKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1hcE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHpvb206IDEwLFxuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IHBvc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtYXAgPSBuZXcgZ29vZ2xlLm1hcHMuTWFwKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWFwLWNhbnZhc1wiKSwgbWFwT3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgdmFyIHcgPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1hcC1jYW52YXNcIikuc3R5bGUud2lkdGggPSB3O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBzdWNjZXNzSW5pY2lhbChwb3MpIHtcblxuICAgICAgICAgICAgICAgIHBvcyA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcocG9zLmNvb3Jkcy5sYXRpdHVkZSwgcG9zLmNvb3Jkcy5sb25naXR1ZGUpO1xuICAgICAgICAgICAgICAgIGNyZWFyTWFwYShwb3MpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKG5hdmlnYXRvci5nZW9sb2NhdGlvbikge1xuICAgICAgICAgICAgICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oc3VjY2Vzc0luaWNpYWwsIGVycm9yKTtcbiAgICAgICAgICAgIH1cblxuXG5cblxuXG5cbiAgICAgICAgICAgIHZhciBsb2NhbGl0emFjaW87XG5cbiAgICAgICAgICAgIHZhciBpbmZvd2luZG93O1xuICAgICAgICAgICAgdmFyIHBvc2ljaW9pbmljaWFsUm91dGU7XG5cblxuXG4gICAgICAgICAgICAvKkFRVUkgRVQgRElVIFNJIEhBIFRST0JBVCBCw4kgTEEgVEVWQSBHRU9MT0NBTElUWkFDSU8qL1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBzdWNjZXNzKHBvcykge1xuXG4gICAgICAgICAgICAgICAgcG9zaWNpb2luaWNpYWxSb3V0ZSA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcocG9zLmNvb3Jkcy5sYXRpdHVkZSwgcG9zLmNvb3Jkcy5sb25naXR1ZGUpO1xuICAgICAgICAgICAgICAgIGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhID0gZmFsc2U7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBlcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLndhcm4oJ0VSUk9SKCcgKyBlcnIuY29kZSArICcpOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwiTm8gZXMgcG90IGFjY2VkaXIgYSBsYSB0ZXZhIGdlb2xvY2FsaXR6YWNpb1wiKTtcbiAgICAgICAgICAgICAgICBnZW9sb2NhbGl0emFjaW9EZW5lZ2FkYSA9IHRydWU7XG4gICAgICAgICAgICB9O1xuXG5cbiAgICAgICAgICAgIC8qQVFVRVNUQSBGVU5DSU8gU0VSVkVJWCBQRVIgVFJFVVJFIEVMUyBNQVJDQURPUlMgREVMIE1BUEEqL1xuXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIFRyZXVyZU1hcmNhZG9ycygpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFycmF5bWFyY2Fkb3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5bWFyY2Fkb3JzW2ldLnNldE1hcChudWxsKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFycmF5bWFyY2Fkb3JzID0gW107XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qQVFVRVNUQSBGVU5DSU8gU0VSVkVJWCBQRVIgVFJFVVJFIExFUyBSVVRFUyBERUwgTUFQQSovXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIFRyZXVyZURpcmVjY2lvbnMoKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJheURpcmVjY2lvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyYXlEaXJlY2Npb25zW2ldLnNldE1hcChudWxsKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGFycmF5RGlyZWNjaW9ucyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBBUVVFU1RBICBGVU5DSU8gU0VSVkVJWCBQRVIgQUdBRkFSIEwnQURSRcOHQSBRVUUgTEkgUE9TRVMgSSBFVCBUUkFOU0ZPUk1BIExBIERJUkVDQ0lPIEVOIEdFT0xPQ0FMSVRaQUNJTyBVTiBDT1BcbiAgICAgICAgICAgIEZFVCBBSVjDkiBFU1hFQ1VUQSBMQSBGVU5DSU8gUVVFIENSRUEgRUxTIE1BUkNBRE9SUyovXG4gICAgICAgICAgICB3aW5kb3cuY29kZUFkZHJlc3MgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaXJlY3Rpb24tcGFuZWxcIikuc3R5bGUub3BhY2l0eSA9IFwiMFwiO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3RvUGVyR3VhcmRhcicpLnN0eWxlLm9wYWNpdHkgPSAnMCc7XG5cbiAgICAgICAgICAgICAgICBpZiAoYXJyYXltYXJjYWRvcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBUcmV1cmVNYXJjYWRvcnMoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFycmF5RGlyZWNjaW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIFRyZXVyZURpcmVjY2lvbnMoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBnZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuICAgICAgICAgICAgICAgIHZhciBhZHJlY2EgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZHJlc3NcIikudmFsdWU7XG4gICAgICAgICAgICAgICAgZ2VvY29kZXIuZ2VvY29kZSh7XG4gICAgICAgICAgICAgICAgICAgICdhZGRyZXNzJzogYWRyZWNhXG4gICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRab29tKDE0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcC5zZXRDZW50ZXIocmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2NhbGl0emFjaW8gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGF0aXR1ZDogcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvbi5BLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvbmdpdHVkOiByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uLkZcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJjYWRvcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsZXJ0KFwiR2VvY29kZSB3YXMgbm90IHN1Y2Nlc3NmdWwgZm9yIHRoZSBmb2xsb3dpbmcgcmVhc29uOiBcIiArIHN0YXR1cyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICAvKiBBUVVFU1RBIEZVTkNJTyBFVCBQSU5UQSBUT1RTIEVMUyBMTE9DUyBRVUUgSEFTIEZJTFRSQVQgQSBQQVJUSVIgREUgTCdBRFJFw4dBIFFVRSBIQVMgUEFTU0FUIEFCQU5TKi9cblxuICAgICAgICAgICAgZnVuY3Rpb24gbWFyY2Fkb3JzKCkge1xuICAgICAgICAgICAgICAgIHZhciBweXJtb250ID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhsb2NhbGl0emFjaW8ubGF0aXR1ZCwgbG9jYWxpdHphY2lvLmxvbmdpdHVkKTtcbiAgICAgICAgICAgICAgICB2YXIgcmFkaSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmFkaVwiKS52YWx1ZTtcbiAgICAgICAgICAgICAgICB2YXIgdGlwdXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpcHVzXCIpLnZhbHVlO1xuICAgICAgICAgICAgICAgIHZhciByZXF1ZXN0ID0ge1xuICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbjogcHlybW9udCxcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiByYWRpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlczogW3RpcHVzXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaW5mb3dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KCk7XG4gICAgICAgICAgICAgICAgc2VydmljZSA9IG5ldyBnb29nbGUubWFwcy5wbGFjZXMuUGxhY2VzU2VydmljZShtYXApO1xuICAgICAgICAgICAgICAgIHNlcnZpY2UubmVhcmJ5U2VhcmNoKHJlcXVlc3QsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsbGJhY2socmVzdWx0cywgc3RhdHVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5wbGFjZXMuUGxhY2VzU2VydmljZVN0YXR1cy5PSykge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlckxldHRlciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoJ0EnLmNoYXJDb2RlQXQoMCkgKyBpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtlckljb24gPSBNQVJLRVJfUEFUSCArIG1hcmtlckxldHRlciArICcucG5nJztcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHNbaV0ubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjcmVhdGVNYXJrZXIocmVzdWx0c1tpXSk7XG5cblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIEFRVUkgRVQgQ1JFQSBFTFMgTUFSQ0FET1JTIEFMIE1BUEEgKi9cblxuICAgICAgICAgICAgZnVuY3Rpb24gY3JlYXRlTWFya2VyKHBsYWNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBsYWNlTG9jID0gcGxhY2UuZ2VvbWV0cnkubG9jYXRpb247XG4gICAgICAgICAgICAgICAgdmFyIG1hcmtlciA9IG5ldyBnb29nbGUubWFwcy5NYXJrZXIoe1xuICAgICAgICAgICAgICAgICAgICBtYXA6IG1hcCxcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uOiBnb29nbGUubWFwcy5BbmltYXRpb24uRFJPUCxcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogbWFya2VySWNvbixcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHBsYWNlLmdlb21ldHJ5LmxvY2F0aW9uXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYXJyYXltYXJjYWRvcnMucHVzaChtYXJrZXIpO1xuXG4gICAgICAgICAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJhdGluZ0h0bWwgPSAnTm8gaGkgaGEgUHVudHMnO1xuICAgICAgICAgICAgICAgICAgICBpZiAocGxhY2UucmF0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmF0aW5nSHRtbCA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocGxhY2UucmF0aW5nIDwgKGkgKyAwLjUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdGluZ0h0bWwgKz0gJyYjMTAwMjU7JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdGluZ0h0bWwgKz0gJyYjMTAwMjk7JztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpbmZvd2luZG93LnNldENvbnRlbnQoXCI8ZGl2ID48aW1nIGNsYXNzPSdpbWFnZUljb24nIHNyYz0nXCIgKyBwbGFjZS5pY29uICsgXCInLz5cIiArIHBsYWNlLm5hbWUgKyBcIjwvZGl2PjxkaXY+XCIgKyByYXRpbmdIdG1sICsgXCI8L2Rpdj48YnV0dG9uIGlkPSdib3RvQXJyaWJhcicgY2xhc3M9J2J0biBidG4tZGVmYXVsdCc+Q29tIGhpIGFycmlibzwvYnV0dG9uPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgaW5mb3dpbmRvdy5vcGVuKG1hcCwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2luZG93LnBsYWNlID0gcGxhY2U7XG4gICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdib3RvQXJyaWJhcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgQ29tQXJyaWJvKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93LkNvbUFycmlibyA9IGZ1bmN0aW9uKHIpIHtcblxuXG4gICAgICAgICAgICAgICAgaWYgKGdlb2xvY2FsaXR6YWNpb0RlbmVnYWRhID09IGZhbHNlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgciA9IHdpbmRvdy5wbGFjZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZUlkOiByLnBsYWNlX2lkXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc2VydmljZS5nZXREZXRhaWxzKHJlcXVlc3QsIGZ1bmN0aW9uKHBsYWNlLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRWwgcXVlIGFycmliYVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHBsYWNlKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGhhaWdodCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoMzcuNzY5OTI5OCwgLTEyMi40NDY5MTU3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5ID0gbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNSZW5kZXJlcigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hcE9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgem9vbTogMTQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBoYWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnJheURpcmVjY2lvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyZXVyZURpcmVjY2lvbnMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5RGlyZWNjaW9ucy5wdXNoKGRpcmVjdGlvbnNEaXNwbGF5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldE1hcChtYXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsY1JvdXRlKHBsYWNlKTtcblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhbGNSb3V0ZShmKSB7XG4gICAgICAgICAgICAgICAgT2JqZWN0ZUd1YXJkYXIgPSBmO1xuICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZE1vZGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9kZScpLnZhbHVlO1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IHBvc2ljaW9pbmljaWFsUm91dGU7XG4gICAgICAgICAgICAgICAgdmFyIHJlcXVlc3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbjogc3RhcnQsXG4gICAgICAgICAgICAgICAgICAgIGRlc3RpbmF0aW9uOiBmLmdlb21ldHJ5LmxvY2F0aW9uLFxuICAgICAgICAgICAgICAgICAgICB0cmF2ZWxNb2RlOiBnb29nbGUubWFwcy5UcmF2ZWxNb2RlW3NlbGVjdGVkTW9kZV1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uc1NlcnZpY2Uucm91dGUocmVxdWVzdCwgZnVuY3Rpb24ocmVzcG9uc2UsIHN0YXR1cykge1xuXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdGVSZXNwb25zZUd1YWRhciA9IHJlc3BvbnNlO1xuXG4gICAgICAgICAgICAgICAgICAgIC8qTUlSTyBTSSBMQSBSVVRBIMOJUyBQT1NTSUJMRSovXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5yb3V0ZXNbMF0ubGVnc1swXSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpcmVjdGlvbi1wYW5lbFwiKS5zdHlsZS5vcGFjaXR5ID0gXCIxXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYm90b1Blckd1YXJkYXInKS5zdHlsZS5vcGFjaXR5ID0gJzEnO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvKkFRVUkgRU1QTEVOTyBMRVMgREFERVMgREVMIExMT0MgRU4gRUwgUFJJTUVSIERJViovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBiID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhbmVsLTEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGIuaW5uZXJIVE1MID0gXCIgXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYTEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGEzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYTQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhNSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2xpc3QtZ3JvdXAtaXRlbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYi5hcHBlbmRDaGlsZChhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGExLmlubmVySFRNTCA9IFwiPGltZyBjbGFzcz0naW1hZ2VJY29uJyBzcmM9J1wiICsgZi5pY29uICsgXCInLz48Yj4gXCIgKyBmLm5hbWUgKyBcIjwvYj5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGEyLmlubmVySFRNTCA9IFwiPHNwYW4gY2xhc3M9J25vbURhZGEnPkFkcmXDp2E6IDwvc3Bhbj5cIiArIHJlc3BvbnNlLnJvdXRlc1swXS5sZWdzWzBdLmVuZF9hZGRyZXNzO1xuICAgICAgICAgICAgICAgICAgICAgICAgYTMuaW5uZXJIVE1MID0gXCI8c3BhbiBjbGFzcz0nbm9tRGFkYSc+RHVyYWRhOiA8L3NwYW4+XCIgKyByZXNwb25zZS5yb3V0ZXNbMF0ubGVnc1swXS5kdXJhdGlvbi50ZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGYub3BlbmluZ19ob3VycyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGYub3BlbmluZ19ob3Vycy5vcGVuX25vdyA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGE0LmlubmVySFRNTCA9IFwiPHNwYW4gY2xhc3M9J25vbURhZGEnPkhvcmFyaTogPC9zcGFuPjxzcGFuIHN0eWxlPSdjb2xvcjpncmVlbic+TG9jYWwgT2JlcnQ8L3NwYW4+XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhNC5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSdub21EYWRhJz5Ib3Jhcmk6IDwvc3Bhbj48c3BhbiBzdHlsZT0nY29sb3I6cmVkJz5Mb2NhbCBUYW5jYXQ8L3NwYW4+XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGYuZm9ybWF0dGVkX3Bob25lX251bWJlciB8fCBmLmludGVybmF0aW9uYWxfcGhvbmVfbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYTUuaW5uZXJIVE1MID0gXCI8c3BhbiBjbGFzcz0nbm9tRGFkYSc+VGVsOiA8L3NwYW4+XCIgKyBmLmZvcm1hdHRlZF9waG9uZV9udW1iZXIgKyBcIiwgXCIgKyBmLmludGVybmF0aW9uYWxfcGhvbmVfbnVtYmVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYTUuaW5uZXJIVE1MID0gXCJObyBoaSBoYSBhcXVlc3RhIGluZm9ybWFjacOzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgYS5hcHBlbmRDaGlsZChhMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhLmFwcGVuZENoaWxkKGEyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGEuYXBwZW5kQ2hpbGQoYTMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYS5hcHBlbmRDaGlsZChhNCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhLmFwcGVuZENoaWxkKGE1KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLypBUVVJIEVNUExFTk8gTEVTIERBREVTIERFTCBMTE9DIEVOIEVMIFNFR09OIERJViovXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3BhbmVsLTInKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGQuaW5uZXJIVE1MID0gXCIgXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYzEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjMiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGMzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjNSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2xpc3QtZ3JvdXAtaXRlbScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZC5hcHBlbmRDaGlsZChjKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmLndlYnNpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjMS5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSdub21EYWRhJz5XZWI6IDwvc3Bhbj48YSBocmVmPSdcIiArIGYud2Vic2l0ZSArIFwiJz5cIiArIGYud2Vic2l0ZSArIFwiPC9hPlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYzEuaW5uZXJIVE1MID0gXCJObyBoaSBoYSBhcXVlc3RhIGluZm9ybWFjacOzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjMi5pbm5lckhUTUwgPSBcIjxzcGFuIGNsYXNzPSdub21EYWRhJz5Fc3BhaSBHb29nbGU6IDwvc3Bhbj48YSBocmVmPSdcIiArIGYudXJsICsgXCInPlwiICsgZi51cmwgKyBcIjwvYT5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMzLmlubmVySFRNTCA9IFwiPHNwYW4gY2xhc3M9J25vbURhZGEnPkRpc3RhbmNpYTogPC9zcGFuPlwiICsgcmVzcG9uc2Uucm91dGVzWzBdLmxlZ3NbMF0uZGlzdGFuY2UudGV4dDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByYXRpbmcgPSAnTm8gaGkgaGEgUHVudHMnO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGYucmF0aW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJhdGluZyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGFjZS5yYXRpbmcgPCAoaSArIDAuNSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJhdGluZyArPSAnJiMxMDAyNTsnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmF0aW5nICs9ICcmIzEwMDI5Oyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYzUuaW5uZXJIVE1MID0gXCI8c3BhbiBjbGFzcz0nbm9tRGFkYSc+UHVudHM6IDwvc3Bhbj5cIiArIHJhdGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLmFwcGVuZENoaWxkKGM1KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgYy5hcHBlbmRDaGlsZChjMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjLmFwcGVuZENoaWxkKGMyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGMuYXBwZW5kQ2hpbGQoYzMpO1xuXG5cblxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZi5waG90b3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3RvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZvdG8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3RvLmlubmVySFRNTCA9IFwiXCI7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGYucGhvdG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXZpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXZpbWFnZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2NvbC14cy0xMiBjb2wtbWQtMyBkaXZkZWxlc2ltYXRnZXMnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXZpbWFnZS5hcHBlbmRDaGlsZCh1cmwpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgJ2ltZy10aHVtYm5haWwgZm90b3MnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsLnNldEF0dHJpYnV0ZSgnc3JjJywgZi5waG90b3NbaV0uZ2V0VXJsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYXhXaWR0aCc6IDMwMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYXhIZWlnaHQnOiAyMDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3RvLmFwcGVuZENoaWxkKGRpdmltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cblxuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1N0YXR1cy5PSykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbnNEaXNwbGF5LnNldERpcmVjdGlvbnMocmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBzY29wZS5zb3J0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICBzY29wZS4kcGFyZW50LnRlc3QoT2JqZWN0ZUd1YXJkYXIsIE9iamVjdGVSZXNwb25zZUd1YWRhcik7XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfVxuICAgIH1cbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpLmRpcmVjdGl2ZSgnc2VsZWN0MicsIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG5cbiAgICAgICAgdGVtcGxhdGU6ICc8c2VsZWN0IGlkPVwic2VsZWN0MlwiIGNsYXNzPVwianMtZGF0YS1leGFtcGxlLWFqYXhcIj4gIDxvcHRpb24gdmFsdWU9XCIzNjIwMTk0XCIgc2VsZWN0ZWQ9XCJzZWxlY3RlZFwiPlVzdWFyaTwvb3B0aW9uPjwvc2VsZWN0PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50KSB7XG5cbiAgICAgICAgICAgICQoXCIuanMtZGF0YS1leGFtcGxlLWFqYXhcIikuc2VsZWN0Mih7XG4gICAgICAgICAgICAgICAgYWpheDoge1xuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS91c2Vycy9sbGV0cmFcIixcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IDI1MCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBwYXJhbXMudGVybSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWdlOiBwYXJhbXMucGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc1Jlc3VsdHM6IGZ1bmN0aW9uKGRhdGEsIHBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHM6IGRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlc2NhcGVNYXJrdXA6IGZ1bmN0aW9uKG1hcmt1cCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWFya3VwO1xuICAgICAgICAgICAgICAgIH0sIC8vIGxldCBvdXIgY3VzdG9tIGZvcm1hdHRlciB3b3JrXG4gICAgICAgICAgICAgICAgbWluaW11bUlucHV0TGVuZ3RoOiAxLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlUmVzdWx0OiBmb3JtYXRSZXBvLCAvLyBvbWl0dGVkIGZvciBicmV2aXR5LCBzZWUgdGhlIHNvdXJjZSBvZiB0aGlzIHBhZ2VcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVNlbGVjdGlvbjogZm9ybWF0UmVwb1NlbGVjdGlvbiAvLyBvbWl0dGVkIGZvciBicmV2aXR5LCBzZWUgdGhlIHNvdXJjZSBvZiB0aGlzIHBhZ2VcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBmb3JtYXRSZXBvKHJlcG8pIHtcbiAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChyZXBvLmxvYWRpbmcpIHJldHVybiByZXBvLnRleHQ7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIG1hcmt1cCA9ICc8ZGl2IGNsYXNzPVwiY2xlYXJmaXhcIj4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxhIHN0eWxlPVwiY3Vyc29yOnBvaW50ZXJcIiBpZD1cIicgKyByZXBvLl9pZCArJ1wib25jbGljaz1cImJ1c2NhKHRoaXMuaWQpXCI+JyArIHJlcG8udXNlcm5hbWUgKyAnPC9hPicgK1xuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+JztcblxuICAgICAgICAgICAgICAgIGlmIChyZXBvLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcmt1cCArPSAnPGRpdj4nICsgcmVwby5kZXNjcmlwdGlvbiArICc8L2Rpdj4nO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIG1hcmt1cCArPSAnPC9kaXY+PC9kaXY+JztcblxuICAgICAgICAgICAgICAgIHJldHVybiBtYXJrdXA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGZvcm1hdFJlcG9TZWxlY3Rpb24ocmVwbykge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXBvLmZ1bGxfbmFtZSB8fCByZXBvLnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHdpbmRvdy5idXNjYSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZihzY29wZS5jdXJyZW50VXNlciYmZT09c2NvcGUuY3VycmVudFVzZXIuX2lkKXtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLlBlcmZpbFVzZXIoKTtcbiAgICAgICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgICBzY29wZS5kZWZpbmlyVXNlclZpc3RhKGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==