import { Link, useNavigate } from "react-router";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  Star,
  Award,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";
import api from "../api/axios";

export default function EyeCheckupBooking() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/clinic/doctors');
        setDoctors(response.data);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      }
    };
    fetchDoctors();
  }, []);

  const dates = [
    { date: "Jun 6", day: "Sat", available: true },
    { date: "Jun 7", day: "Sun", available: true },
    { date: "Jun 8", day: "Mon", available: true },
    { date: "Jun 9", day: "Tue", available: true },
    { date: "Jun 10", day: "Wed", available: true },
    { date: "Jun 11", day: "Thu", available: true },
    { date: "Jun 12", day: "Fri", available: false },
  ];

  const timeSlots = [
    { time: "09:00 AM", available: true },
    { time: "10:00 AM", available: true },
    { time: "11:00 AM", available: false },
    { time: "12:00 PM", available: true },
    { time: "02:00 PM", available: true },
    { time: "03:00 PM", available: true },
    { time: "04:00 PM", available: true },
    { time: "05:00 PM", available: false },
  ];

  const handleBooking = async () => {
    if (selectedDate && selectedTime && selectedDoctor) {
      setLoading(true);
      setError('');
      try {
        // Map pseudo-date to a real Javascript Date for database
        const today = new Date();
        const targetDate = new Date();
        // Just mock the date object for now using the current year + month + selected day
        targetDate.setDate(today.getDate() + 1); // Mock tomorrow
        
        await api.post('/appointments', {
          doctorId: selectedDoctor,
          date: targetDate.toISOString()
        });
        
        setShowConfirmation(true);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to book appointment. Are you logged in?');
      } finally {
        setLoading(false);
      }
    }
  };

  if (showConfirmation) {
    const doctor = doctors.find(d => d.id === selectedDoctor);
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-[var(--healthcare-light-emerald)] flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-[var(--healthcare-emerald)]" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Appointment Confirmed!</h1>
            <p className="text-muted-foreground">Your eye checkup has been successfully scheduled</p>
          </div>

          <Card className="border-2 border-[var(--healthcare-emerald)]">
            <CardHeader className="bg-[var(--healthcare-light-emerald)]">
              <CardTitle className="text-center">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[var(--healthcare-blue)] text-white">
                    {doctor?.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{doctor?.name}</p>
                  <p className="text-sm text-muted-foreground">{doctor?.specialty}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="font-semibold">{selectedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Time</p>
                  <p className="font-semibold">{selectedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Consultation Fee</p>
                  <p className="font-semibold">{doctor?.fee}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
                  <p className="font-semibold">#APT-{Math.floor(Math.random() * 10000)}</p>
                </div>
              </div>

              <Separator />

              <div className="bg-[var(--healthcare-light-blue)] p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2 text-[var(--healthcare-blue)]">Important Instructions:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Arrive 10 minutes before your appointment</li>
                  <li>• Bring your previous prescriptions if any</li>
                  <li>• Avoid wearing contact lenses on the day of checkup</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Link to="/patient-dashboard" className="flex-1">
                  <Button className="w-full bg-[var(--healthcare-blue)] hover:bg-[var(--healthcare-cyan)]">
                    View Dashboard
                  </Button>
                </Link>
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Book Eye Checkup</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Book Eye Checkup</h1>
          <p className="text-lg text-muted-foreground">
            Schedule your comprehensive eye examination with our expert optometrists
          </p>
          {error && <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Select Date */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--healthcare-blue)] text-white flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <CardTitle>Select Date</CardTitle>
                    <CardDescription>Choose your preferred appointment date</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                  {dates.map((dateItem) => (
                    <button
                      key={dateItem.date}
                      onClick={() => dateItem.available && setSelectedDate(dateItem.date)}
                      disabled={!dateItem.available}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedDate === dateItem.date
                          ? "border-[var(--healthcare-blue)] bg-[var(--healthcare-light-blue)] text-[var(--healthcare-blue)]"
                          : dateItem.available
                          ? "border-border hover:border-[var(--healthcare-blue)]"
                          : "border-border bg-slate-50 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xs mb-1">{dateItem.day}</div>
                        <div className="font-semibold">{dateItem.date.split(' ')[1]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Select Time */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--healthcare-blue)] text-white flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <CardTitle>Select Time Slot</CardTitle>
                    <CardDescription>Pick a convenient time for your appointment</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedTime === slot.time
                          ? "border-[var(--healthcare-teal)] bg-[var(--healthcare-light-teal)] text-[var(--healthcare-teal)]"
                          : slot.available
                          ? "border-border hover:border-[var(--healthcare-teal)]"
                          : "border-border bg-slate-50 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{slot.time}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Select Doctor */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--healthcare-blue)] text-white flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <CardTitle>Select Doctor</CardTitle>
                    <CardDescription>Choose your preferred optometrist</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {doctors.length === 0 ? (
                  <p className="text-center text-muted-foreground p-4">Loading available doctors...</p>
                ) : (
                  doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      onClick={() => setSelectedDoctor(doctor.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedDoctor === doctor.id
                          ? "border-[var(--healthcare-emerald)] bg-[var(--healthcare-light-emerald)]"
                          : "border-border hover:border-[var(--healthcare-emerald)]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="bg-[var(--healthcare-blue)] text-white text-lg">
                            {doctor.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{doctor.name}</h3>
                              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                            </div>
                            <Badge className="bg-[var(--healthcare-emerald)] text-white">
                              {doctor.fee}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-[var(--healthcare-blue)]" />
                              <span>{doctor.experience}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold">{doctor.rating}</span>
                              <span className="text-muted-foreground">({doctor.reviews})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

          </div>

          {/* Appointment Summary */}
          <div>
            <div className="sticky top-24">
              <Card className="border-2 border-[var(--healthcare-blue)]">
                <CardHeader className="bg-[var(--healthcare-light-blue)]">
                  <CardTitle className="text-[var(--healthcare-blue)]">Appointment Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {selectedDoctor ? (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Selected Doctor</p>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-[var(--healthcare-blue)] text-white">
                              {doctors.find(d => d.id === selectedDoctor)?.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">
                              {doctors.find(d => d.id === selectedDoctor)?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {doctors.find(d => d.id === selectedDoctor)?.specialty}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Select a doctor</p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Date</span>
                      </div>
                      <span className="font-medium">{selectedDate || "Not selected"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Time</span>
                      </div>
                      <span className="font-medium">{selectedTime || "Not selected"}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Consultation Fee</span>
                    <span className="text-xl font-bold text-[var(--healthcare-blue)]">
                      {doctors.find(d => d.id === selectedDoctor)?.fee || "$--"}
                    </span>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedTime || !selectedDoctor || loading}
                    className="w-full bg-[var(--healthcare-blue)] hover:bg-[var(--healthcare-cyan)] disabled:opacity-50"
                  >
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </Button>

                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Note:</span> You can reschedule or cancel your appointment up to 2 hours before the scheduled time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
