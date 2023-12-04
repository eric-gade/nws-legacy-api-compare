# NWS Legacy and API Comparison Tool #
A small CLI script that compares the results of the legacy (forecast.weather.gov) vs the api (api.weather.gov).
  
## Installation ##
The only requirement is that you have [Deno v1.34.x](https://deno.land) installed. Dependencies will be installed the first time you run the program
  
## Usage ##
From the project folder, simply run `deno run -A get-legacy-for-zip.js <zipcode>` where `<zipcode>` is a 5-digit US zipcode.
  
## Sources ##
Included are source files that map zip codes to lat/lon pairs. The initial CSV is taken from [Geonames](http://download.geonames.org/export/zip/)(modified with custom headers).
  
The JSON file included in this repo is generated from the CSV using the included `generate-zip-json.js` script. You don't need to run this unless you are updating the source data.
