var iconBase = 'img/';
var activePage = 'home';
var page = {};
var map = {};
var infoWindows = [];
var markers = [];
var circles = [];
var isGoogleMapApiLoaded = false;
var isConnectionEventRegistered = false;
var isAddMyPlaceMarkerButton = false;
var animationPinNewLocationInterval = {};
var addMyPlaceMarkerIconState = 'add';
var currentPos = {};

function preparePageObject()
{
    pages = {
        restaurant: {
            icon: {
                url: iconBase + 'resturant-icon2.png',
                scaledSize: new google.maps.Size(50, 50), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
            },
            zoom: 12,
            circle1Radius: 2000,
            circle2Radius: 5000
        },
        home: {
            icon: {
                url: iconBase + 'loc-icon2.png',
                scaledSize: new google.maps.Size(50, 50), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
            },
            zoom: 12,
            circle1Radius: 2000,
            circle2Radius: 5000
        },
        hospital: {
            icon: {
                url: iconBase + 'hospital-icon3.png',
                scaledSize: new google.maps.Size(50, 50), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
            },
            zoom: 12,
            circle1Radius: 2000,
            circle2Radius: 5000
        },
        petrolpump: {
            icon: {
                url: iconBase + 'pump-icon.png',
                scaledSize: new google.maps.Size(32, 32), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
            },
            zoom: 12,
            circle1Radius: 2000,
            circle2Radius: 5000
        },
        custom: {
        icon: {
                url: iconBase + 'pump-icon.png',
                scaledSize: new google.maps.Size(32, 32), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(0, 0) // anchor
        },
        zoom: 12,
        circle1Radius: 2000,
        circle2Radius: 5000
    }
    }
}

function onOrientationChanged()
{
    setTimeout(function () {
        SetMapHeight();
        google.maps.event.trigger(map, 'resize');
        // 1 seconds after the center of the map has changed, pan back to the
        // marker.
        window.setTimeout(function () {
            map.panTo(markers[0].getPosition());
        }, 1000);
    }, 500);    
}

function LoadGoogleMapApi()
{
    if (!isGoogleMapApiLoaded) {
        $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyC3z-gnkk-CmziAPSFzTderEFjKcrplv_s", function () {          
            preparePageObject();
            clearMarkerCircle();
            loadMapsApi();
            isGoogleMapApiLoaded = true;
        });
    }
}

function onDeviceReady() {
    if (!isConnectionEventRegistered) {
        document.addEventListener("online", onOnline, false);
        document.addEventListener("resume", onResume, false);
        document.addEventListener("offline", onOffline, false);
        window.addEventListener('orientationchange', onOrientationChanged);
        isConnectionEventRegistered = true;
    }
    SetMapHeight();
    if (checkConnection()) {
        LoadGoogleMapApi();
    }
    else
    {
        alert('This application requires internet. Please connect to the internet.');
    }
    handleExternalURLs();
}

function checkConnection() {
    var networkState = navigator.connection.type;
    if (networkState == Connection.NONE) {
        return false;
    }
    else
    {
        return true;
    }
}

function SetMapHeight()
{
    var windowHeight = window.innerHeight;
    var headerHeight = $('.ui-header').outerHeight(true);
    var headerFooter = $('.ui-footer').outerHeight(true);
    $('#map').height(windowHeight - headerHeight - headerFooter);
}

function onOffline() {
    alert('This application requires internet. Please connect to the internet.');
}

function onOnline() {
    LoadGoogleMapApi();
}

function onResume() {
    if (checkConnection()) {
        LoadGoogleMapApi();
    }
    else {
        alert('This application requires internet. Please connect to the internet.');
    }
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
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: position.coords.latitude, lng: position.coords.longitude },
        zoom: pages[activePage].zoom
    });
    addMyLocationButton(map);
    addMyPlaceMarkerButton(map);
    initMap(map, position.coords.latitude, position.coords.longitude);
}

// onError Callback receives a PositionError object
//
function onError(error) {
    if (error.message.indexOf("Only secure origins are allowed") == 0) {
        handleLocationError("Error: Only secure origins are allowed.");
    }
    else {
        handleLocationError("Error: The Geolocation service failed.");
    }
}

function initMap(map, lat, long) {
    if (lat === undefined || long === undefined) {
        return;
    }   
    currentPos = { lat: lat, lng: long };
    map.panTo(currentPos);
    var redCircle = new google.maps.Circle({
        strokeColor: '#00FF00',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#00FF00',
        fillOpacity: 0.35,
        map: map,
        center: currentPos,
        radius: pages[activePage].circle1Radius
    });
    circles.push(redCircle);

    var greenCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        center: currentPos,
        radius: pages[activePage].circle2Radius
    });
    circles.push(greenCircle);

    map.addListener('click', function (e) {
        if (isAddMyPlaceMarkerButton) {
            clearMarkerCircle();
            initMap(map, e.latLng.lat(), e.latLng.lng());
            clearInterval(animationPinNewLocationInterval);
            $('#new_location_img').css('background', 'url("img/red_pin.png") no-repeat right center transparent');
            addMyPlaceMarkerIconState = 'add';
            $('#new_location_img').css('backgroundSize', '18px 18px');
            isAddMyPlaceMarkerButton = false;
        }
    });
    GeocodeLocation(map, lat, long, false);
}

function GeocodeLocation(map, lat, long, isWait)
{
    var geocoder = new google.maps.Geocoder();
    var infowindow = new google.maps.InfoWindow();
    var location = { lat: lat, lng: long };
    geocoder.geocode({ 'location': location }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                var marker = new google.maps.Marker({
                    position: location,
                    icon: pages['home'].icon,
                    map: map
                });
                infowindow.setContent(results[0].formatted_address);
                marker.addListener('click', function () {
                    closeAllInfoWindows();
                    infowindow.open(map, marker);
                });
                infoWindows.push(infowindow);
                markers.push(marker);
                if (activePage == 'hospital') {
                    var address = results[0].address_components;
                    var zipcode = address[address.length - 1].long_name;
                    locateNearByHospitals(map, zipcode, lat, long);
                }
                else if (activePage == 'restaurant') {
                    locateNearByResturants(map, lat, long)
                }
                else if (activePage == 'petrolpump') {
                    locateNearByPetrolPumps(map, lat, long)
                }
                else if (activePage == 'custom') {
                    //locateNearByPetrolPumps(map, lat, long)
                    hideProcessingMsg();
                }
                else
                {
                    hideProcessingMsg();
                }
            }
            else {
                displayPopup("No results found.");
            }
        }
        else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            if (!isWait)
            setTimeout(function () {
                GeocodeLocation(map, infowindow, geocoder, location, true);
            }, 2000);
            else
            {
                displayPopup("Geocoder failed due to: " + status + ". Kindly retry!");
            }
        }
        else {
            displayPopup("Geocoder failed due to: " + status + ".");
        }
    });
}

function addMyLocationButton(map) {
    var controlDiv = document.createElement('div');

    var firstChild = document.createElement('button');
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '28px';
    firstChild.style.height = '28px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginLeft = '10px';
    firstChild.style.padding = '0px';
    firstChild.title = 'Your Location';
    controlDiv.appendChild(firstChild);

    var secondChild = document.createElement('div');
    secondChild.style.margin = '5px';
    secondChild.style.width = '18px';
    secondChild.style.height = '18px';
    secondChild.style.backgroundImage = 'url(https://maps.gstatic.com/tactile/mylocation/mylocation-sprite-1x.png)';
    secondChild.style.backgroundSize = '180px 18px';
    secondChild.style.backgroundPosition = '0px 0px';
    secondChild.style.backgroundRepeat = 'no-repeat';
    secondChild.id = 'you_location_img';
    firstChild.appendChild(secondChild);

    google.maps.event.addListener(map, 'dragend', function () {
        $('#you_location_img').css('background-position', '0px 0px');
    });

    firstChild.addEventListener('click', function () {
        var imgX = '0';
        var animationInterval = setInterval(function () {
            if (imgX == '-18') imgX = '0';
            else imgX = '-18';
            $('#you_location_img').css('background-position', imgX + 'px 0px');
        }, 500);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                initMap(map, position.coords.latitude, position.coords.longitude);
                clearInterval(animationInterval);
                $('#you_location_img').css('background-position', '-144px 0px');
            });
        } else {
            clearInterval(animationInterval);
            $('#you_location_img').css('background-position', '0px 0px');
        }
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(controlDiv);
}

function addMyPlaceMarkerButton(map) {
    var controlDiv = document.createElement('div');

    var firstChild = document.createElement('button');
    firstChild.style.backgroundColor = '#fff';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '28px';
    firstChild.style.height = '28px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginLeft = '10px';
    firstChild.style.padding = '0px';
    firstChild.title = 'New Location';
    controlDiv.appendChild(firstChild);

    var secondChild = document.createElement('div');
    secondChild.style.margin = '8px';
    secondChild.style.width = '18px';
    secondChild.style.height = '18px';
    secondChild.style.background = 'url("img/red_pin.png") no-repeat right center transparent';
    secondChild.style.backgroundSize = '18px 18px';
    secondChild.id = 'new_location_img';
    firstChild.appendChild(secondChild);

    firstChild.addEventListener('click', function () {
        animationPinNewLocationInterval = setInterval(function () {
            if (addMyPlaceMarkerIconState == 'add') {
                $('#new_location_img').css('background', 'url("img/green_pin.png") no-repeat right center transparent');
                addMyPlaceMarkerIconState = 'edit';
            }
            else {
                $('#new_location_img').css('background', 'url("img/red_pin.png") no-repeat right center transparent');
                addMyPlaceMarkerIconState = 'add';
            }
            $('#new_location_img').css('backgroundSize', '18px 18px');
        }, 500);
        isAddMyPlaceMarkerButton = true;        
    });

    controlDiv.index = 2;
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(controlDiv);
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
        showProcessingMsg();
        activePage = 'restaurant';
        clearMarkerCircle();
        initMap(map, currentPos.lat, currentPos.lng);
        e.preventDefault();
    });
    $(document).on('click', 'a[href^="#LocateHospital"]', function (e) {
        showProcessingMsg();
        activePage = 'hospital';
        clearMarkerCircle();
        initMap(map, currentPos.lat, currentPos.lng);
        e.preventDefault();
    });
    $(document).on('click', 'a[href^="#Home"]', function (e) {
        showProcessingMsg();
        activePage = 'home';
        clearMarkerCircle();
        initMap(map, currentPos.lat, currentPos.lng);
        e.preventDefault();
    });
    $(document).on('click', 'a[href^="#PetrolPump"]', function (e) {
        showProcessingMsg();
        activePage = 'petrolpump';
        clearMarkerCircle();
        initMap(map, currentPos.lat, currentPos.lng);
        e.preventDefault();
    });
    $(document).on('click', 'a[href^="#Custom"]', function (e) {
        showProcessingMsg();
        activePage = 'custom';
        clearMarkerCircle();
        initMap(map, currentPos.lat, currentPos.lng);
        e.preventDefault();
    });
    $(document).on('click', 'a[href^="#About"]', function (e) {
        displayPopup("Nearby Places Locator App<Br/>Developed By Shubh Gupta<br/>Contact at shubhgupta4u@gmail.com");
        e.preventDefault();
    });
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkerCircle() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);        
    }
    markers = [];

    for (var i = 0; i < circles.length; i++) {
        circles[i].setMap(null);
    }
    circles = []
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
        icon: pages['restaurant'].icon,
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
    }    var hospitalPos = { lat: lat, lng: long };

    var infowindow = new google.maps.InfoWindow();


    var marker = new google.maps.Marker({
        position: hospitalPos,
        icon: pages['hospital'].icon,
        map: map
    });
    var hospitalInfo = createHospitalInfo(hospital);
    infowindow.setContent(hospitalInfo);
    marker.addListener('click', function () {
        closeAllInfoWindows();
        infowindow.open(map, marker);
    });
    infoWindows.push(infowindow);
    markers.push(marker);
}

function createTextsearchMarker(map, searchedRecord) {
    if(!$.isNumeric(searchedRecord.geometry.location.lat) || !$.isNumeric(searchedRecord.geometry.location.lng))
    {
        return;
    }
    var address = searchedRecord.formatted_address;
    var name = searchedRecord.name;
    var lat = parseFloat(searchedRecord.geometry.location.lat);
    var long = parseFloat(searchedRecord.geometry.location.lng);
    var icon = searchedRecord.icon;
    var rating = searchedRecord.rating;

    var searchedRecordPos = { lat: lat, lng: long };
    var infowindow = new google.maps.InfoWindow();
    var searchedRecordInfo = "<div><table>";
    searchedRecordInfo += "<tr><td><b>Name: </b>" + name + "</td></tr>";
    searchedRecordInfo += "<tr><td><b>Rating: </b>" + rating + "</td></tr>";
    searchedRecordInfo += "<tr><td><b>Address: </b>" + address + "</td></tr>";
    searchedRecordInfo += "</table></div>";

    var marker = new google.maps.Marker({
        position: searchedRecordPos,
        icon: pages[activePage].icon,
        map: map
    });
    infowindow.setContent(searchedRecordInfo);
    marker.addListener('click', function () {
        closeAllInfoWindows();
        infowindow.open(map, marker);
    });
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
    if (!$.isNumeric(lat) || !$.isNumeric(long)) {
        return;
    }
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

            hideProcessingMsg();
        }
    });
}

function locateNearByHospitals(map, zipcode, lat, long) {
    if (!$.isNumeric(lat) || !$.isNumeric(long)) {
        return;
    }
    $.ajax({
        type: "GET",
        url: "https://maps.googleapis.com/maps/api/place/textsearch/json?location=" + lat + "," + long + "&radius=10000&type=hospital&query=hospital&key=AIzaSyA5el89rXF1uc2amcFhUet1tMcLc0wcnL4",
        success: function (response) {
            var records = response.results;
            $.each(records, function (index, value) {
                createTextsearchMarker(map, value);                
            });
            $.ajax({
                type: "GET",
                url: "https://data.gov.in/api/datastore/resource.json?resource_id=37670b6f-c236-49a7-8cd7-cc2dc610e32d&api-key=0aea9a938ef72bfbe44fb789135ad11f&filters[pincode]=" + zipcode + "&fields=Hospital_Name,Hospital_Category,Location,Address_Original_First_Line,State,District,Pincode,Telephone,Mobile_Number,Location_Coordinates,Website",
                success: function (response) {
                    var records = response.records;
                    $.each(records, function (index, value) {
                        processHospitalRecord(map, value);
                    });

                    hideProcessingMsg();
                }
            });
        }
    });   
}

function locateNearByPetrolPumps(map, lat, long) {
    if (!$.isNumeric(lat) || !$.isNumeric(long)) {
        return;
    }
    $.ajax({
        type: "GET",
        url: "https://maps.googleapis.com/maps/api/place/textsearch/json?location=" + lat + "," + long + "&radius=5000&type=gas_station&query=pump&key=AIzaSyA5el89rXF1uc2amcFhUet1tMcLc0wcnL4",
        success: function (response) {
            var records = response.results;
            $.each(records, function (index, value) {
                createTextsearchMarker(map, value);
            });

            hideProcessingMsg();
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

function showProcessingMsg() {
    $('a[href^="#LocateRestaurant"]').addClass('ui-disabled');
    $('a[href^="#LocateHospital"]').addClass('ui-disabled');
    $('a[href^="#Home"]').addClass('ui-disabled');
    $('a[href^="#PetrolPump"]').addClass('ui-disabled');
    $('a[href^="#Custom"]').addClass('ui-disabled');
    $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all ui-processing'><h3>Processing... Please wait!</h3></div>")
                    .css({ "display": "block", "text-align": "center", "color": "white", "background-color": "grey", "opacity": 0.96, "top": $(window).height() / 2 - 50, "width": $(window).width() - 20, "left": "10px" })
                        .appendTo($.mobile.pageContainer)
                        .delay(2000);
}

function hideProcessingMsg() {
    $('a[href^="#LocateRestaurant"]').removeClass('ui-disabled');
    $('a[href^="#LocateHospital"]').removeClass('ui-disabled');
    $('a[href^="#Home"]').removeClass('ui-disabled');
    $('a[href^="#PetrolPump"]').removeClass('ui-disabled');
    $('a[href^="#Custom"]').removeClass('ui-disabled');
    $('.ui-processing').fadeOut(500, function () {
        $(this).remove();
    });
}

function handleLocationError(errorMsg) {
    displayPopup(errorMsg);    
}

document.addEventListener("deviceready", onDeviceReady, false);

