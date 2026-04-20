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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantRepository tenantRepository;
    private final StoreRepository storeRepository;

    @GetMapping
    public ApiResponse<List<TenantDto>> list() {
        return ApiResponse.ok(tenantRepository.findAll().stream().map(TenantDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<TenantDto> get(@PathVariable Long id) {
        return ApiResponse.ok(TenantDto.from(findTenant(id)));
    }

    @PostMapping
    public ApiResponse<TenantDto> create(@Valid @RequestBody TenantRequest req) {
        if (tenantRepository.existsByCode(req.getCode()))
            throw new IllegalArgumentException("이미 존재하는 고객사 코드입니다: " + req.getCode());
        Tenant tenant = tenantRepository.save(Tenant.builder().code(req.getCode()).name(req.getName()).build());
        return ApiResponse.ok(TenantDto.from(tenant));
    }

    @PutMapping("/{id}")
    public ApiResponse<TenantDto> update(@PathVariable Long id, @Valid @RequestBody TenantRequest req) {
        Tenant tenant = findTenant(id);
        tenant.update(req.getName(), req.isActive());
        return ApiResponse.ok(TenantDto.from(tenantRepository.save(tenant)));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        Tenant tenant = findTenant(id);
        if (!storeRepository.findByTenantId(id).isEmpty())
            throw new IllegalArgumentException("매장이 존재하는 고객사는 삭제할 수 없습니다.");
        tenantRepository.delete(tenant);
        return ApiResponse.ok(null);
    }

    // ── 고객사별 매장 목록 ──
    @GetMapping("/{id}/stores")
    public ApiResponse<List<StoreController.StoreDto>> stores(@PathVariable Long id) {
        return ApiResponse.ok(storeRepository.findByTenantId(id).stream()
                .map(StoreController.StoreDto::from).toList());
    }

    private Tenant findTenant(Long id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("고객사를 찾을 수 없습니다: " + id));
    }

    @Getter @NoArgsConstructor
    public static class TenantRequest {
        @NotBlank private String code;
        @NotBlank private String name;
        private boolean active = true;
    }

    @Getter @Builder
    public static class TenantDto {
        private Long id;
        private String code;
        private String name;
        private boolean active;

        public static TenantDto from(Tenant t) {
            return TenantDto.builder().id(t.getId()).code(t.getCode()).name(t.getName()).active(t.isActive()).build();
        }
    }
}
