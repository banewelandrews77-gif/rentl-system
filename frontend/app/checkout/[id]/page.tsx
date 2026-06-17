"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ShieldCheck, CreditCard, Building, Smartphone, Landmark } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { reservationsApi, API_BASE } from "../../../lib/api";

const getLocalFormatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

type CheckoutDetails = {
    hostelName: string;
    roomName: string;
    price: number;
    startDate: string;
    endDate: string;
};

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const hostelId = params.id as string;
    const roomTypeId = searchParams.get('roomTypeId');
    const existingReservationId = searchParams.get('reservationId');

    const { user, role, ready } = useAuth();

    const [loading, setLoading] = useState(true);
    const [details, setDetails] = useState<CheckoutDetails | null>(null);
    const [error, setError] = useState("");

    // Payment state
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'MOMO' | 'BANK'>('CARD');
    const [reservationId, setReservationId] = useState<string | null>(null);

    // MoMo state
    const [momoNumber, setMomoNumber] = useState("");
    const [momoNetwork, setMomoNetwork] = useState("MTN");

    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    // Date Picker state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (!ready) return;
        if (!user) {
            router.push(`/login?redirect=/checkout/${hostelId}?roomTypeId=${roomTypeId}`);
            return;
        }

        if (role === 'AGENT') {
            router.push(`/dashboard/agent`);
            return;
        }

        if (!roomTypeId) {
            setError("No room selected for checkout.");
            setLoading(false);
            return;
        }

        // Fetch hostel details to populate checkout summary
        const fetchDetails = async () => {
            try {
                const res = await fetch(
                    `${API_BASE}/public/hostels/${hostelId}`
                );
                if (!res.ok) throw new Error("Failed to load hostel details");

                const data = await res.json();
                const room = data.roomTypes.find((r: any) => r.id === roomTypeId);

                if (!room) throw new Error("Room type not found");

                // Default reservation starts today
                const start = new Date();

                const end = new Date(start);
                end.setFullYear(end.getFullYear() + 1);

                setDetails({
                    hostelName: data.name,
                    roomName: room.name,
                    price: room.pricePerYear,
                    startDate: getLocalFormatDate(start),
                    endDate: getLocalFormatDate(end)
                });

                // Set initial default dates if not already set
                if (!startDate) {
                    setStartDate(getLocalFormatDate(start));
                    setEndDate(getLocalFormatDate(end));
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [hostelId, roomTypeId, ready, user, router]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!details || !roomTypeId) return;

        setIsProcessing(true);
        setError("");

        try {
            let currentReservationId = existingReservationId;

            // 1. Create Reservation ONLY if it doesn't already exist
            if (!currentReservationId) {
                const reservation = await reservationsApi.create({
                    hostelId,
                    roomTypeId,
                    startDate: startDate,
                    endDate: endDate
                });
                currentReservationId = reservation.id;
            }

            // 2. Initialize Paystack Checkout
            const paymentInfo = await reservationsApi.initializePayment(currentReservationId);

            // 3. Redirect to Paystack Hosted Checkout
            window.location.href = paymentInfo.authorizationUrl;

        } catch (err: any) {
            setError(err.message || "Payment initialization failed. Please try again.");
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto flex h-[50vh] max-w-7xl items-center justify-center px-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
        );
    }

    if (error && !details) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-stone-900">Checkout Error</h2>
                <p className="mt-2 text-stone-600">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-6 inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium"
                >
                    <ChevronLeft className="h-4 w-4" /> Go back
                </button>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6">
                        <ShieldCheck className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-stone-900 mb-4">Payment Successful!</h1>
                    <p className="text-lg text-stone-600 mb-8">
                        Your reservation for {details?.roomName} at {details?.hostelName} has been confirmed.
                    </p>

                    <div className="max-w-md mx-auto bg-stone-50 rounded-xl p-6 text-left mb-8 border border-stone-200">
                        <div className="text-sm text-stone-500 mb-1">Reservation ID</div>
                        <div className="font-mono font-medium text-stone-900 mb-4">{reservationId}</div>

                        <div className="text-sm text-stone-500 mb-1">Amount Paid</div>
                        <div className="font-medium text-stone-900">GH₵ {((details?.price || 0) + 20).toFixed(2)}</div>
                    </div>

                    <button
                        onClick={() => router.push('/dashboard/customer')}
                        className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-stone-900"
                    >
                        Go to My Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <button
                onClick={() => router.back()}
                className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
            >
                <ChevronLeft className="h-4 w-4" /> Back to Listing
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Payment Form side */}
                <div className="lg:col-span-7">
                    <h1 className="text-2xl font-bold text-stone-900 mb-6">Secure Checkout</h1>

                    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-stone-100">
                            <div className="rounded-full bg-stone-100 p-2 text-stone-600">
                                {paymentMethod === 'CARD' ? <CreditCard className="h-5 w-5" /> : null}
                                {paymentMethod === 'MOMO' ? <Smartphone className="h-5 w-5" /> : null}
                                {paymentMethod === 'BANK' ? <Landmark className="h-5 w-5" /> : null}
                            </div>
                            <div>
                                <h2 className="font-semibold text-stone-900">Payment Method</h2>
                                <p className="text-sm text-stone-500">MOCK PAYMENT GATEWAY</p>
                            </div>
                        </div>

                        {/* Booking Dates Section */}
                        <div className="mb-8 p-4 rounded-xl bg-amber-50 border border-amber-100">
                            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider mb-4">Booking Duration</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase mb-1">Check-in Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        min={getLocalFormatDate(new Date())}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-lg border-amber-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm py-2 px-3 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-amber-700 uppercase mb-1">Check-out Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        min={startDate || getLocalFormatDate(new Date())}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-lg border-amber-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm py-2 px-3 border"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('CARD')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'CARD'
                                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                                    }`}
                            >
                                <CreditCard className={`h-6 w-6 mb-2 ${paymentMethod === 'CARD' ? 'text-amber-600' : 'text-stone-400'}`} />
                                <span className="text-sm font-medium">Card</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('MOMO')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'MOMO'
                                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                                    }`}
                            >
                                <Smartphone className={`h-6 w-6 mb-2 ${paymentMethod === 'MOMO' ? 'text-amber-600' : 'text-stone-400'}`} />
                                <span className="text-sm font-medium">MoMo</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('BANK')}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${paymentMethod === 'BANK'
                                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                                    }`}
                            >
                                <Landmark className={`h-6 w-6 mb-2 ${paymentMethod === 'BANK' ? 'text-amber-600' : 'text-stone-400'}`} />
                                <span className="text-sm font-medium">Bank</span>
                            </button>
                        </div>

                        <form onSubmit={handlePayment} className="space-y-5">

                            {paymentMethod === 'CARD' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-900 mb-1">Card Number</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={19}
                                            placeholder="0000 0000 0000 0000"
                                            value={cardNumber}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val.length < cardNumber.length) {
                                                    setCardNumber(val);
                                                    return;
                                                }
                                                let clean = val.replace(/\D/g, '');
                                                let formatted = clean.replace(/(.{4})/g, '$1 ').trim();
                                                setCardNumber(formatted);
                                            }}
                                            className="w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2.5 px-3 border"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-900 mb-1">Expiry Date</label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={5}
                                                placeholder="MM/YY"
                                                value={expiry}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    if (val.length < expiry.length) {
                                                        setExpiry(val);
                                                        return;
                                                    }
                                                    val = val.replace(/\D/g, '');
                                                    if (val.length >= 2) {
                                                        val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                    }
                                                    setExpiry(val);
                                                }}
                                                className="w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2.5 px-3 border"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-900 mb-1">Security Code (CVV)</label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={4}
                                                placeholder="123"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                                className="w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2.5 px-3 border"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-900 mb-1">Name on Card</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="John Doe"
                                            defaultValue={user?.fullName || ""}
                                            className="w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2.5 px-3 border"
                                        />
                                    </div>
                                </>
                            )}

                            {paymentMethod === 'MOMO' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-900 mb-1">Network Provider</label>
                                        <select
                                            value={momoNetwork}
                                            onChange={(e) => setMomoNetwork(e.target.value)}
                                            className="w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2.5 px-3 border bg-white"
                                        >
                                            <option value="MTN">MTN Mobile Money</option>
                                            <option value="VODAFONE">Telecel Cash (Vodafone)</option>
                                            <option value="AIRTELTIGO">AT Money (AirtelTigo)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-900 mb-1">Mobile Money Number</label>
                                        <input
                                            type="tel"
                                            required
                                            maxLength={10}
                                            placeholder="024 123 4567"
                                            value={momoNumber}
                                            onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, ''))}
                                            className="w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2.5 px-3 border"
                                        />
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2">
                                        <p className="text-sm text-amber-800">
                                            A prompt will be sent to your phone to authorize the payment of <strong>GH₵ {((details?.price || 0) + 20).toFixed(2)}</strong>. Ensure you have sufficient balance.
                                        </p>
                                    </div>
                                </>
                            )}

                            {paymentMethod === 'BANK' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-900 mb-1">Bank Name</label>
                                        <input
                                            type="text"
                                            list="bank-list"
                                            required
                                            placeholder="Type or select a bank"
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2.5 px-3 border bg-white"
                                        />
                                        <datalist id="bank-list">
                                            <option value="Absa Bank Ghana" />
                                            <option value="Access Bank" />
                                            <option value="Agricultural Development Bank (ADB)" />
                                            <option value="CalBank" />
                                            <option value="Consolidated Bank Ghana (CBG)" />
                                            <option value="Ecobank Ghana" />
                                            <option value="Fidelity Bank" />
                                            <option value="GCB Bank" />
                                            <option value="Guaranty Trust Bank (GTBank)" />
                                            <option value="Stanbic Bank" />
                                            <option value="Standard Chartered Bank" />
                                            <option value="Zenith Bank" />
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-900 mb-1">Account Number</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={15}
                                            placeholder="1234567890123"
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                            className="w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2.5 px-3 border"
                                        />
                                    </div>
                                    <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mt-2 mb-4">
                                        <h4 className="font-semibold text-sm text-stone-900 mb-2">Our Bank Details for Transfer</h4>
                                        <p className="text-sm text-stone-600 mb-1"><span className="font-medium text-stone-700">Bank:</span> FIDELITY BANK</p>
                                        <p className="text-sm text-stone-600 mb-1"><span className="font-medium text-stone-700">Account Name:</span> ANDREWS BANEWEL</p>
                                        <p className="text-sm text-stone-600 mb-1"><span className="font-medium text-stone-700">Account No:</span> 2100502720311</p>
                                        <p className="text-sm text-stone-500 italic mt-2">Mock: We will instantly verify your transfer.</p>
                                    </div>
                                </>
                            )}

                            {error && (
                                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-100">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={
                                    isProcessing ||
                                    (paymentMethod === 'CARD' && (!cardNumber || !expiry || !cvv)) ||
                                    (paymentMethod === 'MOMO' && (momoNumber.length < 10)) ||
                                    (paymentMethod === 'BANK' && (!accountNumber))
                                }
                                className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-amber-500 disabled:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-colors"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Processing Payment...
                                    </>
                                ) : (
                                    `Pay Total: GH₵ ${((details?.price || 0) + 20).toFixed(2)}`
                                )}
                            </button>

                            <p className="text-center text-xs text-stone-500 flex items-center justify-center gap-1.5 mt-4">
                                <ShieldCheck className="h-3.5 w-3.5" /> Payments are secure and encrypted.
                            </p>
                        </form>
                    </div>
                </div>

                {/* Order Summary side */}
                <div className="lg:col-span-5">
                    <div className="sticky top-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-stone-900 mb-4">Reservation Summary</h2>

                        {details && (
                            <>
                                <div className="flex items-start gap-4 mb-6 pb-6 border-b border-stone-200">
                                    <div className="rounded-xl bg-white p-3 shadow-sm border border-stone-100">
                                        <Building className="h-6 w-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-stone-900">{details.hostelName}</h3>
                                        <p className="text-sm text-stone-600 mt-1">{details.roomName}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 text-sm mb-6 pb-6 border-b border-stone-200">
                                    <div className="flex justify-between text-stone-600">
                                        <span>Academic Year</span>
                                        <span className="font-medium text-stone-900">
                                            {startDate ? `${new Date(startDate).getFullYear()}/${new Date(startDate).getFullYear() + 1}` : '2026/2027'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-stone-600">
                                        <span>Check-in</span>
                                        <span className="font-medium text-stone-900">{startDate ? new Date(startDate).toLocaleDateString() : '-'}</span>
                                    </div>
                                    <div className="flex justify-between text-stone-600">
                                        <span>Check-out</span>
                                        <span className="font-medium text-stone-900">{endDate ? new Date(endDate).toLocaleDateString() : '-'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-stone-600 text-sm">
                                        <span>Room Price (Annual)</span>
                                        <span>GH₵ {details.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-stone-600 text-sm">
                                        <span>Site Booking Fee (Pay Now)</span>
                                        <span>GH₵ 20.00</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                                    <span className="font-bold text-stone-900">Total to Pay Now</span>
                                    <span className="text-xl font-bold text-stone-900">GH₵ {((details?.price || 0) + 20).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
