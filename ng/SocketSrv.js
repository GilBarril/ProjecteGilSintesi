angular.module('appLearn')
    .service('SocketSrv', function($rootScope) {
    
    var socket = io().connect();
    
    socket.on('newProduct',function(producte) {
      
        $rootScope.$broadcast('newProduct',producte);
        
    });
    socket.on('updateProduct',function(producte) {
      
        $rootScope.$broadcast('updateProduct',producte);
        
    });
    socket.on('deleteProduct',function(producte) {
      
        $rootScope.$broadcast('deleteProduct',producte);
        
    });
});