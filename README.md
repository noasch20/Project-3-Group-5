# Highlighting Health and Wealth Trends: An Interactive Dashboard

This project is a web-based visualization tool built with Flask that allows users to explore key metrics for countries around the world. The app provides an interactive interface to select a country and a year, returning summary statistics and visualizations that highlight global development trends. The purpose of this project is to make global economic and health indicators more accessible and easier to interpret for a wide audience.

## Features
- Dropdown Selectors: Choose country and year from dropdown menus on the homepage.
- Summary Stats: View selected indicators (GDP, Population, Life Expectancy, and Healthcare Expenditure) for selected country and year.
- Leaflet World Map: Drops a marker on the selected country, showing location.
- Correlation View: Navigate to the /correlation endpoint to see scatter plots of the indicators, along with an overlayed regression line and the corresponding r-squared value.

### Homepage
![homepage](https://github.com/user-attachments/assets/f07b9d61-8bb6-4734-8cdd-c70a4e5eea69)

### Correlation View
![correlation](https://github.com/user-attachments/assets/68b51c94-e9a4-410d-82e0-3a1d9aa274a6)


## How to Use
1. Clone this repository
2. Install dependencies using the requirements.txt file
3. Run the Flask app
4. Open a browser and go to http://localhost:5000
   - (5000 may be different if a different port is specified during the Flask run commmand)
5. Use the dropdown menus to select countries and years
6. If you wish to explore correlations, go to http://localhost:5000/correlation

## Ethical Considerations
This project emphasizes responsible use of data and visualization tools. While the dataset used is publicly available, steps have been taken to ensure the data is presented accurately and in correct context. While the selected indicators are widely cited and highlight
different factors, we understand that there are a variety of conditions that could affect these numbers. Wider historical and social context is likely required to draw inferences from this data. The selected dataset does not include any individual level data, and the app
runs entirely locally, ensuring that user privacy remains unaffected.

## Data Sources
- World Bank Open Data: https://data.worldbank.org
The data is stored in a local SQLite database, which consists of two tables:
- countries: Contains country names, codes, latitude, and longitude.
- indicators: Contains yearly GDP, population, life expectancy, and healthcare expenditure for each country.

## Code References
This project makes use of the following open-source libraries and frameworks:
- Flask: https://flask.palletsprojects.com](https://flask.palletsprojects.com/en/stable/
- Leaflet.js: https://leafletjs.com
- SQLite: https://www.sqlite.org

