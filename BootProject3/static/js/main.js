document.addEventListener("DOMContentLoaded", () => {
    const countrySelect = document.getElementById("countrySelect");
    const startYear = document.getElementById("startYear");
    const endYear = document.getElementById("endYear");
    const downloadBtn = document.getElementById("downloadBtn");
    const chartCanvas = document.getElementById("chartCanvas");
    let chart;

    // Populate
    for (let y = 2000; y <= 2023; y++) {
        const option1 = document.createElement("option");
        const option2 = document.createElement("option");
        option1.value = option1.textContent = y;
        option2.value = option2.textContent = y;
        startYear.appendChild(option1);
        endYear.appendChild(option2);
    }
    startYear.value = 2005;
    endYear.value = 2015;

    // Load country 
    fetch("/countries")
        .then(res => res.json())
        .then(data => {
            data.forEach(c => {
                const option = document.createElement("option");
                option.value = c.CountryCode;
                option.textContent = c.CountryName;
                countrySelect.appendChild(option);
            });
            if (data.length) {
                countrySelect.value = data[0].CountryCode;
                updateChart();
            }
        });

    // Events
    countrySelect.addEventListener("change", updateChart);
    startYear.addEventListener("change", updateChart);
    endYear.addEventListener("change", updateChart);

    downloadBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = 'chart.png';
        link.href = chartCanvas.toDataURL();
        link.click();
    });

    // get charts
    function updateChart() {
        const country = countrySelect.value;
        const from = parseInt(startYear.value);
        const to = parseInt(endYear.value);

        if (from > to || !country) return;

        const promises = [];
        for (let y = from; y <= to; y++) {
            promises.push(
                fetch(`/indicators?country_code=${country}&year=${y}`)
                    .then(res => res.json())
                    .then(data => ({ year: y, ...data[0] }))
            );
        }

        Promise.all(promises).then(data => {
            const indicators = ["HealthExpenditure", "GDP", "LifeExpectancy", "Population"];
            const labels = data.map(d => d.year);
            const datasets = indicators.map((key, i) => ({
                label: key,
                data: data.map(d => d?.[key] ?? null),
                backgroundColor: `rgba(${50 * (i + 1)}, ${100 + 30 * i}, 200, 0.6)`
            }));

            if (chart) chart.destroy();

            chart = new Chart(chartCanvas, {
                type: "bar",
                data: { labels, datasets },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: context => {
                                    const label = context.dataset.label;
                                    const value = context.raw;
                                    const units = {
                                        "GDP": " USD",
                                        "Population": " people",
                                        "LifeExpectancy": " yrs",
                                        "HealthExpenditure": " USD"
                                    };
                                    return `${label}: ${value?.toLocaleString() || 'N/A'}${units[label] || ""}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'logarithmic',
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: "Log Scale"
                            },
                            ticks: {
                                callback: val => val.toLocaleString()
                            }
                        }
                    }
                }
            });
        });
    }
});

