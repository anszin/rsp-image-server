package com.food.menu.api.admin;

import com.food.menu.common.dto.ApiResponse;
import com.food.menu.domain.menu.Category;
import com.food.menu.domain.menu.CategoryRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ApiResponse<List<CategoryDto>> list(@RequestParam(required = false) Long menuId) {
        List<Category> categories = menuId != null
                ? categoryRepository.findByMenuIdOrderBySortOrderAsc(menuId)
                : categoryRepository.findAll();
        return ApiResponse.ok(categories.stream().map(CategoryDto::from).toList());
    }

    @Getter
    @Builder
    public static class CategoryDto {
        private Long id;
        private String name;
        private Long menuId;
        private String menuName;
        private String storeName;

        public static CategoryDto from(Category c) {
            return CategoryDto.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .menuId(c.getMenu().getId())
                    .menuName(c.getMenu().getName())
                    .storeName(c.getMenu().getStore().getName())
                    .build();
        }
    }
}
