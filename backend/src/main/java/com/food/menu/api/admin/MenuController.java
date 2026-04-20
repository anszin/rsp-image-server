package com.food.menu.api.admin;

import com.food.menu.common.dto.ApiResponse;
import com.food.menu.domain.menu.Category;
import com.food.menu.domain.menu.CategoryRepository;
import com.food.menu.domain.menu.Menu;
import com.food.menu.domain.menu.MenuRepository;
import com.food.menu.domain.store.Store;
import com.food.menu.domain.store.StoreRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/stores/{storeId}")
@RequiredArgsConstructor
public class MenuController {

    private final StoreRepository storeRepository;
    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;

    // ── 메뉴판 ──────────────────────────────

    @GetMapping("/menus")
    public ApiResponse<List<MenuDto>> listMenus(@PathVariable Long storeId) {
        return ApiResponse.ok(menuRepository.findByStoreId(storeId).stream().map(MenuDto::from).toList());
    }

    @PostMapping("/menus")
    public ApiResponse<MenuDto> createMenu(@PathVariable Long storeId, @Valid @RequestBody MenuRequest req) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("매장을 찾을 수 없습니다: " + storeId));
        Menu menu = menuRepository.save(Menu.builder().store(store).name(req.getName()).build());
        return ApiResponse.ok(MenuDto.from(menu));
    }

    @PutMapping("/menus/{menuId}")
    public ApiResponse<MenuDto> updateMenu(@PathVariable Long storeId, @PathVariable Long menuId,
                                           @Valid @RequestBody MenuRequest req) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("메뉴판을 찾을 수 없습니다: " + menuId));
        menu.updateName(req.getName());
        return ApiResponse.ok(MenuDto.from(menuRepository.save(menu)));
    }

    @DeleteMapping("/menus/{menuId}")
    @Transactional
    public ApiResponse<Void> deleteMenu(@PathVariable Long storeId, @PathVariable Long menuId) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("메뉴판을 찾을 수 없습니다: " + menuId));
        menuRepository.delete(menu);
        return ApiResponse.ok(null);
    }

    // ── 카테고리 ──────────────────────────────

    @GetMapping("/menus/{menuId}/categories")
    public ApiResponse<List<CategoryDto>> listCategories(@PathVariable Long storeId, @PathVariable Long menuId) {
        return ApiResponse.ok(
                categoryRepository.findByMenuIdOrderBySortOrderAsc(menuId).stream().map(CategoryDto::from).toList());
    }

    @PostMapping("/menus/{menuId}/categories")
    public ApiResponse<CategoryDto> createCategory(@PathVariable Long storeId, @PathVariable Long menuId,
                                                   @Valid @RequestBody CategoryRequest req) {
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("메뉴판을 찾을 수 없습니다: " + menuId));
        int sortOrder = categoryRepository.findByMenuIdOrderBySortOrderAsc(menuId).size();
        Category category = categoryRepository.save(
                Category.builder().menu(menu).name(req.getName()).sortOrder(req.getSortOrder() > 0 ? req.getSortOrder() : sortOrder).build());
        return ApiResponse.ok(CategoryDto.from(category));
    }

    @PutMapping("/menus/{menuId}/categories/{categoryId}")
    public ApiResponse<CategoryDto> updateCategory(@PathVariable Long storeId, @PathVariable Long menuId,
                                                   @PathVariable Long categoryId,
                                                   @Valid @RequestBody CategoryRequest req) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + categoryId));
        category.update(req.getName(), req.getSortOrder());
        return ApiResponse.ok(CategoryDto.from(categoryRepository.save(category)));
    }

    @DeleteMapping("/menus/{menuId}/categories/{categoryId}")
    @Transactional
    public ApiResponse<Void> deleteCategory(@PathVariable Long storeId, @PathVariable Long menuId,
                                            @PathVariable Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + categoryId));
        categoryRepository.delete(category);
        return ApiResponse.ok(null);
    }

    // ── DTOs ──────────────────────────────

    @Getter @NoArgsConstructor
    public static class MenuRequest { @NotBlank private String name; }

    @Getter @NoArgsConstructor
    public static class CategoryRequest {
        @NotBlank private String name;
        private int sortOrder;
    }

    @Getter @Builder
    public static class MenuDto {
        private Long id;
        private String name;
        private boolean active;

        public static MenuDto from(Menu m) {
            return MenuDto.builder().id(m.getId()).name(m.getName()).active(m.isActive()).build();
        }
    }

    @Getter @Builder
    public static class CategoryDto {
        private Long id;
        private String name;
        private int sortOrder;

        public static CategoryDto from(Category c) {
            return CategoryDto.builder().id(c.getId()).name(c.getName()).sortOrder(c.getSortOrder()).build();
        }
    }
}
