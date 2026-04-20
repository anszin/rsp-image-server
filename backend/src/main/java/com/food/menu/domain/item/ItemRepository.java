package com.food.menu.domain.item;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findByProductCode(String productCode);
    boolean existsByProductCode(String productCode);

    // optionGroups만 fetch join (values는 트랜잭션 내 lazy 초기화)
    @Query("SELECT DISTINCT i FROM Item i " +
           "LEFT JOIN FETCH i.optionGroups " +
           "WHERE i.category.id = :categoryId " +
           "ORDER BY i.sortOrder ASC")
    List<Item> findByCategoryIdWithOptions(@Param("categoryId") Long categoryId);

    @Query("SELECT DISTINCT i FROM Item i " +
           "LEFT JOIN FETCH i.optionGroups " +
           "WHERE i.category.menu.id = :menuId " +
           "ORDER BY i.sortOrder ASC")
    List<Item> findByMenuIdWithOptions(@Param("menuId") Long menuId);
}
