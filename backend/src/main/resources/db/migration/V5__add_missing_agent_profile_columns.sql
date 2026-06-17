-- HostelConnect GH - Add missing columns to agent_profiles
-- Run with Flyway

ALTER TABLE agent_profiles
ADD COLUMN id_document_url VARCHAR(255),
ADD COLUMN rejection_reason TEXT;
