// Upgraded main.js with summary box update and GDP per Capita

// Colors and units
const indicatorColors = {
    GDP: '#e74c3c',
    Population: '#3498db',
    LifeExpectancy: '#2ecc71',
    HealthExpenditure: '#9b59b6'
};

const units = {
    GDP: "USD",
    Population: "people",
    LifeExpectancy: "yrs",
    HealthExpenditure: "%"
};

let chartLarge, chartSmall;
const map = L.map("map").setView([20, 0], 2);
let marker = null;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const countrySelect = document.getElementById("countrySelect");
const yearSelect = document.getElementById("startYear");
const downloadBtn = document.getElementById("downloadBtn");
const canvasLarge = document.getElementById("chartLarge");
const canvasSmall = document.getElementById("chartSmall");

function populateYears() {
    for (let y = 2000; y <= 2023; y++) {
        const opt = document.createElement("option");
        opt.value = opt.textContent = y;
        yearSelect.appendChild(opt);
    }
    yearSelect.value = 2015;
}

function populateCountries() {
    fetch("/countries")
        .then(res => res.json())
        .then(data => {
            data.forEach(c => {
                const opt = document.createElement("option");
                opt.value = c.CountryCode;
                opt.textContent = c.CountryName;
                countrySelect.appendChild(opt);
            });
            if (data.length) {
                countrySelect.value = data[0].CountryCode;
                updateChart();
                updateMap();
            }
        });
}

function updateMap() {
    const country = countrySelect.value;
    fetch(`/coordinates?country_code=${country}`)
        .then(res => res.json())
        .then(coords => {
            if (!coords.lat || !coords.lon) return;
            if (marker) map.removeLayer(marker);
            marker = L.marker([coords.lat, coords.lon]).addTo(map)
                .bindPopup(`Selected: ${country}`).openPopup();
            map.setView([coords.lat, coords.lon], 4);
        });
}

function updateSummary(data) {
    const { GDP, Population, LifeExpectancy, HealthExpenditure } = data;
    const gdpPerCapita = GDP && Population ? GDP / Population : 0;

    document.getElementById("summaryGDP").textContent = `GDP: ${GDP.toLocaleString()} USD`;
    document.getElementById("summaryPopulation").textContent = `Population: ${Population.toLocaleString()}`;
    document.getElementById("summaryLifeExpectancy").textContent = `Life Expectancy: ${LifeExpectancy.toFixed(2)} yrs`;
    document.getElementById("summaryHealth").textContent = `Health Expenditure: ${HealthExpenditure.toFixed(2)} USD`;
    document.getElementById("summaryGDPPerCapita").textContent = `GDP per Capita: ${gdpPerCapita.toFixed(2)} USD`;
}

function updateChart() {
    const country = countrySelect.value;
    const year = yearSelect.value;
    if (!country || !year) return;

    fetch(`/indicators?country_code=${country}&year=${year}`)
        .then(res => res.json())
        .then(data => {
            if (!data || !data.length) return;

            const d = data[0];
            updateSummary(d);

            if (chartLarge) chartLarge.destroy();
            if (chartSmall) chartSmall.destroy();

            chartLarge = new Chart(canvasLarge, {
                type: "bar",
                data: {
                    labels: ["GDP", "Population"],
                    datasets: [
                        {
                            label: "GDP",
                            data: [d.GDP, null],
                            backgroundColor: indicatorColors.GDP,
                            yAxisID: 'y1'
                        },
                        {
                            label: "Population",
                            data: [null, d.Population],
                            backgroundColor: indicatorColors.Population,
                            yAxisID: 'y2'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: ctx => {
                                    const val = ctx.raw;
                                    const label = ctx.dataset.label;
                                    return `${label}: ${val ? val.toLocaleString() : "N/A"} ${units[label]}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y1: {
                            beginAtZero: true,
                            position: 'left',
                            title: { display: true, text: 'GDP (USD)' },
                            ticks: { callback: v => v.toLocaleString() }
                        },
                        y2: {
                            beginAtZero: true,
                            position: 'right',
                            title: { display: true, text: 'Population' },
                            ticks: { callback: v => v.toLocaleString() },
                            grid: { drawOnChartArea: false }
                        }
                    }
                }
            });

            chartSmall = new Chart(canvasSmall, {
                type: "bar",
                data: {
                    labels: ["LifeExpectancy", "HealthExpenditure"],
                    datasets: [{
                        label: `${country} (${year})`,
                        data: [d.LifeExpectancy, d.HealthExpenditure],
                        backgroundColor: [
                            indicatorColors.LifeExpectancy,
                            indicatorColors.HealthExpenditure
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: ctx => {
                                    const label = ctx.label;
                                    const val = ctx.raw;
                                    return `${label}: ${val ? val.toLocaleString() : "N/A"} ${units[label]}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Life Expectancy (yrs) / Health Expenditure (USD per capita)"
                            },
                            ticks: {
                                callback: v => v.toLocaleString()
                            }
                        }
                    }
                }
            });
        });
}

document.addEventListener("DOMContentLoaded", () => {
    populateYears();
    populateCountries();
    countrySelect.addEventListener("change", () => {
        updateChart();
        updateMap();
    });
    yearSelect.addEventListener("change", updateChart);
    downloadBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = "chart.png";
        link.href = canvasLarge.toDataURL();
        link.click();
    });
});

