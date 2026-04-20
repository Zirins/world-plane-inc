import { useLocation, useNavigate, Link } from "react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Clock, Plane, MapPin, Circle } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { generateFlights, type Flight, type SearchParams } from "../utils/flightData";

export function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [returnFlights, setReturnFlights] = useState<Flight[]>([]);
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(null);
  const [returnFlight, setReturnFlight] = useState<Flight | null>(null);
  const [showingReturn, setShowingReturn] = useState(false);
  
  // Store searchParams in state to prevent loss on re-renders
  const [searchParams, setSearchParams] = useState<SearchParams | null>(
    location.state?.searchParams || null
  );

  console.log("SearchResults rendered");
  console.log("location.state:", location.state);
  console.log("searchParams:", searchParams);

  useEffect(() => {
    // If we have searchParams from location.state, store them
    if (location.state?.searchParams && !searchParams) {
      setSearchParams(location.state.searchParams);
      return;
    }
    
    console.log("useEffect running, searchParams:", searchParams);
    
    if (!searchParams) {
      console.log("No searchParams found, redirecting to home");
      navigate("/");
      return;
    }
    
    console.log("Generating flights with params:", searchParams);
    const results = generateFlights(searchParams);
    console.log("Generated flights:", results);
    setFlights(results);
  }, [searchParams, location.state, navigate]);

  if (!searchParams) {
    return null;
  }

  const handleSelectFlight = (flight: Flight) => {
    if (searchParams.tripType === "one-way") {
      navigate("/seat-selection", {
        state: {
          flight,
          searchParams,
        },
      });
    } else {
      // Round trip - show return flights
      setOutboundFlight(flight);
      
      // Generate return flights (reverse route)
      const returnSearchParams: SearchParams = {
        ...searchParams,
        from: searchParams.to,
        to: searchParams.from,
        departDate: searchParams.returnDate || searchParams.departDate,
      };
      
      const returnResults = generateFlights(returnSearchParams);
      setReturnFlights(returnResults);
      setShowingReturn(true);
      
      // Scroll to return flights section
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  const handleSelectReturnFlight = (flight: Flight) => {
    setReturnFlight(flight);
    navigate("/seat-selection", {
      state: {
        outboundFlight,
        returnFlight: flight,
        searchParams,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Summary */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-8 border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl text-slate-900">{searchParams.from.split(",")[0]}</div>
              <div className="text-sm text-slate-500">{searchParams.departDate}</div>
            </div>
            <ArrowRight className="size-6 text-slate-400" />
            <div className="text-center">
              <div className="text-2xl text-slate-900">{searchParams.to.split(",")[0]}</div>
              <div className="text-sm text-slate-500">
                {searchParams.returnDate || searchParams.departDate}
              </div>
            </div>
          </div>
          <div className="text-slate-600">
            {searchParams.passengers} {searchParams.passengers === 1 ? "Passenger" : "Passengers"}
            {" • "}
            {searchParams.tripType === "round-trip" ? "Round Trip" : "One Way"}
          </div>
          <Link to="/">
            <Button variant="outline">Modify Search</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl text-slate-900 mb-2">Available Flights</h1>
        <p className="text-slate-600">{flights.length} flights found</p>
      </div>

      {/* Flight List */}
      <div className="space-y-4">
        {flights.map((flight) => (
          <Card key={flight.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Airline Info */}
              <div className="lg:w-32">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-blue-600 p-2 rounded">
                    <Plane className="size-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-900">{flight.airline}</div>
                    <div className="text-xs text-slate-500">{flight.flightNumber}</div>
                  </div>
                </div>
              </div>

              {/* Flight Details */}
              <div className="flex-1">
                <div className="flex items-center justify-between gap-8">
                  {/* Departure */}
                  <div className="text-center">
                    <div className="text-3xl text-slate-900 mb-1">{flight.departure.time}</div>
                    <div className="text-sm text-slate-600">{flight.departure.city.split(",")[0]}</div>
                    <div className="text-xs text-slate-500">{flight.departure.airport}</div>
                  </div>

                  {/* Duration & Stops */}
                  <div className="flex-1 max-w-xs">
                    <div className="text-center mb-2">
                      <div className="text-sm text-slate-600">{flight.duration}</div>
                    </div>
                    <div className="relative">
                      <div className="border-t-2 border-slate-300"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        {flight.stops === 0 ? (
                          <Circle className="size-2 fill-slate-300 text-slate-300" />
                        ) : (
                          <div className="flex gap-1">
                            {Array.from({ length: flight.stops }).map((_, i) => (
                              <Circle key={i} className="size-2 fill-slate-300 text-slate-300" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <Badge variant={flight.stops === 0 ? "default" : "secondary"} className="text-xs">
                        {flight.stops === 0 ? "Non-stop" : `${flight.stops} ${flight.stops === 1 ? "stop" : "stops"}`}
                      </Badge>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="text-center">
                    <div className="text-3xl text-slate-900 mb-1">{flight.arrival.time}</div>
                    <div className="text-sm text-slate-600">{flight.arrival.city.split(",")[0]}</div>
                    <div className="text-xs text-slate-500">{flight.arrival.airport}</div>
                  </div>
                </div>
              </div>

              {/* Select Button */}
              <div className="lg:w-48 text-center lg:text-right">
                <Button
                  onClick={() => handleSelectFlight(flight)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Select Flight
                </Button>
                <div className="text-xs text-slate-500 mt-2">
                  {flight.available} seats left
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showingReturn && outboundFlight && (
        <>
          {/* Selected Outbound Flight Banner */}
          <div className="my-8 p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-slate-900 mb-2">Selected Outbound Flight</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-slate-600">{outboundFlight.airline} {outboundFlight.flightNumber}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{outboundFlight.departure.time} → {outboundFlight.arrival.time}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600">{outboundFlight.departure.city.split(",")[0]} → {outboundFlight.arrival.city.split(",")[0]}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOutboundFlight(null);
                  setShowingReturn(false);
                  setReturnFlights([]);
                }}
              >
                Change Flight
              </Button>
            </div>
          </div>

          {/* Return Flights Section */}
          <div className="mb-6">
            <h1 className="text-3xl text-slate-900 mb-2">Select Return Flight</h1>
            <p className="text-slate-600">{returnFlights.length} flights found</p>
          </div>

          <div className="space-y-4">{returnFlights.map((flight) => (
            <Card key={flight.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Airline Info */}
                <div className="lg:w-32">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="bg-blue-600 p-2 rounded">
                      <Plane className="size-4 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-slate-900">{flight.airline}</div>
                      <div className="text-xs text-slate-500">{flight.flightNumber}</div>
                    </div>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-8">
                    {/* Departure */}
                    <div className="text-center">
                      <div className="text-3xl text-slate-900 mb-1">{flight.departure.time}</div>
                      <div className="text-sm text-slate-600">{flight.departure.city.split(",")[0]}</div>
                      <div className="text-xs text-slate-500">{flight.departure.airport}</div>
                    </div>

                    {/* Duration & Stops */}
                    <div className="flex-1 max-w-xs">
                      <div className="text-center mb-2">
                        <div className="text-sm text-slate-600">{flight.duration}</div>
                      </div>
                      <div className="relative">
                        <div className="border-t-2 border-slate-300"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          {flight.stops === 0 ? (
                            <Circle className="size-2 fill-slate-300 text-slate-300" />
                          ) : (
                            <div className="flex gap-1">
                              {Array.from({ length: flight.stops }).map((_, i) => (
                                <Circle key={i} className="size-2 fill-slate-300 text-slate-300" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <Badge variant={flight.stops === 0 ? "default" : "secondary"} className="text-xs">
                          {flight.stops === 0 ? "Non-stop" : `${flight.stops} ${flight.stops === 1 ? "stop" : "stops"}`}
                        </Badge>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="text-center">
                      <div className="text-3xl text-slate-900 mb-1">{flight.arrival.time}</div>
                      <div className="text-sm text-slate-600">{flight.arrival.city.split(",")[0]}</div>
                      <div className="text-xs text-slate-500">{flight.arrival.airport}</div>
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <div className="lg:w-48 text-center lg:text-right">
                  <Button
                    onClick={() => handleSelectReturnFlight(flight)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Select Flight
                  </Button>
                  <div className="text-xs text-slate-500 mt-2">
                    {flight.available} seats left
                  </div>
                </div>
              </div>
            </Card>
          ))}</div>
        </>
      )}
    </div>
  );
}