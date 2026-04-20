package com.food.menu.api.admin;

import com.food.menu.domain.item.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class ItemDto {

    @Getter
    @NoArgsConstructor
    public static class CreateRequest {
        @NotBlank private String productCode;
        @NotBlank private String name;
        @NotNull @Min(0) private BigDecimal price;
        @NotNull private Long categoryId;
        private int sortOrder;
        private List<OptionGroupRequest> optionGroups;
    }

    @Getter
    @NoArgsConstructor
    public static class UpdateRequest {
        @NotBlank private String name;
        @NotNull @Min(0) private BigDecimal price;
        private ItemStatus status;
        private int sortOrder;
        private List<OptionGroupRequest> optionGroups;
    }

    @Getter
    @NoArgsConstructor
    public static class OptionGroupRequest {
        @NotBlank private String name;
        private boolean required;
        private boolean multiSelect;
        private int sortOrder;
        private List<OptionValueRequest> values;
    }

    @Getter
    @NoArgsConstructor
    public static class OptionValueRequest {
        @NotBlank private String name;
        private BigDecimal extraPrice = BigDecimal.ZERO;
        private int sortOrder;
    }

    @Getter
    @Builder
    public static class Response {
        private Long id;
        private String productCode;
        private String name;
        private BigDecimal price;
        private ItemStatus status;
        private int sortOrder;
        private Long categoryId;
        private String categoryName;
        private List<String> imageUrls;
        private List<OptionGroupResponse> optionGroups;

        public static Response from(Item item) {
            return Response.builder()
                    .id(item.getId())
                    .productCode(item.getProductCode())
                    .name(item.getName())
                    .price(item.getPrice())
                    .status(item.getStatus())
                    .sortOrder(item.getSortOrder())
                    .categoryId(item.getCategory().getId())
                    .categoryName(item.getCategory().getName())
                    .imageUrls(item.getImages().stream().map(ItemImage::getUrl).toList())
                    .optionGroups(item.getOptionGroups().stream().map(OptionGroupResponse::from).toList())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class OptionGroupResponse {
        private Long id;
        private String name;
        private boolean required;
        private boolean multiSelect;
        private int sortOrder;
        private List<OptionValueResponse> values;

        public static OptionGroupResponse from(ItemOptionGroup g) {
            return OptionGroupResponse.builder()
                    .id(g.getId())
                    .name(g.getName())
                    .required(g.isRequired())
                    .multiSelect(g.isMultiSelect())
                    .sortOrder(g.getSortOrder())
                    .values(g.getValues().stream().map(OptionValueResponse::from).toList())
                    .build();
        }
    }

    @Getter
    @Builder
    public static class OptionValueResponse {
        private Long id;
        private String name;
        private BigDecimal extraPrice;
        private int sortOrder;

        public static OptionValueResponse from(ItemOptionValue v) {
            return OptionValueResponse.builder()
                    .id(v.getId())
                    .name(v.getName())
                    .extraPrice(v.getExtraPrice())
                    .sortOrder(v.getSortOrder())
                    .build();
        }
    }
}
