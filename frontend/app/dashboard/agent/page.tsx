'use client';

import { useAuth } from '@/context/AuthContext';
import { agentApi, agentHostelsApi, agentInquiriesApi, Hostel, InquiryResponse } from '@/lib/api';
import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserCheck, 
  LayoutDashboard, 
  MessageSquare, 
  Camera, 
  Upload, 
  ArrowRight, 
  ShieldCheck,
  Building2,
  TrendingUp,
  Inbox
} from 'lucide-react';

export default function AgentDashboardPage() {
  const { verificationStatus } = useAuth();
  const isVerified = verificationStatus === 'VERIFIED';
  
  const [ghanaCardNumber, setGhanaCardNumber] = useState('');
  const [ghanaCard, setGhanaCard] = useState<File | null>(null);
  const [facePhoto, setFacePhoto] = useState<File | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dashboard Metrics State
  const [statsLoading, setStatsLoading] = useState(true);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);

  useEffect(() => {
    if (isVerified) {
      Promise.all([
        agentHostelsApi.getMyHostels().catch(() => []),
        agentInquiriesApi.getMyInquiries().catch(() => [])
      ]).then(([hostelsData, inquiriesData]) => {
        setHostels(hostelsData);
        setInquiries(inquiriesData);
        setStatsLoading(false);
      });
    }
  }, [isVerified]);

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast.error("Camera access failed or denied.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleGhanaCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setGhanaCard(e.target.files[0]);
    }
  };

  const handleFacePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFacePhoto(e.target.files[0]);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "live_face_scan.jpg", { type: "image/jpeg" });
            setFacePhoto(file);
            stopCamera();
          }
        }, "image/jpeg", 0.95);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ghanaCard || !facePhoto || !ghanaCardNumber.trim()) {
      setError('Please provide all required details.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await agentApi.uploadDocument(ghanaCard, facePhoto, ghanaCardNumber);
      setSuccess(res.message || 'Identity verified successfully');
      setGhanaCard(null);
      setFacePhoto(null);
      setGhanaCardNumber('');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit details');
    } finally {
      setLoading(false);
    }
  };

  // Calculations for metrics
  const totalRooms = hostels.reduce((acc, hostel) => acc + hostel.roomTypes.reduce((sum, rt) => sum + rt.totalAvailable, 0), 0);
  const availableRooms = hostels.reduce((acc, hostel) => acc + hostel.roomTypes.reduce((sum, rt) => sum + rt.availableCount, 0), 0);
  const pendingInquiries = inquiries.filter(i => i.status === 'PENDING').length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 w-full">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-stone-950">
              Overview
            </h1>
            <p className="mt-2 text-stone-500">
              Here's what's happening with your properties today.
            </p>
          </div>
          {!isVerified && (
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border shadow-sm ${
              verificationStatus === 'PENDING'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-stone-50 text-stone-600 border-stone-200'
            }`}>
              {verificationStatus === 'PENDING' && <Clock className="h-3.5 w-3.5 animate-pulse" />}
              {(!verificationStatus || verificationStatus === 'UNVERIFIED') && <AlertCircle className="h-3.5 w-3.5" />}
              {verificationStatus || 'UNVERIFIED'}
            </div>
          )}
        </div>
      </header>

      {(verificationStatus === 'UNVERIFIED' || verificationStatus === 'REJECTED') && (
        <div className="max-w-4xl mx-auto">
          <section className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden mb-8">
            <div className="bg-stone-950 px-8 py-10 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <ShieldCheck className="h-7 w-7 text-emerald-400" />
                  Identity Verification Required
                </h2>
                <p className="mt-2 text-stone-400 max-w-xl text-balance">
                  To maintain the integrity of our platform, we require all agents to complete a one-time identity verification before accessing dashboard features.
                </p>
              </div>
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-900/20 blur-3xl" />
            </div>

            <form onSubmit={handleUpload} className="p-8 md:p-12">
              {verificationStatus === 'REJECTED' && (
                <div className="mb-10 flex items-start gap-4 rounded-2xl bg-rose-50 p-6 border border-rose-100">
                  <AlertCircle className="h-6 w-6 text-rose-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-rose-900">Verification Rejected</h3>
                    <p className="mt-1 text-sm text-rose-700">Please provide a clearer facial scan and ensure your Ghana Card details match perfectly.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-12">
                <div className="space-y-3">
                  <label className="text-sm font-black uppercase tracking-widest text-stone-900">Ghana Card Number</label>
                  <input
                    type="text"
                    placeholder="e.g. GHA-123456789-0"
                    value={ghanaCardNumber}
                    onChange={(e) => setGhanaCardNumber(e.target.value)}
                    className="block w-full rounded-2xl border-stone-200 py-4 px-6 text-stone-900 shadow-sm focus:border-stone-900 focus:ring-stone-900 sm:text-base transition-all bg-stone-50/50"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
                        <Camera className="h-4 w-4" /> Facial Scan
                      </label>
                      <p className="text-xs text-stone-500 mt-1">Take a clear picture of your face for biometric matching.</p>
                    </div>
                    
                    <div className="relative group">
                      {isCameraOpen ? (
                        <div className="rounded-3xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center border-4 border-stone-900 shadow-2xl">
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                          <canvas ref={canvasRef} className="hidden" />
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                            <button type="button" onClick={capturePhoto} className="bg-white text-stone-950 font-bold px-6 py-2.5 rounded-full hover:bg-stone-100 shadow-lg">Capture</button>
                            <button type="button" onClick={stopCamera} className="bg-white/20 backdrop-blur-md text-white font-bold px-6 py-2.5 rounded-full hover:bg-white/30 border border-white/20">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => !facePhoto && startCamera()}
                          className={`flex flex-col items-center justify-center aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
                            facePhoto 
                              ? 'border-emerald-500 bg-emerald-50/30' 
                              : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-400 group'
                          }`}
                        >
                          {facePhoto ? (
                            <div className="text-center p-6">
                              <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                              </div>
                              <p className="text-sm font-bold text-emerald-900 truncate max-w-[200px]">{facePhoto.name}</p>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setFacePhoto(null); startCamera(); }} className="mt-4 text-xs font-bold text-stone-500 underline hover:text-stone-950">Retake Photo</button>
                            </div>
                          ) : (
                            <div className="text-center p-6">
                              <div className="h-16 w-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Camera className="h-8 w-8 text-stone-400 group-hover:text-stone-600" />
                              </div>
                              <p className="text-sm font-bold text-stone-900">Start Face Scan</p>
                              <p className="text-xs text-stone-500 mt-1">or click to upload photo</p>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFacePhotoChange}
                                className="hidden" 
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
                        <Upload className="h-4 w-4" /> ID Document
                      </label>
                      <p className="text-xs text-stone-500 mt-1">Upload a high-resolution scan of your Ghana Card.</p>
                    </div>
                    
                    <label className={`flex flex-col items-center justify-center aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer ${
                      ghanaCard 
                        ? 'border-emerald-500 bg-emerald-50/30' 
                        : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-400 group'
                    }`}>
                      {ghanaCard ? (
                        <div className="text-center p-6">
                          <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                          </div>
                          <p className="text-sm font-bold text-emerald-900 truncate max-w-[200px]">{ghanaCard.name}</p>
                          <span className="mt-4 inline-block text-xs font-bold text-stone-500 underline hover:text-stone-950">Replace File</span>
                        </div>
                      ) : (
                        <div className="text-center p-6">
                          <div className="h-16 w-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="h-8 w-8 text-stone-400 group-hover:text-stone-600" />
                          </div>
                          <p className="text-sm font-bold text-stone-900">Upload ID Card</p>
                          <p className="text-xs text-stone-500 mt-1">PDF, JPG, or PNG (Max 10MB)</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleGhanaCardChange}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {error && <p className="mt-8 text-sm font-bold text-rose-600 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error}</p>}
              {success && <p className="mt-8 text-sm font-bold text-emerald-600 flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {success}</p>}

              <div className="mt-12 pt-8 border-t border-stone-100">
                <button
                  type="submit"
                  disabled={!ghanaCard || !facePhoto || !ghanaCardNumber || loading}
                  className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-stone-950 px-10 py-5 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed shadow-xl"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? 'Processing Identity...' : 'Submit for Verification'}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {verificationStatus === 'PENDING' && (
        <div className="max-w-4xl mx-auto">
          <section className="bg-white rounded-3xl shadow-sm border border-stone-200 p-12 text-center">
            <div className="h-24 w-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Clock className="h-12 w-12 text-amber-600 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-stone-950">Verification in Progress</h2>
            <p className="mt-4 text-stone-600 max-w-xl mx-auto text-lg">
              Our specialized team is currently reviewing your application. We prioritize security and will cross-reference your biometric data with your legal ID.
            </p>
            <div className="mt-10 inline-flex items-center gap-3 px-6 py-3 bg-stone-50 rounded-full text-sm font-bold text-stone-600 border border-stone-200">
              Estimated wait time: 24–48 hours
            </div>
          </section>
        </div>
      )}

      {isVerified && (
        <>
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-pulse">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-3xl border border-stone-200 h-32"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total</span>
                  </div>
                  <h3 className="text-3xl font-black text-stone-950">{hostels.length}</h3>
                  <p className="text-sm font-medium text-stone-500 mt-1">Properties Listed</p>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-0 group-hover:opacity-5 transition-opacity">
                  <Building2 className="h-32 w-32" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Available</span>
                  </div>
                  <h3 className="text-3xl font-black text-stone-950">{availableRooms} <span className="text-lg text-stone-400 font-medium">/ {totalRooms}</span></h3>
                  <p className="text-sm font-medium text-stone-500 mt-1">Total Rooms</p>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-0 group-hover:opacity-5 transition-opacity">
                  <TrendingUp className="h-32 w-32" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Inquiries</span>
                  </div>
                  <h3 className="text-3xl font-black text-stone-950">{inquiries.length}</h3>
                  <p className="text-sm font-medium text-stone-500 mt-1">Total Inquiries</p>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-0 group-hover:opacity-5 transition-opacity">
                  <Inbox className="h-32 w-32" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Action Required</span>
                  </div>
                  <h3 className="text-3xl font-black text-stone-950">{pendingInquiries}</h3>
                  <p className="text-sm font-medium text-stone-500 mt-1">Pending Inquiries</p>
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-0 group-hover:opacity-5 transition-opacity">
                  <MessageSquare className="h-32 w-32" />
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">Recent Properties</h3>
                <Link href="/dashboard/agent/hostels" className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700">View All</Link>
              </div>
              <div className="p-6 flex-1">
                {hostels.length === 0 && !statsLoading ? (
                  <div className="text-center py-10">
                    <div className="h-12 w-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building2 className="h-5 w-5 text-stone-400" />
                    </div>
                    <p className="text-sm font-medium text-stone-500">No properties listed yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hostels.slice(0, 3).map(hostel => (
                      <div key={hostel.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 transition-colors">
                        <div className="h-12 w-12 rounded-xl bg-stone-100 flex-shrink-0 flex items-center justify-center border border-stone-200">
                          <Building2 className="h-5 w-5 text-stone-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-stone-900 truncate">{hostel.name}</h4>
                          <p className="text-xs text-stone-500 truncate">{hostel.location}</p>
                        </div>
                        <div className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                          hostel.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-stone-50 text-stone-600 border-stone-200'
                        }`}>
                          {hostel.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">Recent Inquiries</h3>
                <Link href="/dashboard/agent/inquiries" className="text-xs font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700">View All</Link>
              </div>
              <div className="p-6 flex-1">
                {inquiries.length === 0 && !statsLoading ? (
                  <div className="text-center py-10">
                    <div className="h-12 w-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="h-5 w-5 text-stone-400" />
                    </div>
                    <p className="text-sm font-medium text-stone-500">No recent inquiries.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.slice(0, 3).map(inquiry => (
                      <div key={inquiry.id} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-stone-50 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex-shrink-0 flex items-center justify-center border border-indigo-100">
                          <UserCheck className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-bold text-stone-900 truncate">{inquiry.customerName || 'Guest'}</h4>
                            <span className="text-[10px] text-stone-400 flex-shrink-0">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs font-medium text-stone-500 truncate">{inquiry.hostelName} {inquiry.roomTypeName ? `(${inquiry.roomTypeName})` : ''}</p>
                          <p className="text-xs text-stone-600 mt-1 line-clamp-2">{inquiry.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
