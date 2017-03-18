//$(document).bind("mobileinit", function () {
//    alert('mobileinit event');
//    // Make your jQuery Mobile framework configuration changes here!
//    $.mobile.allowCrossDomainPages = true;
//});// Wait for device API libraries to load


function onDeviceReady() {
    document.addEventListener("online", onOnline, false);
    document.addEventListener("resume", onResume, false);
    loadMapsApi();
}

function onOnline() {
    loadMapsApi();
}

function onResume() {
    loadMapsApi();
}

function loadMapsApi() {
    // if online and maps not already loaded
    //    then load maps api
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
    else {
        handleLocationError("Error: Your browser doesn\'t support geolocation.");
    }
}

// onSuccess Callback receives a Position object
//
function onSuccess(position) {
    initMap(position.coords.latitude, position.coords.longitude);
}

// onError Callback receives a PositionError object
//
function onError(error) {
    if (error.message.indexOf("Only secure origins are allowed") == 0) {
        $.getJSON('https://ipinfo.io/geo', function (response) {
            var loc = response.loc.split(',');
            var coords = {
                latitude: parseFloat(loc[0]),
                longitude: parseFloat(loc[1])
            };
            initMap(coords.latitude, coords.longitude);
        });
    }
    else {
        handleLocationError("Error: The Geolocation service failed.");
    }
}

function initMap(lat, long) {
    if (lat === undefined || long === undefined) {
        return;
    }
    var currentPos = { lat: lat, lng: long };
    var map = new google.maps.Map(document.getElementById('map'), {
        center: currentPos,
        zoom: 15
    });
    var geocoder = new google.maps.Geocoder();
    var infowindow = new google.maps.InfoWindow();
    geocoder.geocode({ 'location': currentPos }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                map.setZoom(11);
                var marker = new google.maps.Marker({
                    position: currentPos,
                    map: map
                });
                infowindow.setContent(results[0].formatted_address);
                marker.addListener('click', function () {
                    infowindow.open(map, marker);
                });
                displayPopup("Map Loaded.");
            }
            else {
                displayPopup("No results found.");
            }
        }
        else {
            displayPopup("Geocoder failed due to: " + status + ".");
        }
    });
}

function displayPopup(msg) {
    $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h3>" + msg + "</h3></div>")
                    .css({ "display": "block", "text-align": "center", "color": "white", "background-color": "grey", "opacity": 0.96, "top": $(window).height() / 2 - 50, "width": $(window).width() - 20, "left": "10px" })
                        .appendTo($.mobile.pageContainer)
                        .delay(1500)
                        .fadeOut(4000, function () {
                            $(this).remove();
                        });
}

function handleLocationError(errorMsg) {
    displayPopup(errorMsg);

    var indiaPos = { lat: 20.5937, lng: 78.9629 };
    var map = new google.maps.Map(document.getElementById('map'), {
        center: indiaPos,
        zoom: 4
    });
    var infoWindow = new google.maps.InfoWindow({ map: map });
    infoWindow.setPosition(indiaPos);
    infoWindow.setContent(errorMsg);
}

document.addEventListener("deviceready", onDeviceReady, false);

