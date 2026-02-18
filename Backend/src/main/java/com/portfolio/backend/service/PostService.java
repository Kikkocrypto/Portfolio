package com.portfolio.backend.service;

import com.portfolio.backend.controller.dto.PostPublicResponse;
import com.portfolio.backend.entity.Post;
import com.portfolio.backend.entity.PostTranslation;
import com.portfolio.backend.repository.PostRepository;
import com.portfolio.backend.repository.PostTranslationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostTranslationRepository postTranslationRepository;

    public PostService(PostRepository postRepository,
                       PostTranslationRepository postTranslationRepository) {
        this.postRepository = postRepository;
        this.postTranslationRepository = postTranslationRepository;
    }

    @Transactional(readOnly = true)
    public List<Post> findAll() {
        return postRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Post> findAllWithTranslations() {
        return postRepository.findAllWithTranslations();
    }

    @Transactional(readOnly = true)
    public Page<Post> findAllWithTranslations(Pageable pageable) {
        return findAllWithTranslationsForAdmin(null, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Post> findAllWithTranslationsByStatus(String status, Pageable pageable) {
        return findAllWithTranslationsForAdmin(status, null, pageable);
    }

    /**
     * Lista admin con ordinamento: prima published, poi per createdAt desc; filtri opzionali status e ricerca per titolo.
     */
    @Transactional(readOnly = true)
    public Page<Post> findAllWithTranslationsForAdmin(String status, String titleSearch, Pageable pageable) {
        // "" invece di null per titleSearch evita binding bytea su PostgreSQL (lower(bytea))
        String normalizedTitle = (titleSearch != null && !titleSearch.isBlank()) ? titleSearch.trim() : "";
        String normalizedStatus = (status != null && !status.isBlank()) ? status.trim() : null;
        Page<Post> page = postRepository.findForAdminOrderByPublishedFirst(normalizedTitle, normalizedStatus, pageable);
        if (page.getContent().isEmpty()) return page;
        List<String> ids = page.getContent().stream().map(Post::getId).toList();
        List<Post> withTrans = postRepository.findByIdInOrderByCreatedAtDesc(ids);
        Map<String, Integer> order = new java.util.HashMap<>();
        for (int i = 0; i < ids.size(); i++) order.put(ids.get(i), i);
        withTrans.sort(Comparator.comparingInt(p -> order.getOrDefault(p.getId(), Integer.MAX_VALUE)));
        return new PageImpl<>(withTrans, page.getPageable(), page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Optional<Post> findById(String id) {
        return postRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Post> findByIdWithTranslations(String id) {
        return postRepository.findByIdWithTranslations(id);
    }

    @Transactional(readOnly = true)
    public Optional<Post> findBySlug(String slug) {
        return postRepository.findBySlug(slug);
    }

    @Transactional(readOnly = true)
    public boolean existsBySlugAndIdNot(String slug, String id) {
        return postRepository.existsBySlugAndIdNot(slug, id);
    }

    @Transactional(readOnly = true)
    public List<Post> findAllPublished() {
        // Carica anche le traduzioni per evitare LazyInitializationException in serializzazione
        return postRepository.findByStatusWithTranslationsOrderByCreatedAtDesc("published");
    }

    @Transactional(readOnly = true)
    public Optional<Post> findBySlugPublished(String slug) {
        return postRepository.findBySlugAndStatus(slug, "published");
    }

    /**
     * Lista paginata di post pubblicati per locale specifico con filtri opzionali:
     * - titleSearch: contiene nel titolo della traduzione (case-insensitive)
     * - createdFrom / createdTo: intervallo sulla data di creazione
     */
    @Transactional(readOnly = true)
    public Page<PostPublicResponse> findPublishedPageByLocale(
            String locale,
            Pageable pageable,
            String titleSearch,
            Instant createdFrom,
            Instant createdTo) {
        // Passare "" invece di null evita che PostgreSQL bindi il parametro come bytea (errore lower(bytea))
        String normalizedTitle = isTitleSearchPresent(titleSearch) ? titleSearch.trim() : "";
        Page<Post> page = postRepository.findPublishedByLocaleWithFilters(
                "published",
                locale,
                normalizedTitle,
                createdFrom,
                createdTo,
                pageable);
        List<Post> posts = page.getContent();
        if (posts.isEmpty()) {
            return new PageImpl<>(List.of(), page.getPageable(), page.getTotalElements());
        }
        // Mappatura delle traduzioni per ogni post
        List<String> postIds = posts.stream().map(Post::getId).toList();
        List<PostTranslation> translations = postTranslationRepository.findByPostIdInAndLocale(postIds, locale);
        Map<String, PostTranslation> translationByPostId = translations.stream()
                .collect(Collectors.toMap(t -> t.getPost().getId(), t -> t));
        List<PostPublicResponse> content = posts.stream()
                .map(p -> toPublicResponse(p, translationByPostId.get(p.getId())))
                .toList();
        return new PageImpl<>(content, page.getPageable(), page.getTotalElements());
    }

    private static boolean isTitleSearchPresent(String titleSearch) {
        return titleSearch != null && !titleSearch.isBlank();
    }

    private static PostPublicResponse toPublicResponse(Post post, PostTranslation translation) {
        if (translation == null) return null;
        return PostPublicResponse.builder()
                .id(post.getId())
                .slug(translation.getSlug())
                .title(translation.getTitle())
                .content(translation.getContent())
                .locale(translation.getLocale())
                .createdAt(post.getCreatedAt())
                .build();
    }

    @Transactional
    public Post save(Post post) {
        return postRepository.save(post);
    }

    /** Aggiorna solo lo status del post (evita di caricare l'entità e la collezione lazy). */
    @Transactional
    public int updateStatusById(String id, String status) {
        return postRepository.updateStatusById(id, status);
    }

    @Transactional
    public void deleteById(String id) {
        postTranslationRepository.deleteByPostId(id);
        postRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<PostTranslation> findTranslationsByPostId(String postId) {
        if (postId == null) return List.of();
        return postTranslationRepository.findByPostId(postId);
    }

    @Transactional(readOnly = true)
    public Optional<PostTranslation> findTranslationBySlug(String slug) {
        return postTranslationRepository.findBySlug(slug);
    }

    @Transactional(readOnly = true)
    public Optional<PostTranslation> findTranslationById(String id) {
        return postTranslationRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<PostTranslation> findTranslationByPostIdAndLocale(String postId, String locale) {
        if (postId == null || locale == null) return Optional.empty();
        return postTranslationRepository.findByPostIdAndLocale(postId, locale);
    }

    /**
     * Dettaglio pubblico di un post pubblicato per locale + slug della traduzione.
     * Restituisce solo se lo status del post è \"published\" e la traduzione appartiene al locale richiesto.
     */
    @Transactional(readOnly = true)
    public Optional<PostPublicResponse> findPublishedDetailByLocaleAndSlug(String locale, String slug) {
        String normalizedLocale = locale == null ? "" : locale.trim().toLowerCase();
        String normalizedSlug = slug == null ? "" : slug.trim().toLowerCase();
        if (normalizedLocale.isEmpty() || normalizedSlug.isEmpty()) {
            return Optional.empty();
        }
        return postTranslationRepository.findBySlug(normalizedSlug)
                .filter(t -> t.getLocale().equalsIgnoreCase(normalizedLocale))
                .filter(t -> {
                    Post post = t.getPost();
                    return post != null && "published".equalsIgnoreCase(post.getStatus());
                })
                .map(t -> toPublicResponse(t.getPost(), t));
    }

    @Transactional
    public PostTranslation saveTranslation(PostTranslation translation) {
        return postTranslationRepository.save(translation);
    }
}
