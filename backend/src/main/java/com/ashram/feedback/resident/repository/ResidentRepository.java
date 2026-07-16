package com.ashram.feedback.resident.repository;

import com.ashram.feedback.resident.entity.Resident;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, Long> {

    Optional<Resident> findByResidentCode(String residentCode);

    boolean existsByResidentCode(String residentCode);

    @Query("SELECT r FROM Resident r WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(r.residentCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Resident> searchResidents(@Param("search") String search, Pageable pageable);
}
