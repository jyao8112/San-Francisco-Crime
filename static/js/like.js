/// function buildCharts() {

var defaultURL = "/restaurant_stat1";
d3.json(defaultURL,function(food_type) {
  // d3.json(defaultURL).then((food_type) => {
  console.log(food_type);
  // var PANEL = d3.select(".pie")
  // PANEL.html("");
  // d3.json(url, function(response) {
// console.log(response)


  var category_title = food_type.category_title;
  var review_count = food_type.review_count;
  console.log("category"+category_title);
  console.log("review"+review_count);
  var pieDiv = document.getElementById("pie");
  trace1 = {
    domain: {
      x: [0, 1], 
      y: [0, 1]
    }, 
    hole: 0.1, 
    hoverinfo: 'all', 
    labels: category_title.slice(0, 20),
    pull: 0, 
    showlegend: false, 
    textinfo: 'label+value', 
    type: 'pie', 
    uid: 'f4de1f', 
    values: review_count.slice(0,20),
  };
  data = [trace1];
  layout = {
    autosize: false, 
    height: 500, 
    title: 'Most Popular Restaurant Categories', 
    width: 800
  };
  Plotly.plot(pieDiv, {data: data, ayout: layout});
});


var defaultURL2 = "/restaurant_stat2";
  d3.json(defaultURL2,function(price_range) {
    var category_title2 = price_range.category_title;
    var barDiv = document.getElementById("bar");
    var trace1 = {
      x: [category_title2], 
      y: [20, 14, 25, 16, 18, 22, 19, 15, 12, 16, 14, 17],
      type: 'bar',
      name: 'Primary Product',
      marker: {
        color: 'rgb(49,130,189)',
        opacity: 0.7
    }
  };
  
    var trace2 = {
      x: [category_title2],
      y: [19, 14, 22, 14, 16, 19, 15, 14, 10, 12, 12, 16],
      type: 'bar',
      name: 'Secondary Product',
      marker: {
        color: 'rgb(204,204,204)',
        opacity: 0.5
    }};
    var trace3 = {
      x: [category_title2],
      y: [19, 14, 22, 14, 16, 19, 15, 14, 10, 12, 12, 16],
      type: 'bar',
      name: 'Secondary Product',
      marker: {
        color: 'rgb(55, 83, 109)',
        opacity: 0.5
      }
  };
    var trace4 = {
      x: [category_title2],
      y: [19, 14, 22, 14, 16, 19, 15, 14, 10, 12, 12, 16],
      type: 'bar',
      name: 'Secondary Product',
      marker: {
        color: 'rgb(26, 118, 255)',
        opacity: 0.5
    }};
    var data = [trace1, trace2, trace3, trace4];
  
    var layout = {
    title: 'Restaurant Price Distribution',
    xaxis: {
      tickangle: -45
    },
    barmode: 'group'
  };
  
  Plotly.newPlot('barDiv', data, layout, {showSendToCloud:true});
// layermap


// Add a tile layer
// function buildmap(){
// Add a tile layer
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.light",
  accessToken: API_KEY
});

// Initialize all of the LayerGroups we'll be using
var layers = {
  Most_Expensive: new L.LayerGroup(),
  Most_Popular: new L.LayerGroup(),
  Higest_Rating: new L.LayerGroup(),
  Favorite: new L.LayerGroup(),
  // OUT_OF_ORDER: new L.LayerGroup()
};



// Create a map object
var map = L.map("map-id", {
  center: [37.7749, -122.4194],
  zoom: 13,
  layers: [
    layers.Most_Expensive,
    layers.Most_Popular,
    layers.Higest_Rating,
    layers.Favorite,
    // layers.OUT_OF_ORDER
  ]
});

// // Add our 'lightmap' tile layer to the map
lightmap.addTo(map); 

// Create an overlays object to add to the layer control
var overlays = {
  "Most Expensive": layers.Most_Expensive,
  "Most Popular": layers.Most_Popular,
  "Best": layers.Higest_Rating,
  "Favorite": layers.Favorite,
  // "Out of Order": layers.OUT_OF_ORDER
};

// Create a control for our layers, add our overlay layers to it
L.control.layers(null, overlays).addTo(map);

// Create a legend to display information about our map
var info = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function() {
  var div = L.DomUtil.create("div", "legend");
  return div;
};
// Add the info legend to the map
info.addTo(map);

// Initialize an object containing icons for each layer group
var icons = {
  Most_Expensive :L.icon({
    iconUrl: 'https://image.flaticon.com/icons/svg/985/985647.svg',
    iconSize: [20, 40],
    iconAnchor: [22, 40],
    popupAnchor: [-3, -76],
  }),
  Most_Popular : L.icon({
    iconUrl: 'https://image.flaticon.com/icons/svg/148/148841.svg',
    iconSize: [20, 40],
    iconAnchor: [22, 40],
    popupAnchor: [-3, -76],
  }),
  Higest_Rating : L.icon({
    iconUrl: 'https://image.flaticon.com/icons/svg/148/148838.svg',
    iconSize: [20, 40],
    iconAnchor: [22, 44],
    popupAnchor: [-3, -76],
  }),
  Favorite : L.icon({
    iconUrl: 'https://image.flaticon.com/icons/svg/148/148836.svg',
    iconSize: [20, 40],
    iconAnchor: [22, 40],
    popupAnchor: [-3, -76],
  })
};


var url = "/yelpdata"


//connect with jsonyelpdata
d3.json(url, function(response) {
console.log(response)


  // Create an object to keep of the number of markers in each layer
  var restuarantCount = {
    Most_Expensive: 0,
    Most_Popular: 0,
    Higest_Rating:0,
    Favorite:0
  }; 
  
  // Initialize a layerCode, which will be used as a key to access the appropriate layers, icons,
        

   // Loop through yelpdata 
  for (var i = 0; i < response.length; i++) {
        var yelp = response[i];
        

    if (yelp.price === "$$$$") {
      layerCode = "Most_Expensive";
      var layerCode;
      restuarantCount.Most_Expensive++
      // L.marker(yelp.coordinates,{icon: favorite_icon})
      // .bindPopup("<h3>" + yelp.name + "</h3> <h4> Rating " + yelp.rating+ "</h4> <h4> Phone " + yelp.display_phone+ "</h4>" + Popupimage) 
      // .addTo(map);
    }
    
    else if(yelp.review_count > 3000) {
      layerCode = "Most_Popular";
      restuarantCount.Most_Popular++;
    }
    
    else if(yelp.rating === 5.0) {
       layerCode = "Higest_Rating";
       restuarantCount.Higest_Rating++;
    }
    
    else if(yelp.likes !== 0) {
       layerCode = "Favorite"
       restuarantCount.Favorite++; 
    }
    
    else {
      continue;
    }

  console.log(layerCode)
    // Update the resturants count
    // restuarantCount[layerCode]++;
   
    // Create a new marker with the appropriate icon and coordinates
    var newMarker = L.marker([yelp.latitude, yelp.longitude], {
      icon: icons[layerCode]
    });

     // Add the new marker to the appropriate layer
     newMarker.addTo(layers[layerCode]);
    
     // Bind a popup to the marker that will  display on click. This will be rendered as HTML
     newMarker.bindPopup("<h3>" + yelp.name + "</h3> <h4> Rating " + yelp.rating+ "</h4> <h4> Phone " + yelp.display_phone+ "</h4>" );
    }

    // Call the updateLegend function, which will... update the legend!
    updateLegend(layerCode, restuarantCount);
   });
  
  // Update the legend's innerHTML with the last updated time and restaurant count

function updateLegend(time, restuarantCount) {
  document.querySelector(".legend").innerHTML = [
    // "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
    "<p class='Most Expensive'>Most_Expensive: " + restuarantCount.Most_Expensive + "</p>",
    "<p class='Most_Popular'>Most_Popular: " + restuarantCount.Most_Popular + "</p>",
    "<p class='Higest_Rating'>Higest_Rating: " + restuarantCount.Higest_Rating + "</p>",
    "<p class='Favorite'>Favorite: " + restuarantCount.Favorite+ "</p>",
 
  ].join("");
}
// }
 
// // buildmap();