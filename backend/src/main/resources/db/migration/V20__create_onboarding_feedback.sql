CREATE TABLE onboarding_feedback (
    id BIGSERIAL PRIMARY KEY,
    resident_id BIGINT NOT NULL REFERENCES residents(id),
    journey_delay_faced BOOLEAN NOT NULL,
    journey_delay_comment TEXT,
    doctor_wait_faced BOOLEAN NOT NULL,
    doctor_wait_comment TEXT,
    floor_incharge_issue BOOLEAN NOT NULL,
    floor_incharge_comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_resident_onboarding_feedback UNIQUE (resident_id)
);

ALTER TABLE ai_settings ADD COLUMN onboarding_feedback_days INTEGER NOT NULL DEFAULT 2;
