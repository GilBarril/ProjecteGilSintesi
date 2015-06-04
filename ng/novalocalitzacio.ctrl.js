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