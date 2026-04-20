import { useLocation, Link } from "react-router";
import { CheckCircle, Download, Mail, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import type { Flight, SearchParams } from "../utils/flightData";
import { useState, useEffect } from "react";

interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function Confirmation() {
  const location = useLocation();
  
  // For one-way flights
  const [flight, setFlight] = useState<Flight | null>(
    location.state?.flight || null
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>(
    location.state?.selectedSeats || []
  );
  
  // For round-trip flights
  const [outboundFlight, setOutboundFlight] = useState<Flight | null>(
    location.state?.outboundFlight || null
  );
  const [returnFlight, setReturnFlight] = useState<Flight | null>(
    location.state?.returnFlight || null
  );
  const [selectedOutboundSeats, setSelectedOutboundSeats] = useState<string[]>(
    location.state?.selectedOutboundSeats || []
  );
  const [selectedReturnSeats, setSelectedReturnSeats] = useState<string[]>(
    location.state?.selectedReturnSeats || []
  );
  
  const [searchParams, setSearchParams] = useState<SearchParams | null>(
    location.state?.searchParams || null
  );

  const isRoundTrip = !!(outboundFlight && returnFlight);

  // Update state if we receive new data from location
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
    if (location.state?.selectedSeats && selectedSeats.length === 0) {
      setSelectedSeats(location.state.selectedSeats);
    }
    if (location.state?.selectedOutboundSeats && selectedOutboundSeats.length === 0) {
      setSelectedOutboundSeats(location.state.selectedOutboundSeats);
    }
    if (location.state?.selectedReturnSeats && selectedReturnSeats.length === 0) {
      setSelectedReturnSeats(location.state.selectedReturnSeats);
    }
  }, [location.state, flight, outboundFlight, returnFlight, searchParams, selectedSeats, selectedOutboundSeats, selectedReturnSeats]);
  
  // Generate a booking reference
  const bookingReference = `WP${Date.now().toString().slice(-8)}`;

  if (!searchParams || (!flight && !outboundFlight)) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl text-slate-900 mb-4">No booking information found</h2>
        <Link to="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    );
  }

  const currentFlight = flight || outboundFlight!;
  const totalPrice = isRoundTrip 
    ? (outboundFlight!.price + returnFlight!.price) * searchParams.passengers
    : currentFlight.price * searchParams.passengers;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="size-10 text-green-600" />
          </div>
          <h1 className="text-4xl text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-slate-600">
            Your flight has been successfully reserved
          </p>
        </div>

        {/* Booking Reference */}
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="text-center">
            <div className="text-sm text-slate-600 mb-1">Booking Reference</div>
            <div className="text-3xl tracking-wider text-slate-900 mb-2">
              {bookingReference}
            </div>
            <p className="text-sm text-slate-600">
              Please save this reference number for your records
            </p>
          </div>
        </Card>

        {/* Flight Details */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl text-slate-900 mb-6">
            {isRoundTrip ? "Outbound Flight" : "Flight Details"}
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-sm text-slate-500 mb-1">Airline</div>
                <div className="text-slate-900">{currentFlight.airline}</div>
                <div className="text-sm text-slate-600">{currentFlight.flightNumber}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Duration</div>
                <div className="text-slate-900">{currentFlight.duration}</div>
                <div className="text-sm text-slate-600">
                  {currentFlight.stops === 0 ? "Non-stop" : `${currentFlight.stops} stop(s)`}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Departure</div>
                <div className="text-lg text-slate-900">{currentFlight.departure.time}</div>
                <div className="text-slate-600">{currentFlight.departure.date}</div>
                <div className="text-sm text-slate-600">{currentFlight.departure.city}</div>
                <div className="text-xs text-slate-500">{currentFlight.departure.airport}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Arrival</div>
                <div className="text-lg text-slate-900">{currentFlight.arrival.time}</div>
                <div className="text-slate-600">{currentFlight.arrival.date}</div>
                <div className="text-sm text-slate-600">{currentFlight.arrival.city}</div>
                <div className="text-xs text-slate-500">{currentFlight.arrival.airport}</div>
              </div>
            </div>

            {selectedOutboundSeats.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-500 mb-1">Selected Seats</div>
                <div className="text-slate-900">{selectedOutboundSeats.join(", ")}</div>
              </div>
            )}
          </div>
        </Card>

        {/* Return Flight Details (for round trips) */}
        {isRoundTrip && returnFlight && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl text-slate-900 mb-6">Return Flight</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Airline</div>
                  <div className="text-slate-900">{returnFlight.airline}</div>
                  <div className="text-sm text-slate-600">{returnFlight.flightNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Duration</div>
                  <div className="text-slate-900">{returnFlight.duration}</div>
                  <div className="text-sm text-slate-600">
                    {returnFlight.stops === 0 ? "Non-stop" : `${returnFlight.stops} stop(s)`}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Departure</div>
                  <div className="text-lg text-slate-900">{returnFlight.departure.time}</div>
                  <div className="text-slate-600">{returnFlight.departure.date}</div>
                  <div className="text-sm text-slate-600">{returnFlight.departure.city}</div>
                  <div className="text-xs text-slate-500">{returnFlight.departure.airport}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Arrival</div>
                  <div className="text-lg text-slate-900">{returnFlight.arrival.time}</div>
                  <div className="text-slate-600">{returnFlight.arrival.date}</div>
                  <div className="text-sm text-slate-600">{returnFlight.arrival.city}</div>
                  <div className="text-xs text-slate-500">{returnFlight.arrival.airport}</div>
                </div>
              </div>

              {selectedReturnSeats.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-500 mb-1">Selected Seats</div>
                  <div className="text-slate-900">{selectedReturnSeats.join(", ")}</div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Passenger Details */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl text-slate-900 mb-6">Passenger Information</h2>

          <div className="space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Number of Passengers</span>
              <span className="text-slate-900">{searchParams.passengers}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Trip Type</span>
              <span className="text-slate-900">
                {searchParams.tripType === "round-trip" ? "Round Trip" : "One Way"}
              </span>
            </div>
            {selectedSeats.length > 0 && (
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200">
                <span>Selected Seats</span>
                <span className="text-slate-900">{selectedSeats.join(", ")}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl text-slate-900 mb-6">Payment Summary</h2>

          <div className="space-y-2">
            {isRoundTrip ? (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Outbound Flight ({searchParams.passengers} passenger{searchParams.passengers > 1 ? "s" : ""})</span>
                  <span>${outboundFlight!.price * searchParams.passengers}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Return Flight ({searchParams.passengers} passenger{searchParams.passengers > 1 ? "s" : ""})</span>
                  <span>${returnFlight!.price * searchParams.passengers}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-600">
                <span>Flight ({searchParams.passengers} passenger{searchParams.passengers > 1 ? "s" : ""})</span>
                <span>${currentFlight.price * searchParams.passengers}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Taxes & Fees</span>
              <span>$0</span>
            </div>
            <div className="flex justify-between text-xl text-slate-900 border-t border-slate-200 pt-2">
              <span>Total</span>
              <span>${totalPrice}</span>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button variant="outline" className="w-full">
            <Download className="mr-2 size-4" />
            Download Ticket
          </Button>
          <Button variant="outline" className="w-full">
            <Mail className="mr-2 size-4" />
            Email Confirmation
          </Button>
        </div>

        {/* What's Next */}
        <Card className="p-6 bg-slate-50">
          <h3 className="text-lg text-slate-900 mb-4">What's Next?</h3>
          <ul className="space-y-2 text-sm text-slate-600 mb-4">
            <li className="flex gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>A confirmation email has been sent to your registered email address</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Check-in opens 24 hours before departure</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Please arrive at the airport at least 2 hours before departure</span>
            </li>
            <li className="flex gap-2">
              <CheckCircle className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Bring a valid ID and your booking reference</span>
            </li>
          </ul>
        </Card>

        <div className="text-center mt-8">
          <Link to="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Book Another Flight
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}