import { readCSVObjects, readCSV } from "https://deno.land/x/csv/mod.ts";

const f = await Deno.open("./us-zipcodes.csv");

const options = {
  columnSeparator: "\t"
};

let rows = [];
for await (const obj of readCSVObjects(f, options)) {
  rows.push(obj);
}

let results = {};

rows.forEach(obj => {
  results[obj.zip] = { lat: obj.lat, lon: obj.lon};
});

console.log(
  JSON.stringify(results, null, 4)
);

f.close();
