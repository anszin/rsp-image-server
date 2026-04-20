package com.food.menu.api.admin;

import com.food.menu.domain.item.Item;
import com.food.menu.domain.item.ItemImage;
import com.food.menu.domain.item.ItemRepository;
import com.food.menu.infrastructure.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ImageUploadService {

    private final ItemRepository itemRepository;
    private final StorageService storageService;

    @Transactional
    public String upload(Long itemId, MultipartFile file) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + itemId));

        String url = storageService.store(file, "items/" + itemId);
        int sortOrder = item.getImages().size();
        ItemImage image = ItemImage.builder()
                .item(item)
                .url(url)
                .sortOrder(sortOrder)
                .build();
        item.getImages().add(image);
        return url;
    }
}
