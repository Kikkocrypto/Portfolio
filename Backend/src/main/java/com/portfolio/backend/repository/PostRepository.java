package com.portfolio.backend.repository;

import com.portfolio.backend.entity.Post;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, String> {

    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.translations WHERE p.id = :id")
    Optional<Post> findByIdWithTranslations(@Param("id") String id);

    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.translations ORDER BY p.createdAt DESC")
    List<Post> findAllWithTranslations();

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findAllByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    /**
     * Lista admin: ordinamento published prima, poi createdAt desc; filtri opzionali status e titolo (in qualsiasi traduzione).
     */
    @Query("""
           SELECT p FROM Post p
           WHERE (:statusFilter IS NULL OR :statusFilter = '' OR p.status = :statusFilter)
             AND (:titleSearch = '' OR EXISTS (
               SELECT 1 FROM PostTranslation t WHERE t.post = p AND LOWER(t.title) LIKE LOWER(CONCAT('%', :titleSearch, '%'))
             ))
           ORDER BY CASE WHEN p.status = 'published' THEN 0 ELSE 1 END, p.createdAt DESC
           """)
    Page<Post> findForAdminOrderByPublishedFirst(
            @Param("titleSearch") String titleSearch,
            @Param("statusFilter") String statusFilter,
            Pageable pageable);

    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.translations WHERE p.id IN :ids ORDER BY p.createdAt DESC")
    List<Post> findByIdInOrderByCreatedAtDesc(@Param("ids") List<String> ids);

    Optional<Post> findBySlug(String slug);

    Optional<Post> findBySlugAndStatus(String slug, String status);

    List<Post> findByStatusOrderByCreatedAtDesc(String status);

    /**
     * Tutti i post con uno specifico status, con traduzioni già caricate (per evitare LazyInitializationException
     * quando open-in-view è disabilitato e gli entity vengono serializzati in risposta).
     */
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.translations WHERE p.status = :status ORDER BY p.createdAt DESC")
    List<Post> findByStatusWithTranslationsOrderByCreatedAtDesc(@Param("status") String status);

    /**
     * posts pubblicati per locale specifico, con filtri opzionali:
     * - titleSearch: contiene nel titolo della traduzione (case-insensitive)
     * - createdFrom / createdTo: intervallo sulla data di creazione del post
     *
     * Il filtro per status è necessario per escludere i post in stato draft e archived.
     */
    @Query("""
           SELECT DISTINCT p
           FROM Post p
           INNER JOIN p.translations t
           WHERE p.status = :status
             AND t.locale = :locale
             AND (:titleSearch = '' OR LOWER(t.title) LIKE LOWER(CONCAT('%', :titleSearch, '%')))
             AND (:createdFrom IS NULL OR p.createdAt >= :createdFrom)
             AND (:createdTo IS NULL OR p.createdAt <= :createdTo)
           ORDER BY p.createdAt DESC
           """)
    Page<Post> findPublishedByLocaleWithFilters(
            @Param("status") String status,
            @Param("locale") String locale,
            @Param("titleSearch") String titleSearch,
            @Param("createdFrom") Instant createdFrom,
            @Param("createdTo") Instant createdTo,
            Pageable pageable);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, String id);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Post p SET p.status = :status WHERE p.id = :id")
    int updateStatusById(@Param("id") String id, @Param("status") String status);
}
