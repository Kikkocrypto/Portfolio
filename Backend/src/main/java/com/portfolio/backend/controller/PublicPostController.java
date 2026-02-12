package com.portfolio.backend.controller;

import com.portfolio.backend.controller.dto.PostPublicResponse;
import com.portfolio.backend.entity.Post;
import com.portfolio.backend.service.PostService;
import com.portfolio.backend.util.ApiErrorUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Set;

/**
 * Public endpoints for blog posts. Only posts with status PUBLISHED are returned.
 * No authentication required. Draft and archived posts are never exposed.
 */
@RestController
@RequestMapping("/api/posts")
public class PublicPostController {

    private static final Set<String> ALLOWED_LOCALES = Set.of("en", "it", "es");
    private static final int PAGE_SIZE = 10;

    private final PostService postService;

    public PublicPostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<List<Post>> list() {
        List<Post> posts = postService.findAllPublished();
        return ResponseEntity.ok(posts);
    }

    /**
     * Restituisce la lista paginata di post pubblicati per un determinato locale, con filtri opzionali:
     * - title: filtro \"contains\" sul titolo della traduzione (case-insensitive)
     * - createdFrom / createdTo: intervallo sulla data di creazione del post
     *
     * Questo endpoint NON gestisce più la ricerca per slug; uno specifico endpoint di dettaglio
     * verrà introdotto separatamente.
     */
    @GetMapping("/{locale}")
    public ResponseEntity<?> getByLocale(
            @PathVariable String locale,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String title,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdFrom,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant createdTo) {
        String normalizedLocale = locale == null ? "" : locale.trim().toLowerCase();
        if (!ALLOWED_LOCALES.contains(normalizedLocale)) {
            return ApiErrorUtil.badRequest("Locale non supportato: " + locale + ". Valori ammessi: it, en, es.");
        }
        if (page < 0) {
            page = 0;
        }
        Pageable pageable = PageRequest.of(page, PAGE_SIZE);
        Page<PostPublicResponse> result = postService.findPublishedPageByLocale(
                normalizedLocale,
                pageable,
                title,
                createdFrom,
                createdTo);
        return ResponseEntity.ok(result);
    }

    /**
     * Dettaglio di un singolo post pubblicato per locale + slug della traduzione.
     * Esempio: GET /api/posts/it/primo-articolo
     */
    @GetMapping("/{locale}/{slug}")
    public ResponseEntity<?> getByLocaleAndSlug(
            @PathVariable String locale,
            @PathVariable String slug) {
        String normalizedLocale = locale == null ? "" : locale.trim().toLowerCase();
        if (!ALLOWED_LOCALES.contains(normalizedLocale)) {
            return ApiErrorUtil.badRequest("Locale non supportato: " + locale + ". Valori ammessi: it, en, es.");
        }
        return postService.findPublishedDetailByLocaleAndSlug(normalizedLocale, slug)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ApiErrorUtil.notFound(
                        "Post non trovato per locale '" + normalizedLocale + "' e slug '" + slug + "'"));
    }
}
