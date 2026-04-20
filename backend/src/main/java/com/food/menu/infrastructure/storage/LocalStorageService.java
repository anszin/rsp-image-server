package com.food.menu.infrastructure.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    @Value("${storage.local.root:uploads}")
    private String rootPath;

    @Value("${storage.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    public String store(MultipartFile file, String subPath) {
        try {
            String filename = UUID.randomUUID() + getExtension(file.getOriginalFilename());
            Path dir = Paths.get(rootPath, subPath);
            Files.createDirectories(dir);
            Path dest = dir.resolve(filename);
            file.transferTo(dest);
            return baseUrl + "/images/" + subPath + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }
    }

    @Override
    public void delete(String url) {
        String relativePath = url.replace(baseUrl + "/images/", "");
        Path file = Paths.get(rootPath, relativePath);
        try {
            Files.deleteIfExists(file);
        } catch (IOException e) {
            throw new RuntimeException("파일 삭제 실패", e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf("."));
    }
}
