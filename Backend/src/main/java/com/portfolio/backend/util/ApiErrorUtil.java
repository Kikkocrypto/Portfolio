package com.portfolio.backend.util;

import com.portfolio.backend.controller.dto.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Utility per costruire risposte di errore in formato {@link ApiError}
 * da usare nei controller (es. 404, 409).
 */
public final class ApiErrorUtil {

    private ApiErrorUtil() {
    }

    public static ResponseEntity<ApiError> badRequest(String details) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiError(HttpStatus.BAD_REQUEST.value(), details));
    }

    public static ResponseEntity<ApiError> notFound(String details) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ApiError(HttpStatus.NOT_FOUND.value(), details));
    }

    public static ResponseEntity<ApiError> conflict(String details) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ApiError(HttpStatus.CONFLICT.value(), details));
    }

    public static ResponseEntity<ApiError> unauthorized(String details) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiError(HttpStatus.UNAUTHORIZED.value(), details));
    }

    public static ResponseEntity<ApiError> of(HttpStatus status, String details) {
        return ResponseEntity
                .status(status)
                .body(new ApiError(status.value(), details));
    }
}
