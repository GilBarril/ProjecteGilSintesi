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