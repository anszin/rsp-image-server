package com.food.menu.domain.tenant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "food_tenant")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Tenant {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    private boolean active = true;

    @Builder
    public Tenant(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public void update(String name, boolean active) {
        this.name = name;
        this.active = active;
    }
}
