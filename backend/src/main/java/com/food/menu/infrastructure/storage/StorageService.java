package com.food.menu.infrastructure.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String subPath);
    void delete(String url);
}
