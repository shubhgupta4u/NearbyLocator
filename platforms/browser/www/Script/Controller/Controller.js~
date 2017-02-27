angular.module('myApp')
	.controller("mapViewCtrl", function ($scope, dataGovApiService) {

	// Wait for device API libraries to load
    //
    document.addEventListener("deviceready", onDeviceReady, false);

    // device APIs are available
    //
    function onDeviceReady() {
        if (navigator.geolocation) {        
        		navigator.geolocation.getCurrentPosition(onSuccess, onError);
        		//onSuccess(null);
        }
        else {
        	handleLocationError("Error: Your browser doesn\'t support geolocation.");        	
        }
    }

    // onSuccess Geolocation
    //
    function onSuccess(position) {
    	 initMap(position.coords.latitude , position.coords.longitude);
    }

    // onError Callback receives a PositionError object
    //
    function onError(error) {
		if(error.message.indexOf("Only secure origins are allowed") == 0) {
      		$.getJSON('https://ipinfo.io/geo', function(response) { 
        		var loc = response.loc.split(',');
        		var coords = {
            	latitude: parseFloat(loc[0]),
            	longitude: parseFloat(loc[1])
        		};
        		initMap(coords.latitude , coords.longitude);
        	});  
    	}      
    	else {    		
    		handleLocationError("Error: The Geolocation service failed.");
    	}
    }
    function initMap(lat, long) {
        if(lat === undefined || long === undefined)
        {
      	  return;
        }
        var currentPos = {lat: lat, lng: long};
        var map = new google.maps.Map(document.getElementById('map'), {
          center: currentPos,
          zoom: 15
        });
        var geocoder = new google.maps.Geocoder();
        var infowindow = new google.maps.InfoWindow();
        geocoder.geocode({'location': currentPos}, function(results, status) {
        	 if (status === 'OK') {
            if (results[1]) {
              map.setZoom(11);
              var marker = new google.maps.Marker({
                position: currentPos,
                map: map
              });
              infowindow.setContent(results[1].formatted_address);
              marker.addListener('click', function() {
          				infowindow.open(map, marker);
        			});
              
            } else {
            	$("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>No results found.</h1></div>").css({ "display": "block", "opacity": 0.96, "top": $(window).scrollTop() + 100 })
  .appendTo( $.mobile.pageContainer )
  .delay( 1500 )
  .fadeOut( 400, function(){
    $(this).remove();
  });
            }
          } else {
          	$("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>Geocoder failed due to: " + status +".</h1></div>").css({ "display": "block", "opacity": 0.96, "top": $(window).scrollTop() + 100 })
  .appendTo( $.mobile.pageContainer )
  .delay( 1500 )
  .fadeOut( 400, function(){
    $(this).remove();
  });
          }
        });
    }
    function handleLocationError(errorMsg) {
$("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all'><h1>" + errorMsg +"</h1></div>").css({ "display": "block", "opacity": 0.96, "top": $(window).scrollTop() + 100 })
  .appendTo( $.mobile.pageContainer )
  .delay( 1500 )
  .fadeOut( 400, function(){
    $(this).remove();
  });
		  var indiaPos = {lat: 20.5937, lng: 78.9629};
		  var map = new google.maps.Map(document.getElementById('map'), {
          center: indiaPos,
          zoom: 4
        });
        var infoWindow = new google.maps.InfoWindow({map: map});
        infoWindow.setPosition(indiaPos);
        infoWindow.setContent(errorMsg);
      }
          
    
	});