angular.module('appLearn')
.service("LocalitzacioServei", function($resource) {
     this.srv = $resource('/api/localitzacio/:id', null, {
          'update': {
              method: 'PUT'
          }
      });

  this.edita = null;
  return this;
    
  });