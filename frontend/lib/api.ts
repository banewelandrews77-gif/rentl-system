export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export function getImageUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Use API_BASE to determine the backend domain
  let domain = 'http://localhost:8081';
  if (API_BASE.startsWith('http')) {
    domain = API_BASE.replace(/\/api\/?$/, '');
  }

  return `${domain}${cleanPath}`;
}
export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  role?: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  role: string;
  verificationStatus: string | null;
  user: AuthUser;
};

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hostelconnect_token');
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hostelconnect_token', token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hostelconnect_token');
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token: optToken, ...init } = options;
  const token = optToken ?? getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized. Please log in again.');
    }
    if (res.status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }
    let message = data?.message || res.statusText || 'Request failed';
    if (data?.errors && typeof data.errors === 'object') {
      const errorDetails = Object.values(data.errors).join(', ');
      message = `${message}: ${errorDetails}`;
    }
    throw new Error(message);
  }
  return data as T;
}

export const authApi = {
  registerCustomer: (body: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }) => api<AuthResponse>('/auth/register/customer', { method: 'POST', body: JSON.stringify(body) }),

  registerAgent: (body: {
    fullName: string;
    email: string;
    phoneNumber: string;
    agencyName?: string;
    password: string;
    confirmPassword?: string;
  }) => api<AuthResponse>('/auth/register/agent', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  verifyEmail: (body: { email: string; otp: string }) =>
    api<{ message: string }>('/auth/verify-email', { method: 'POST', body: JSON.stringify(body) }),

  forgotPassword: (body: { email: string }) =>
    api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),

  resetPassword: (body: { email: string; otp: string; newPassword: string; confirmPassword: string }) =>
    api<{ message: string }>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  me: (token: string) =>
    api<AuthResponse>('/auth/me', { token }),
};

export const agentApi = {
  uploadDocument: async (ghanaCard: File, facePhoto: File, ghanaCardNumber: string) => {
    const formData = new FormData();
    formData.append('ghanaCard', ghanaCard);
    formData.append('facePhoto', facePhoto);
    formData.append('ghanaCardNumber', ghanaCardNumber);

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/agents/profile/document`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data?.message || res.statusText || 'Request failed';
      throw new Error(message);
    }
    return data as { message: string };
  },

  getProfileMe: () =>
    api<AgentProfileResponse>('/agents/profile/me', { method: 'GET' }),
};

export const agentSubscriptionApi = {
  initialize: () =>
    api<{ authorizationUrl: string; accessCode: string; reference: string }>('/agents/subscription/initialize', { method: 'POST' }),

  verify: (reference: string) =>
    api<{ message: string }>('/agents/subscription/verify', { method: 'POST', body: JSON.stringify({ reference }) }),
};

export type AgentProfileParams = {
  id: string;
  verificationStatus: string;
  idDocumentUrl: string | null;
  ghanaCardUrl: string | null;
  ghanaCardNumber: string | null;
  facePhotoUrl: string | null;
  rejectionReason: string | null;
  submissionCount: number;
  subscriptionValidUntil: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
  }
};

export type AgentProfileResponse = {
  id: string;
  userId: string;
  verificationStatus: string;
  idDocumentUrl: string | null;
  ghanaCardUrl: string | null;
  ghanaCardNumber: string | null;
  facePhotoUrl: string | null;
  rejectionReason: string | null;
  subscriptionValidUntil: string | null;
};

export type AdminDashboardResponse = {
  totalCustomers: number;
  totalAgents: number;
  totalHostels: number;
  pendingVerifications: number;
};

export const adminApi = {
  getPendingAgents: () =>
    api<AgentProfileParams[]>('/admin/agents/pending', { method: 'GET' }),

  verifyAgent: (id: string) =>
    api<{ message: string }>(`/admin/agents/${id}/verify`, { method: 'POST' }),

  rejectAgent: (id: string, reason: string) =>
    api<{ message: string }>(`/admin/agents/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    }),

  getStats: () =>
    api<AdminDashboardResponse>('/admin/stats', { method: 'GET' }),

  getCustomers: () =>
    api<AuthUser[]>('/admin/customers', { method: 'GET' }),

  getAgents: () =>
    api<AuthUser[]>('/admin/agents', { method: 'GET' }),

  deleteUser: (id: string) =>
    api<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),

  getHostels: () =>
    api<Hostel[]>('/admin/hostels', { method: 'GET' }),

  deleteHostel: (id: string) =>
    api<{ message: string }>(`/admin/hostels/${id}`, { method: 'DELETE' }),

  updateHostel: (id: string, body: { name: string; description: string; location: string; gpsCoordinates: string }) =>
    api<Hostel>(`/admin/hostels/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
};

export type RoomType = {
  id: string;
  name: string;
  capacity: number;
  pricePerYear: number;
  availableCount: number;
  totalAvailable: number;
  imageUrl?: string;
};

export type HostelImage = {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
};

export type Hostel = {
  id: string;
  name: string;
  description: string;
  location: string;
  gpsCoordinates: string;
  schoolSlug: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'UNAVAILABLE';
  agentName: string;
  agentPhone: string;
  averageRating: number | null;
  reviewCount: number;
  roomTypes: RoomType[];
  images: HostelImage[];
};

export const agentHostelsApi = {
  create: (body: { name: string; description: string; location: string; gpsCoordinates: string; schoolSlug: string }) =>
    api<Hostel>('/agents/hostels', { method: 'POST', body: JSON.stringify(body) }),

  getMyHostels: () =>
    api<Hostel[]>('/agents/hostels', { method: 'GET' }),

  addRoomType: (hostelId: string, body: { name: string; capacity: number; pricePerYear: number; totalAvailable: number }) =>
    api<Hostel>(`/agents/hostels/${hostelId}/rooms`, { method: 'POST', body: JSON.stringify(body) }),

  uploadImage: async (hostelId: string, file: File, isPrimary: boolean) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPrimary', String(isPrimary));

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/agents/hostels/${hostelId}/images`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || res.statusText || 'Upload failed');
    }
    return data as Hostel;
  },
  
  uploadRoomImage: async (hostelId: string, roomId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/agents/hostels/${hostelId}/rooms/${roomId}/image`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || res.statusText || 'Upload failed');
    }
    return data as Hostel;
  },

  deleteImage: (hostelId: string, imageId: string) =>
    api<Hostel>(`/agents/hostels/${hostelId}/images/${imageId}`, { method: 'DELETE' }),

  updateStatus: (hostelId: string, status: string) =>
    api<Hostel>(`/agents/hostels/${hostelId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  update: (hostelId: string, body: { name: string; description: string; location: string; gpsCoordinates: string; schoolSlug: string }) =>
    api<Hostel>(`/agents/hostels/${hostelId}`, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: (hostelId: string) =>
    api<{ message: string }>(`/agents/hostels/${hostelId}`, { method: 'DELETE' }),
};

export const publicHostelsApi = {
  getAllPublished: () =>
    api<Hostel[]>('/public/hostels', { method: 'GET' }),

  getHostel: (id: string) =>
    api<Hostel>(`/public/hostels/${id}`, { method: 'GET' }),
};

export type InquiryResponse = {
  id: string;
  hostelId: string;
  hostelName: string;
  roomTypeId: string | null;
  roomTypeName: string | null;
  message: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  agentName: string | null;
  agentEmail: string | null;
  agentPhone: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
};

export const customerInquiriesApi = {
  submit: (body: { hostelId: string; roomTypeId?: string; message: string }) =>
    api<InquiryResponse>('/customers/inquiries', { method: 'POST', body: JSON.stringify(body) }),

  getMyInquiries: () =>
    api<InquiryResponse[]>('/customers/inquiries', { method: 'GET' }),
};

export const agentInquiriesApi = {
  getMyInquiries: () =>
    api<InquiryResponse[]>('/agents/inquiries', { method: 'GET' }),

  updateStatus: (inquiryId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') =>
    api<InquiryResponse>(`/agents/inquiries/${inquiryId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

export type ReviewResponse = {
  id: string;
  hostelId: string;
  hostelName: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export const reviewsApi = {
  create: (body: { hostelId: string; rating: number; comment?: string }) =>
    api<ReviewResponse>('/customers/reviews', { method: 'POST', body: JSON.stringify(body) }),

  getByHostel: (hostelId: string) =>
    api<ReviewResponse[]>(`/public/hostels/${hostelId}/reviews`, { method: 'GET' }),

  getMyReviews: () =>
    api<ReviewResponse[]>('/customers/reviews/my', { method: 'GET' }),

  getAgentReviews: () =>
    api<ReviewResponse[]>('/agents/reviews', { method: 'GET' }),

  getAllReviews: () =>
    api<ReviewResponse[]>('/admin/reviews', { method: 'GET' }),

  deleteReview: (id: string) =>
    api<{ message: string }>(`/admin/reviews/${id}`, { method: 'DELETE' }),
};


export type ReservationResponse = {
  id: string;
  hostelId: string;
  hostelName: string;
  roomTypeId: string;
  roomTypeName: string;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentReference: string | null;
  amountPaid: number;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export const reservationsApi = {
  create: (body: { hostelId: string; roomTypeId: string; startDate: string; endDate: string }) =>
    api<ReservationResponse>('/customers/reservations', { method: 'POST', body: JSON.stringify(body) }),

  getMyReservations: () =>
    api<ReservationResponse[]>('/customers/reservations', { method: 'GET' }),

  initializePayment: (reservationId: string) =>
    api<{ authorizationUrl: string; accessCode: string; reference: string }>(`/customers/reservations/${reservationId}/initialize-payment`, {
      method: 'POST',
    }),

  getAgentReservations: (hostelId: string) =>
    api<ReservationResponse[]>(`/agents/hostels/${hostelId}/reservations`, { method: 'GET' }),

  verifyPayment: (reference: string) =>
    api<{ message: string }>('/customers/reservations/verify', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    }),

  downloadInvoice: async (reservationId: string) => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    console.log(`Downloading invoice: ${API_BASE}/customers/reservations/${reservationId}/invoice`);

    const res = await fetch(`${API_BASE}/customers/reservations/${reservationId}/invoice`, {
      method: 'GET',
      headers,
    });

    if (!res.ok) {
      console.error(`Invoice download failed with status: ${res.status}`);
      let message = 'Failed to download invoice';
      try {
        const data = await res.json();
        message = data?.message || message;
      } catch (e) {
        // Fallback if not JSON
        message = res.statusText || message;
      }
      throw new Error(message);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${reservationId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

export type SupportTicketResponse = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'SUBMITTED' | 'IN_REVIEW' | 'RESOLVED';
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
};

export const supportApi = {
  submitContact: (body: { name: string; email: string; subject: string; message: string }) =>
    api<SupportTicketResponse>('/support/contact', { method: 'POST', body: JSON.stringify(body) }),

  getMyTickets: () =>
    api<SupportTicketResponse[]>('/support/tickets', { method: 'GET' }),

  adminGetTickets: () =>
    api<SupportTicketResponse[]>('/admin/support/tickets', { method: 'GET' }),

  adminRespondTicket: (id: string, body: { status: string; response: string }) =>
    api<SupportTicketResponse>(`/admin/support/tickets/${id}/respond`, { method: 'POST', body: JSON.stringify(body) }),
};
