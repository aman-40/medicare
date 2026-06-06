import { Link } from "react-router";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import {
  Star,
  ShoppingCart,
  ChevronRight,
  Camera,
  Upload,
  Check,
  Truck,
  RotateCcw,
  Shield,
  Heart,
  Share2,
  Minus,
  Plus
} from "lucide-react";
import { useState } from "react";

export default function ProductDetail() {
  const [selectedLens, setSelectedLens] = useState("single-vision");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [
    "https://images.unsplash.com/photo-1614715838608-dd527c46231d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleWVnbGFzc2VzJTIwb3B0aWNhbCUyMGZyYW1lc3xlbnwxfHx8fDE3ODA3MzkyODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1556306510-31ca015374b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxleWVnbGFzc2VzJTIwb3B0aWNhbCUyMGZyYW1lc3xlbnwxfHx8fDE3ODA3MzkyODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "https://images.unsplash.com/photo-1615468822882-4828d2602857?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxleWVnbGFzc2VzJTIwb3B0aWNhbCUyMGZyYW1lc3xlbnwxfHx8fDE3ODA3MzkyODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
  ];

  const colors = ["Black", "Tortoise", "Crystal"];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/optical-store" className="hover:text-primary">Optical Store</Link>
          <ChevronRight className="w-4 h-4" />
          <span>Classic Round Frame</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div>
            <div className="mb-4 relative rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={images[selectedImage]}
                alt="Product"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
              <Badge className="absolute top-4 left-4 bg-[var(--healthcare-emerald)] text-white">
                Best Seller
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? "border-[var(--healthcare-blue)]" : "border-transparent"
                  }`}
                >
                  <img src={image} alt={`View ${idx + 1}`} className="w-full h-32 object-cover" />
                </button>
              ))}
            </div>

            <Button className="w-full mt-4 bg-[var(--healthcare-blue)] hover:bg-[var(--healthcare-cyan)]">
              <Camera className="w-4 h-4 mr-2" />
              Virtual Try-On
            </Button>
          </div>

          {/* Product Info & Customization */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">Ray-Ban</Badge>
              <h1 className="text-3xl font-bold mb-2">Classic Round Frame</h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-semibold">4.8</span>
                <span className="text-muted-foreground">(128 reviews)</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-bold text-[var(--healthcare-teal)]">$149.99</span>
                <span className="text-xl text-muted-foreground line-through">$199.99</span>
                <Badge className="bg-emerald-500 text-white">25% OFF</Badge>
              </div>
              <p className="text-muted-foreground">
                Timeless round frame design with premium acetate construction. Perfect for everyday wear with superior comfort and style.
              </p>
            </div>

            <Separator />

            {/* Color Selection */}
            <div>
              <Label className="text-base mb-3 block">Select Color</Label>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? "border-[var(--healthcare-blue)] bg-[var(--healthcare-light-blue)]"
                        : "border-border hover:border-[var(--healthcare-blue)]"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Lens Type */}
            <div>
              <Label className="text-base mb-3 block">Lens Type</Label>
              <RadioGroup value={selectedLens} onValueChange={setSelectedLens} className="space-y-3">
                <Card className={selectedLens === "single-vision" ? "border-[var(--healthcare-blue)] bg-[var(--healthcare-light-blue)]" : ""}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <RadioGroupItem value="single-vision" id="single-vision" />
                    <div className="flex-1">
                      <Label htmlFor="single-vision" className="cursor-pointer font-semibold">
                        Single Vision
                      </Label>
                      <p className="text-sm text-muted-foreground">For distance or reading</p>
                      <p className="text-sm font-semibold text-[var(--healthcare-blue)] mt-1">Included</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={selectedLens === "progressive" ? "border-[var(--healthcare-blue)] bg-[var(--healthcare-light-blue)]" : ""}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <RadioGroupItem value="progressive" id="progressive" />
                    <div className="flex-1">
                      <Label htmlFor="progressive" className="cursor-pointer font-semibold">
                        Progressive Lenses
                      </Label>
                      <p className="text-sm text-muted-foreground">Multifocal for all distances</p>
                      <p className="text-sm font-semibold text-[var(--healthcare-blue)] mt-1">+$80.00</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={selectedLens === "blue-cut" ? "border-[var(--healthcare-blue)] bg-[var(--healthcare-light-blue)]" : ""}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <RadioGroupItem value="blue-cut" id="blue-cut" />
                    <div className="flex-1">
                      <Label htmlFor="blue-cut" className="cursor-pointer font-semibold">
                        Blue Cut Lenses
                      </Label>
                      <p className="text-sm text-muted-foreground">Block harmful blue light</p>
                      <p className="text-sm font-semibold text-[var(--healthcare-blue)] mt-1">+$30.00</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={selectedLens === "photochromic" ? "border-[var(--healthcare-blue)] bg-[var(--healthcare-light-blue)]" : ""}>
                  <CardContent className="p-4 flex items-start gap-3">
                    <RadioGroupItem value="photochromic" id="photochromic" />
                    <div className="flex-1">
                      <Label htmlFor="photochromic" className="cursor-pointer font-semibold">
                        Photochromic Lenses
                      </Label>
                      <p className="text-sm text-muted-foreground">Adapt to light conditions</p>
                      <p className="text-sm font-semibold text-[var(--healthcare-blue)] mt-1">+$60.00</p>
                    </div>
                  </CardContent>
                </Card>
              </RadioGroup>
            </div>

            <Separator />

            {/* Prescription Upload */}
            <Card className="border-2 border-dashed border-[var(--healthcare-blue)]">
              <CardHeader>
                <CardTitle className="text-base">Upload Prescription</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8 bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="font-semibold mb-1">Upload your prescription</p>
                    <p className="text-sm text-muted-foreground mb-4">PNG, JPG or PDF up to 5MB</p>
                    <Button variant="outline">
                      Choose File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quantity & Add to Cart */}
            <div className="flex gap-4">
              <div className="flex items-center border-2 border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button className="flex-1 bg-[var(--healthcare-teal)] hover:bg-[var(--healthcare-emerald)] text-lg h-12">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-10 h-10 rounded-full bg-[var(--healthcare-light-blue)] flex items-center justify-center">
                  <Truck className="w-5 h-5 text-[var(--healthcare-blue)]" />
                </div>
                <div>
                  <p className="font-semibold">Free Shipping</p>
                  <p className="text-muted-foreground text-xs">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-10 h-10 rounded-full bg-[var(--healthcare-light-teal)] flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-[var(--healthcare-teal)]" />
                </div>
                <div>
                  <p className="font-semibold">30-Day Returns</p>
                  <p className="text-muted-foreground text-xs">Easy returns policy</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-10 h-10 rounded-full bg-[var(--healthcare-light-emerald)] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[var(--healthcare-emerald)]" />
                </div>
                <div>
                  <p className="font-semibold">2-Year Warranty</p>
                  <p className="text-muted-foreground text-xs">Quality guaranteed</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                  <Check className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="font-semibold">Authentic</p>
                  <p className="text-muted-foreground text-xs">100% genuine</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Product Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Frame Material</p>
                <p className="font-semibold">Premium Acetate</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Frame Shape</p>
                <p className="font-semibold">Round</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Frame Width</p>
                <p className="font-semibold">140mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Lens Width</p>
                <p className="font-semibold">50mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bridge Width</p>
                <p className="font-semibold">20mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Temple Length</p>
                <p className="font-semibold">145mm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
