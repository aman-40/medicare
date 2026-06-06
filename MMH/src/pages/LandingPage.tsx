import { Link } from "react-router";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Stethoscope,
  Eye,
  Glasses,
  Calendar,
  Pill,
  ShoppingCart,
  Clock,
  Shield,
  Star,
  ChevronRight,
  Truck,
  HeartPulse,
  Award
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--healthcare-light-blue)] via-white to-[var(--healthcare-light-teal)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-[var(--healthcare-emerald)] text-white hover:bg-[var(--healthcare-teal)]">
                Trusted Healthcare Partner Since 2010
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Complete Eye Care & Medical Solutions{" "}
                <span className="text-[var(--healthcare-blue)]">Under One Roof</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Book eye checkups, order medicines, buy glasses, and manage your health digitally.
                Experience premium healthcare services with a modern, convenient approach.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/appointments">
                  <Button size="lg" className="w-full sm:w-auto bg-[var(--healthcare-blue)] hover:bg-[var(--healthcare-cyan)] text-lg px-8">
                    <Eye className="w-5 h-5 mr-2" />
                    Book Eye Test
                  </Button>
                </Link>
                <Link to="/medicines">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 border-[var(--healthcare-teal)] text-[var(--healthcare-teal)] hover:bg-[var(--healthcare-light-teal)]">
                    <Pill className="w-5 h-5 mr-2" />
                    Order Medicines
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border">
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-[var(--healthcare-blue)]">50K+</div>
                  <div className="text-sm text-muted-foreground">Happy Customers</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-[var(--healthcare-teal)]">15+</div>
                  <div className="text-sm text-muted-foreground">Expert Doctors</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold text-[var(--healthcare-emerald)]">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    src="https://images.unsplash.com/photo-1576091358783-a212ec293ff3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxoZWFsdGhjYXJlJTIwZG9jdG9yJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Healthcare Professional"
                    className="rounded-2xl shadow-lg w-full h-64 object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1534078477103-9f6a18b3a5e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxleWVnbGFzc2VzJTIwb3B0aWNhbCUyMGZyYW1lc3xlbnwxfHx8fDE3ODA3MzkyODF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Eyeglasses Collection"
                    className="rounded-2xl shadow-lg w-full h-48 object-cover"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img
                    src="https://images.unsplash.com/photo-1671108503276-1d3d5ab23a3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxMHx8aGVhbHRoY2FyZSUyMGRvY3RvciUyMHBoYXJtYWN5fGVufDF8fHx8MTc4MDczOTI3N3ww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Pharmacy"
                    className="rounded-2xl shadow-lg w-full h-48 object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1580281657527-47f249e8f4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwZG9jdG9yJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5Mjc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Medical Consultation"
                    className="rounded-2xl shadow-lg w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[var(--healthcare-light-blue)] text-[var(--healthcare-blue)]">Our Services</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Healthcare Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for your health and wellness in one convenient location
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Medical Store */}
            <Card className="border-2 hover:border-[var(--healthcare-blue)] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--healthcare-blue)] to-[var(--healthcare-cyan)] flex items-center justify-center mb-4">
                  <Pill className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Medical Store</CardTitle>
                <CardDescription className="text-base">
                  Premium quality medicines delivered to your doorstep
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-blue)]" />
                  <span>Medicine delivery in 24 hours</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-blue)]" />
                  <span>Prescription upload & verification</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-blue)]" />
                  <span>Online ordering & tracking</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-blue)]" />
                  <span>Genuine medicines guarantee</span>
                </div>
                <Link to="/medicines" className="block pt-2">
                  <Button className="w-full bg-[var(--healthcare-blue)] hover:bg-[var(--healthcare-cyan)]">
                    Order Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Eye Clinic */}
            <Card className="border-2 hover:border-[var(--healthcare-teal)] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--healthcare-teal)] to-[var(--healthcare-emerald)] flex items-center justify-center mb-4">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Eye Clinic</CardTitle>
                <CardDescription className="text-base">
                  Expert eye care and comprehensive examinations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-teal)]" />
                  <span>Comprehensive eye examinations</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-teal)]" />
                  <span>Digital prescriptions</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-teal)]" />
                  <span>Easy appointment booking</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-teal)]" />
                  <span>Experienced optometrists</span>
                </div>
                <Link to="/appointments" className="block pt-2">
                  <Button className="w-full bg-[var(--healthcare-teal)] hover:bg-[var(--healthcare-emerald)]">
                    Book Appointment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Optical Store */}
            <Card className="border-2 hover:border-[var(--healthcare-emerald)] transition-all hover:shadow-lg">
              <CardHeader>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--healthcare-emerald)] to-[var(--healthcare-teal)] flex items-center justify-center mb-4">
                  <Glasses className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Optical Store</CardTitle>
                <CardDescription className="text-base">
                  Premium eyewear and contact lenses collection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-emerald)]" />
                  <span>Wide range of frames & brands</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-emerald)]" />
                  <span>Contact lenses available</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-emerald)]" />
                  <span>Virtual try-on feature</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="w-4 h-4 text-[var(--healthcare-emerald)]" />
                  <span>Premium eyewear brands</span>
                </div>
                <Link to="/optical-store" className="block pt-2">
                  <Button className="w-full bg-[var(--healthcare-emerald)] hover:bg-[var(--healthcare-teal)]">
                    Shop Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Medicines</h2>
              <p className="text-muted-foreground">Popular and trusted medications</p>
            </div>
            <Link to="/medicines">
              <Button variant="outline">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Paracetamol 500mg", manufacturer: "Generic Pharma", price: "$5.99", image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080", badge: "Best Seller" },
              { name: "Vitamin D3 1000 IU", manufacturer: "HealthVit", price: "$12.99", image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080", badge: "Popular" },
              { name: "Omega-3 Fish Oil", manufacturer: "NutraLife", price: "$18.99", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080" },
              { name: "Multivitamin Complex", manufacturer: "WellCare", price: "$22.99", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080" },
            ].map((product, idx) => (
              <Card key={idx} className="group hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {product.badge && (
                      <Badge className="absolute top-2 right-2 z-10 bg-[var(--healthcare-emerald)] text-white">
                        {product.badge}
                      </Badge>
                    )}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.manufacturer}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold text-[var(--healthcare-blue)]">{product.price}</span>
                      <Button size="sm" className="bg-[var(--healthcare-blue)] hover:bg-[var(--healthcare-cyan)]">
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Eyeglasses Collection */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Premium Eyewear Collection</h2>
              <p className="text-muted-foreground">Stylish frames from top brands</p>
            </div>
            <Link to="/optical-store">
              <Button variant="outline">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Classic Round Frame", brand: "Ray-Ban", price: "$149.99", image: "https://images.unsplash.com/photo-1614715838608-dd527c46231d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleWVnbGFzc2VzJTIwb3B0aWNhbCUyMGZyYW1lc3xlbnwxfHx8fDE3ODA3MzkyODF8MA&ixlib=rb-4.1.0&q=80&w=1080", rating: 4.8 },
              { name: "Modern Aviator", brand: "Oakley", price: "$189.99", image: "https://images.unsplash.com/photo-1556306510-31ca015374b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxleWVnbGFzc2VzJTIwb3B0aWNhbCUyMGZyYW1lc3xlbnwxfHx8fDE3ODA3MzkyODF8MA&ixlib=rb-4.1.0&q=80&w=1080", rating: 4.9 },
              { name: "Rectangular Designer", brand: "Gucci", price: "$299.99", image: "https://images.unsplash.com/photo-1591076482161-42ce6da69f67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxleWVnbGFzc2VzJTIwb3B0aWNhbCUyMGZyYW1lc3xlbnwxfHx8fDE3ODA3MzkyODF8MA&ixlib=rb-4.1.0&q=80&w=1080", rating: 4.7 },
              { name: "Blue Cut Lens", brand: "Lenskart", price: "$99.99", image: "https://images.unsplash.com/photo-1483412468200-72182dbbc544?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw4fHxleWVnbGFzc2VzJTIwb3B0aWNhbCUyMGZyYW1lc3xlbnwxfHx8fDE3ODA3MzkyODF8MA&ixlib=rb-4.1.0&q=80&w=1080", rating: 4.6 },
            ].map((product, idx) => (
              <Link to={`/optical/${idx + 1}`} key={idx}>
                <Card className="group hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-lg bg-slate-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-1 text-sm text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">{product.rating}</span>
                        <span className="text-muted-foreground">(128)</span>
                      </div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xl font-bold text-[var(--healthcare-teal)]">{product.price}</span>
                        <Button size="sm" variant="outline" className="border-[var(--healthcare-teal)] text-[var(--healthcare-teal)] hover:bg-[var(--healthcare-light-teal)]">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-br from-[var(--healthcare-light-blue)] to-[var(--healthcare-light-teal)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose VisionCare?</h2>
            <p className="text-lg text-muted-foreground">Your health and satisfaction are our top priorities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "100% Genuine", description: "Authentic medicines and certified eyewear" },
              { icon: Truck, title: "Fast Delivery", description: "Quick delivery within 24-48 hours" },
              { icon: HeartPulse, title: "Expert Care", description: "Experienced doctors and optometrists" },
              { icon: Award, title: "Best Prices", description: "Competitive pricing with quality assurance" },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--healthcare-blue)] to-[var(--healthcare-teal)] flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[var(--healthcare-light-teal)] text-[var(--healthcare-teal)]">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Sarah Johnson", role: "Regular Customer", text: "Excellent service! Got my eye checkup done and ordered glasses on the same day. Very convenient and professional.", rating: 5 },
              { name: "Michael Chen", role: "Patient", text: "The online medicine ordering is so easy. Delivery was quick and all medicines were genuine. Highly recommended!", rating: 5 },
              { name: "Emily Rodriguez", role: "Eyewear Customer", text: "Amazing collection of frames! The virtual try-on feature helped me choose the perfect glasses. Love them!", rating: 5 },
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-2">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[var(--healthcare-blue)] to-[var(--healthcare-teal)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience Better Healthcare?</h2>
          <p className="text-lg mb-8 text-white/90">
            Join thousands of satisfied customers who trust VisionCare for their health needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-[var(--healthcare-blue)] hover:bg-slate-100">
                Create Account
              </Button>
            </Link>
            <Link to="/appointments">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
