package com.food.menu.domain.layout;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DisplayLayoutRepository extends JpaRepository<DisplayLayout, Long> {
    Optional<DisplayLayout> findByStoreId(Long storeId);
}
