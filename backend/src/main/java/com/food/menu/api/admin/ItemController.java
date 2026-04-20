package com.food.menu.api.admin;

import com.food.menu.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;
    private final ImageUploadService imageUploadService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ItemDto.Response>>> listItems(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long menuId) {
        return ResponseEntity.ok(ApiResponse.ok(itemService.listItems(categoryId, menuId)));
    }

    @GetMapping("/{itemId}")
    public ResponseEntity<ApiResponse<ItemDto.Response>> getItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(ApiResponse.ok(itemService.getItem(itemId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ItemDto.Response>> createItem(@Valid @RequestBody ItemDto.CreateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(itemService.createItem(req)));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse<ItemDto.Response>> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody ItemDto.UpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(itemService.updateItem(itemId, req)));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long itemId) {
        itemService.deleteItem(itemId);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/{itemId}/images")
    public ResponseEntity<ApiResponse<String>> uploadImage(
            @PathVariable Long itemId,
            @RequestParam("file") MultipartFile file) {
        String url = imageUploadService.upload(itemId, file);
        return ResponseEntity.ok(ApiResponse.ok(url));
    }
}
