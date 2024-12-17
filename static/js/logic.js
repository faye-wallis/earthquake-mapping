// Event listener that triggers when DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    let url = 'static/data/volcano_events.json';

    // Add map
    let myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);
    // Add marker layers
    let infoLayer = L.layerGroup().addTo(myMap);
    let eruptionLayer = L.layerGroup().addTo(myMap);
    let tsunamiLayer = L.layerGroup();

    // Set marker size based on explosivity (VEI)
    function markerSize(vei) {
        // Ensure that VEI is valid before calculating marker size
        if (vei && vei > 0) {
            return vei * 30000; // Multiply by 30000 to make the marker size proportional
        }
        return 10000; // Default size if VEI is missing or invalid
    }

    // Set color on eruptionLayer to be based on number of deaths
    function eruptionColor(deaths) {
        if (deaths === null || deaths <= 0) {
            return "#FFA07A";
        }
        return deaths > 1000 ? "#800000" :
            deaths > 500 ? "#B22222" :
                deaths > 100 ? "#FF4500" :
                    deaths > 50 ? "#FF6347" :
                        deaths > 10 ? "#FF7F50" :
                            "#FFA07A";
    }

    // Set color on tsunamiLayer to be based on tsunami status
    function tsunamiColor(tsunami) {
        if (tsunami === 'No') {
            return "#800000";
        }
        return 'blue'
    }

    // Create legend that will be appropriate for each layer
    function createLegend(layer) {
        let legend = L.control({ position: 'bottomright' });
    
        legend.onAdd = function () {
            let div = L.DomUtil.create('div', 'info legend');
            if (layer === eruptionLayer) {
                div.innerHTML += '<h4>Eruption Deaths</h4>';
                div.innerHTML += '<i style="background:#800000"></i> > 1000 deaths<br>';
                div.innerHTML += '<i style="background:#B22222"></i> 501 - 1000 deaths<br>';
                div.innerHTML += '<i style="background:#FF4500"></i> 101 - 500 deaths<br>';
                div.innerHTML += '<i style="background:#FF6347"></i> 51 - 100 deaths<br>';
                div.innerHTML += '<i style="background:#FF7F50"></i> 11 - 50 deaths<br>';
                div.innerHTML += '<i style="background:#FFA07A"></i> 0 - 10 deaths<br>';
            } else if (layer === tsunamiLayer) {
                div.innerHTML += '<h4>Tsunami Indicator</h4>';
                div.innerHTML += '<i style="background:blue"></i> Tsunami Occurred<br>';
                div.innerHTML += '<i style="background:#800000"></i> No Tsunami<br>';
            }
            return div;
        };
    
        return legend;
    }

    // Read data using d3, and then use it to populate marker layers
    function addMarkers() {
        d3.json(url).then(function (data) {
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

                    let infoText = cowsay.say({
                        text: `
    Name: ${name}
    Country: ${country}
    Year: ${year}
    Type: ${type}
    Volcanic Explosivity Index: ${vei}
    Tsunami: ${tsunami}
    Total Deaths: ${deaths}
                    `,
                        e: "oO",
                        T: "U "
                    });

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
                        fillColor: "#800000",
                        radius: markerSize(vei)
                    }).bindPopup(`<pre>${infoText}</pre>`
                    ).addTo(infoLayer);

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
            document.getElementById('filter-button').addEventListener('click', function () {
                let startYear = parseInt(document.getElementById('start-year').value);
                let endYear = parseInt(document.getElementById('end-year').value);
                loadMarkers(startYear, endYear);


            });
        });
    }

// Add legendControl as a variable that can be changed later
let legendControl; 

// Event listener to update legend when new layer is selected
document.getElementById('layerSelector').addEventListener('change', function () {
    let selectedLayer = this.value;

    // Clear old layers to prevent entanglement
    myMap.removeLayer(infoLayer);
    myMap.removeLayer(eruptionLayer);
    myMap.removeLayer(tsunamiLayer);
    
    // Clear legend control to prevent redundancy
    if (legendControl) {
        myMap.removeControl(legendControl);
    }

    // Add the selected layer with appropriate legend
    if (selectedLayer === 'Volcano Deaths') {
        myMap.addLayer(eruptionLayer);
        legendControl = createLegend(eruptionLayer);
        myMap.addControl(legendControl);
    } else if (selectedLayer === 'Volcano Tsunamis') {
        myMap.addLayer(tsunamiLayer);
        legendControl = createLegend(tsunamiLayer);
        myMap.addControl(legendControl);
    } else if (selectedLayer === 'Volcano Info') {
        myMap.addLayer(infoLayer);
    }
});

    addMarkers()
});