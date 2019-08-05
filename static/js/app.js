

// Creating map object
var myMap = L.map("map", {
  center: [37.7749, -122.44],
  zoom: 13
});

// Adding tile layer to the map
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: "pk.eyJ1IjoianVubGluY2hlbiIsImEiOiJjandsZnF4eDkwMzV3NDFtY3Z0aHI0eDdmIn0.mTWkH9uMiPE1yQyEY1SAdQ"
}).addTo(myMap);

var tbody = d3.select("tbody");  

var foodtypeData;
function buildFullTable() {
  var categories = [];
  d3.json("/yelpdata").then((data) => {
    foodtypeData = data;
    buildTableByData(data);
    buildMapByData(data); 
  });
}
//define different icon 
var StoreIcon = L.icon({
  iconUrl: 'https://image.flaticon.com/icons/svg/1916/1916263.svg',
  iconSize: [38, 95],
  iconAnchor: [38, 95],
  popupAnchor: [-3, -76],
});

var icons = {
  OpenMeter: L.icon({
    iconUrl: 'https://image.flaticon.com/icons/svg/148/148767.svg',
    iconSize: [25, 94],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
  }),
  CloseMeter: L.icon({
    iconUrl: 'https://image.flaticon.com/icons/svg/148/148766.svg',
    iconSize: [25, 94],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
  })
};

//L.marker([50.505, 30.57], {icon: myIcon}).addTo(map);

var markers;
function buildMapByData(data) {
  if (markers) {
    myMap.removeLayer(markers);
  }
  markers = L.markerClusterGroup();

  data.forEach((business) => {
    // Add a new marker to the cluster group and bind a pop-up
    markers.addLayer(L.marker(business.coordinates, {icon: StoreIcon}).bindPopup(business.name + "</br>(Rating: " + business.address + ")"+"</br>(Price: " + business.price + ") "));
  });

  myMap.addLayer(markers);
  }
var favlist = [];
var meterMarkers;
function buildTableByData(data) {
  tbody.html("");
  data.forEach((food) => {
    var category = [food.name, food.category_title, food.price, food.rating, food.likes, food.yelp_id,food.latitude,food.longitude];

    // var category = { "name": food.name, 
    //                   "category": food.category_title, 
    //                   "price": food.price, 
    //                   "rating": food.rating, 
    //                   "likes": food.likes, 
    //                   "id": food.yelp_id};

    var row = tbody.append("tr");   
    row.attr("isSelected", "false"); 
    
    // Object.values(category).forEach((value) => {
    //   var cell = row.append("td");
    //   cell.text(value);
    // });
    
    var likesColCell;
    for (i = 0; i < 5; i++) {
      var value = category[i]; 
      var cell = row.append("td");
      cell.text(value);
      if (i == 4) {
        likesColCell = cell;
      }
    };  

    var selected = row.append("td");
    var button = selected.append("button");

    button.attr("isBtnSelected", "false");
    button.attr("style", "width");
    button.text("like");

    //Add Button
    button.on('click',function() {

      var meterStatus
      d3.json("/meterloc").then((data) => {
        var filteredMeter = data.filter(row => row["yelp_id"] === food.yelp_id);
        var meters = filteredMeter[0];
        //d3.json("http://api.sfpark.org/sfpark/rest/availabilityservice?lat="+meters.meter1[1]+"&"+"long="+meters.meter1[2]+"&radius=0.01&uom=mile&response=json",function(statusRes) {
        //  console.log(statusRes)
        //});
        console.log(meters);

        // firstly, empty the whole fav table
        var html, element;
        // Create HTML string with placeholder text
        element = ".containerFav";
        document.querySelectorAll(".containerFav-cat").forEach(e => e.parentNode.removeChild(e));
        // update fav list 
        if (button.attr("isBtnSelected") == "false") {
          // update isSelected to true
            button.attr("isBtnSelected", "true");
            button.text("liked");
            row.attr("isSelected", "true");
            row.attr("style", "background-color: LightBlue"); 
            // add selected category to fav list
            favlist.push(category);
            button.attr("style", "background-color: Blue; color: White");  
            category[4]++;   
          } 
          else {
           // update isSelected to false
            button.attr("isBtnSelected", "false");
            button.text("like");
            // remove unselected category from fav list
            favlist = favlist.filter((elem) => {
                return elem[0] !== category[0];
            });
            category[4]--; 
            button.attr("style", "background-color: White; color: Black");    
         }

         console.log("fav list: ", favlist);
         
         $.ajax({
          type: "POST",
          url: '/favcart/',
          contentType: "application/json",
          data: JSON.stringify(favlist),
          dataType: "json",
          success: function(response) {
              console.log(response);
          },
          error: function(err) {
              console.log(err);
          }
          });

        // create new fav list
        // favlist.forEach((category) => {
        //   const html = '<div class="containerFav-cat"><p>%category%<p></div>';
        //   const newHtml = html.replace('%category%', category);
        //   document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        // });
        // counter.attr("count", newCount);
        // counter.text(newCount);
       
        // category[4] += newCount;
        likesColCell.text(category[4]);
       
        // sent fav data back to /favlist
        $.ajax({
        type: "POST",
        url: "/favlist/" + category[5],
        contentType: "application/json",
        data: JSON.stringify({"likes" : category[4]}),
        dataType: "json",
        success: function(response) {
            console.log(response);
        },
        error: function(err) {
            console.log(err);
        }
        });
      });
       
    });

    //Add Row
    row.on('click', function() {
      if (row.attr("isSelected") == "false") {
        // update isSelected to true
          row.attr("isSelected", "true");
          row.attr("style", "background-color: LightBlue"); 
        } 
        else {
         // update isSelected to false
          row.attr("isSelected", "false");
          row.attr("style", "background-color: White"); 
       }

      //Filter meter and add selected meter according to yelp_ID
       var metericons = []
       var meterStatus
       d3.json("/meterloc").then((data) => {
        var filteredMeter = data.filter(row => row["yelp_id"] === food.yelp_id);
        var meters = filteredMeter[0];
        //d3.json("http://api.sfpark.org/sfpark/rest/availabilityservice?lat="+meters.meter1[1]+"&"+"long="+meters.meter1[2]+"&radius=0.01&uom=mile&response=json",function(statusRes) {
        //  console.log(statusRes)
        //});
        console.log(meters);
        
        var meterdata = 
        $.ajax({
          type: "POST",
          url: "/meterstatus",
          async: false,
          contentType: "application/json",
          data: JSON.stringify(meters),
          dataType: "json",
          success: function(response) {
              console.log(response);
              console.log(response.length);
              // loop through records in response
              for (var i = 0; i < response.length; i++) {
                console.log(response[i].status);
                meterStatusIcon=response[i];
                if (meterStatusIcon.status == 0)
                  metericons[i] = "CloseMeter";
                else 
                  metericons[i] = "OpenMeter";
                //console.log(metericons[i])
              }
          },
          error: function(err) {
              console.log(err);
          }
        });

      if (meterMarkers) {
          myMap.removeLayer(meterMarkers);
        }

        var meterMarkers = L.markerClusterGroup();
        meterMarkers.addLayer(L.marker([meters.meter1[1], meters.meter1[2]], {icon: icons[metericons[0]]}).bindPopup("meter1"+"</br>"+meters.meter1[3]));
        meterMarkers.addLayer(L.marker([meters.meter2[1], meters.meter2[2]], {icon: icons[metericons[1]]}).bindPopup("meter2"+"</br>"+meters.meter2[3]));
        meterMarkers.addLayer(L.marker([meters.meter3[1], meters.meter3[2]], {icon: icons[metericons[2]]}).bindPopup( "meter3"+"</br>"+meters.meter3[3]));
        meterMarkers.addLayer(L.marker([meters.meter4[1], meters.meter4[2]], {icon: icons[metericons[3]]}).bindPopup("meter4"+"</br>"+meters.meter4[3]));
        meterMarkers.addLayer(L.marker([meters.meter5[1], meters.meter5[2]], {icon: icons[metericons[4]]}).bindPopup("meter5"+"</br>"+meters.meter5[3]));
        meterMarkers.addLayer(L.marker([meters.meter6[1], meters.meter6[2]], {icon: icons[metericons[5]]}).bindPopup("meter6"+"</br>"+meters.meter6[3]));
        meterMarkers.addLayer(L.marker([meters.meter7[1], meters.meter7[2]], {icon: icons[metericons[6]]}).bindPopup("meter7"+"</br>"+meters.meter7[3]));
        meterMarkers.addLayer(L.marker([meters.meter8[1], meters.meter8[2]], {icon: icons[metericons[7]]}).bindPopup("meter8"+"</br>"+meters.meter8[3]));
        meterMarkers.addLayer(L.marker([meters.meter9[1], meters.meter9[2]], {icon: icons[metericons[8]]}).bindPopup("meter9"+"</br>"+meters.meter9[3]));
        meterMarkers.addLayer(L.marker([meters.meter10[1], meters.meter10[2]], {icon: icons[metericons[9]]}).bindPopup("meter10"+"</br>"+meters.meter10[3]))

        myMap.addLayer(meterMarkers)
        //var group = new L.featureGroup([marker1, marker2, marker3]);
        myMap.fitBounds(meterMarkers.getBounds());
        // sent meter info back to "/meterstatus"
        
        // var layers = {
        //   ON: new L.LayerGroup(),
        //   OFF: new L.LayerGroup(),
        // };
        // var map = L.map("map-id", {
        //   center: [40.73, -74.0059],
        //   zoom: 12,
        //   layers: [
        //     layers.ON,
        //     layers.OFF]
        // });

        // // Create an overlays object to add to the layer control
        //   var overlays = {
        //   "Station Available": layers.ON,
        //   "Station Occupied": layers.OFF,
        //   };
        //   // Create a control for our layers, add our overlay layers to it
        // L.control.layers(null, overlays).addTo(map);

        // // Create a legend to display information about our map
        // var info = L.control({
        // position: "bottomright"
        //   });
        // // When the layer control is added, insert a div with the class of "legend"       
        // info.onAdd = function() {
        // var div = L.DomUtil.create("div", "legend");
        //  return div;
        // };
        // // Add the info legend to the map
        // info.addTo(map);


        });
      });
    });
}

function updateFilters() {
  var changedElement = d3.select(this).select("select");
  var filterValue = changedElement.property("value");
  var filterId = changedElement.attr("id");

  var filters = {};
  if (filterValue) {
    filters[filterId] = filterValue;
  }
  else {
    delete filters[filterId];
  }
  filterTable(filters);
}
buildFullTable();



function filterTable(filters) {
  let filteredData = foodtypeData;
  Object.entries(filters).forEach(([key, value]) => {
    filteredData = filteredData.filter(row => row[key] === value);
  });
  buildTableByData(filteredData);
  buildMapByData(filteredData);
}

function init() {
  var selector= d3.select("#foodtype");
  d3.json("/foodtype").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
  // });

  //  var selector2 = d3.select("#price");
  //  d3.json("/yelpdata").then((sampleNames) => {
  //   sampleNames.forEach((sample) => {
  //     selector
  //       .append("option")
  //       .text(sample)
  //       .property("value", sample);
  //   });
  // });
    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    // buildCharts(firstSample);
    // buildMetadata(firstSample);
  });
}

function optionChanged(newValue) {
  // Fetch new data each time a new sample is selected
  // buildCharts(newSample);
  // buildMetadata(newSample);

  var filters = {"category_title": newValue};
  filterTable(filters);
}

// Initialize the dashboard
init();
// buildTable(foodtypeData);