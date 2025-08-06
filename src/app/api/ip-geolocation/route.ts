import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'IP address is required.' }, { status: 400 });
  }

  try {
    // We use a free, no-key-required API for geolocation.
    const geoResponse = await fetch(`http://ip-api.com/json/${query}`);
    const geoData = await geoResponse.json();

    if (geoData.status === 'fail') {
      return NextResponse.json({ error: `Could not geolocate IP: ${geoData.message}` }, { status: 404 });
    }

    
    const output = `
IP Geolocation Results for: ${geoData.query}
---------------------------------------------
Country:     ${geoData.country} (${geoData.countryCode})
Region:      ${geoData.regionName} (${geoData.region})
City:        ${geoData.city}
Zip Code:    ${geoData.zip}
Coordinates: ${geoData.lat}, ${geoData.lon}
Timezone:    ${geoData.timezone}
ISP:         ${geoData.isp}
Organization:${geoData.org}
ASN:         ${geoData.as}
    `.trim();

    return NextResponse.json({ output });

  } catch (error) {
    console.error('IP Geolocation API error:', error);
    return NextResponse.json({ error: 'Failed to fetch geolocation data.' }, { status: 500 });
  }
}