// /// function buildCharts() {

//   d3.json(defaultURL,function(food_type) {
//     // d3.json(defaultURL).then((food_type) => {
//     console.log(food_type);
//     // var PANEL = d3.select(".pie")
//     // PANEL.html("");
//     // d3.json(url, function(response) {
//   // console.log(response)
  
  
//     var category_title = food_type.category_title;
//     var review_count = food_type.review_count;
//     console.log("category"+category_title);
//     console.log("review"+review_count);
//     var pieDiv = document.getElementById("pie");
//     trace1 = {
//       domain: {
//         x: [0, 1], 
//         y: [0, 1]
//       }, 
//       hole: 0.1, 
//       hoverinfo: 'all', 
//       labels: category_title.slice(0, 20),
//       pull: 0, 
//       showlegend: false, 
//       textinfo: 'label+value', 
//       type: 'pie', 
//       uid: 'f4de1f', 
//       values: review_count.slice(0,20),
//     };
//     data = [trace1];
//     layout = {
//       autosize: false, 
//       height: 500, 
//       title: 'Most Popular Restaurant Categories', 
//       width: 800
//     };
//     Plotly.plot(pieDiv, {data: data, ayout: layout});
//   });
  
  
  
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
    Larceny_Theft: new L.LayerGroup(),
    Assuault: new L.LayerGroup(),
    Non_Criminal: new L.LayerGroup(),
    Motor_Vehicle_Theft: new L.LayerGroup(),
    // OUT_OF_ORDER: new L.LayerGroup()
  };
  
  
  
  
  // Create a map object
  var map = L.map("map-id", {
    center: [37.7749, -122.4194],
    zoom: 13,
    layers: [
      layers.Larceny_Theft,
      layers.Assuault,
      layers.Non_Criminal,
      layers.Motor_Vehicle_Theft,
      // layers.OUT_OF_ORDER
    ]
  });
  
  // // Add our 'lightmap' tile layer to the map
  lightmap.addTo(map); 
  
  // Create an overlays object to add to the layer control
  var overlays = {
    "Larceny Theft": layers.Larceny_Theft,
    "Assuault": layers.Assuault,
    "Non_Criminal": layers.Non_Criminal,
    "Motor_Vehicle_Theft": layers.Motor_Vehicle_Theft,
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
    Larceny_Theft :L.icon({
      iconUrl: 'https://image.flaticon.com/icons/svg/138/138292.svg',
      iconSize: [20, 40],
      iconAnchor: [22, 40],
      popupAnchor: [-3, -76],
    }),
    Non_Criminal : L.icon({
      iconUrl: 'https://image.flaticon.com/icons/svg/1680/1680052.svg',
      iconSize: [20, 40],
      iconAnchor: [22, 40],
      popupAnchor: [-3, -76],
    }),
    Assuault : L.icon({
      iconUrl: 'https://image.flaticon.com/icons/svg/837/837872.svg',
      iconSize: [20, 40],
      iconAnchor: [22, 44],
      popupAnchor: [-3, -76],
    }),
    Motor_Vehicle_Theft : L.icon({
      iconUrl: 'https://image.flaticon.com/icons/svg/1469/1469601.svg',
      iconSize: [20, 40],
      iconAnchor: [22, 40],
      popupAnchor: [-3, -76],
    })
  };
  
  
  // var crimedata = d3.csv("crimedata_all")
  
  
  //connect with jsonyelpdata
  d3.json("/crimedata"), function(response) {
  console.log(response)
  
  
    // Create an object to keep of the number of markers in each layer
    var crimeCount = {
      Larceny_Theft: 0,
      Motor_Vehicle_Theft: 0,
      Non_Criminal:0,
      Assuault:0
    }; 
    
    // Initialize a layerCode, which will be used as a key to access the appropriate layers, icons,
          
  
     // Loop through yelpdata 
    for (var i = 0; i < response.length; i++) {
          var yelp = response[i];
          
  
      if (crime.category === 'Larceny Theft') {
        layerCode = "Larceny_Theft";
        var layerCode;
        crimeCount.Larceny_Theft++
        // L.marker(yelp.coordinates,{icon: favorite_icon})
        // .bindPopup("<h3>" + yelp.name + "</h3> <h4> Rating " + yelp.rating+ "</h4> <h4> Phone " + yelp.display_phone+ "</h4>" + Popupimage) 
        // .addTo(map);
      }
      
      else if(crime.category === 'Non-Criminal') {
        layerCode = "Non_Criminal";
        crimeCount.Non_Criminal++;
      }
      
      else if(crime.category === 'Assault') {
         layerCode = "Assault";
         crimeCount.Assuault++;
      }
      
      else if(yelp.likes !== 0) {
         layerCode = "Motor_Vehicle_Theft"
         crimeCount.Motor_Vehicle_Theft++; 
      }
      
      else {
        continue;
      }
  
    console.log(layerCode)
      // Update the resturants count
      // restuarantCount[layerCode]++;
     
      // Create a new marker with the appropriate icon and coordinates
      var newMarker = L.marker([crimedata.Latitude, crimedata.Longitude], {
        icon: icons[layerCode]
      });
  
       // Add the new marker to the appropriate layer
       newMarker.addTo(layers[layerCode]);
      
       // Bind a popup to the marker that will  display on click. This will be rendered as HTML
       newMarker.bindPopup("<h3>" + crimedata.Category + "</h3> <h4> Rating " + crimedata.Date+ "</h4> <h4> Phone " + crimedata.Time+ "</h4>" );
      }
  
      // Call the updateLegend function, which will... update the legend!
      updateLegend(layerCode, crimeCount);
     };
    
    // Update the legend's innerHTML with the last updated time and restaurant count
  
  function updateLegend(time, crimeCount) {
    document.querySelector(".legend").innerHTML = [
      // "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
      "<p class='Most Expensive'>Most_Expensive: " + crimeCount.Larceny_Theft + "</p>",
      "<p class='Most_Popular'>Most_Popular: " + crimeCount.Non_Criminal + "</p>",
      "<p class='Higest_Rating'>Higest_Rating: " + crimeCount.Assuault + "</p>",
      "<p class='Favorite'>Favorite: " + crimeCount.Motor_Vehicle_Theft+ "</p>",
   
    ].join("");
  }
  // }
  $( "#result" ).click(function() {
  var marker = L.marker([37.7467506,-122.4923846], {
    draggable: true,
     title: "My First Marker"
     }).addTo(map).bindPopup("Be awared"+"</br>"+"Larceny Theft").bindPopup("Beaware of "+ "Larceny Theft");

  L.circle([37.7467506,-122.4923846], {
  color: "red",
  fillColor: "red",
  fillOpacity: 0.75,
  radius: 500
  }).addTo(map);

})
  // // buildmap();