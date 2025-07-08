import { useEffect, useState } from "react";
import { Button } from "../common/Button";
import { useLocation, useNavigate } from "react-router-dom";
import { IoArrowBackSharp } from "react-icons/io5";
import { CiCreditCard1, CiWallet } from "react-icons/ci";
import { useContracts } from '../../hooks/useContracts';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useWeb3 } from '../../context/Web3Context';

const STRIPE_PUBLIC_KEY = 'pk_test_XXXXXXXXXXXXXXXXXXXXXXXX'; // TODO: Replace with your real Stripe public key
const MOONPAY_PUBLIC_KEY = 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxxx'; // TODO: Replace with your real MoonPay public key

function StripeForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // TODO: Integrate with your backend to create a PaymentIntent and confirm payment
    // This is a placeholder for demo purposes
    setTimeout(() => {
      setLoading(false);
      onSuccess && onSuccess("demo_stripe_tx_id");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <CardElement className="p-4 border border-gray-300 rounded-lg text-2xl" />
      <Button name={loading ? "Processing..." : `Pay $${amount} with Card`} className="w-full" type="submit" disabled={loading} />
      {error && <div className="mt-2 text-red-500 text-xl font-medium">{error}</div>}
    </form>
  );
}

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const navigate = useNavigate();
  const { state } = useLocation();
  const propertyTitle = state?.title || "Unknown Property";
  const propertyPrice = state?.price || 0;
  const location = useLocation();
  const pathname = location.pathname;
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showFiatModal, setShowFiatModal] = useState(false);
  const [fiatTxId, setFiatTxId] = useState("");
  const [showStripe, setShowStripe] = useState(false);
  const [showMoonPay, setShowMoonPay] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  const { account } = useWeb3();
  const { payWithUSDT, recordFiatPayment, createPayment, getPendingPayments, getProperty, loading, error, clearError } = useContracts();

  // Fetch properties when component mounts
  useEffect(() => {
    fetch("/mock-properties.json")
      .then((res) => res.json())
      .then((data) => {
        setProperties(data);
        // If there's a property in state, set it as selected
        if (state?.title) {
          const property = data.find((p) => p.title === state.title);
          setSelectedProperty(property || data[0]);
        } else {
          setSelectedProperty(data[0]);
        }
      })
      .catch((err) => console.error("Failed to load properties:", err));
  }, [state]);

  const handlePropertyChange = (e) => {
    const property = properties.find((p) => p.title === e.target.value);
    setSelectedProperty(property);
  };

  // Enhanced crypto payment handler
  const handlePayment = async () => {
    setPaymentError("");
    setPaymentSuccess("");
    if (!selectedProperty || !selectedProperty.id) {
      setPaymentError("No property selected.");
      return;
    }
    setPaymentLoading(true);
    try {
      if (paymentMethod === "crypto") {
        // 1. Find pending payment for this property
        let pendingPayments = await getPendingPayments(account);
        let paymentId = null;
        if (pendingPayments && pendingPayments.length > 0) {
          // Try to find a pending payment for this property
          for (const pid of pendingPayments) {
            const payment = await getProperty(pid);
            if (payment && payment.id === String(selectedProperty.id)) {
              paymentId = pid;
              break;
            }
          }
        }
        // 2. If not found, create a new payment
        if (!paymentId) {
          // Get landlord address from property data or contract
          let landlord = selectedProperty.landlord;
          if (!landlord) {
            const propertyOnChain = await getProperty(selectedProperty.id);
            landlord = propertyOnChain.landlord;
          }
          // Use price and a due date (e.g., now + 30 days)
          const amount = selectedProperty.price;
          const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const receipt = await createPayment(landlord, selectedProperty.id, amount, dueDate);
          // After creation, reload pending payments
          pendingPayments = await getPendingPayments(account);
          paymentId = pendingPayments[pendingPayments.length - 1]; // Assume last is newest
        }
        // 3. Pay with USDT using the found/created paymentId
        const result = await payWithUSDT(paymentId);
        if (result) setPaymentSuccess("Crypto payment successful!");
      } else if (paymentMethod === "creditCard") {
        setShowFiatModal(true);
      }
    } catch (err) {
      setPaymentError("Payment failed. " + (err?.message || ""));
    } finally {
      setPaymentLoading(false);
    }
  };

  // Fiat modal submit
  const handleFiatSubmit = async (e) => {
    e.preventDefault();
    setPaymentError("");
    setPaymentSuccess("");
    if (!fiatTxId) {
      setPaymentError("Please enter the transaction ID.");
      return;
    }
    setPaymentLoading(true);
    try {
      // Simulate paymentId as property.id for demo
      const result = await recordFiatPayment(selectedProperty.id, fiatTxId);
      if (result) setPaymentSuccess("Fiat payment recorded!");
      setShowFiatModal(false);
      setFiatTxId("");
      setShowStripe(false);
      setShowMoonPay(false);
    } catch (err) {
      setPaymentError("Fiat payment failed. " + (err?.message || ""));
    } finally {
      setPaymentLoading(false);
    }
  };

  // MoonPay handler
  const handleMoonPay = () => {
    if (!selectedProperty) return;
    // Open MoonPay widget in a new tab
    const walletAddress = state?.userWallet || ""; // TODO: Replace with actual connected wallet address
    const moonpayUrl = `https://buy.moonpay.com?apiKey=${MOONPAY_PUBLIC_KEY}&walletAddress=${walletAddress}&currencyCode=usdt`;
    window.open(moonpayUrl, '_blank');
    setShowMoonPay(true);
  };

  // Use selected property values or fallbacks
  const selectedTitle = selectedProperty?.title || "Unknown Property";
  const selectedPrice = selectedProperty?.price || 0;

  return (
    <div className="w-full section-page !py-52">
      <div className="relative w-full pt-20">
        <h1 className="mb-6 text-5xl font-bold">Pay Rent</h1>
        <p className="mb-6 text-3xl normal-case text-secondary">Secure payment for {selectedTitle}</p>

        <div
          onClick={() => navigate(-1)}
          className="absolute top-0 left-0 flex items-center cursor-pointer gap-x-6 hover:scale-95 hover:text-primary"
        >
          <IoArrowBackSharp className="text-4xl" />
          <span className="text-3xl font-medium">Back</span>
        </div>

        {/* Property Selection Dropdown (for non-direct payment route) */}
        {pathname !== "/dashboard/tenant-dashboard/properties/payment" && (
        <div className="max-w-5xl mb-16">
          <label className="block mb-3 text-3xl font-medium">Select Property</label>
          <select
            value={selectedProperty?.title || ""}
            onChange={handlePropertyChange}
            className="w-full h-[5.5rem] cursor-pointer p-2 border rounded-xl text-3xl font-medium normal-case text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {properties.map((property) => (
              <option key={property.id} value={property.title}>
                {property.title}
              </option>
            ))}
          </select>
        </div>
        )}

        <div className="flex flex-wrap items-start justify-center gap-10 sm:flex-nowrap">
          <div className="w-full border border-gray-100 shadow-sm rounded-xl p-7">
            <h2 className="mb-4 text-4xl font-semibold">Payment Details</h2>
            <div className="mt-10 space-y-5">
              <label className="block mb-2 text-2xl font-medium text-secondary">Amount (USD)</label>
              <div className="text-6xl font-bold text-primary">${selectedPrice}</div>
              <div className="h-px !my-10 w-full bg-gray-200"></div>
            </div>
            <div className="space-y-5 ">
              <h3 className="mb-3 text-4xl font-medium">Payment Method</h3>
              <div className="space-y-5">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    className="w-8 h-8 text-blue-600 form-radio"
                    checked={paymentMethod === "crypto"}
                    onChange={() => setPaymentMethod("crypto")}
                  />
                  <span className="flex items-center text-3xl font-medium normal-case gap-x-4 text-secondary">
                    <CiWallet className="text-4xl" />
                    Crypto (USDC)
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    className="w-8 h-8 text-blue-600 form-radio"
                    checked={paymentMethod === "creditCard"}
                    onChange={() => setPaymentMethod("creditCard")}
                  />
                  <span className="flex items-center text-3xl font-medium normal-case gap-x-4 text-secondary">
                    <CiCreditCard1 className="text-4xl" />
                    Flat (Credit Card / Onramp)
                  </span>
                </label>
              </div>
              <div className="!mt-10">
                <Button
                  className="w-full h-[5rem] justify-center flex"
                  name={paymentLoading ? "Processing..." : `$${selectedPrice}`}
                  onClick={handlePayment}
                  disabled={paymentLoading}
                />
                {paymentError && <div className="mt-4 text-red-500 text-2xl font-medium">{paymentError}</div>}
                {paymentSuccess && <div className="mt-4 text-green-600 text-2xl font-medium">{paymentSuccess}</div>}
              </div>
            </div>
          </div>

          <div className="w-full border border-gray-100 shadow-sm rounded-xl p-7">
            <h2 className="mb-4 text-4xl font-semibold">Property Summary</h2>
            <h3 className="mb-3 text-3xl font-medium text-secondary">{selectedTitle}</h3>

            <div className="mt-10 mb-4 space-y-2 text-[1.7rem] font-normal text-secondary">
              <p>
                Monthly Rent: <span className="font-semibold">{`$${selectedPrice}`}</span>
              </p>
              <p>
                Landlord: <span className="font-semibold normal-case">'wallet address'</span>
              </p>
            </div>

            <div className="w-full h-px my-10 bg-gray-200"></div>

            <div className="flex items-center justify-between">
              <span className="text-3xl font-medium">Total Amount:</span>
              <span className="text-4xl font-bold text-primary">{`$${selectedPrice}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fiat Payment Modal */}
      {showFiatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md">
          <div className="w-full max-w-lg p-8 bg-white rounded-xl shadow-xl">
            <h2 className="mb-4 text-3xl font-bold text-center">Choose Fiat/Onramp Option</h2>
            <div className="flex flex-col gap-6 mb-8">
              <Button name="Pay with Card (Stripe)" className="w-full" onClick={() => { setShowStripe(true); setShowMoonPay(false); }} />
              <Button name="Buy Crypto (MoonPay)" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black" onClick={handleMoonPay} />
            </div>
            {showStripe && (
              <Elements stripe={stripePromise}>
                <StripeForm amount={selectedPrice} onSuccess={(txId) => { setFiatTxId(txId); setShowStripe(false); }} onError={setPaymentError} />
              </Elements>
            )}
            {showMoonPay && (
              <div className="mb-4 text-center text-xl text-secondary">After completing your MoonPay purchase, enter your MoonPay transaction ID below.</div>
            )}
            <form onSubmit={handleFiatSubmit} className="space-y-6 mt-4">
              <input
                type="text"
                className="w-full p-4 border border-gray-300 rounded-lg text-2xl"
                placeholder="Enter Transaction ID (Stripe or MoonPay)"
                value={fiatTxId}
                onChange={e => setFiatTxId(e.target.value)}
                required
              />
              <div className="flex gap-4 justify-center">
                <Button name="Submit" className="w-1/2" type="submit" disabled={paymentLoading} />
                <Button name="Cancel" className="w-1/2 bg-gray-400 hover:bg-gray-500" type="button" onClick={() => { setShowFiatModal(false); setShowStripe(false); setShowMoonPay(false); }} />
              </div>
              {paymentError && <div className="mt-2 text-red-500 text-xl font-medium">{paymentError}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
