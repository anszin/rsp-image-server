package com.food.menu.api.admin;

import com.food.menu.common.dto.ApiResponse;
import com.food.menu.domain.store.Store;
import com.food.menu.domain.store.StoreRepository;
import com.food.menu.domain.tenant.Tenant;
import com.food.menu.domain.tenant.TenantRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreRepository storeRepository;
    private final TenantRepository tenantRepository;

    @GetMapping
    public ApiResponse<List<StoreDto>> list(@RequestParam(required = false) Long tenantId) {
        List<Store> stores = tenantId != null
                ? storeRepository.findByTenantId(tenantId)
                : storeRepository.findAll();
        return ApiResponse.ok(stores.stream().map(StoreDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<StoreDto> get(@PathVariable Long id) {
        return ApiResponse.ok(StoreDto.from(findStore(id)));
    }

    @PostMapping
    public ApiResponse<StoreDto> create(@Valid @RequestBody StoreRequest req) {
        if (storeRepository.existsByCode(req.getCode()))
            throw new IllegalArgumentException("이미 존재하는 매장코드입니다: " + req.getCode());
        Tenant tenant = req.getTenantId() != null
                ? tenantRepository.findById(req.getTenantId())
                        .orElseThrow(() -> new IllegalArgumentException("고객사를 찾을 수 없습니다: " + req.getTenantId()))
                : null;
        Store store = storeRepository.save(Store.builder()
                .tenant(tenant).code(req.getCode()).name(req.getName())
                .address(req.getAddress()).description(req.getDescription())
                .build());
        return ApiResponse.ok(StoreDto.from(store));
    }

    @PutMapping("/{id}")
    public ApiResponse<StoreDto> update(@PathVariable Long id, @Valid @RequestBody StoreRequest req) {
        Store store = findStore(id);
        store.update(req.getName(), req.getAddress(), req.getDescription(), req.isActive());
        return ApiResponse.ok(StoreDto.from(storeRepository.save(store)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        storeRepository.delete(findStore(id));
        return ApiResponse.ok(null);
    }

    private Store findStore(Long id) {
        return storeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("매장을 찾을 수 없습니다: " + id));
    }

    @Getter @NoArgsConstructor
    public static class StoreRequest {
        private Long tenantId;
        @NotBlank private String code;
        @NotBlank private String name;
        private String address;
        private String description;
        private boolean active = true;
    }

    @Getter @Builder
    public static class StoreDto {
        private Long id;
        private Long tenantId;
        private String tenantName;
        private String code;
        private String name;
        private String address;
        private String description;
        private boolean active;

        public static StoreDto from(Store s) {
            return StoreDto.builder()
                    .id(s.getId())
                    .tenantId(s.getTenant() != null ? s.getTenant().getId() : null)
                    .tenantName(s.getTenant() != null ? s.getTenant().getName() : null)
                    .code(s.getCode()).name(s.getName())
                    .address(s.getAddress()).description(s.getDescription())
                    .active(s.isActive())
                    .build();
        }
    }
}
