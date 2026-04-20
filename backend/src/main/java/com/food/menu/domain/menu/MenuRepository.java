package com.food.menu.domain.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findByStoreId(Long storeId);

    @Query("SELECT m FROM Menu m " +
           "JOIN FETCH m.store s " +
           "LEFT JOIN FETCH m.categories c " +
           "LEFT JOIN FETCH c.items i " +
           "LEFT JOIN FETCH i.images " +
           "LEFT JOIN FETCH i.optionGroups og " +
           "LEFT JOIN FETCH og.values " +
           "WHERE s.code = :storeCode AND m.active = true")
    Optional<Menu> findActiveMenuByStoreCode(@Param("storeCode") String storeCode);
}
