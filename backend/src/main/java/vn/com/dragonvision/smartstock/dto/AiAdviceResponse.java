package vn.com.dragonvision.smartstock.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAdviceResponse {
    private String question;
    private String answer;
    private List<String> lowStockAlerts;
    private BigDecimal totalInventoryValue;
    private LocalDateTime generatedAt;
}

