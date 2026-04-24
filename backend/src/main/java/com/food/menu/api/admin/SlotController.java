package com.food.menu.api.admin;

import com.food.menu.common.dto.ApiResponse;
import com.food.menu.domain.item.Item;
import com.food.menu.domain.item.ItemRepository;
import com.food.menu.domain.menu.Category;
import com.food.menu.domain.menu.CategoryRepository;
import com.food.menu.domain.menu.Menu;
import com.food.menu.domain.menu.MenuRepository;
import com.food.menu.domain.slot.ItemSlot;
import com.food.menu.domain.slot.ItemSlotRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/menus/{menuId}/slots")
@RequiredArgsConstructor
public class SlotController {

    private final ItemSlotRepository slotRepository;
    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ApiResponse<List<SlotDto>> list(
            @PathVariable Long menuId,
            @RequestParam Long categoryId) {
        return ApiResponse.ok(
                slotRepository.findByMenuIdAndCategoryIdWithItem(menuId, categoryId)
                        .stream().map(SlotDto::from).toList());
    }

    @PutMapping("/{categoryId}/{page}/{row}/{col}")
    @Transactional
    public ApiResponse<SlotDto> assign(
            @PathVariable Long menuId,
            @PathVariable Long categoryId,
            @PathVariable int page, @PathVariable int row, @PathVariable int col,
            @RequestBody AssignRequest req) {

        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new IllegalArgumentException("메뉴판을 찾을 수 없습니다: " + menuId));
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + categoryId));

        ItemSlot slot = slotRepository.findByMenuIdAndCategoryIdAndPageAndRowAndCol(menuId, categoryId, page, row, col)
                .orElseGet(() -> ItemSlot.builder()
                        .menu(menu).category(category)
                        .page(page).row(row).col(col)
                        .build());

        if (req.getItemId() == null) {
            slot.clearItem();
        } else {
            Item item = itemRepository.findById(req.getItemId())
                    .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + req.getItemId()));
            slot.assignItem(item);
        }

        return ApiResponse.ok(SlotDto.from(slotRepository.save(slot)));
    }

    @DeleteMapping("/{categoryId}/{page}/{row}/{col}")
    @Transactional
    public ApiResponse<Void> clear(
            @PathVariable Long menuId,
            @PathVariable Long categoryId,
            @PathVariable int page, @PathVariable int row, @PathVariable int col) {
        slotRepository.findByMenuIdAndCategoryIdAndPageAndRowAndCol(menuId, categoryId, page, row, col)
                .ifPresent(slotRepository::delete);
        return ApiResponse.ok(null);
    }

    @Getter @Setter @NoArgsConstructor
    public static class AssignRequest {
        private Long itemId;
    }

    @Getter @Builder
    public static class SlotDto {
        private Long id;
        private int page;
        private int row;
        private int col;
        private Long categoryId;
        private Long itemId;
        private String itemName;
        private BigDecimal itemPrice;
        private String itemStatus;
        private String imageUrl;

        public static SlotDto from(ItemSlot s) {
            Item item = s.getItem();
            return SlotDto.builder()
                    .id(s.getId())
                    .page(s.getPage()).row(s.getRow()).col(s.getCol())
                    .categoryId(s.getCategory().getId())
                    .itemId(item != null ? item.getId() : null)
                    .itemName(item != null ? item.getName() : null)
                    .itemPrice(item != null ? item.getPrice() : null)
                    .itemStatus(item != null ? item.getStatus().name() : null)
                    .imageUrl(item != null && !item.getImages().isEmpty() ? item.getImages().get(0).getUrl() : null)
                    .build();
        }
    }
}
