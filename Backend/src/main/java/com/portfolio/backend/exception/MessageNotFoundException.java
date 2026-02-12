package com.portfolio.backend.exception;

/**
 * Thrown when a contact message (by ID) is not found.
 * Mapped to 404 with a generic message to avoid leaking resource existence.
 */
public class MessageNotFoundException extends RuntimeException {

    public MessageNotFoundException() {
        super();
    }
}
