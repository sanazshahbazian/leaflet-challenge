// Get data set for all earthquakes within the last 30 days
// API link 
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"


// Import & Visualize the Data

// Markers should reflect the magnitude of the earthquake in their size and color. 
function markerSize(mag) {
  return mag * 10000;
}

// Earthquakes with higher magnitudes should appear larger and darker in color.
function markerColor(mag) {
  if (mag <= 1) {
      return "#99ff99";
  } else if (mag <= 2) {
      return "#ddff99";
  } else if (mag <= 3) {
      return "#ffff99";
  } else if (mag <= 4) {
      return "#ffe680";
  } else if (mag <= 5) {
      return "#ff751a";
  } else {
      return "#ff0000";
  };
}

// Perform a query using a GET request
d3.json(link, function(data) {
  createFeatures(data.features);
});

// Create a map using Leaflet that plots all of the earthquakes from your data set 
// based on their longitude and latitude.
function createFeatures(earthquakeData) {

  var earthquakes = L.geoJSON(earthquakeData, {

 onEachFeature : function (feature, layer) {
// Include popups that provide additional information about the earthquake when a marker is clicked.
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " +  feature.properties.mag + "</p>")
    },     pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.properties.mag),
        fillOpacity: 1,
        stroke: false,
    })
  }
  });
    
  // Create earthquake layer 
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the tile layer that will be the background of our map 
  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create a base map
  var baseMaps = {
    "Grayscale": grayscale,
    //"Dark Map": darkmap
  };

  // Create overlay map to show earthquake data
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create the map with our layers
  var myMap = L.map("map", {
    center: [39.5501, -105.7821],
    zoom: 4.5,
    layers: [grayscale, earthquakes]
  });

  // Create a layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);         

  // Create a legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {
  
      var div = L.DomUtil.create('div', 'info legend'),
          magnitudes = [0, 1, 2, 3, 4, 5];
  
      for (var i = 0; i < magnitudes.length; i++) {
          div.innerHTML +=
              '<i style="background:' + markerColor(magnitudes[i] + 1) + '"></i> ' + 
      + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
      }
  
      return div;
  };
  
  legend.addTo(myMap);

}