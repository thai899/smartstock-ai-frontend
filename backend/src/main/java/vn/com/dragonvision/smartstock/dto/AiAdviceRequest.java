package vn.com.dragonvision.smartstock.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAdviceRequest {
    private String question;
}

