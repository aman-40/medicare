import { Link, useParams } from "react-router";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  ChevronRight,
  Phone,
  Mail
} from "lucide-react";

export default function OrderTracking() {
  const { id } = useParams();

  const trackingSteps = [
    {
      status: "completed",
      title: "Prescription Received",
      description: "Your prescription has been verified by our optometrist",
      date: "Jun 1, 2026",
      time: "10:30 AM",
    },
    {
      status: "completed",
      title: "Lens Processing",
      description: "Custom lenses are being manufactured according to your prescription",
      date: "Jun 2, 2026",
      time: "2:15 PM",
    },
    {
      status: "completed",
      title: "Frame Assembly",
      description: "Your selected frame is being assembled with the lenses",
      date: "Jun 4, 2026",
      time: "11:00 AM",
    },
    {
      status: "in-progress",
      title: "Quality Check",
      description: "Final quality inspection in progress",
      date: "Jun 6, 2026",
      time: "9:00 AM",
    },
    {
      status: "pending",
      title: "Ready for Pickup",
      description: "Your glasses will be ready for pickup or delivery",
      date: "Est. Jun 7, 2026",
      time: "TBD",
    },
    {
      status: "pending",
      title: "Delivered",
      description: "Order completed and delivered to customer",
      date: "Est. Jun 8, 2026",
      time: "TBD",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/patient-dashboard" className="hover:text-primary">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span>Track Order</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Track Your Order</h1>
              <p className="text-muted-foreground">Order ID: #{id || "GL-2845"}</p>
            </div>
            <Badge className="bg-[var(--healthcare-blue)] text-white text-lg px-4 py-2">
              In Progress
            </Badge>
          </div>

          <Card className="border-[var(--healthcare-blue)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Package className="w-8 h-8 text-[var(--healthcare-blue)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Ray-Ban Classic Round Frame</h3>
                    <p className="text-sm text-muted-foreground">With Blue Cut Lenses</p>
                    <p className="text-xs text-muted-foreground mt-1">Ordered on: June 1, 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--healthcare-teal)]">$179.99</p>
                  <p className="text-xs text-muted-foreground">Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tracking Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {trackingSteps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="flex gap-6">
                    {/* Icon */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          step.status === "completed"
                            ? "bg-[var(--healthcare-emerald)] text-white"
                            : step.status === "in-progress"
                            ? "bg-[var(--healthcare-blue)] text-white animate-pulse"
                            : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : step.status === "in-progress" ? (
                          <Clock className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      {idx < trackingSteps.length - 1 && (
                        <div
                          className={`absolute top-14 left-1/2 -translate-x-1/2 w-0.5 h-16 ${
                            step.status === "completed" ? "bg-[var(--healthcare-emerald)]" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3
                            className={`font-semibold text-lg ${
                              step.status === "in-progress" ? "text-[var(--healthcare-blue)]" : ""
                            }`}
                          >
                            {step.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                        {step.status !== "pending" && (
                          <div className="text-right text-sm">
                            <p className="font-semibold">{step.date}</p>
                            <p className="text-muted-foreground">{step.time}</p>
                          </div>
                        )}
                      </div>

                      {step.status === "in-progress" && (
                        <div className="mt-4 p-4 rounded-lg bg-[var(--healthcare-light-blue)] border border-[var(--healthcare-blue)]">
                          <p className="text-sm font-semibold text-[var(--healthcare-blue)]">
                            🔍 Currently in Progress
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Our quality team is carefully inspecting your glasses to ensure perfect vision and comfort.
                          </p>
                        </div>
                      )}

                      {step.status === "pending" && idx === trackingSteps.length - 2 && (
                        <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                          <p className="text-sm font-semibold mb-2">📍 Delivery Address</p>
                          <p className="text-sm text-muted-foreground">
                            123 Healthcare Plaza<br />
                            Medical District, NY 10001
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[var(--healthcare-blue)]" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Delivery Method</p>
                <p className="font-semibold">Standard Shipping (3-5 days)</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Delivery</p>
                <p className="font-semibold text-[var(--healthcare-blue)]">June 8, 2026</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Shipping Address</p>
                <p className="font-semibold">123 Healthcare Plaza</p>
                <p className="text-sm text-muted-foreground">Medical District, NY 10001</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[var(--healthcare-teal)]" />
                Need Help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Have questions about your order? Our customer support team is here to help.
              </p>
              <div className="space-y-2">
                <a href="tel:+12345678900" className="flex items-center gap-2 text-sm text-[var(--healthcare-teal)] hover:underline">
                  <Phone className="w-4 h-4" />
                  <span>+1 (234) 567-8900</span>
                </a>
                <a href="mailto:support@visioncare.com" className="flex items-center gap-2 text-sm text-[var(--healthcare-teal)] hover:underline">
                  <Mail className="w-4 h-4" />
                  <span>support@visioncare.com</span>
                </a>
              </div>
              <Button variant="outline" className="w-full mt-4">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link to="/patient-dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
          <Button className="flex-1 bg-[var(--healthcare-blue)] hover:bg-[var(--healthcare-cyan)]">
            <Package className="w-4 h-4 mr-2" />
            View Invoice
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
