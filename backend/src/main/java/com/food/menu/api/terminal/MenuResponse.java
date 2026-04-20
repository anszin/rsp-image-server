package com.food.menu.api.terminal;

import com.food.menu.domain.item.*;
import com.food.menu.domain.menu.Category;
import com.food.menu.domain.menu.Menu;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class MenuResponse {
    private Long menuId;
    private String menuName;
    private List<CategoryResponse> categories;

    @Getter
    @Builder
    public static class CategoryResponse {
        private Long id;
        private String name;
        private int sortOrder;
        private List<ItemResponse> items;
    }

    @Getter
    @Builder
    public static class ItemResponse {
        private Long id;
        private String productCode;
        private String name;
        private BigDecimal price;
        private String status;
        private int sortOrder;
        private List<String> imageUrls;
        private List<OptionGroupResponse> optionGroups;
    }

    @Getter
    @Builder
    public static class OptionGroupResponse {
        private Long id;
        private String name;
        private boolean required;
        private boolean multiSelect;
        private List<OptionValueResponse> values;
    }

    @Getter
    @Builder
    public static class OptionValueResponse {
        private Long id;
        private String name;
        private BigDecimal extraPrice;
    }

    public static MenuResponse from(Menu menu) {
        List<CategoryResponse> cats = menu.getCategories().stream()
                .map(MenuResponse::toCategory)
                .toList();
        return MenuResponse.builder()
                .menuId(menu.getId())
                .menuName(menu.getName())
                .categories(cats)
                .build();
    }

    private static CategoryResponse toCategory(Category c) {
        List<ItemResponse> items = c.getItems().stream()
                .filter(i -> i.getStatus() != ItemStatus.HIDDEN)
                .map(MenuResponse::toItem)
                .toList();
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .sortOrder(c.getSortOrder())
                .items(items)
                .build();
    }

    private static ItemResponse toItem(Item i) {
        return ItemResponse.builder()
                .id(i.getId())
                .productCode(i.getProductCode())
                .name(i.getName())
                .price(i.getPrice())
                .status(i.getStatus().name())
                .sortOrder(i.getSortOrder())
                .imageUrls(i.getImages().stream().map(ItemImage::getUrl).toList())
                .optionGroups(i.getOptionGroups().stream().map(MenuResponse::toOptionGroup).toList())
                .build();
    }

    private static OptionGroupResponse toOptionGroup(ItemOptionGroup g) {
        return OptionGroupResponse.builder()
                .id(g.getId())
                .name(g.getName())
                .required(g.isRequired())
                .multiSelect(g.isMultiSelect())
                .values(g.getValues().stream().map(MenuResponse::toOptionValue).toList())
                .build();
    }

    private static OptionValueResponse toOptionValue(ItemOptionValue v) {
        return OptionValueResponse.builder()
                .id(v.getId())
                .name(v.getName())
                .extraPrice(v.getExtraPrice())
                .build();
    }
}
