-- =============================================
-- V21: Create Important Docs Table
-- =============================================

CREATE TABLE IF NOT EXISTS important_docs (
    id              BIGSERIAL       PRIMARY KEY,
    title           VARCHAR(255)    NOT NULL,
    description     TEXT,
    url             VARCHAR(1000)   NOT NULL,
    doc_type        VARCHAR(20)     NOT NULL DEFAULT 'LINK',
    category        VARCHAR(100),
    visible         BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_important_docs_visible ON important_docs(visible);
CREATE INDEX IF NOT EXISTS idx_important_docs_created_at ON important_docs(created_at DESC);
