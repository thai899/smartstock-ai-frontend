package vn.com.dragonvision.smartstock.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProductCategory category;

    @Column(length = 20)
    private String unit;

    private BigDecimal costPrice;
    private BigDecimal sellPrice;

    @Builder.Default
    private Integer qtyStock = 0;

    @Builder.Default
    private Integer minStockLevel = 5;

    @Builder.Default
    private String status = "ACTIVE";

    private LocalDateTime createdAt;
}

