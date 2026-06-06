import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart } from '../store/cartSlice';
import { type RootState } from '../store';

export default function OpticalStore() {
  const [frames, setFrames] = useState<any[]>([]);
  const [lenses, setLenses] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [framesRes, lensesRes] = await Promise.all([
          api.get('/store/frames'),
          api.get('/store/lenses')
        ]);
        setFrames(framesRes.data);
        setLenses(lensesRes.data);
      } catch (error) {
        console.error('Failed to load catalog');
      }
    };
    fetchCatalog();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        setStatus('Failed to load Razorpay SDK. Check your connection.');
        return;
      }

      // 1. Create order on our server
      const orderRes = await api.post('/payments/create-order', { amount: Math.round(cart.total * 1.18) });
      
      const options = {
        key: 'rzp_test_placeholder_key', // Replace with real key in production
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'VisionCare Optical',
        description: 'Store Purchase',
        order_id: orderRes.data.id,
        handler: async function (response: any) {
          // 2. Verify payment on our server
          try {
            await api.post('/payments/verify', response);
            
            // 3. Generate Final Invoice
            const invoiceRes = await api.post('/billing/checkout', {
              items: cart.items.map(item => ({ id: item.id, type: item.type, quantity: item.quantity, price: item.price }))
            });
            setStatus(`Success! Invoice ${invoiceRes.data.invoiceNo} generated.`);
            dispatch(clearCart());
          } catch (err) {
            setStatus('Payment verification failed.');
          }
        },
        theme: { color: '#3182ce' } // healthcare-blue
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (error) {
      setStatus('Checkout initialization failed.');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-8">
      <div className="max-w-7xl mx-auto flex gap-8">
        
        {/* Left Side: Product Catalog */}
        <div className="flex-1 space-y-12">
          <div>
            <h2 className="text-3xl font-extrabold text-healthcare-text mb-6">Premium Frames</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {frames.length === 0 ? <p className="text-gray-500">No frames available.</p> : frames.map(frame => (
                <div key={frame.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{frame.name}</h3>
                    <p className="text-sm text-gray-500">{frame.brand}</p>
                    <p className="text-xl font-bold text-healthcare-blue mt-2">₹ {frame.price}</p>
                  </div>
                  <button 
                    onClick={() => dispatch(addToCart({ id: frame.id, name: frame.name, price: frame.price, quantity: 1, type: 'optical' }))}
                    className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium transition"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-healthcare-text mb-6">Precision Lenses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lenses.length === 0 ? <p className="text-gray-500">No lenses available.</p> : lenses.map(lens => (
                <div key={lens.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{lens.name}</h3>
                    <p className="text-sm text-gray-500">{lens.type}</p>
                    <p className="text-xl font-bold text-healthcare-teal mt-2">₹ {lens.price}</p>
                  </div>
                  <button 
                    onClick={() => dispatch(addToCart({ id: lens.id, name: lens.name, price: lens.price, quantity: 1, type: 'optical' }))}
                    className="mt-4 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded font-medium transition"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Cart Panel */}
        <div className="w-96">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-healthcare-blue/20 sticky top-8">
            <h2 className="text-2xl font-bold text-healthcare-text border-b pb-4 mb-4">Your Cart</h2>
            
            {cart.items.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold">₹ {item.price * item.quantity}</p>
                  </div>
                ))}
                
                <div className="border-t pt-4 mt-6">
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>Subtotal</span>
                    <span>₹ {cart.total}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mb-2">
                    <span>GST (18%)</span>
                    <span>₹ {Math.round(cart.total * 0.18)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-healthcare-text mt-4">
                    <span>Total</span>
                    <span>₹ {Math.round(cart.total * 1.18)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full mt-6 py-3 bg-healthcare-blue hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition"
                >
                  Checkout & Generate Invoice
                </button>
              </div>
            )}
            
            {status && <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">{status}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
