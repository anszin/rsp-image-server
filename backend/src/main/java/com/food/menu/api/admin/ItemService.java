package com.food.menu.api.admin;

import com.food.menu.domain.item.*;
import com.food.menu.domain.menu.Category;
import com.food.menu.domain.menu.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;

    public List<ItemDto.Response> listItems(Long categoryId, Long menuId) {
        // images와 optionGroups를 동시에 fetch join하면 MultipleBagFetchException
        // → options 먼저 fetch join 후, images는 Hibernate가 별도 select로 처리
        List<Item> items;
        if (categoryId != null) {
            items = itemRepository.findByCategoryIdWithOptions(categoryId);
        } else if (menuId != null) {
            items = itemRepository.findByMenuIdWithOptions(menuId);
        } else {
            items = itemRepository.findAll();
        }
        // images, option values lazy 초기화 (트랜잭션 내 접근)
        items.forEach(i -> {
            i.getImages().size();
            i.getOptionGroups().forEach(og -> og.getValues().size());
        });
        return items.stream().map(ItemDto.Response::from).toList();
    }

    public ItemDto.Response getItem(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + itemId));
        return ItemDto.Response.from(item);
    }

    @Transactional
    public ItemDto.Response createItem(ItemDto.CreateRequest req) {
        if (itemRepository.existsByProductCode(req.getProductCode())) {
            throw new IllegalArgumentException("이미 존재하는 상품코드입니다: " + req.getProductCode());
        }
        Category category = categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + req.getCategoryId()));

        Item item = Item.builder()
                .category(category)
                .productCode(req.getProductCode())
                .name(req.getName())
                .price(req.getPrice())
                .sortOrder(req.getSortOrder())
                .build();
        itemRepository.save(item);

        if (req.getOptionGroups() != null) {
            saveOptionGroups(item, req.getOptionGroups());
        }

        return ItemDto.Response.from(item);
    }

    @Transactional
    public ItemDto.Response updateItem(Long itemId, ItemDto.UpdateRequest req) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + itemId));
        item.update(req.getName(), req.getPrice(), req.getStatus(), req.getSortOrder());

        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + req.getCategoryId()));
            item.changeCategory(category);
        }

        item.getOptionGroups().clear();
        if (req.getOptionGroups() != null) {
            saveOptionGroups(item, req.getOptionGroups());
        }

        return ItemDto.Response.from(item);
    }

    @Transactional
    public void deleteItem(Long itemId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다: " + itemId));
        itemRepository.delete(item);
    }

    private void saveOptionGroups(Item item, List<ItemDto.OptionGroupRequest> groups) {
        for (ItemDto.OptionGroupRequest gReq : groups) {
            ItemOptionGroup group = ItemOptionGroup.builder()
                    .item(item)
                    .name(gReq.getName())
                    .required(gReq.isRequired())
                    .multiSelect(gReq.isMultiSelect())
                    .sortOrder(gReq.getSortOrder())
                    .build();
            item.getOptionGroups().add(group);

            if (gReq.getValues() != null) {
                for (ItemDto.OptionValueRequest vReq : gReq.getValues()) {
                    ItemOptionValue value = ItemOptionValue.builder()
                            .optionGroup(group)
                            .name(vReq.getName())
                            .extraPrice(vReq.getExtraPrice())
                            .sortOrder(vReq.getSortOrder())
                            .build();
                    group.getValues().add(value);
                }
            }
        }
    }
}
