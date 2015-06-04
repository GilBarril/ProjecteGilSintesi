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