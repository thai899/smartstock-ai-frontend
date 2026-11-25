package vn.com.dragonvision.smartstock.dto;

import lombok.*;
import vn.com.dragonvision.smartstock.entity.StockReceipt;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockReceiptResponse {
    private Long id;
    private String code;
    private String type;
    private BigDecimal totalAmount;
    private String status;
    private String note;
    private LocalDateTime createdAt;

    public static StockReceiptResponse fromEntity(StockReceipt receipt) {
        return StockReceiptResponse.builder()
                .id(receipt.getId())
                .code(receipt.getCode())
                .type(receipt.getType() != null ? receipt.getType().name() : null)
                .totalAmount(receipt.getTotalAmount())
                .status(receipt.getStatus() != null ? receipt.getStatus().name() : null)
                .note(receipt.getNote())
                .createdAt(receipt.getCreatedAt())
                .build();
    }
}

