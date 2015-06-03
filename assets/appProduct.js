  var app = angular.module('appLearn', ['ngResource']);
  app.controller('ProductesController', function($scope, ProductesServei) {
      var id;
      ProductesServei.query(function(productes) {
          $scope.productes = productes;
      });
      $scope.refresh = function() {
          ProductesServei.query(function(productes) {
              $scope.productes = productes;
          });
      }
      $scope.afegirproducte = function() {
          ProductesServei.save({
              nom: $scope.nom,
              preu: $scope.preu,
              existencies: $scope.existencies
          }, function() {
              $scope.refresh();
              $scope.nom = "";
              $scope.preu = "";
              $scope.existencies = "";
          });
      }
      $scope.editarproducte = function(producte) {
          $scope.nomE = producte.nom;
          $scope.preuE = producte.preu;
          $scope.productepereditar = producte;
      }
      $scope.modificarproducte = function() {
          ProductesServei.update({id:$scope.productepereditar.nom}, {
              nom: $scope.nomE,
              preu: $scope.preuE
          }, function(producte) {
              $scope.productepereditar = producte;
              $scope.refresh();
              $scope.nomE = "";
              $scope.preuE = ""
          });
      }
      $scope.borrarproducte = function(producte) {
          ProductesServei.remove({id:producte.nom});
          $scope.refresh();
      }
  });
  app.service("ProductesServei", function($resource) {
      return $resource('/api/productes/:id', null, {
          'update': {
              method: 'PUT'
          }
      });
  })