import { Link } from "react-router";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Search,
  Upload,
  ChevronRight,
  ShoppingCart,
  CheckCircle2,
  Pill,
  Thermometer,
  Heart,
  Activity
} from "lucide-react";
import { useState } from "react";

export default function PharmacyStore() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", label: "All Medicines", icon: Pill },
    { id: "pain-relief", label: "Pain Relief", icon: Pill },
    { id: "vitamins", label: "Vitamins & Supplements", icon: Heart },
    { id: "cold-flu", label: "Cold & Flu", icon: Thermometer },
    { id: "diabetes", label: "Diabetes Care", icon: Activity },
    { id: "prescription", label: "Prescription Required", icon: Pill },
  ];

  const medicines = [
    {
      id: 1,
      name: "Paracetamol 500mg",
      manufacturer: "Generic Pharma",
      price: 5.99,
      image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      stock: "In Stock",
      stockCount: 245,
      badge: "Best Seller",
      prescription: false,
      category: "pain-relief"
    },
    {
      id: 2,
      name: "Vitamin D3 1000 IU",
      manufacturer: "HealthVit",
      price: 12.99,
      image: "https://images.unsplash.com/photo-1628771065518-0d82f1938462?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      stock: "In Stock",
      stockCount: 156,
      badge: "Popular",
      prescription: false,
      category: "vitamins"
    },
    {
      id: 3,
      name: "Omega-3 Fish Oil",
      manufacturer: "NutraLife",
      price: 18.99,
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      stock: "In Stock",
      stockCount: 89,
      prescription: false,
      category: "vitamins"
    },
    {
      id: 4,
      name: "Multivitamin Complex",
      manufacturer: "WellCare",
      price: 22.99,
      image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      stock: "In Stock",
      stockCount: 123,
      prescription: false,
      category: "vitamins"
    },
    {
      id: 5,
      name: "Aspirin 75mg",
      manufacturer: "MediCare",
      price: 7.99,
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      stock: "Low Stock",
      stockCount: 15,
      prescription: true,
      category: "pain-relief"
    },
    {
      id: 6,
      name: "Cold & Flu Relief",
      manufacturer: "PharmaCo",
      price: 9.99,
      image: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2luZSUyMHBpbGxzJTIwcGhhcm1hY3l8ZW58MXx8fHwxNzgwNzM5MjgyfDA&ixlib=rb-4.1.0&q=80&w=1080",
      stock: "In Stock",
      stockCount: 67,
      prescription: false,
      category: "cold-flu"
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[var(--healthcare-emerald)] to-[var(--healthcare-teal)] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-white/80 mb-2">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span>Pharmacy</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Online Pharmacy</h1>
          <p className="text-lg text-white/90 max-w-2xl">
            Order genuine medicines with fast delivery and expert consultation
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Upload Prescription */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search for medicines, health products..."
                  className="pl-12 h-12 text-base"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-[var(--healthcare-blue)]">
            <CardContent className="p-6">
              <Button className="w-full h-12 bg-[var(--healthcare-blue)] hover:bg-[var(--healthcare-cyan)]">
                <Upload className="w-5 h-5 mr-2" />
                Upload Prescription
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  selectedCategory === category.id
                    ? "border-[var(--healthcare-emerald)] bg-[var(--healthcare-light-emerald)] text-[var(--healthcare-emerald)]"
                    : "border-border hover:border-[var(--healthcare-emerald)]"
                }`}
              >
                <category.icon className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm font-medium">{category.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Offer */}
        <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Flat 20% OFF on First Order!</h3>
              <p className="text-muted-foreground">Use code: WELCOME20 • Valid for all medicines</p>
            </div>
            <Badge className="bg-amber-500 text-white text-lg px-4 py-2">
              SAVE 20%
            </Badge>
          </CardContent>
        </Card>

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Available Medicines</h2>
            <select className="px-4 py-2 border border-border rounded-lg">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Name: A-Z</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <Card key={medicine.id} className="group hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg bg-slate-100">
                    {medicine.badge && (
                      <Badge className="absolute top-2 left-2 z-10 bg-[var(--healthcare-emerald)] text-white">
                        {medicine.badge}
                      </Badge>
                    )}
                    {medicine.prescription && (
                      <Badge className="absolute top-2 right-2 z-10 bg-red-500 text-white">
                        Rx Required
                      </Badge>
                    )}
                    <img
                      src={medicine.image}
                      alt={medicine.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">{medicine.name}</h3>
                      <p className="text-sm text-muted-foreground">{medicine.manufacturer}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {medicine.stock === "In Stock" ? (
                        <div className="flex items-center gap-1 text-sm text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>In Stock ({medicine.stockCount})</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          Low Stock
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <span className="text-2xl font-bold text-[var(--healthcare-emerald)]">
                          ${medicine.price}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">per pack</span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-[var(--healthcare-emerald)] hover:bg-[var(--healthcare-teal)]"
                      >
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

        {/* Info Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--healthcare-light-blue)] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-[var(--healthcare-blue)]" />
              </div>
              <h3 className="font-semibold mb-2">100% Genuine</h3>
              <p className="text-sm text-muted-foreground">All medicines are verified and authentic</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--healthcare-light-emerald)] flex items-center justify-center mx-auto mb-3">
                <Pill className="w-7 h-7 text-[var(--healthcare-emerald)]" />
              </div>
              <h3 className="font-semibold mb-2">Expert Consultation</h3>
              <p className="text-sm text-muted-foreground">Free consultation with pharmacists</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--healthcare-light-teal)] flex items-center justify-center mx-auto mb-3">
                <Activity className="w-7 h-7 text-[var(--healthcare-teal)]" />
              </div>
              <h3 className="font-semibold mb-2">Fast Delivery</h3>
              <p className="text-sm text-muted-foreground">Delivery within 24-48 hours</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
