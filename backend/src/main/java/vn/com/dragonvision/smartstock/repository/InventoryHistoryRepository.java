package vn.com.dragonvision.smartstock.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.com.dragonvision.smartstock.entity.InventoryHistory;

import java.util.List;

@Repository
public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {
    List<InventoryHistory> findByProductIdOrderByCreatedAtDesc(Long productId);
}

