package com.portfolio.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "posts", uniqueConstraints = @UniqueConstraint(columnNames = "slug"))
@Getter
@Setter
public class Post {

    @Id
    @GeneratedValue(generator = "uuid-string")
    @GenericGenerator(name = "uuid-string", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    @NotBlank
    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z\\-]+$", message = "Lo slug non deve contenere numeri.")
    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @NotBlank
    @Pattern(regexp = "^(?i)(published|draft|archived)$")
    @Column(nullable = false, length = 20)
    private String status = "draft";

    @JsonManagedReference
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostTranslation> translations = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
