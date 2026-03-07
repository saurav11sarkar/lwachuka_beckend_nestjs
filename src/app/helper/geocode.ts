import axios from 'axios';
import config from '../config';

// export const getLatLngFromAddress = async (address: string) => {
//   const url = `https://nominatim.openstreetmap.org/search`;

//   const response = await axios.get(url, {
//     params: {
//       q: address,
//       format: 'json',
//       limit: 1,
//     },
//     headers: {
//       'User-Agent': 'nestjs-app',
//     },
//   });

//   if (!response.data.length) {
//     return { lat: null, lng: null };
//   }

//   return {
//     lat: Number(response.data[0].lat),
//     lng: Number(response.data[0].lon),
//   };
// };

export const getLatLngFromAddress = async (address: string) => {
  const url = 'https://maps.googleapis.com/maps/api/geocode/json';

  try {
    const response = await axios.get(url, {
      params: {
        address: address,
        key: config.googlemap_apikey,
      },
    });

    const result = response.data.results?.[0];

    if (!result) {
      return { lat: null, lng: null };
    }

    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
    };
  } catch (error) {
    console.error('Google Geocoding Error:', error);
    return { lat: null, lng: null };
  }
};
