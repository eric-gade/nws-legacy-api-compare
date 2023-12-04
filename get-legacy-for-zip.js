import { parse } from "https://deno.land/std@0.207.0/flags/mod.ts";

const getLegacyUrl = (lat, lon) => {
  return `https://forecast.weather.gov/MapClick.php?lat=${lat}&lon=${lon}&FcstType=json`;
};

const getAPIDailyForecastFromLatLon = async (lat, lon) => {
  const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
  const pointsResponse = await fetch(pointsUrl);
  if(!pointsResponse.ok){
    console.error(`Could not get API points for ${lat}, ${lon}`);
    Deno.exit(-1);
  }
  const pointData = await pointsResponse.json();
  const forecastUrl = pointData.properties.forecast;
  const forecastResponse = await fetch(forecastUrl);

  if(!forecastResponse.ok){
    console.error(`Could not get API forecast for ${forecastUrl}`);
    Deno.exit(-1);
  }

  const forecastData = await forecastResponse.json();

  return forecastData.properties.periods.map(period => {
    let high, low = null;
    if(period.isDaytime){
      high = period.temperature;
    } else {
      low = period.temperature;
    }
    return {
      kind: "api",
      periodName: period.name,
      startTime: period.startTime,
      probabilityOfPrecipitation: period.probabilityOfPrecipitation.value,
      description: period.shortForecast,
      longDescription: period.detailedForecast,
      high,
      low
    };
  });
};

// Parse cli args
if(Deno.args.length < 1){
  console.error('Must provide a zip code as the argument');
  Deno.exit(-1);
}

const zip = Deno.args[0];

const zipLookupFile = await Deno.readTextFile('./zip-to-geo.json', 'utf-8');
const zipLookup = JSON.parse(zipLookupFile);

const found = zipLookup[zip];

if(!found){
  console.error(`No matching data for zip code ${zip}`);
  Deno.exit(-1);
}

const legacyResponse = await fetch(
  getLegacyUrl(found.lat, found.lon)
);

if(!legacyResponse.ok){
  console.error(`Invalid NWS response: ${legacyResponse.status}`);
  Deno.exit(-1);
}

const data = await legacyResponse.json();

let resultPeriods = data.time.startPeriodName.map(name => {return {periodName: name};});

resultPeriods.forEach((obj, index) => {
  obj.startTime = data.time.startValidTime[index];
  obj.kind = "legacy";
  if(data.time.tempLabel[index] == "High"){
    obj.high = data.data.temperature[index];
    obj.low = null;
  } else {
    obj.high = null;
    obj.low = data.data.temperature[index];
  }

  obj.probabilityOfPrecipitation = data.data.pop[index];
  obj.description = data.data.weather[index];
  obj.longDescription = data.data.text[index];
});

const apiData = await getAPIDailyForecastFromLatLon(found.lat, found.lon);

let output = [];
apiData.forEach((apiPeriod, index) => {
  if(resultPeriods[index]){
    output.push(resultPeriods[index]);
  }
  output.push(apiPeriod);
});

console.log(JSON.stringify(output, null, 4));
