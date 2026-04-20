package com.food.menu.common.dto;

import com.food.menu.domain.layout.DisplayLayout;
import com.food.menu.domain.layout.DisplayLayoutRepository;
import com.food.menu.domain.layout.Orientation;
import com.food.menu.domain.menu.Category;
import com.food.menu.domain.menu.CategoryRepository;
import com.food.menu.domain.menu.Menu;
import com.food.menu.domain.menu.MenuRepository;
import com.food.menu.domain.store.Store;
import com.food.menu.domain.store.StoreRepository;
import com.food.menu.domain.tenant.Tenant;
import com.food.menu.domain.tenant.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final TenantRepository tenantRepository;
    private final StoreRepository storeRepository;
    private final MenuRepository menuRepository;
    private final CategoryRepository categoryRepository;
    private final DisplayLayoutRepository layoutRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (tenantRepository.count() > 0) return;

        Tenant tenant = tenantRepository.save(Tenant.builder()
                .code("TENANT001").name("(주)맛있는커피").build());

        Store store = storeRepository.save(Store.builder()
                .tenant(tenant).code("STORE001").name("강남점")
                .address("서울시 강남구").description("강남 1호 직영점").build());

        Menu menu = menuRepository.save(Menu.builder().store(store).name("기본 메뉴판").build());

        categoryRepository.save(Category.builder().menu(menu).name("커피").sortOrder(0).build());
        categoryRepository.save(Category.builder().menu(menu).name("논커피").sortOrder(1).build());
        categoryRepository.save(Category.builder().menu(menu).name("푸드").sortOrder(2).build());

        layoutRepository.save(DisplayLayout.builder()
                .store(store).orientation(Orientation.LANDSCAPE).columns(4).rows(3).build());
    }
}
