document.addEventListener("DOMContentLoaded", () => {
    const indicatorX = document.getElementById("indicatorX");
    const indicatorY = document.getElementById("indicatorY");
    const yearSelect = document.getElementById("yearSelect");
    const chartCanvas = document.getElementById("correlationChart");
    const countrySelect = document.getElementById("countryMapSelect");
  
    let chart;
    let map = L.map("map").setView([20, 0], 2);
    let countryMarker;
  
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    // Populate year dropdown
    for (let y = 2000; y <= 2023; y++) {
      const option = document.createElement("option");
      option.value = option.textContent = y;
      yearSelect.appendChild(option);
    }
    yearSelect.value = 2015;
  
    [indicatorX, indicatorY, yearSelect].forEach(el => el.addEventListener("change", updateChart));
  
    function updateChart() {
      const x = indicatorX.value;
      const y = indicatorY.value;
      const year = yearSelect.value;
  
      fetch(`/api/correlation?x=${x}&y=${y}&year=${year}`)
        .then(res => res.json())
        .then(data => {
          const points = data.map(d => ({
            x: d.x,
            y: d.y,
            label: d.CountryName
          }));
  
          const { regressionPoints, r } = calculateRegression(points);
  
          if (chart) chart.destroy();
  
          chart = new Chart(chartCanvas, {
            type: 'scatter',
            data: {
              datasets: [
                {
                  label: `${x} vs ${y} (${year})`,
                  data: points,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)'
                },
                {
                  label: `Regression Line (r = ${r})`,
                  data: regressionPoints,
                  type: 'line',
                  borderColor: 'rgba(255, 99, 132, 1)',
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  pointRadius: 0
                }
              ]
            },
            options: {
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: context => {
                      const p = context.raw;
                      return `${p.label}: (${p.x.toLocaleString()}, ${p.y.toLocaleString()})`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  type: ['GDP', 'Population'].includes(x) ? 'logarithmic' : 'linear',
                  title: { display: true, text: x },
                  ticks: { callback: v => v.toLocaleString() }
                },
                y: {
                  type: ['GDP', 'Population'].includes(y) ? 'logarithmic' : 'linear',
                  title: { display: true, text: y },
                  ticks: { callback: v => v.toLocaleString() }
                }
              }
            }
          });
        });
    }
  
    function calculateRegression(points) {
      const n = points.length;
      const sumX = points.reduce((sum, p) => sum + p.x, 0);
      const sumY = points.reduce((sum, p) => sum + p.y, 0);
      const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
      const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);
  
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
  
      const meanX = sumX / n;
      const meanY = sumY / n;
      const numerator = points.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0);
      const denomX = Math.sqrt(points.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0));
      const denomY = Math.sqrt(points.reduce((sum, p) => sum + (p.y - meanY) ** 2, 0));
      const r = numerator / (denomX * denomY);
  
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
  
      return {
        regressionPoints: [
          { x: minX, y: slope * minX + intercept },
          { x: maxX, y: slope * maxX + intercept }
        ],
        r: r.toFixed(3)
      };
    }
  
    // Country dropdown and map
    fetch("/countries")
      .then(res => res.json())
      .then(data => {
        data.forEach(c => {
          const option = document.createElement("option");
          option.value = c.CountryCode;
          option.textContent = c.CountryName;
          countrySelect.appendChild(option);
        });
      });
  
    countrySelect.addEventListener("change", () => {
      const code = countrySelect.value;
      fetch(`/coordinates?country_code=${code}`)
        .then(res => res.json())
        .then(coords => {
          if (!coords.lat || !coords.lon) return;
          if (countryMarker) map.removeLayer(countryMarker);
          countryMarker = L.marker([coords.lat, coords.lon]).addTo(map)
            .bindPopup(`Selected: ${code}`).openPopup();
          map.setView([coords.lat, coords.lon], 4);
        });
    });
  
    updateChart(); // initial render
  });
  
  

  
  
  