package vn.com.dragonvision.smartstock.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockOutRequest {
    private String receiver;
    private String note;
    private List<Item> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Item {
        private Long productId;
        private Integer qtyOut;
        private BigDecimal unitPrice;
    }
}

