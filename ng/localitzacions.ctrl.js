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