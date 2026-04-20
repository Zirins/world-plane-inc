import { useLocation, useNavigate, Link } from "react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import type { Flight, SearchParams } from "../utils/flightData";

interface Seat {
  id: string;
  row: number;
  column: string;
  isAvailable: boolean;
  isSelected: boolean;
}

export function SeatSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // For one-way flights
  const [flight, setFlight] = useState<Flight | null>(
    location.state?.flight || null
  );
  
  // For round-trip flights
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(
    location.state?.outboundFlight || null
  );
  const [returnFlight, setReturnFlight] = useState<Flight | null>(
    location.state?.returnFlight || null
  );
  
  const [searchParams, setSearchParams] = useState<SearchParams | null>(
    location.state?.searchParams || null
  );
  
  const [outboundSeats, setOutboundSeats] = useState<Seat[]>([]);
  const [returnSeats, setReturnSeats] = useState<Seat[]>([]);
  const [selectedOutboundSeats, setSelectedOutboundSeats] = useState<string[]>([]);
  const [selectedReturnSeats, setSelectedReturnSeats] = useState<string[]>([]);
  const [showingReturn, setShowingReturn] = useState(false);
  
  // For one-way flights
  const [oneWaySeats, setOneWaySeats] = useState<Seat[]>([]);
  const [selectedOneWaySeats, setSelectedOneWaySeats] = useState<string[]>([]);

  const isRoundTrip = !!(outboundFlight && returnFlight);

  useEffect(() => {
    if (location.state?.flight && !flight) {
      setFlight(location.state.flight);
    }
    if (location.state?.outboundFlight && !outboundFlight) {
      setOutboundFlight(location.state.outboundFlight);
    }
    if (location.state?.returnFlight && !returnFlight) {
      setReturnFlight(location.state.returnFlight);
    }
    if (location.state?.searchParams && !searchParams) {
      setSearchParams(location.state.searchParams);
    }
  }, [location.state, flight, outboundFlight, returnFlight, searchParams]);

  // Generate seat maps
  useEffect(() => {
    if (!searchParams) return;

    const generateSeatMap = () => {
      const rows = 20;
      const columns = ["A", "B", "C", "D", "E", "F"];
      const generatedSeats: Seat[] = [];

      for (let row = 1; row <= rows; row++) {
        for (const col of columns) {
          const isAvailable = Math.random() > 0.3;
          generatedSeats.push({
            id: `${row}${col}`,
            row,
            column: col,
            isAvailable,
            isSelected: false,
          });
        }
      }

      return generatedSeats;
    };

    if (isRoundTrip) {
      setOutboundSeats(generateSeatMap());
      setReturnSeats(generateSeatMap());
    } else if (flight) {
      setOneWaySeats(generateSeatMap());
    }
  }, [searchParams, isRoundTrip, flight]);

  if (!searchParams || (!flight && !outboundFlight)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl text-slate-900 mb-4">No flight information found</h2>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const handleOutboundSeatClick = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    if (selectedOutboundSeats.includes(seatId)) {
      setSelectedOutboundSeats(selectedOutboundSeats.filter((id) => id !== seatId));
    } else {
      if (selectedOutboundSeats.length < searchParams.passengers) {
        setSelectedOutboundSeats([...selectedOutboundSeats, seatId]);
      }
    }
  };

  const handleReturnSeatClick = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    if (selectedReturnSeats.includes(seatId)) {
      setSelectedReturnSeats(selectedReturnSeats.filter((id) => id !== seatId));
    } else {
      if (selectedReturnSeats.length < searchParams.passengers) {
        setSelectedReturnSeats([...selectedReturnSeats, seatId]);
      }
    }
  };

  const handleContinueOutbound = () => {
    if (selectedOutboundSeats.length === searchParams.passengers) {
      setShowingReturn(true);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  const handleContinueToConfirmation = () => {
    if (selectedReturnSeats.length === searchParams.passengers) {
      navigate("/confirmation", {
        state: {
          outboundFlight,
          returnFlight,
          searchParams,
          selectedOutboundSeats,
          selectedReturnSeats,
        },
      });
    }
  };

  const handleOneWaySeatClick = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    if (selectedOneWaySeats.includes(seatId)) {
      setSelectedOneWaySeats(selectedOneWaySeats.filter((id) => id !== seatId));
    } else {
      if (selectedOneWaySeats.length < searchParams.passengers) {
        setSelectedOneWaySeats([...selectedOneWaySeats, seatId]);
      }
    }
  };

  const handleContinueOneWay = () => {
    if (selectedOneWaySeats.length === searchParams.passengers) {
      navigate("/confirmation", {
        state: {
          flight,
          searchParams,
          selectedSeats: selectedOneWaySeats,
        },
      });
    }
  };

  // For one-way flights, use different variables
  const displayFlight = isRoundTrip 
    ? (showingReturn ? returnFlight : outboundFlight)
    : flight;
  
  const displaySeats = isRoundTrip 
    ? (showingReturn ? returnSeats : outboundSeats)
    : oneWaySeats;
  
  const displaySelectedSeats = isRoundTrip 
    ? (showingReturn ? selectedReturnSeats : selectedOutboundSeats)
    : selectedOneWaySeats;
  
  const displayHandleSeatClick = isRoundTrip 
    ? (showingReturn ? handleReturnSeatClick : handleOutboundSeatClick)
    : handleOneWaySeatClick;

  const getSeatClassName = (seat: Seat) => {
    if (displaySelectedSeats.includes(seat.id)) {
      return "bg-blue-600 text-white border-blue-600 cursor-pointer hover:bg-blue-700";
    }
    if (!seat.isAvailable) {
      return "bg-slate-300 text-slate-500 border-slate-300 cursor-not-allowed";
    }
    return "bg-white text-slate-700 border-slate-300 cursor-pointer hover:bg-slate-50 hover:border-slate-400";
  };

  // Group seats by row
  const seatsByRow = displaySeats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<number, Seat[]>);

  if (!displayFlight) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl text-slate-900 mb-4">No flight information found</h2>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-slate-900 mb-2">
            Select Your Seat{isRoundTrip && (showingReturn ? " - Return Flight" : " - Outbound Flight")}
          </h1>
          <p className="text-slate-600">
            Choose {searchParams.passengers} seat{searchParams.passengers > 1 ? "s" : ""} for your {showingReturn ? "return" : "outbound"} flight
          </p>
        </div>

        {/* Selected Outbound Flight Banner (when on return) */}
        {showingReturn && selectedOutboundSeats.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-slate-900 mb-1">Outbound Flight Seats Selected</h3>
                <div className="text-sm text-slate-600">
                  {selectedOutboundSeats.join(", ")}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowingReturn(false)}
              >
                Change Outbound Seats
              </Button>
            </div>
          </div>
        )}

        {/* Flight Info */}
        <Card className="p-6 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="text-sm text-slate-500 mb-1">Flight</div>
              <div className="text-slate-900">{displayFlight.airline}</div>
              <div className="text-sm text-slate-600">{displayFlight.flightNumber}</div>
            </div>
            <div className="h-8 border-l border-slate-200"></div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Route</div>
              <div className="text-slate-900">
                {displayFlight.departure.city.split(",")[0]} → {displayFlight.arrival.city.split(",")[0]}
              </div>
            </div>
            <div className="h-8 border-l border-slate-200"></div>
            <div>
              <div className="text-sm text-slate-500 mb-1">Departure</div>
              <div className="text-slate-900">{displayFlight.departure.date} at {displayFlight.departure.time}</div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Seat Map */}
          <Card className="p-6">
            {/* Legend */}
            <div className="flex gap-6 mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="size-6 border-2 border-slate-300 bg-white rounded"></div>
                <span className="text-sm text-slate-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-6 border-2 border-blue-600 bg-blue-600 rounded"></div>
                <span className="text-sm text-slate-600">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-6 border-2 border-slate-300 bg-slate-300 rounded"></div>
                <span className="text-sm text-slate-600">Occupied</span>
              </div>
            </div>

            {/* Seat Grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Column Headers */}
                <div className="flex items-center mb-2">
                  <div className="w-12 text-center text-sm text-slate-500"></div>
                  {["A", "B", "C"].map((col) => (
                    <div key={col} className="w-10 text-center text-sm text-slate-500">
                      {col}
                    </div>
                  ))}
                  <div className="w-8"></div>
                  {["D", "E", "F"].map((col) => (
                    <div key={col} className="w-10 text-center text-sm text-slate-500">
                      {col}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {Object.entries(seatsByRow).map(([rowNum, rowSeats]) => (
                  <div key={rowNum} className="flex items-center mb-2">
                    <div className="w-12 text-center text-sm text-slate-500">{rowNum}</div>
                    {rowSeats.slice(0, 3).map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => displayHandleSeatClick(seat.id, seat.isAvailable)}
                        className={`w-10 h-10 border-2 rounded text-xs font-medium transition-colors ${getSeatClassName(
                          seat
                        )}`}
                        disabled={!seat.isAvailable}
                      >
                        {displaySelectedSeats.includes(seat.id) && (
                          <Check className="size-4 mx-auto" />
                        )}
                      </button>
                    ))}
                    <div className="w-8"></div>
                    {rowSeats.slice(3, 6).map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => displayHandleSeatClick(seat.id, seat.isAvailable)}
                        className={`w-10 h-10 border-2 rounded text-xs font-medium transition-colors ${getSeatClassName(
                          seat
                        )}`}
                        disabled={!seat.isAvailable}
                      >
                        {displaySelectedSeats.includes(seat.id) && (
                          <Check className="size-4 mx-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Summary */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg text-slate-900 mb-4">Selected Seats</h3>
              
              {displaySelectedSeats.length === 0 ? (
                <p className="text-slate-500 text-sm">No seats selected yet</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {displaySelectedSeats.map((seatId) => (
                    <div
                      key={seatId}
                      className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded"
                    >
                      <span className="text-slate-900 font-medium">Seat {seatId}</span>
                      <Badge variant="default">Selected</Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-600 mb-1">
                  {displaySelectedSeats.length} of {searchParams.passengers} seat{searchParams.passengers > 1 ? "s" : ""} selected
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(displaySelectedSeats.length / searchParams.passengers) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {showingReturn ? (
                <Button
                  onClick={handleContinueToConfirmation}
                  disabled={selectedReturnSeats.length !== searchParams.passengers}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Confirmation
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : isRoundTrip ? (
                <Button
                  onClick={handleContinueOutbound}
                  disabled={selectedOutboundSeats.length !== searchParams.passengers}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Return Flight
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleContinueOneWay}
                  disabled={selectedOneWaySeats.length !== searchParams.passengers}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Confirmation
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              )}
            </Card>

            <Card className="p-6 bg-slate-50">
              <h3 className="text-sm text-slate-900 mb-2">Seat Selection Tips</h3>
              <ul className="space-y-1 text-xs text-slate-600">
                <li>• Exit rows offer extra legroom</li>
                <li>• Window seats (A, F) for views</li>
                <li>• Aisle seats (C, D) for easy access</li>
                <li>• Front rows for quick exit</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}