package com.portfolio.backend.repository;

import com.portfolio.backend.entity.PostTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostTranslationRepository extends JpaRepository<PostTranslation, String> {

    List<PostTranslation> findByPostId(String postId);

    Optional<PostTranslation> findByPostIdAndLocale(String postId, String locale);

    @Query("SELECT t FROM PostTranslation t JOIN FETCH t.post WHERE t.post.id IN :postIds AND t.locale = :locale")
    List<PostTranslation> findByPostIdInAndLocale(@Param("postIds") Collection<String> postIds, @Param("locale") String locale);

    Optional<PostTranslation> findBySlug(String slug);

    void deleteByPostId(String postId);
}
