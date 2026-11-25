package vn.com.dragonvision.smartstock.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.com.dragonvision.smartstock.entity.StockReceiptDetail;

@Repository
public interface StockReceiptDetailRepository extends JpaRepository<StockReceiptDetail, Long> {
}

