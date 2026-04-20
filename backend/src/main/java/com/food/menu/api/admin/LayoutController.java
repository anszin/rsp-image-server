package com.food.menu.api.admin;

import com.food.menu.common.dto.ApiResponse;
import com.food.menu.domain.layout.DisplayLayout;
import com.food.menu.domain.layout.DisplayLayoutRepository;
import com.food.menu.domain.layout.Orientation;
import com.food.menu.domain.store.Store;
import com.food.menu.domain.store.StoreRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/stores/{storeId}/layout")
@RequiredArgsConstructor
public class LayoutController {

    private final StoreRepository storeRepository;
    private final DisplayLayoutRepository layoutRepository;

    @GetMapping
    public ApiResponse<LayoutDto> get(@PathVariable Long storeId) {
        DisplayLayout layout = layoutRepository.findByStoreId(storeId)
                .orElseGet(() -> defaultLayout(storeId));
        return ApiResponse.ok(LayoutDto.from(layout));
    }

    @PutMapping
    public ApiResponse<LayoutDto> save(@PathVariable Long storeId, @Valid @RequestBody LayoutRequest req) {
        DisplayLayout layout = layoutRepository.findByStoreId(storeId).orElseGet(() -> {
            Store store = storeRepository.findById(storeId)
                    .orElseThrow(() -> new IllegalArgumentException("매장을 찾을 수 없습니다: " + storeId));
            return DisplayLayout.builder().store(store)
                    .orientation(req.getOrientation())
                    .columns(req.getColumns()).rows(req.getRows()).build();
        });
        layout.update(req.getOrientation(), req.getColumns(), req.getRows());
        return ApiResponse.ok(LayoutDto.from(layoutRepository.save(layout)));
    }

    private DisplayLayout defaultLayout(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("매장을 찾을 수 없습니다: " + storeId));
        return DisplayLayout.builder().store(store)
                .orientation(Orientation.LANDSCAPE).columns(4).rows(3).build();
    }

    @Getter @NoArgsConstructor
    public static class LayoutRequest {
        @NotNull private Orientation orientation;
        @Min(1) @Max(8) private int columns;
        @Min(1) @Max(6) private int rows;
    }

    @Getter @Builder
    public static class LayoutDto {
        private Long storeId;
        private Orientation orientation;
        private int columns;
        private int rows;
        private int itemsPerPage;

        public static LayoutDto from(DisplayLayout l) {
            return LayoutDto.builder()
                    .storeId(l.getStore().getId())
                    .orientation(l.getOrientation())
                    .columns(l.getColumns()).rows(l.getRows())
                    .itemsPerPage(l.itemsPerPage())
                    .build();
        }
    }
}
