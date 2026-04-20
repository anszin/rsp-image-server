package com.food.menu.domain.menu;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByMenuIdOrderBySortOrderAsc(Long menuId);
}
