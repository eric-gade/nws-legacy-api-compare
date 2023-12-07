export const api = {};
api.getAPIDailyForecastFromLatLon = async (lat, lon) => {
  const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
  const pointsResponse = await fetch(pointsUrl);
  if(!pointsResponse.ok){
    throw new Error(`Could not get API points for ${lat}, ${lon}`);
  }
  const pointData = await pointsResponse.json();
  const forecastUrl = pointData.properties.forecast;
  const forecastResponse = await fetch(forecastUrl);

  if(!forecastResponse.ok){
    throw new Error(`Could not get API forecast for ${forecastUrl}`);
  }

  return await forecastResponse.json();
};
