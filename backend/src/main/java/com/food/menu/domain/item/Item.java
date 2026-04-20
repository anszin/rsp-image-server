package com.food.menu.domain.item;

import com.food.menu.domain.menu.Category;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Item {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, unique = true, length = 30)
    private String productCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 10, scale = 0)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private ItemStatus status = ItemStatus.ON_SALE;

    private int sortOrder;

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "item", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemOptionGroup> optionGroups = new ArrayList<>();

    @Builder
    public Item(Category category, String productCode, String name, BigDecimal price, int sortOrder) {
        this.category = category;
        this.productCode = productCode;
        this.name = name;
        this.price = price;
        this.sortOrder = sortOrder;
    }

    public void update(String name, BigDecimal price, ItemStatus status, int sortOrder) {
        this.name = name;
        this.price = price;
        this.status = status;
        this.sortOrder = sortOrder;
    }

    public void changeCategory(Category category) {
        this.category = category;
    }
}
