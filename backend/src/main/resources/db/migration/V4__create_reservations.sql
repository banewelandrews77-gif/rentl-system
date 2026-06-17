CREATE TABLE reservations (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id),
    hostel_id UUID NOT NULL REFERENCES hostels(id),
    room_type_id UUID NOT NULL REFERENCES room_types(id),
    status VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    amount_paid DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_customer_id ON reservations(customer_id);
CREATE INDEX idx_reservations_hostel_id ON reservations(hostel_id);
