package com.food.menu.domain.slot;

import com.food.menu.domain.item.Item;
import com.food.menu.domain.menu.Menu;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "item_slot",
       uniqueConstraints = @UniqueConstraint(columnNames = {"menu_id", "page", "row_idx", "col_idx"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ItemSlot {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_id", nullable = false)
    private Menu menu;

    private int page;

    @Column(name = "row_idx")
    private int row;

    @Column(name = "col_idx")
    private int col;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @Builder
    public ItemSlot(Menu menu, int page, int row, int col, Item item) {
        this.menu = menu;
        this.page = page;
        this.row = row;
        this.col = col;
        this.item = item;
    }

    public void assignItem(Item item) {
        this.item = item;
    }

    public void clearItem() {
        this.item = null;
    }
}
