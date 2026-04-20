package com.food.menu.api.terminal;

import com.food.menu.common.dto.ApiResponse;
import com.food.menu.domain.menu.Menu;
import com.food.menu.domain.menu.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class TerminalMenuController {

    private final MenuRepository menuRepository;

    /**
     * 단말기(POS/KIOSK)가 매장 전체 메뉴를 가져가는 API
     * Cache-Control 헤더로 CDN 캐시 처리
     */
    @GetMapping("/{storeCode}")
    public ResponseEntity<ApiResponse<MenuResponse>> getMenu(@PathVariable String storeCode) {
        Menu menu = menuRepository.findActiveMenuByStoreCode(storeCode)
                .orElseThrow(() -> new IllegalArgumentException("활성 메뉴가 없습니다: " + storeCode));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).mustRevalidate())
                .eTag(String.valueOf(menu.getId()))
                .body(ApiResponse.ok(MenuResponse.from(menu)));
    }
}
