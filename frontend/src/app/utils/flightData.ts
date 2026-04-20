export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departure: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  arrival: {
    airport: string;
    city: string;
    time: string;
    date: string;
  };
  duration: string;
  price: number;
  stops: number;
  available: number;
}

export interface SearchParams {
  from: string;
  to: string;
  departDate: string;
  returnDate?: string;
  passengers: number;
  tripType: "one-way" | "round-trip";
}

// Mock flight data generator
export function generateFlights(searchParams: SearchParams): Flight[] {
  const airlines = [
    { name: "Delta", code: "DL" },
    { name: "Southwest", code: "WN" },
  ];

  const flights: Flight[] = [];
  const basePrice = 150 + Math.random() * 300;

  for (let i = 0; i < 8; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const stops = Math.floor(Math.random() * 3);
    const departHour = 6 + i * 2;
    const duration = 2 + stops * 1.5 + Math.random() * 3;
    const arrivalHour = departHour + Math.floor(duration);
    const price = basePrice + stops * 50 + Math.random() * 100;

    flights.push({
      id: `FL${1000 + i}`,
      airline: airline.name,
      flightNumber: `${airline.code}${100 + i}`,
      departure: {
        airport: searchParams.from.split(",")[0].trim() + " Airport",
        city: searchParams.from,
        time: `${departHour.toString().padStart(2, "0")}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")}`,
        date: searchParams.departDate,
      },
      arrival: {
        airport: searchParams.to.split(",")[0].trim() + " Airport",
        city: searchParams.to,
        time: `${(arrivalHour % 24).toString().padStart(2, "0")}:${Math.floor(Math.random() * 60).toString().padStart(2, "0")}`,
        date: searchParams.departDate,
      },
      duration: `${Math.floor(duration)}h ${Math.floor((duration % 1) * 60)}m`,
      price: Math.round(price),
      stops: stops,
      available: Math.floor(Math.random() * 50) + 10,
    });
  }

  return flights.sort((a, b) => a.price - b.price);
}

// Popular destinations
export const popularDestinations = [
  { city: "New York", country: "USA", code: "JFK" },
  { city: "London", country: "UK", code: "LHR" },
  { city: "Paris", country: "France", code: "CDG" },
  { city: "Tokyo", country: "Japan", code: "NRT" },
  { city: "Dubai", country: "UAE", code: "DXB" },
  { city: "Singapore", country: "Singapore", code: "SIN" },
];