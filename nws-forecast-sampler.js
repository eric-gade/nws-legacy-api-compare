// Retrieve the longest shortForecast value
// for the daily forecasts of N number
// randomly selected zipcodes
import { parse } from "https://deno.land/std@0.207.0/flags/mod.ts";
import { sleep } from "https://deno.land/x/sleep/mod.ts";
import { api } from "./utils.js";

// Parse cli args
if(Deno.args.length < 1){
  console.error('Must provide the number of  zip code as the argument');
  Deno.exit(-1);
}

const numZips = parseInt(Deno.args[0]);

const zipLookupFile = await Deno.readTextFile('./zip-to-geo.json', 'utf-8');
const zipLookup = JSON.parse(zipLookupFile);

const getRandomZipInfo = () => {
  const zips = Object.keys(zipLookup);
  const zipcode = zips[Math.floor(Math.random()*zips.length)];
  return zipLookup[zipcode];
};

const zips = [];
for(let i = 0; i < numZips; i++){
  zips.push(getRandomZipInfo());
}

let longest = "";
for(let i = 0; i < zips.length; i++){
  const {lat, lon} = zips[i];
  try {
    const forecast = await api.getAPIDailyForecastFromLatLon(
      lat,
      lon
    );
    forecast.properties.periods.forEach(period => {
      if(period.shortForecast.length > longest.length){
        longest = period.shortForecast;
      }
    });
    await sleep(1);
  } catch (e) {
    //console.error(e);
  }
};
console.log(longest);
