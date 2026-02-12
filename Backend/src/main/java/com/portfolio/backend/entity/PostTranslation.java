package com.portfolio.backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;

@Entity
@Table(name = "post_translations",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = { "post_id", "locale" }),
           @UniqueConstraint(columnNames = "slug")
       })
@Getter
@Setter
public class PostTranslation {

    @Id
    @GeneratedValue(generator = "uuid-string")
    @GenericGenerator(name = "uuid-string", strategy = "uuid2")
    @Column(length = 36)
    private String id;

    /** FK come stringa per evitare BLOB/hex con SQLite. Impostare alla creazione con post.getId().toString(). */
    @Column(name = "post_id", nullable = false, length = 36)
    private String postId;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false, insertable = false, updatable = false)
    private Post post;

    @NotBlank
    @Pattern(regexp = "^(en|it|es)$")
    @Column(nullable = false, length = 5)
    private String locale;

    @NotBlank
    @Size(max = 255)
    @Pattern(regexp = "^[a-zA-Z\\-]+$", message = "Lo slug non deve contenere numeri.")
    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false, length = 500)
    private String title;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
}
