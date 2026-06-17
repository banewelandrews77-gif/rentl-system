CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id),
    hostel_id UUID NOT NULL REFERENCES hostels(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_customer_hostel_review UNIQUE (customer_id, hostel_id)
);

CREATE INDEX idx_reviews_hostel_id ON reviews(hostel_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
