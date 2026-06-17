-- HostelConnect GH - Add Ghana Card and Student ID columns to agent_profiles
-- Run with Flyway

ALTER TABLE agent_profiles
ADD COLUMN ghana_card_url VARCHAR(255),
ADD COLUMN student_id_url VARCHAR(255);
