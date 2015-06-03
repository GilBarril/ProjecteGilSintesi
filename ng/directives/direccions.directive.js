angular.module('appLearn').directive('compartir', function() {
    return {
        restrict: 'E',
        scope: {
            sortby: "@",
            onsort: "="
        },
        template: '<div id="panel-direccions"><p id="dadesIniciDireccions">Adreça Inici (per defecte la teva geolocalitzacio) <span id="botoBorraDireccions" onclick="neteja()" class="glyphicon glyphicon-remove"></span></p><input type="text" onchange="novadireccio()" id="inici"></input><div><select class="form-control" onchange="novadireccio()" id="mode"><option value="DRIVING">Cotxe</option><option value="WALKING">Caminant</option><option value="TRANSIT">Trasport Públic</option></select></div></div><div id="directions-panel"></div>',
        link: function(scope, element) {



            var directionsDisplay = new google.maps.DirectionsRenderer();
            var directionsService = new google.maps.DirectionsService();
            var geocoder;
            /*AIXO HO IGUALO A L'OBJECTE LOCALITZACIO PERQUE QUAN EXECUTI LA FUNCIO NOVADIRECCIO ESTIGUI L'ADRECA GUARDADA*/
            var objecteAdrecaFinal;
            var posicioinicialRoute;
            var adrecainicial;
            var adrecafinal;
            var geolocalitzacioDenegada=false;
            var tipusdetransport;

            function success(pos) {
                geolocalitzacioDenegada=false;
                posicioinicialRoute = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    'latLng': posicioinicialRoute
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {

                        adrecainicial = results[0].formatted_address;

                        console.log("la meva " + adrecainicial);
                        document.getElementById('inici').setAttribute('value', adrecainicial);
                        document.getElementById('inici').setAttribute('placeholder', adrecainicial);
                        tipusdetransport =  document.getElementById('mode').value;

                        direccions();


                    }
                })


            }


            function error(err) {
                alert("No hi ha geolocalització!");
                geolocalitzacioDenegada=true;
                console.warn('ERROR(' + err.code + '): ' + err.message);
                
            };

            window.geolocalitzam = function(e) {
                objecteAdrecaFinal = e;
                navigator.geolocation.getCurrentPosition(success, error);
            }





            window.direccions = function() {
                
            if(geolocalitzacioDenegada==false){
                adrecafinal = objecteAdrecaFinal.adreca;
                var a = document.getElementById('panel-direccions');
                 a.style.opacity = "1";
           //    tipusdetransport = document.getElementById('mode').value;
           
               
                directionsDisplay.setPanel(document.getElementById('directions-panel'));


                calcRoute(adrecafinal, adrecainicial,tipusdetransport)
              }
            }



            window.novadireccio = function() {

                adrecainicial = document.getElementById('inici').value;
                tipusdetransport = document.getElementById('mode').value;
                direccions();
            }




            function calcRoute(a, e,t) {

                console.log(a);

                var request = {
                    origin: e,
                    destination: a,
                    travelMode: google.maps.TravelMode[t]
                };
                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });
            }

            window.neteja = function() {

                document.getElementById('panel-direccions').style.opacity = "0";
                directionsDisplay.setPanel(null);

            }
        }

    }
});