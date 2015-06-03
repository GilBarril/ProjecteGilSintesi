  var app = angular.module('appLearn', ['ngResource']);
  app.controller('LlibresController', function($scope, LlibresServei) {
      var id;
      LlibresServei.query(function(llibres) {
          $scope.llibres = llibres;
      });
      $scope.refresh = function() {
          LlibresServei.query(function(llibres) {
              $scope.llibres = llibres;
          });
      }
      $scope.afegirllibre = function() {
          LlibresServei.save({
              isbn: $scope.isbn,
              titol: $scope.titol,
              autors: [$scope.autor]
          }, function() {
              $scope.refresh();
              $scope.isbn = "";
              $scope.titol = "";
              $scope.autor = "";
          });
      }
      $scope.editarLlibre = function(llibre) {
          $scope.isbnE = llibre.isbn;
          $scope.titolE = llibre.titol;
          $scope.llibrepereditar = llibre;
      }
      $scope.modificarllibre = function() {
          LlibresServei.update({id:$scope.llibrepereditar.isbn}, {
              isbn: $scope.isbnE,
              titol: $scope.titolE
          }, function(llibre) {
              $scope.llibrepereditar = llibre;
              $scope.refresh();
              $scope.isbnE = "";
              $scope.titolE = ""
          });
      }
      $scope.borrarllibre = function(llibre) {
          LlibresServei.remove({id:llibre.isbn});
          $scope.refresh();
      }
  });
  app.service("LlibresServei", function($resource) {
      return $resource('/api/llibres/:id', null, {
          'update': {
              method: 'PUT'
          }
      });
  })