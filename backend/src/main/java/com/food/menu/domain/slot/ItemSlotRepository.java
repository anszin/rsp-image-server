package com.food.menu.domain.slot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ItemSlotRepository extends JpaRepository<ItemSlot, Long> {

    @Query("SELECT s FROM ItemSlot s LEFT JOIN FETCH s.item WHERE s.menu.id = :menuId AND s.category.id = :categoryId ORDER BY s.page, s.row, s.col")
    List<ItemSlot> findByMenuIdAndCategoryIdWithItem(@Param("menuId") Long menuId, @Param("categoryId") Long categoryId);

    Optional<ItemSlot> findByMenuIdAndCategoryIdAndPageAndRowAndCol(
            Long menuId, Long categoryId, int page, int row, int col);

    void deleteByMenuId(Long menuId);
}
