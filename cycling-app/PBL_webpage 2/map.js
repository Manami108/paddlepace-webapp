var directionsService;
var directionsRenderer;
var distanceMatrixservice;
var map;
var currentLocationMarker;
var currentLocation;
var secondMarker;

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Store the current location
        currentLocation = { lat: latitude, lng: longitude };
        
        // Set center of the map
        const latLng = new google.maps.LatLng(latitude, longitude);

        // Create and display the map
        displayMap(latLng);

        // Place a marker at the current location
        placeMarker(currentLocation);

        // Set the current location as the default origin
        setDefaultOrigin();
      },
      function (error) {
        alert("Error!!");
      }
    );
    
  } else {
    alert("This browser is not allowed location information!");
    // Set a default location if geolocation is not supported
    currentLocation = { lat: 35.6812405, lng: 139.7649361 };
    displayMap(currentLocation);
    placeMarker(currentLocation);

    // Set the default location as the default origin
    setDefaultOrigin();
  }

  
}

function setDefaultOrigin() {
  // Assuming you have an input field with id "origin"
  document.getElementById("origin").value = "Current Location";
}

function displayMap(centerAddress) {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  distanceMatrixservice = new google.maps.DistanceMatrixService();

  map = new google.maps.Map(document.getElementById("googleMap"), {
    zoom: 16,
    center: centerAddress,
  });

  directionsRenderer.setMap(map);
  directionsRenderer.setOptions({
    preserveViewport: true,
  });

  // Listen for click events on the map
  google.maps.event.addListener(map, 'click', function(event) {
    // Place a marker at the clicked location
    placeSecondMarker(event.latLng);

    // Store the location of the second marker
    storeSecondMarkerLocation(event.latLng);
  });
}

function placeMarker(location) {
  // Remove existing current location marker if any
  if (currentLocationMarker) {
    currentLocationMarker.setMap(null);
  }

  // Create a marker at the current location
  currentLocationMarker = new google.maps.Marker({
    position: location,
    map: map,
    title: "Current Location",
    draggable: true,
  });
}

function placeSecondMarker(location) {
  // Remove existing second marker if any
  if (secondMarker) {
    secondMarker.setMap(null);
  }

  // Create a marker at the clicked location
  secondMarker = new google.maps.Marker({
    position: location,
    map: map,
    title: "Second Marker",
    draggable: true,
  });
}

function storeSecondMarkerLocation(location) {
  // Store the location of the second marker
  // You can use this information as needed in your application
  console.log("Second Marker Location:", location.lat(), location.lng());
}

var isFocus_end = false;

/// This function is used to convert time(string form) to minutes(integer)
function convertTimeStringToMinutes(timeString) {
  // 正規表現を使用して時間と分を抽出
  const match = timeString.match(/(?:([0-9]+)\s*days*\s*)?(?:([0-9]+)\s*hour[s]*\s*)?(?:([0-9]+)\s*min[s]*)?/i);

  if (!match) {
      // マッチしなかった場合の処理
      console.error("Invalid time format");
      return null;
  }

  const days = parseInt(match[1]) || 0;
  const hours = parseInt(match[2]) || 0;
  const minutes = parseInt(match[3]) || 0;

  // 時間を分に変換して合算
  const totalMinutes = days * 24 * 60 + hours * 60 + minutes;

  return totalMinutes;
}

/// This function is used to convert distance(string) to meters(integer)
function convertDistanceStringToMeters(distanceString) {
  // 正規表現を使用して数値と単位（kmまたはm）を抽出
  const match = distanceString.match(/([0-9.]+)\s*(km|m)/i);

  if (!match) {
      // マッチしなかった場合の処理
      console.error("Invalid distance format");
      return null;
  }

  // 数値と単位を取得
  const value = parseFloat(match[1]);
  const unit = match[2].toLowerCase();

  // 単位に応じてメートルに変換
  let meters;

  if (unit === "km") {
      meters = value * 1000; // 1 km = 1000 m
  } else if (unit === "m") {
      meters = value;
  } else {
      // 無効な単位の場合の処理
      console.error("Invalid distance unit");
      return null;
  }

  // 小数点以下を切り捨てて整数に変換
  return Math.floor(meters);
}


/// This function is used to get weather and
/// display weather at start point in id="start_weather" tab
/// display weather at destination point in id="end_weather" tab
function getWeather (address, s_or_e){

  const address_parts = address.split(", ");
  var city_name = address_parts[address_parts.length - 3];

  city_name = city_name.replace(" City", "");

  console.log(city_name);

  const query_params = new URLSearchParams({ 
    appid: "07ec85db75e8dd4c75af3eddfc2f34aa", // Set your API key of OpenWeather API
    // q: "Chiyoda",
    q: city_name,
    lang:"en", 
    units: "metric"
  });
  

  const weather = $("#" + s_or_e + "_weather")
  const temperature = $("#" + s_or_e + "_temp")
  const clouds = $("#" + s_or_e + "_clouds")
  const precipElement = $("#" + s_or_e + "_precip")

  //APIリクエスト
  fetch("https://api.openweathermap.org/data/2.5/weather?" + query_params)
  .then(response => {
    return response.json()
  })
  .then(data => {
    // console.log(data)
    weather.text(data.weather[0].description)
    temperature.text(data.main.temp + " °C")
    clouds.text(data.clouds.all + "%");

    // Handle precipitation data
    let precipitation = data.precipitation && data.precipitation.value ? data.precipitation.value : 0;
    let precipitationMode = data.precipitation && data.precipitation.mode ? data.precipitation.mode : 'no';
  
    let modeDescription = '';


    precipElement.text(`${precipitation} mm. ${modeDescription}`);
  })
}


/// This function is used to get elevation and
/// display elevation gap in id="elevation-gap" tab
/// display Bicycle time in id="bike-time" tab
/// This function use convertTimesStringToMinuts function and convertDistanceStringMeters function
function getElevation(start_latlng, end_latlng, time, dst) {

  const totalMinutes = convertTimeStringToMinutes(time);

  const totalDistance = convertDistanceStringToMeters(dst)

  // 要素が１つでも配列に…。
  var locations = [start_latlng, end_latlng];

  // ElevationServiceのコンストラクタ
  var elevation = new google.maps.ElevationService();

  // リクエストを発行
  elevation.getElevationForLocations({
    locations: locations
  }, function(results, status) {
    if (status == google.maps.ElevationStatus.OK) {
      if (results[0].elevation) {

        // 標高ゲット！
        // var elevation = results[0].elevation;
        // console.log(results)

        var start_elevation = results[0].elevation
        var end_elevation = results[1].elevation
        elevation_gap = end_elevation - start_elevation
        
        const elevationGap = $("#elevation-gap");
        elevationGap.text('Elevation Gap : ' + elevation_gap);

        const bikeTime = $("#bike-time");
        // t(c) = t(w)/2.9 x (1+(8A(m)/D(m))
        var bike_time = totalMinutes/3.0 * (1+(8*parseFloat(elevation_gap)/totalDistance))
        bikeTime.text('Time for Bicycle : about ' + Math.floor(bike_time) + ' minutes');
        
      }
    } else if (status == google.maps.ElevationStatus.INVALID_REQUEST) {
      alert("リクエストに問題アリ！requestで渡している内容を確認せよ！！");
    } else if (status == google.maps.ElevationStatus.OVER_QUERY_LIMIT) {
      alert("Too much queries");
    } else if (status == google.maps.ElevationStatus.REQUEST_DENIED) {
      alert("ElevationResult is not allowed to use on this page");
    } else if (status == google.maps.ElevationStatus.UNKNOWN_ERROR) {
      alert("Error on this page");
    } else {
      alert("Error on this page");
    }
  });
}

/// This is main function in this program
/// This function call defined functions:
///   setBounds function to change the map zoom factor to match the route size
///   getWeather function to get weather
///   getElevation function to get elevation
/// Display distance and walking time in id="route-time" tab
function setLocation() {
  var origin = currentLocation;
  var destination = secondMarker ? secondMarker.getPosition() : null;

  // Check if both origin and destination are available
  if (!origin) {
    alert("Please provide the origin.");
    return;
  }

  if (!destination) {
    alert("Please set the secondary marker as the destination.");
    return;
  }

  // Get route from origin to destination
  directionsService.route({
    origin: origin,
    destination: destination,
    travelMode: google.maps.TravelMode.WALKING,
  }, function(response, status){
    directionsRenderer.setDirections(response);
    setBounds(response);
    if (status == 'OK'){
      // Route time to destination
      var time = response.routes[0].legs[0].duration.text;  
      // Route distance
      var dist = response.routes[0].legs[0].distance.text;

      // Get weather 
      getWeather(response.routes[0].legs[0].start_address, "start");
      getWeather(response.routes[0].legs[0].end_address, "end");

      // Get elevation
      getElevation(origin, destination, time, dist);

      // Update route-time element
      const routeTime = $("#route-time");
      routeTime.text('Distance : ' + dist + ' Time : '+ time);
    }
  });
}


//This function is to change the map zoom factor to match the route size
function setBounds(response) {
  var bounds = new google.maps.LatLngBounds();

  // Add each coordinate on the route to map range
  response.routes[0].legs.forEach(function (leg) {
    leg.steps.forEach(function (step) {
      step.path.forEach(function (path) {
        bounds.extend(path);
      });
    });
  });

  // Change the map zoom
  map.fitBounds(bounds);
}


$("#destination").focus(() => {
  isFocus_end = true
  console.log(isFocus_end)
})
$("#origin").focus(() => {
  isFocus_end = false
  console.log(isFocus_end)
})
/// When click id="earch_btn" button, call setLocation function
$('#search_btn').on('click', setLocation);
/// When click id="inputCurrent_btn" button, call inputCurrentLocation function
$('#inputCurrent_btn').on('click', inputCurrentLocation);

