package com.food.menu.domain.item;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "food_item_option_value")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ItemOptionValue {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_group_id", nullable = false)
    private ItemOptionGroup optionGroup;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(precision = 10, scale = 0)
    private BigDecimal extraPrice = BigDecimal.ZERO;

    private int sortOrder;

    @Builder
    public ItemOptionValue(ItemOptionGroup optionGroup, String name, BigDecimal extraPrice, int sortOrder) {
        this.optionGroup = optionGroup;
        this.name = name;
        this.extraPrice = extraPrice != null ? extraPrice : BigDecimal.ZERO;
        this.sortOrder = sortOrder;
    }
}
