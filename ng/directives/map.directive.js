angular.module('appLearn').directive('map', function() {
    var autocomplete;
    return {
        restrict: 'E',
        scope: {
            sortby: "@",
            onsort: "="
        },
        template: '<div id="map-canvas"></div><div id="success"></div><div class="col-md-offset-5 col-md-2 col-xs-12"><button id="botoPerGuardar" class="btn btn-warning" ng-click="sort()">Guardar Cerca  <span class="glyphicon glyphicon-save"></span></button></div>',
        link: function(scope, element) {


            var ObjecteGuardar;
            var ObjecteResponseGuadar;
            var geolocalitzacioDenegada = false;
            var geocoder;
            var map;
            var mapRoute;
            var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_orange';
            var markerLetter;
            var markerIcon;
            var service;
            var directionsDisplay;
            var directionsService = new google.maps.DirectionsService();
            geocoder = new google.maps.Geocoder();
            var arraymarcadors = [];
            var arrayDireccions = [];





            /*AQUI CREO L'AUTOCOMPLETAT DE GOOGLE PER L'INPUT*/
            autocomplete = new google.maps.places.Autocomplete(
                (document.getElementById('address')), {
                    types: ['geocode']
                });

            google.maps.event.addListener(autocomplete, 'place_changed', onPlaceChanged);


            function onPlaceChanged() {
                var place = autocomplete.getPlace();
                if (place.geometry) {
                    map.panTo(place.geometry.location);
                    map.setZoom(15);
                    search();
                }
                else {
                    document.getElementById('address').placeholder = 'Enter a city';
                }

            }

            /* AQUI CREO EL SELECT AMB LES OPCIONS QUE JO VUI PER PODER POSAR-LO A UN SELECT 2*/
            var arrayTipus = ["Aeroport", "Aquari", "Galeria d'Art", "Fleca", "Banc", "Bar", "Bus", "Botiga", "Restaurants", "Hospital", "Casino", "Esport", "Universitat", "Hotel"];
            var arrayTypes = ["airport", "aquarium", "art_gallery", "bakery", "bank", "bar", "bus_station", "store", "restaurant", "hospital", "casino", "stadium", "university", "lodging"];
            var sel = document.getElementById('tipus');
            for (var i = 0; i < arrayTipus.length; i++) {
                var opt = document.createElement('option');
                opt.innerHTML = arrayTipus[i];
                opt.value = arrayTypes[i];
                sel.appendChild(opt);
            }



            /* AQUI CREO EL MAPA AMB UNES COORDENADES CONCRETES I UN ZOOM */
            window.crearMapa = function(pos) {
                var mapOptions = {
                    zoom: 10,
                    center: pos
                }
                map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
                var w = window.innerWidth;
                document.getElementById("map-canvas").style.width = w;
            }

            function successInicial(pos) {

                pos = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                crearMapa(pos);
            };

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(successInicial, error);
            }






            var localitzacio;

            var infowindow;
            var posicioinicialRoute;



            /*AQUI ET DIU SI HA TROBAT BÉ LA TEVA GEOLOCALITZACIO*/

            function success(pos) {

                posicioinicialRoute = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                geolocalitzacioDenegada = false;
            };

            function error(err) {
                console.warn('ERROR(' + err.code + '): ' + err.message);
                alert("No es pot accedir a la teva geolocalitzacio");
                geolocalitzacioDenegada = true;
            };


            /*AQUESTA FUNCIO SERVEIX PER TREURE ELS MARCADORS DEL MAPA*/


            function TreureMarcadors() {
                for (var i = 0; i < arraymarcadors.length; i++) {
                    arraymarcadors[i].setMap(null);
                };
                arraymarcadors = [];
            }

            /*AQUESTA FUNCIO SERVEIX PER TREURE LES RUTES DEL MAPA*/

            function TreureDireccions() {
                for (var i = 0; i < arrayDireccions.length; i++) {
                    arrayDireccions[i].setMap(null);
                };
                arrayDireccions = [];
            }

            /* AQUESTA  FUNCIO SERVEIX PER AGAFAR L'ADREÇA QUE LI POSES I ET TRANSFORMA LA DIRECCIO EN GEOLOCALITZACIO UN COP
            FET AIXÒ ESXECUTA LA FUNCIO QUE CREA ELS MARCADORS*/
            window.codeAddress = function() {
                 navigator.geolocation.getCurrentPosition(success, error);
                document.getElementById("direction-panel").style.opacity = "0";
                document.getElementById('botoPerGuardar').style.opacity = '0';

                if (arraymarcadors.length > 0) {
                    TreureMarcadors();
                }
                if (arrayDireccions.length > 0) {
                    TreureDireccions();
                }

                geocoder = new google.maps.Geocoder();
                var adreca = document.getElementById("address").value;
                geocoder.geocode({
                    'address': adreca
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        map.setZoom(14);
                        map.setCenter(results[0].geometry.location);
                        localitzacio = {
                            latitud: results[0].geometry.location.A,
                            longitud: results[0].geometry.location.F
                        };
                        marcadors();
                    }
                    else {
                        alert("Geocode was not successful for the following reason: " + status);
                    }
                });
            }


            /* AQUESTA FUNCIO ET PINTA TOTS ELS LLOCS QUE HAS FILTRAT A PARTIR DE L'ADREÇA QUE HAS PASSAT ABANS*/

            function marcadors() {
                var pyrmont = new google.maps.LatLng(localitzacio.latitud, localitzacio.longitud);
                var radi = document.getElementById("radi").value;
                var tipus = document.getElementById("tipus").value;
                var request = {
                    location: pyrmont,
                    radius: radi,
                    types: [tipus]
                };
                infowindow = new google.maps.InfoWindow();
                service = new google.maps.places.PlacesService(map);
                service.nearbySearch(request, callback);
            }

            function callback(results, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    for (var i = 0; i < results.length; i++) {
                        markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
                        markerIcon = MARKER_PATH + markerLetter + '.png';
                        console.log(results[i].name);
                        createMarker(results[i]);


                    }
                    results = [];
                }
            }

            /* AQUI ET CREA ELS MARCADORS AL MAPA */

            function createMarker(place) {
                var placeLoc = place.geometry.location;
                var marker = new google.maps.Marker({
                    map: map,
                    animation: google.maps.Animation.DROP,
                    icon: markerIcon,
                    position: place.geometry.location
                });
                arraymarcadors.push(marker);

                google.maps.event.addListener(marker, 'click', function() {
                    var ratingHtml = 'No hi ha Punts';
                    if (place.rating) {
                        var ratingHtml = '';
                        for (var i = 0; i < 5; i++) {
                            if (place.rating < (i + 0.5)) {
                                ratingHtml += '&#10025;';
                            }
                            else {
                                ratingHtml += '&#10029;';
                            }
                        }
                    }

                    infowindow.setContent("<div ><img class='imageIcon' src='" + place.icon + "'/>" + place.name + "</div><div>" + ratingHtml + "</div><button id='botoArribar' class='btn btn-default'>Com hi arribo</button>");
                    infowindow.open(map, this);

                    window.place = place;
                    document.getElementById('botoArribar').addEventListener('click', ComArribo);

                });
            }
            window.ComArribo = function(r) {


                if (geolocalitzacioDenegada == false) {

                    r = window.place;
                    var request = {
                        placeId: r.place_id
                    };

                    service.getDetails(request, function(place, status) {
                        console.log("El que arriba");
                        console.log(place);

                        var haight = new google.maps.LatLng(37.7699298, -122.4469157);
                        directionsDisplay = new google.maps.DirectionsRenderer();
                        var mapOptions = {
                            zoom: 14,
                            center: haight
                        }
                        if (arrayDireccions.length > 0) {
                            TreureDireccions();
                        }
                        arrayDireccions.push(directionsDisplay);
                        directionsDisplay.setMap(map);
                        calcRoute(place);

                    });
                }
            }

            function calcRoute(f) {
                ObjecteGuardar = f;
                var selectedMode = document.getElementById('mode').value;
                var start = posicioinicialRoute;
                var request = {
                    origin: start,
                    destination: f.geometry.location,
                    travelMode: google.maps.TravelMode[selectedMode]
                }
                directionsService.route(request, function(response, status) {

                    ObjecteResponseGuadar = response;

                    /*MIRO SI LA RUTA ÉS POSSIBLE*/
                    if (response.routes[0].legs[0] != null) {
                        document.getElementById("direction-panel").style.opacity = "1";
                        document.getElementById('botoPerGuardar').style.opacity = '1';

                        /*AQUI EMPLENO LES DADES DEL LLOC EN EL PRIMER DIV*/

                        var b = document.getElementById('panel-1');
                        b.innerHTML = " ";
                        var a = document.createElement("div");
                        var a1 = document.createElement("p");
                        var a2 = document.createElement("p");
                        var a3 = document.createElement("p");
                        var a4 = document.createElement("p");
                       
                        // a.setAttribute('class', 'list-group-item');
                        b.appendChild(a);
                        a1.innerHTML = "<img class='imageIcon' src='" + f.icon + "'/><b> " + f.name + "</b>";
                        a2.innerHTML = "<span class='nomDada'>Adreça: </span>" + response.routes[0].legs[0].end_address;
                        a3.innerHTML = "<span class='nomDada'>Durada: </span>" + response.routes[0].legs[0].duration.text;
                        if (f.opening_hours != null) {
                            if (f.opening_hours.open_now == true) {
                                a4.innerHTML = "<span class='nomDada'>Horari: </span><span style='color:green'>Local Obert</span>";
                            }
                            else {
                                a4.innerHTML = "<span class='nomDada'>Horari: </span><span style='color:red'>Local Tancat</span>";
                            }
                        }
                        if (f.formatted_phone_number || f.international_phone_number) {
                            var a5 = document.createElement("p");
                            a5.innerHTML = "<span class='nomDada'>Tel: </span>" + f.formatted_phone_number + ", " + f.international_phone_number;
                            a.appendChild(a5);
                        }
                       
                        a.appendChild(a1);
                        a.appendChild(a2);
                        a.appendChild(a3);
                        a.appendChild(a4);
                        

                        /*AQUI EMPLENO LES DADES DEL LLOC EN EL SEGON DIV*/

                        var d = document.getElementById('panel-2');
                        d.innerHTML = " ";
                        var c = document.createElement("div");
                       
                        var c2 = document.createElement("p");
                        var c3 = document.createElement("p");

                        var c5 = document.createElement("p");
                        // a.setAttribute('class', 'list-group-item');
                        d.appendChild(c);
                        if (f.website) {
                             var c1 = document.createElement("p");
                            c1.innerHTML = "<span class='nomDada'>Web: </span><a href='" + f.website + "'>" + f.website + "</a>";
                            c.appendChild(c1);
                        }
                       
                        c2.innerHTML = "<span class='nomDada'>Espai Google: </span><a href='" + f.url + "'>" + f.url + "</a>";
                        c3.innerHTML = "<span class='nomDada'>Distancia: </span>" + response.routes[0].legs[0].distance.text;
                        var rating = 'No hi ha Punts';
                        if (f.rating) {
                            var rating = '';
                            for (var i = 0; i < 5; i++) {
                                if (place.rating < (i + 0.5)) {
                                    rating += '&#10025;';
                                }
                                else {
                                    rating += '&#10029;';
                                }
                            }
                            c5.innerHTML = "<span class='nomDada'>Punts: </span>" + rating;
                            c.appendChild(c5);
                        }

                       
                        c.appendChild(c2);
                        c.appendChild(c3);




                        if (f.photos != null) {
                            var foto = document.getElementById('foto');
                            foto.innerHTML = "";

                            for (var i = 0; i < f.photos.length; i++) {
                                var divimage = document.createElement('div');
                                divimage.setAttribute('class', 'col-xs-12 col-md-3 divdelesimatges');
                                var url = document.createElement('img');
                                divimage.appendChild(url);

                                url.setAttribute('class', 'img-thumbnail fotos');
                                url.setAttribute('src', f.photos[i].getUrl({
                                    'maxWidth': 300,
                                    'maxHeight': 200
                                }));
                                foto.appendChild(divimage);
                            }
                        }




                        if (status == google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(response);
                        }
                    }
                });

            }


            scope.sort = function() {

                scope.$parent.test(ObjecteGuardar, ObjecteResponseGuadar);

            };

        }
    }
});