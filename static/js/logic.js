document.addEventListener('DOMContentLoaded', function() {
    let url = 'static/data/volcano_events.json';

let myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4
});

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);
// Add markers layer
let eruptionLayer = L.layerGroup().addTo(myMap);
let tsunamiLayer = L.layerGroup().addTo(myMap);

function markerSize(vei) {
    // Ensure that VEI is valid before calculating marker size
    if (vei && vei > 0) {
      return vei * 30000; // Multiply by 30000 to make the marker size proportional
    }
    return 10000; // Default size if VEI is missing or invalid
  }

function eruptionColor(deaths) {
    if (deaths === null || deaths <= 0) {
        return "#FFA07A"; 
    }
    return deaths > 1000 ? "#800000" :  
            deaths > 500  ? "#B22222" :  
            deaths > 100  ? "#FF4500" :  
            deaths > 50   ? "#FF6347" :  
            deaths > 10   ? "#FF7F50" :  
                            "#FFA07A";   
}

function tsunamiColor(tsunami) {
    if (tsunami === 'No') {
        return "#800000"; 
    }
    return 'blue'
}

function addMarkers() {
    d3.json(url).then(function(data) {
        console.log(data);
        
        // Define default start and end years
        let defaultStartYear = 0; // Adjust as needed
        let defaultEndYear = 2020; // Adjust as needed

        // Function to add markers based on year range
        function loadMarkers(startYear, endYear) {
            let filteredData = data.filter(data => {
                return data.Year >= startYear && data.Year <= endYear;
            });

            // Clear layers before adding new markers
            eruptionLayer.clearLayers();
            tsunamiLayer.clearLayers();

            for (let i = 0; i < filteredData.length; i++) {
                let year = filteredData[i].Year !== null ? filteredData[i].Year : 'N/A';
                let name = filteredData[i].Name !== null ? filteredData[i].Name : 'N/A';
                let location = filteredData[i].Location !== null ? filteredData[i].Location : 'N/A';
                let type = filteredData[i].Type !== null ? filteredData[i].Type : 'N/A';
                let tsunami = filteredData[i].Tsu !== null ? 'Yes' : 'No';
                let country = filteredData[i].Country !== null ? filteredData[i].Country : 'N/A';
                let deaths = filteredData[i]["Total Deaths"] !== null ? filteredData[i]["Total Deaths"] : '0';
                let vei = filteredData[i].VEI;
                let latitude = filteredData[i].Latitude;
                let longitude = filteredData[i].Longitude;

                if (latitude === null || longitude === null || vei === null) {
                    continue;
                }

                let coordinates = [latitude, longitude];
                let eruptionText = cowsay.say({
                    text: `
    Name: ${name}
    Country: ${country}
    Year: ${year}
    Volcanic Explosivity Index: ${vei}
    Total Deaths: ${deaths}
                    `,
                    e: "oO",
                    T: "U "
                });

                let tsunamiText = cowsay.say({
                    text: `
    Name: ${name}
    Country: ${country}
    Year: ${year}
    Type: ${type}
    Total Deaths: ${deaths}
                    `,
                    e: "oO",
                    T: "U "
                });

                L.circle(coordinates, {
                    fillOpacity: 0.75,
                    color: '#000',
                    fillColor: eruptionColor(deaths),
                    radius: markerSize(vei)
                }).bindPopup(`<pre>${eruptionText}</pre>`
                ).addTo(eruptionLayer);

                L.circle(coordinates, {
                    fillOpacity: 0.75,
                    color: '#000',
                    fillColor: tsunamiColor(tsunami),
                    radius: markerSize(vei)
                }).bindPopup(`<pre>${tsunamiText}</pre>`
                ).addTo(tsunamiLayer);
            }
        }

        // Load initial markers with default year range
        loadMarkers(defaultStartYear, defaultEndYear);
        // Add event listener to pick up changes
        document.getElementById('filter-button').addEventListener('click', function() {
            let startYear = parseInt(document.getElementById('start-year').value);
            let endYear = parseInt(document.getElementById('end-year').value);
            loadMarkers(startYear, endYear);
        });
    });
}

document.getElementById('layerSelector').addEventListener('change', function() {
let selectedLayer = this.value;
  // Remove all layers first
  myMap.removeLayer(eruptionLayer);
  myMap.removeLayer(tsunamiLayer);

  // Add the selected layer
  if (selectedLayer === 'Volcano Deaths') {
    myMap.addLayer(eruptionLayer);
  } else if (selectedLayer === 'Volcano Tsunamis') {
    myMap.addLayer(tsunamiLayer);
  }
});

addMarkers()
});