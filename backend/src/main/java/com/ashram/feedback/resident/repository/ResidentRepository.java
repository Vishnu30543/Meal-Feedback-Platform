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

    @Query("SELECT DISTINCT r FROM Resident r LEFT JOIN r.camps c WHERE r.archived = false AND " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(r.residentCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:activeCampOnly = false OR (c.active = true AND c.startDate <= CURRENT_DATE AND c.endDate >= CURRENT_DATE))")
    Page<Resident> searchResidents(@Param("search") String search, @Param("activeCampOnly") boolean activeCampOnly, Pageable pageable);
}
