import { useState } from "react";
import { useNavigate } from "react-router";
import { Calendar, MapPin, Users, ArrowRight, Plane } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Home() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("round-trip");
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    departDate: "",
    returnDate: "",
    passengers: "1",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Form submitted with data:", formData);
    
    if (!formData.from || !formData.to || !formData.departDate) {
      alert("Please fill in all required fields");
      return;
    }
    
    if (tripType === "round-trip" && !formData.returnDate) {
      alert("Please select a return date for round trip");
      return;
    }
    
    console.log("Navigating to results...");
    
    navigate("/results", {
      state: {
        searchParams: {
          from: formData.from,
          to: formData.to,
          departDate: formData.departDate,
          returnDate: tripType === "round-trip" ? formData.returnDate : undefined,
          passengers: parseInt(formData.passengers),
          tripType,
        },
      },
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1725650981338-cacdcae6465a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXJwbGFuZSUyMHdpbmclMjBjbG91ZHMlMjBzdW5zZXQlMjBhZXJpYWx8ZW58MXx8fHwxNzcxMjk0MTgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Airplane wing"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl mb-8">Book Your Next Adventure</h1>
          </div>

          {/* Search Form */}
          <Card className="bg-white p-6 shadow-2xl">
            <form onSubmit={handleSubmit}>
              {/* Trip Type Selector */}
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setTripType("round-trip")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    tripType === "round-trip"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Round Trip
                </button>
                <button
                  type="button"
                  onClick={() => setTripType("one-way")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    tripType === "one-way"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  One Way
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* From */}
                <div>
                  <Label htmlFor="from" className="text-slate-700 mb-2 block">
                    From
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="from"
                      placeholder="City or Airport"
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* To */}
                <div>
                  <Label htmlFor="to" className="text-slate-700 mb-2 block">
                    To
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="to"
                      placeholder="City or Airport"
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Depart Date */}
                <div>
                  <Label htmlFor="departDate" className="text-slate-700 mb-2 block">
                    Depart
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="departDate"
                      type="date"
                      value={formData.departDate}
                      onChange={(e) => setFormData({ ...formData, departDate: e.target.value })}
                      className="pl-10"
                      required
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {/* Return Date */}
                {tripType === "round-trip" && (
                  <div>
                    <Label htmlFor="returnDate" className="text-slate-700 mb-2 block">
                      Return
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <Input
                        id="returnDate"
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                        className="pl-10"
                        required={tripType === "round-trip"}
                        min={formData.departDate || new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                )}

                {/* Passengers */}
                <div>
                  <Label htmlFor="passengers" className="text-slate-700 mb-2 block">
                    Passengers
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      id="passengers"
                      type="number"
                      min="1"
                      max="9"
                      value={formData.passengers}
                      onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700">
                Search Flights
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}