package com.food.menu.domain.item;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "food_item_image")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ItemImage {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(nullable = false)
    private String url;

    private int sortOrder;

    @Builder
    public ItemImage(Item item, String url, int sortOrder) {
        this.item = item;
        this.url = url;
        this.sortOrder = sortOrder;
    }
}
