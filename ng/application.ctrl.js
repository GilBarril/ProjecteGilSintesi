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