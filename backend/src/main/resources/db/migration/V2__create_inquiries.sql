-- HostelConnect GH - Phase 5: Customer Inquiries
-- Run with Flyway

CREATE TYPE inquiry_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    room_type_id UUID REFERENCES room_types(id) ON DELETE SET NULL,
    message TEXT,
    status inquiry_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inquiries_customer_id ON inquiries(customer_id);
CREATE INDEX idx_inquiries_hostel_id ON inquiries(hostel_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);
