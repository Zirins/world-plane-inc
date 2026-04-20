import { useLocation, useNavigate, Link } from "react-router";
import { useState } from "react";
import { ArrowRight, User, Mail, Phone, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import type { Flight, SearchParams } from "../utils/flightData";

interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const flight = location.state?.flight as Flight | undefined;
  const searchParams = location.state?.searchParams as SearchParams | undefined;

  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    Array.from({ length: searchParams?.passengers || 1 }, () => ({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    }))
  );

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  if (!flight || !searchParams) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl text-slate-900 mb-4">No flight selected</h2>
        <Link to="/">
          <Button>Back to Search</Button>
        </Link>
      </div>
    );
  }

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const newPassengers = [...passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    setPassengers(newPassengers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all passengers have required info
    const isValid = passengers.every(
      (p) => p.firstName && p.lastName && p.email && p.phone
    );
    
    if (!isValid || !paymentInfo.cardNumber || !paymentInfo.cardName) {
      alert("Please fill in all required fields");
      return;
    }

    navigate("/confirmation", {
      state: {
        flight,
        searchParams,
        passengers,
        bookingReference: `SKY${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    });
  };

  const totalPrice = flight.price * searchParams.passengers;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl text-slate-900 mb-2">Complete Your Booking</h1>
        <p className="text-slate-600">Please provide passenger and payment details</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Passenger Information */}
            <Card className="p-6">
              <h2 className="text-xl text-slate-900 mb-6 flex items-center gap-2">
                <User className="size-5 text-blue-600" />
                Passenger Information
              </h2>

              <div className="space-y-8">
                {passengers.map((passenger, index) => (
                  <div key={index} className="border-b border-slate-200 pb-6 last:border-0">
                    <h3 className="text-sm text-slate-700 mb-4">
                      Passenger {index + 1}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`firstName-${index}`}>First Name *</Label>
                        <Input
                          id={`firstName-${index}`}
                          value={passenger.firstName}
                          onChange={(e) => updatePassenger(index, "firstName", e.target.value)}
                          required
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`lastName-${index}`}>Last Name *</Label>
                        <Input
                          id={`lastName-${index}`}
                          value={passenger.lastName}
                          onChange={(e) => updatePassenger(index, "lastName", e.target.value)}
                          required
                          placeholder="Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`email-${index}`}>Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <Input
                            id={`email-${index}`}
                            type="email"
                            value={passenger.email}
                            onChange={(e) => updatePassenger(index, "email", e.target.value)}
                            required
                            placeholder="john@example.com"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor={`phone-${index}`}>Phone *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <Input
                            id={`phone-${index}`}
                            type="tel"
                            value={passenger.phone}
                            onChange={(e) => updatePassenger(index, "phone", e.target.value)}
                            required
                            placeholder="+1 234 567 8900"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-6">
              <h2 className="text-xl text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="size-5 text-blue-600" />
                Payment Information
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number *</Label>
                  <Input
                    id="cardNumber"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                    required
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div>
                  <Label htmlFor="cardName">Cardholder Name *</Label>
                  <Input
                    id="cardName"
                    value={paymentInfo.cardName}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      value={paymentInfo.expiryDate}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV *</Label>
                    <Input
                      id="cvv"
                      type="password"
                      value={paymentInfo.cvv}
                      onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                      required
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-4">
              <Link to="/results" state={{ searchParams }} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Back to Results
                </Button>
              </Link>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Confirm & Pay ${totalPrice}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Booking Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h2 className="text-xl text-slate-900 mb-6">Booking Summary</h2>

            <div className="space-y-4 mb-6">
              <div>
                <div className="text-sm text-slate-500">Flight</div>
                <div className="text-slate-900">{flight.airline}</div>
                <div className="text-sm text-slate-600">{flight.flightNumber}</div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="text-sm text-slate-500 mb-2">Route</div>
                <div className="flex items-center gap-2 text-slate-900">
                  <span>{flight.departure.city.split(",")[0]}</span>
                  <ArrowRight className="size-4 text-slate-400" />
                  <span>{flight.arrival.city.split(",")[0]}</span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="text-sm text-slate-500 mb-2">Departure</div>
                <div className="text-slate-900">{flight.departure.date}</div>
                <div className="text-slate-600">{flight.departure.time}</div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="text-sm text-slate-500 mb-2">Duration</div>
                <div className="text-slate-900">{flight.duration}</div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="text-sm text-slate-500 mb-2">Passengers</div>
                <div className="text-slate-900">{searchParams.passengers}</div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Flight ({searchParams.passengers}x ${flight.price})</span>
                <span>${flight.price * searchParams.passengers}</span>
              </div>
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
        </div>
      </div>
    </div>
  );
}
