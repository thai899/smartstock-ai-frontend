package vn.com.dragonvision.smartstock.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.com.dragonvision.smartstock.entity.Product;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);

    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.name ASC")
    List<Product> findAllActive();

    @Query("SELECT p FROM Product p WHERE p.qtyStock <= p.minStockLevel")
    List<Product> findLowStock();
}

