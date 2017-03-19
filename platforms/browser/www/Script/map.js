var iconBase = 'img/';
var icons = {
    restaurant: {
        icon: {
            url: iconBase + 'resturant-icon2.png',
            scaledSize: new google.maps.Size(50, 50), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        }
    },
    user: {
        icon: {
            url: iconBase + 'loc-icon2.png',
            scaledSize: new google.maps.Size(50, 50), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        }
    }
}
var infoWindows = [];

function onDeviceReady() {
    document.addEventListener("online", onOnline, false);
    document.addEventListener("resume", onResume, false);
    loadMapsApi();
    handleExternalURLs();
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
        zoom: 14
    });
    var cityCircle = new google.maps.Circle({
        strokeColor: '#00FF00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00FF00',
        fillOpacity: 0.35,
        map: map,
        center: currentPos,
        radius: 1 * 1000
    });

    var cityCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: currentPos,
        radius: 2 * 1000
    });

    var geocoder = new google.maps.Geocoder();
    var infowindow = new google.maps.InfoWindow();
    geocoder.geocode({ 'location': currentPos }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                var marker = new google.maps.Marker({
                    position: currentPos,
                    icon: icons['user'].icon,
                    map: map
                });
                infowindow.setContent(results[0].formatted_address);
                marker.addListener('click', function () {
                    closeAllInfoWindows();
                    infowindow.open(map, marker);
                });
                infoWindows.push(infowindow);
                locateNearByResturants(map, lat, long)
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

function handleExternalURLs() {
    // Handle click events for all external URLs
    if (device.platform.toUpperCase() === 'IOS' || device.platform.toUpperCase() === 'ANDROID') {
        $(document).on('click', 'a[href^="http"]', function (e) {
            var url = $(this).attr('href');
            window.open(url, '_system');
            e.preventDefault();
        });
    }
    else {
        // Leave standard behaviour
        // Possible web browser
        $(document).on('click', 'a[href^="http"]', function (e) {
            var url = $(this).attr('href');
            window.open(url, "_system");
            e.preventDefault();
        });
        
    }
}

function createResturantMarker(map, restaurant)
{
    var average_cost_for_two = restaurant.average_cost_for_two;
    var cuisines = restaurant.cuisines;
    var name = restaurant.name;
    var lat = parseFloat(restaurant.location.latitude);
    var long = parseFloat(restaurant.location.longitude);
    var address = restaurant.location.address;
    var url = restaurant.url;
    var thumb = restaurant.thumb;
    var is_delivering_now = restaurant.is_delivering_now;
    var userRating = restaurant.user_rating.aggregate_rating;
    var userRatingText = restaurant.user_rating.rating_text;

    var restaurantPos = { lat: lat, lng: long };
    var infowindow = new google.maps.InfoWindow();
    var restaurantInfo = "<div><table>";
    restaurantInfo += "<tr><td><b>Restaurant Name: </b><a href='" + url + "'>" + name + "</a></td></tr>";
    restaurantInfo += "<tr><td><b>User Rating: </b>" + userRating + " (" + userRatingText + ")</td></tr>";
    if (is_delivering_now == 1) {
        restaurantInfo += "<tr><td><b>Online Delivery: </b>Yes</td></tr>";
    }
    else {
        restaurantInfo += "<tr><td><b>Online Delivery: </b>No</td></tr>";
    }
    restaurantInfo += "<tr><td><b>Average cost for 2: </b>" + average_cost_for_two + "</td></tr>";
    restaurantInfo += "<tr><td><b>Cuisines: </b>" + cuisines + "</td></tr>";
    restaurantInfo += "<tr><td><b>Address: </b>" + address + "</td></tr>";
    restaurantInfo += "</table></div>";
    
    var marker = new google.maps.Marker({
        position: restaurantPos,
        icon: icons['restaurant'].icon,
        map: map
    });
    infowindow.setContent(restaurantInfo);
    marker.addListener('click', function () {
        closeAllInfoWindows();
        infowindow.open(map, marker);
    });
    infoWindows.push(infowindow);
}

function closeAllInfoWindows() {
    for (var i = 0; i < infoWindows.length; i++) {
        infoWindows[i].close();
    }
}

function locateNearByResturants(map, lat, long)
{
    $.ajax({
        type: "GET",
        beforeSend: function (request) {
            request.setRequestHeader("user-key", "75adcf66b987a3fdf5acc35ce13ae7e5");
        },
        url: "https://developers.zomato.com/api/v2.1/geocode?lat=" + lat + "&lon=" + long,
        success: function (response) {
            var nearby_restaurants = response.nearby_restaurants;
            $.each(nearby_restaurants, function (index, value) {
                createResturantMarker(map, value.restaurant);                
            });
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
}

document.addEventListener("deviceready", onDeviceReady, false);

