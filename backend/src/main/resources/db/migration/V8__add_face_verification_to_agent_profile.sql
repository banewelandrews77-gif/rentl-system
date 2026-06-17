-- HostelConnect GH - Replace Student ID with Ghana Card Number and Face Scan
-- Run with Flyway

ALTER TABLE agent_profiles
ADD COLUMN ghana_card_number VARCHAR(100),
ADD COLUMN face_photo_url VARCHAR(255);

ALTER TABLE agent_profiles
DROP COLUMN student_id_url;
