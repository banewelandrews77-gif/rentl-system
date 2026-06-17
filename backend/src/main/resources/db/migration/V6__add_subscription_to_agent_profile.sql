-- Add subscription validity period to agent_profiles
ALTER TABLE agent_profiles
ADD COLUMN subscription_valid_until TIMESTAMP;
