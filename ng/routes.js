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