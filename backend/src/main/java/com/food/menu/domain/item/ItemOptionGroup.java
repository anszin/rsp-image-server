package com.food.menu.domain.item;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "food_item_option_group")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ItemOptionGroup {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false, length = 50)
    private String name;

    private boolean required;
    private boolean multiSelect;
    private int sortOrder;

    @OneToMany(mappedBy = "optionGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<ItemOptionValue> values = new ArrayList<>();

    @Builder
    public ItemOptionGroup(Item item, String name, boolean required, boolean multiSelect, int sortOrder) {
        this.item = item;
        this.name = name;
        this.required = required;
        this.multiSelect = multiSelect;
        this.sortOrder = sortOrder;
    }
}
