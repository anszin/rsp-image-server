package com.food.menu.domain.layout;

import com.food.menu.domain.store.Store;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "display_layout")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DisplayLayout {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false, unique = true)
    private Store store;

    @Enumerated(EnumType.STRING)
    private Orientation orientation = Orientation.LANDSCAPE;

    private int columns = 4;  // 가로 칸 수
    private int rows = 3;     // 세로 칸 수

    @Builder
    public DisplayLayout(Store store, Orientation orientation, int columns, int rows) {
        this.store = store;
        this.orientation = orientation;
        this.columns = columns;
        this.rows = rows;
    }

    public void update(Orientation orientation, int columns, int rows) {
        this.orientation = orientation;
        this.columns = Math.max(1, columns);
        this.rows = Math.max(1, rows);
    }

    public int itemsPerPage() {
        return columns * rows;
    }
}
