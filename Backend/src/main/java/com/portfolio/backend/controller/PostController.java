package com.portfolio.backend.controller;

import com.portfolio.backend.controller.dto.CreatePostRequest;
import com.portfolio.backend.controller.dto.CreatePostTranslationRequest;
import com.portfolio.backend.controller.dto.PatchPostRequest;
import com.portfolio.backend.controller.dto.PatchTranslationRequest;
import com.portfolio.backend.controller.dto.UpdatePostRequest;
import com.portfolio.backend.entity.Post;
import com.portfolio.backend.entity.PostTranslation;
import com.portfolio.backend.service.PostService;
import com.portfolio.backend.util.ApiErrorUtil;
import com.portfolio.backend.util.SlugUtil;
import com.portfolio.backend.util.XssSanitizer;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<Page<Post>> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String title,
            @PageableDefault(size = 100, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String statusFilter = (status != null && !status.isBlank()) ? normalizeStatus(status) : null;
        Page<Post> page = postService.findAllWithTranslationsForAdmin(statusFilter, title, pageable);
        return ResponseEntity.ok(page);
    }

    // Dettaglio post (slug, status, traduzioni)
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        Optional<Post> opt = postService.findByIdWithTranslations(id);
        if (opt.isPresent()) {
            return ResponseEntity.ok(opt.get());
        }
        return ApiErrorUtil.notFound("Post non trovato con id: " + id);
    }

    // Crea post. Slug: da titolo prima traduzione se presenti, altrimenti da request. Slug traduzioni: da titolo se non fornito.
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreatePostRequest request) {
        String status = normalizeStatus(request.getStatus());
        boolean hasTranslations = request.getTranslations() != null && !request.getTranslations().isEmpty();
        String slug;
        if (hasTranslations) {
            slug = SlugUtil.slugify(request.getTranslations().get(0).getTitle());
            if (slug.isBlank()) {
                return ApiErrorUtil.badRequest("Impossibile generare slug dal titolo della prima traduzione.");
            }
        } else {
            slug = normalizeSlug(request.getSlug());
            if (slug.isBlank()) {
                return ApiErrorUtil.badRequest("Slug obbligatorio quando non ci sono traduzioni.");
            }
        }
        if (postService.findBySlug(slug).isPresent()) {
            return ApiErrorUtil.conflict("Slug già in uso: " + slug);
        }
        Post post = new Post();
        post.setSlug(slug);
        post.setStatus(status);
        Post saved = postService.save(post);
        if (hasTranslations) {
            for (CreatePostTranslationRequest tr : request.getTranslations()) {
                String trSlug = resolveTranslationSlug(tr.getSlug(), tr.getTitle());
                if (trSlug.isBlank()) trSlug = tr.getLocale();
                trSlug = ensureTranslationSlugUnique(trSlug, tr.getLocale());
                PostTranslation t = new PostTranslation();
                t.setPostId(saved.getId());
                t.setPost(saved);
                t.setLocale(tr.getLocale());
                t.setSlug(trSlug);
                t.setTitle(XssSanitizer.stripHtml(tr.getTitle()));
                t.setContent(XssSanitizer.stripHtml(tr.getContent()));
                postService.saveTranslation(t);
            }
        }
        // Ricarica il post con traduzioni (JOIN FETCH) così la risposta include le traduzioni senza LazyInitializationException
        Post postWithTranslations = postService.findByIdWithTranslations(saved.getId()).orElse(saved);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("success", true, "post", postWithTranslations));
    }
    // Elimina post e relative traduzioni.
    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    @Transactional
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (postService.findById(id).isEmpty()) {
            return ApiErrorUtil.notFound("Post non trovato con id: " + id);
        }
        postService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Aggiorna post. Slug: da titolo prima traduzione se presenti, altrimenti da request. Slug traduzioni: da titolo se non fornito.
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @Valid @RequestBody UpdatePostRequest request) {
        Optional<Post> existing = postService.findByIdWithTranslations(id);
        if (existing.isEmpty()) {
            return ApiErrorUtil.notFound("Post non trovato con id: " + id);
        }
        boolean hasTranslations = request.getTranslations() != null && !request.getTranslations().isEmpty();
        String slug = hasTranslations && request.getTranslations().get(0).getTitle() != null
                ? SlugUtil.slugify(request.getTranslations().get(0).getTitle())
                : normalizeSlug(request.getSlug());
        if (slug.isBlank()) slug = normalizeSlug(request.getSlug());
        String status = normalizeStatus(request.getStatus());
        if (postService.findBySlug(slug)
                .filter(p -> !p.getId().equals(id)).isPresent()) {
            return ApiErrorUtil.conflict("Slug già in uso: " + slug);
        }
        Post toUpdate = existing.get();
        toUpdate.setSlug(slug);
        toUpdate.setStatus(status);
        if (request.getTranslations() != null) {
            Set<String> requestLocales = request.getTranslations().stream()
                    .map(CreatePostTranslationRequest::getLocale)
                    .collect(Collectors.toSet());
            // Rimuovi traduzioni il cui locale non è più nella request (orphanRemoval le elimina)
            List<PostTranslation> toRemove = new ArrayList<>();
            for (PostTranslation t : toUpdate.getTranslations()) {
                if (!requestLocales.contains(t.getLocale())) {
                    toRemove.add(t);
                }
            }
            toRemove.forEach(toUpdate.getTranslations()::remove);
            // Per ogni traduzione nella request: aggiorna se esiste (stesso locale), altrimenti crea nuova
            for (CreatePostTranslationRequest tr : request.getTranslations()) {
                String tSlug = resolveTranslationSlug(tr.getSlug(), tr.getTitle());
                if (tSlug.isBlank()) tSlug = tr.getLocale();
                Optional<PostTranslation> existingTr = toUpdate.getTranslations().stream()
                        .filter(t -> tr.getLocale().equals(t.getLocale()))
                        .findFirst();
                if (existingTr.isPresent()) {
                    PostTranslation t = existingTr.get();
                    t.setSlug(ensureTranslationSlugUnique(tSlug, tr.getLocale(), t.getId()));
                    t.setTitle(XssSanitizer.stripHtml(tr.getTitle()));
                    t.setContent(XssSanitizer.stripHtml(tr.getContent()));
                } else {
                    PostTranslation t = new PostTranslation();
                    t.setPostId(id);
                    t.setPost(toUpdate);
                    t.setLocale(tr.getLocale());
                    t.setSlug(ensureTranslationSlugUnique(tSlug, tr.getLocale()));
                    t.setTitle(XssSanitizer.stripHtml(tr.getTitle()));
                    t.setContent(XssSanitizer.stripHtml(tr.getContent()));
                    toUpdate.getTranslations().add(t);
                }
            }
        }
        Post updated = postService.save(toUpdate);
        return ResponseEntity.ok(postService.findByIdWithTranslations(updated.getId()).orElse(updated));
    }

    // Aggiorna solo status e/o slug del post. Per modificare una traduzione usa PATCH /translations/{translationId}.
    @PatchMapping("/{id}")
    @Transactional
    public ResponseEntity<?> patchPost(@PathVariable String id, @Valid @RequestBody PatchPostRequest request) {
        if (request == null) {
            return ApiErrorUtil.badRequest("Body obbligatorio: invia almeno 'status' e/o 'slug'.");
        }
        boolean updateStatus = request.getStatus() != null && !request.getStatus().isBlank();
        boolean updateSlug = request.getSlug() != null && !request.getSlug().isBlank();
        if (!updateStatus && !updateSlug) {
            return ApiErrorUtil.badRequest("Invia almeno uno tra 'status' e 'slug'.");
        }
        if (postService.findById(id).isEmpty()) {
            return ApiErrorUtil.notFound("Post non trovato con id: " + id);
        }
        if (updateStatus) {
            String statusNorm = normalizeStatus(request.getStatus());
            if (!List.of("published", "draft", "archived").contains(statusNorm)) {
                return ApiErrorUtil.badRequest("Il campo 'status' deve essere: published, draft o archived.");
            }
        }
        if (updateSlug) {
            String slugNorm = normalizeSlug(request.getSlug());
            if (slugNorm.isBlank()) {
                return ApiErrorUtil.badRequest("Lo slug non può essere vuoto.");
            }
            if (postService.existsBySlugAndIdNot(slugNorm, id)) {
                return ApiErrorUtil.conflict("Slug già in uso: " + slugNorm);
            }
        }
        // Solo status: UPDATE diretto; altrimenti carica post e aggiorna status e/o slug
        if (updateStatus && !updateSlug) {
            postService.updateStatusById(id, normalizeStatus(request.getStatus()));
        } else {
            Post post = postService.findById(id).orElseThrow();
            if (updateStatus) post.setStatus(normalizeStatus(request.getStatus()));
            if (updateSlug) post.setSlug(normalizeSlug(request.getSlug()));
            postService.save(post);
        }
        Optional<Post> updated = postService.findByIdWithTranslations(id);
        if (updated.isPresent()) {
            return ResponseEntity.ok(updated.get());
        }
        return ApiErrorUtil.notFound("Post non trovato con id: " + id);
    }

    // Modifica una singola traduzione (title, content, slug). Il locale non è modificabile.
    @PatchMapping("/translations/{translationId}")
    @Transactional
    public ResponseEntity<?> patchTranslation(@PathVariable String translationId,
                                             @Valid @RequestBody PatchTranslationRequest request) {
        if (request == null) {
            return ApiErrorUtil.badRequest("Body obbligatorio: invia 'title' e 'content'.");
        }
        Optional<PostTranslation> opt = postService.findTranslationById(translationId);
        if (opt.isEmpty()) {
            return ApiErrorUtil.notFound("Traduzione non trovata con id: " + translationId);
        }
        PostTranslation t = opt.get();
        String locale = t.getLocale();
        String trSlug = resolveTranslationSlug(request.getSlug(), request.getTitle());
        if (trSlug.isBlank()) trSlug = locale;
        trSlug = ensureTranslationSlugUnique(trSlug, locale, translationId);
        t.setSlug(trSlug);
        t.setTitle(XssSanitizer.stripHtml(request.getTitle()));
        t.setContent(XssSanitizer.stripHtml(request.getContent()));
        postService.saveTranslation(t);
        return ResponseEntity.ok(t);
    }

    private static String normalizeSlug(String slug) {
        return slug == null ? "" : slug.trim().toLowerCase();
    }

    private static String normalizeStatus(String status) {
        return status == null ? "draft" : status.trim().toLowerCase();
    }

    /** Slug traduzione: da request se valorizzato, altrimenti generato dal titolo. */
    private static String resolveTranslationSlug(String requestSlug, String title) {
        if (requestSlug != null && !requestSlug.isBlank()) {
            return normalizeSlug(requestSlug);
        }
        return SlugUtil.slugify(title);
    }

    /** Se lo slug è già usato (da un'altra traduzione), aggiunge "-" + locale (e eventualmente suffisso) fino a univocità. */
    private String ensureTranslationSlugUnique(String slug, String locale) {
        return ensureTranslationSlugUnique(slug, locale, null);
    }

    /** Come sopra, ma esclude la traduzione con id {@code excludeTranslationId} (per aggiornamento senza cambiare slug). */
    private String ensureTranslationSlugUnique(String slug, String locale, String excludeTranslationId) {
        String candidate = slug;
        int n = 0;
        while (true) {
            Optional<PostTranslation> opt = postService.findTranslationBySlug(candidate);
            if (opt.isEmpty() || (excludeTranslationId != null && opt.get().getId().equals(excludeTranslationId))) {
                return candidate;
            }
            candidate = n == 0 ? slug + "-" + locale : slug + "-" + locale + "-" + n;
            n++;
        }
    }
}
