package com.food.menu.domain.store;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StoreRepository extends JpaRepository<Store, Long> {
    Optional<Store> findByCode(String code);
    boolean existsByCode(String code);
    List<Store> findByTenantId(Long tenantId);
    List<Store> findByTenantIdAndActiveTrue(Long tenantId);
}
