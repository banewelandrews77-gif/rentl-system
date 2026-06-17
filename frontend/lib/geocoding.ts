/**
 * Converts a physical address/location string into GPS coordinates using OpenStreetMap Nominatim API.
 */
export async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
    if (!address || address.length < 3) return null;

    try {
        // Append "Ghana" and use countrycodes parameter to ensure local results
        const searchQuery = address.toLowerCase().includes("ghana") ? address : `${address}, Ghana`;
        const query = encodeURIComponent(searchQuery);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=gh`;
        
        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'en',
                'User-Agent': 'HostelConnect-App' // Nominatim requires a User-Agent
            }
        });

        if (!response.ok) {
            throw new Error(`Geocoding failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
            };
        }
    } catch (error) {
        console.error("Geocoding error:", error);
    }

    return null;
}
