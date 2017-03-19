var iconBase = 'img/';
var activePage = 'home';
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
    },
    hospital: {
        icon: {
            url: iconBase + 'hospital-icon3.png',
            scaledSize: new google.maps.Size(50, 50), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        }
    }
}
var infoWindows = [];
var markers = [];

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
        radius: (activePage == 'hospital')? (10 * 1000): (1 * 1000)
    });

    var cityCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: currentPos,
        radius: (activePage == 'hospital') ? (20 * 1000) : (2 * 1000)
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
                markers.push(marker);
                if (activePage == 'hospital')
                {
                    var address = results[0].address_components;
                    var zipcode = address[address.length - 1].long_name;
                    locateNearByHospital(map, zipcode);
                }
                else if (activePage == 'resturant')
                {
                    locateNearByResturants(map, lat, long)
                }
                
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
    $(document).on('click', 'a[href^="#LocateRestaurant"]', function (e) {
        activePage = 'resturant';
        clearMarkers();
        loadMapsApi();
        e.preventDefault();
    });
    $(document).on('click', 'a[href^="#LocateHospital"]', function (e) {
        activePage = 'hospital';
        clearMarkers();
        loadMapsApi();
        e.preventDefault();
    });
    $(document).on('click', 'a[href^="#Home"]', function (e) {
        activePage = 'home';
        clearMarkers();
        loadMapsApi();
        e.preventDefault();
    });
    $(document).on('click', 'a[href^="#About"]', function (e) {
        displayPopup("Resturant / Hospital Locator<Br/>Developed By Shubh Gupta<br/>Contact at shubhgupta4u@gmail.com");
        e.preventDefault();
    });
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);        
    }
    markers = [];
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
    markers.push(marker);
}

function createHospitalInfo(hospital)
{
    var name = hospital.Hospital_Name;
    var category = hospital.Hospital_Category;
    var address = hospital.Location;
    var state = hospital.State;
    var district = hospital.District;
    var pincode = hospital.Pincode;
    var telephone = hospital.Telephone;
    var mobile = hospital.Mobile_Number;
    var url = hospital.Website;

    var hospitalInfo = "<div><table>";
    if (url.length > 0 && url != "NA") {
        hospitalInfo += "<tr><td><b>Hospital Name: </b><a href='" + url + "'>" + name + "</a></td></tr>";
    }
    else {
        url = "https://www.google.co.in/?q=" + encodeURI(name + " " + address);
        hospitalInfo += "<tr><td><b>Hospital Name: </b><a href='" + url + "'>" + name + "</a></td></tr>";
    }
    if (category.length > 0 && category != "NA") {
        hospitalInfo += "<tr><td><b>Category: </b>" + category + "</td></tr>";
    }
    if (telephone.length > 0 && telephone != "NA") {
        hospitalInfo += "<tr><td><b>Telephone: </b>" + telephone + "</td></tr>";
    }
    if (mobile.length > 0 && mobile != "NA") {
        hospitalInfo += "<tr><td><b>Mobile: </b>" + mobile + "</td></tr>";
    }
    hospitalInfo += "<tr><td><b>Address: </b>" + address + "</td></tr>";
    hospitalInfo += "<tr><td><b>District: </b>" + district + "</td></tr>";
    hospitalInfo += "<tr><td><b>State: </b>" + state + "</td></tr>";
    hospitalInfo += "</table></div>";

    return hospitalInfo;
}

function processHospitalRecord(map, hospital) {
    var name = hospital.Hospital_Name;
    var address = hospital.Location;
    var state = hospital.State;
    var district = hospital.District;
    var pincode = hospital.Pincode;
    var coordinates = hospital.Location_Coordinates;
    var lat;
    var long;
    if (coordinates.indexOf(',') == -1 || coordinates == "NA")
    {
        var address = name + "+" + address + "+" + district + "+" + state + "+" + pincode;
        var geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': address}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                lat = results[0].geometry.location.lat();
                long = results[0].geometry.location.lng();
                createHospitalMarker(map, hospital, lat, long);
            }
        });
    }
    else
    {
        var coord = coordinates.split(",");
        //11.6357989, 92.7120575
        lat = parseFloat(coord[0].trim());
        long = parseFloat(coord[1].trim());
        createHospitalMarker(map, hospital, lat, long);
    }    
}

function createHospitalMarker(map, hospital, lat, long)
{
    if (!$.isNumeric(lat) || !$.isNumeric(long)) {
        return;
    }
    var hospitalPos = { lat: lat, lng: long };
    var infowindow = new google.maps.InfoWindow();


    var marker = new google.maps.Marker({
        position: hospitalPos,
        icon: icons['hospital'].icon,
        map: map
    });
    var hospitalInfo = createHospitalInfo(hospital);
    infowindow.setContent(hospitalInfo);
    marker.addListener('click', function () {
        closeAllInfoWindows();
        infowindow.open(map, marker);
    });
    //map.setCenter(hospitalPos);
    map.setZoom(11);
    infoWindows.push(infowindow);
    markers.push(marker);
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

function locateNearByHospital(map, pincode) {
    $.ajax({
        type: "GET",
        url: "https://data.gov.in/api/datastore/resource.json?resource_id=37670b6f-c236-49a7-8cd7-cc2dc610e32d&api-key=0aea9a938ef72bfbe44fb789135ad11f&filters[pincode]=" + pincode + "&fields=Hospital_Name,Hospital_Category,Location,Address_Original_First_Line,State,District,Pincode,Telephone,Mobile_Number,Location_Coordinates,Website",
        success: function (response) {
            var records = response.records;
            $.each(records, function (index, value) {
                processHospitalRecord(map, value);
            });
        }
    });
}

function displayPopup(msg) {
    $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h3>" + msg + "</h3></div>")
                    .css({ "display": "block", "text-align": "center", "color": "white", "background-color": "grey", "opacity": 0.96, "top": $(window).height() / 2 - 50, "width": $(window).width() - 20, "left": "10px" })
                        .appendTo($.mobile.pageContainer)
                        .delay(2000)
                        .fadeOut(2000, function () {
                            $(this).remove();
                        });
}

function handleLocationError(errorMsg) {
    displayPopup(errorMsg);    
}

document.addEventListener("deviceready", onDeviceReady, false);

