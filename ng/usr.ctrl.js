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