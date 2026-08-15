package com.ashram.feedback.doc.repository;

import com.ashram.feedback.doc.entity.ImportantDoc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportantDocRepository extends JpaRepository<ImportantDoc, Long> {

    List<ImportantDoc> findByVisibleTrueOrderByCreatedAtDesc();

    Page<ImportantDoc> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
