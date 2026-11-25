package vn.com.dragonvision.smartstock.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import vn.com.dragonvision.smartstock.dto.AiAdviceRequest;
import vn.com.dragonvision.smartstock.dto.AiAdviceResponse;
import vn.com.dragonvision.smartstock.entity.Product;
import vn.com.dragonvision.smartstock.repository.ProductRepository;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * AiInventoryAssistantService — Dịch vụ Trợ lý AI Kho hàng Thông Minh.
 *
 * <p>Quy trình hoạt động:
 * <ol>
 *   <li>Đọc toàn bộ dữ liệu tồn kho từ database.</li>
 *   <li>Chuyển đổi sang JSON payload và tạo prompt tiếng Việt chi tiết.</li>
 *   <li>Gửi prompt đến LLM API (OpenAI-compatible hoặc Ollama local).</li>
 *   <li>Phân tích phản hồi và trả về khuyến nghị nhập hàng có cấu trúc.</li>
 * </ol>
 * </p>
 *
 * @author Dragon Vision AI Team
 * @version 2.5.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiInventoryAssistantService {

    private final ProductRepository productRepository;
    private final RestTemplate      restTemplate;
    private final ObjectMapper      objectMapper;

    @Value("${dragonvision.ai.api-url:http://localhost:11434/v1/chat/completions}")
    private String aiApiUrl;

    @Value("${dragonvision.ai.model:qwen2.5:7b}")
    private String aiModel;

    @Value("${dragonvision.ai.timeout-ms:30000}")
    private int aiTimeoutMs;

    // ─────────────────────────────────────────────────────────────────────────
    //  PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Phân tích câu hỏi của người dùng và trả lời dựa trên dữ liệu kho thực tế.
     *
     * @param question Câu hỏi tiếng Việt tự nhiên từ nhân viên kho.
     * @return Câu trả lời phân tích có cấu trúc từ mô hình ngôn ngữ lớn.
     */
    public AiAdviceResponse answerQuestion(String question) {
        log.info("[AI-ASSISTANT] Processing question: {}", question);

        // Bước 1: Lấy dữ liệu kho từ DB
        List<Product> allProducts = productRepository.findAllActive();
        String inventoryJson = buildInventoryJson(allProducts);

        // Bước 2: Xây dựng prompt đầy đủ ngữ cảnh
        String systemPrompt = buildSystemPrompt(inventoryJson);
        String userPrompt   = buildUserPrompt(question, allProducts);

        // Bước 3: Gọi AI API
        String rawResponse = callAiApi(systemPrompt, userPrompt);

        // Bước 4: Phân tích & cấu trúc hóa phản hồi
        return AiAdviceResponse.builder()
                .question(question)
                .answer(rawResponse)
                .lowStockAlerts(detectLowStockProducts(allProducts))
                .totalInventoryValue(calculateTotalValue(allProducts))
                .generatedAt(java.time.LocalDateTime.now())
                .build();
    }

    /**
     * Tự động tạo kế hoạch nhập hàng thông minh cho tuần tới.
     *
     * <p>AI phân tích xu hướng xuất kho và tốc độ tiêu thụ để gợi ý
     * số lượng nhập tối ưu cho từng mặt hàng sắp cạn tồn.</p>
     *
     * @return Danh sách khuyến nghị nhập hàng có số lượng và nhà cung cấp đề xuất.
     */
    public AiAdviceResponse generateWeeklyRestockPlan() {
        log.info("[AI-ASSISTANT] Generating weekly restock plan...");
        return answerQuestion(
            "Hãy phân tích tồn kho hiện tại và lập kế hoạch nhập hàng chi tiết " +
            "cho tuần tới, bao gồm số lượng đề xuất và nhà cung cấp ưu tiên."
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Chuyển đổi danh sách sản phẩm sang chuỗi JSON gắn gọn để nhúng vào prompt.
     */
    private String buildInventoryJson(List<Product> products) {
        try {
            List<Map<String, Object>> simplified = products.stream()
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("sku",      p.getSku());
                    m.put("name",     p.getName());
                    m.put("category", p.getCategory().getName());
                    m.put("qty",      p.getQtyStock());
                    m.put("minQty",   p.getMinStockLevel());
                    m.put("unit",     p.getUnit());
                    m.put("price",    p.getSellPrice());
                    m.put("isLow",    p.getQtyStock() <= p.getMinStockLevel());
                    return m;
                })
                .collect(Collectors.toList());
            return objectMapper.writeValueAsString(simplified);
        } catch (Exception e) {
            log.error("Failed to serialize inventory to JSON", e);
            return "[]";
        }
    }

    /**
     * Xây dựng system prompt với ngữ cảnh đầy đủ về dữ liệu kho hiện tại.
     */
    private String buildSystemPrompt(String inventoryJson) {
        return """
            Bạn là chuyên gia quản lý kho hàng thiết bị công nghệ của Dragon Vision AI.
            Hãy phân tích dữ liệu kho dưới đây và trả lời bằng tiếng Việt một cách
            chuyên nghiệp, ngắn gọn và có cấu trúc rõ ràng.

            DỮ LIỆU TỒN KHO HIỆN TẠI (JSON):
            %s

            QUY TẮC:
            - Trả lời bằng tiếng Việt chuẩn, chuyên nghiệp.
            - Sử dụng bullet points và bảng Markdown khi cần thiết.
            - Ưu tiên các sản phẩm có qty <= minQty (đang báo động đỏ).
            - Luôn đề xuất số lượng nhập cụ thể và nhà cung cấp ưu tiên.
            """.formatted(inventoryJson);
    }

    /**
     * Xây dựng user prompt kết hợp câu hỏi và thống kê tóm tắt tức thì.
     */
    private String buildUserPrompt(String question, List<Product> products) {
        long lowCount = products.stream()
            .filter(p -> p.getQtyStock() <= p.getMinStockLevel()).count();

        return """
            Câu hỏi: %s

            Thống kê nhanh:
            - Tổng số mã hàng đang quản lý: %d SKU
            - Mặt hàng chạm ngưỡng cảnh báo: %d sản phẩm
            - Tổng giá trị tồn kho: %,.0f VNĐ

            Hãy phân tích và trả lời chi tiết.
            """.formatted(
                question,
                products.size(),
                lowCount,
                calculateTotalValue(products).doubleValue()
            );
    }

    /**
     * Gửi request đến AI API (OpenAI-compatible chat completion format).
     */
    private String callAiApi(String systemPrompt, String userPrompt) {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", aiModel);
            body.put("temperature", 0.3);
            body.put("max_tokens", 1500);
            body.put("messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user",   "content", userPrompt)
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                aiApiUrl, HttpMethod.POST, entity, Map.class
            );

            // Parse OpenAI-compatible response
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices =
                (List<Map<String, Object>>) response.getBody().get("choices");
            @SuppressWarnings("unchecked")
            Map<String, String> message =
                (Map<String, String>) choices.get(0).get("message");

            String answer = message.get("content");
            log.info("[AI-ASSISTANT] ✓ Received response ({} chars)", answer.length());
            return answer;

        } catch (Exception e) {
            log.error("[AI-ASSISTANT] API call failed: {}", e.getMessage());
            return "Trợ lý AI hiện không khả dụng. Vui lòng kiểm tra kết nối mô hình AI.";
        }
    }

    private List<String> detectLowStockProducts(List<Product> products) {
        return products.stream()
            .filter(p -> p.getQtyStock() <= p.getMinStockLevel())
            .map(p -> String.format("%s (%s): còn %d %s (định mức: %d)",
                    p.getName(), p.getSku(), p.getQtyStock(), p.getUnit(), p.getMinStockLevel()))
            .collect(Collectors.toList());
    }

    private BigDecimal calculateTotalValue(List<Product> products) {
        return products.stream()
            .filter(p -> p.getCostPrice() != null && p.getQtyStock() != null)
            .map(p -> p.getCostPrice().multiply(BigDecimal.valueOf(p.getQtyStock())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

