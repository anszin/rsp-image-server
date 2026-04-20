package com.food.menu.domain.store;

import com.food.menu.domain.tenant.Tenant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "food_store")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Store {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    private String address;

    @Column(length = 200)
    private String description;

    private boolean active = true;

    @Builder
    public Store(Tenant tenant, String code, String name, String address, String description) {
        this.tenant = tenant;
        this.code = code;
        this.name = name;
        this.address = address;
        this.description = description;
    }

    public void update(String name, String address, String description, boolean active) {
        this.name = name;
        this.address = address;
        this.description = description;
        this.active = active;
    }
}
