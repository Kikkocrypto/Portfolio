package com.portfolio.backend.exception;

/**
 * Thrown when an audit log with the given ID is not found.
 * Mapped to 404 with a generic message to avoid leaking resource existence (IDOR-safe).
 */
public class AuditLogNotFoundException extends RuntimeException {

    public AuditLogNotFoundException() {
        super();
    }
}
