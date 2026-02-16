package com.portfolio.backend.repository;

import com.portfolio.backend.entity.AuditLog;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specifications for filtering audit logs (action, actor, date range).
 */
public final class AuditLogSpecification {

    private AuditLogSpecification() {
    }

    public static Specification<AuditLog> withFilters(
            String action,
            String actor,
            Instant dateFrom,
            Instant dateTo) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("action")), action.trim().toUpperCase()));
            }
            if (actor != null && !actor.isBlank()) {
                String pattern = "%" + actor.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("actor")), pattern));
            }
            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), dateTo));
            }
            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
