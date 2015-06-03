angular.module('appLearn')
.service("CompartidaServei", function($resource) {
     this.srv = $resource('/api/compartides/:id', null, {
          'update': {
              method: 'PUT'
          }
      });

  this.edita = null;
  return this;
    
  });