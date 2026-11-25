package vn.com.dragonvision.smartstock.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.com.dragonvision.smartstock.dto.*;
import vn.com.dragonvision.smartstock.entity.*;
import vn.com.dragonvision.smartstock.exception.InsufficientStockException;
import vn.com.dragonvision.smartstock.repository.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * InventoryTransactionService — Xử lý toàn bộ nghiệp vụ nhập/xuất kho.
 *
 * <p>Mỗi giao dịch xuất kho được bọc trong {@code @Transactional} để đảm bảo
 * tính nguyên vẹn dữ liệu: nếu bất kỳ bước nào thất bại, toàn bộ
 * transaction sẽ rollback tự động (kể cả lịch sử biến động tồn kho).</p>
 *
 * @author Dragon Vision AI Team
 * @version 2.5.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryTransactionService {

    private final ProductRepository           productRepository;
    private final StockReceiptRepository      receiptRepository;
    private final StockReceiptDetailRepository detailRepository;
    private final InventoryHistoryRepository  historyRepository;
    private final SupplierRepository          supplierRepository;

    // ─────────────────────────────────────────────────────────────────────────
    //  LẬP PHIẾU XUẤT KHO
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lập phiếu xuất kho và cập nhật tồn kho theo thời gian thực.
     *
     * <p>Quy trình nghiệp vụ:
     * <ol>
     *   <li>Kiểm tra số lượng tồn thực tế của từng sản phẩm trong request.</li>
     *   <li>Nếu thiếu hàng → ném {@link InsufficientStockException} (HTTP 422).</li>
     *   <li>Trừ số lượng tồn và lưu {@code inventory_history} cho mỗi dòng.</li>
     *   <li>Lưu phiếu xuất và tất cả chi tiết phiếu vào database.</li>
     * </ol>
     * </p>
     *
     * @param request  DTO chứa danh sách sản phẩm cần xuất và thông tin nơi nhận.
     * @param operator Thông tin nhân viên kho đang thực hiện thao tác.
     * @return {@link StockReceiptResponse} phiếu xuất vừa được tạo thành công.
     * @throws InsufficientStockException khi số lượng xuất vượt quá tồn kho hiện có.
     */
    @Transactional(rollbackFor = Exception.class)
    public StockReceiptResponse createStockOutReceipt(StockOutRequest request, AppUser operator) {

        log.info("[TX-OUT] Starting stock-out transaction by user={}, items={}",
                operator.getUsername(), request.getItems().size());

        // ── BƯỚC 1: Validate tồn kho TRƯỚC khi thay đổi bất kỳ dữ liệu nào ──
        List<String> errors = new ArrayList<>();
        for (var item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Sản phẩm ID=" + item.getProductId() + " không tồn tại trong hệ thống."));

            if (product.getQtyStock() < item.getQtyOut()) {
                errors.add(String.format(
                        "Sản phẩm \"%s\" [%s] chỉ còn %d %s, không đủ để xuất %d %s.",
                        product.getName(), product.getSku(),
                        product.getQtyStock(), product.getUnit(),
                        item.getQtyOut(), product.getUnit()
                ));
            }
        }
        // Nếu có bất kỳ lỗi nào → rollback toàn bộ transaction
        if (!errors.isEmpty()) {
            throw new InsufficientStockException(String.join("\n", errors));
        }

        // ── BƯỚC 2: Tạo phiếu xuất kho (header) ────────────────────────────
        String receiptCode = generateReceiptCode("PX");
        StockReceipt receipt = StockReceipt.builder()
                .code(receiptCode)
                .type(ReceiptType.STOCK_OUT)
                .receiver(request.getReceiver())
                .note(request.getNote())
                .createdBy(operator)
                .createdAt(LocalDateTime.now())
                .status(ReceiptStatus.COMPLETED)
                .build();

        // ── BƯỚC 3: Trừ tồn kho và ghi lịch sử biến động ──────────────────
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<StockReceiptDetail> details = new ArrayList<>();

        for (var item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElseThrow();
            int qtyBefore = product.getQtyStock();

            // Trừ tồn kho – Database constraint CHECK (qty_stock >= 0) sẽ bắt lỗi nếu sót
            product.setQtyStock(qtyBefore - item.getQtyOut());
            productRepository.save(product);

            // Ghi lịch sử biến động tồn kho
            InventoryHistory history = InventoryHistory.builder()
                    .product(product)
                    .receipt(receipt)
                    .qtyBefore(qtyBefore)
                    .qtyChange(-item.getQtyOut())       // âm = xuất
                    .qtyAfter(product.getQtyStock())
                    .type(HistoryType.STOCK_OUT)
                    .note("Xuất kho theo phiếu " + receiptCode)
                    .operator(operator)
                    .createdAt(LocalDateTime.now())
                    .build();
            historyRepository.save(history);

            // Tích lũy chi tiết phiếu
            BigDecimal lineTotal = item.getUnitPrice()
                    .multiply(BigDecimal.valueOf(item.getQtyOut()));
            totalAmount = totalAmount.add(lineTotal);

            details.add(StockReceiptDetail.builder()
                    .receipt(receipt)
                    .product(product)
                    .productName(product.getName())
                    .productSku(product.getSku())
                    .unitPrice(item.getUnitPrice())
                    .qty(item.getQtyOut())
                    .total(lineTotal)
                    .build());
        }

        receipt.setTotalAmount(totalAmount);
        receipt.setDetails(details);
        StockReceipt saved = receiptRepository.save(receipt);

        log.info("[TX-OUT] ✓ Receipt {} saved. Total={} VNĐ. Items={}",
                saved.getCode(), totalAmount, details.size());

        return StockReceiptResponse.fromEntity(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  LẬP PHIẾU NHẬP KHO
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Lập phiếu nhập kho và cộng dồn tồn kho tức thì.
     *
     * @param request  DTO phiếu nhập (nhà cung cấp + danh sách sản phẩm nhập).
     * @param operator Nhân viên thực hiện.
     * @return Phiếu nhập đã được lưu.
     */
    @Transactional(rollbackFor = Exception.class)
    public StockReceiptResponse createStockInReceipt(StockInRequest request, AppUser operator) {

        log.info("[TX-IN] Starting stock-in transaction by user={}", operator.getUsername());

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new IllegalArgumentException("Nhà cung cấp không tồn tại."));

        String receiptCode = generateReceiptCode("PN");
        StockReceipt receipt = StockReceipt.builder()
                .code(receiptCode)
                .type(ReceiptType.STOCK_IN)
                .supplier(supplier)
                .note(request.getNote())
                .createdBy(operator)
                .createdAt(LocalDateTime.now())
                .status(ReceiptStatus.COMPLETED)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<StockReceiptDetail> details = new ArrayList<>();

        for (var item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElseThrow();
            int qtyBefore = product.getQtyStock();

            // Cộng dồn tồn kho
            product.setQtyStock(qtyBefore + item.getQtyIn());
            productRepository.save(product);

            historyRepository.save(InventoryHistory.builder()
                    .product(product)
                    .receipt(receipt)
                    .qtyBefore(qtyBefore)
                    .qtyChange(item.getQtyIn())         // dương = nhập
                    .qtyAfter(product.getQtyStock())
                    .type(HistoryType.STOCK_IN)
                    .note("Nhập kho theo phiếu " + receiptCode + " từ " + supplier.getName())
                    .operator(operator)
                    .createdAt(LocalDateTime.now())
                    .build());

            BigDecimal lineTotal = item.getCostPrice().multiply(BigDecimal.valueOf(item.getQtyIn()));
            totalAmount = totalAmount.add(lineTotal);

            details.add(StockReceiptDetail.builder()
                    .receipt(receipt).product(product)
                    .productName(product.getName()).productSku(product.getSku())
                    .unitPrice(item.getCostPrice()).qty(item.getQtyIn()).total(lineTotal)
                    .build());
        }

        receipt.setTotalAmount(totalAmount);
        receipt.setDetails(details);
        StockReceipt saved = receiptRepository.save(receipt);

        log.info("[TX-IN] ✓ Receipt {} saved. Total={} VNĐ", saved.getCode(), totalAmount);
        return StockReceiptResponse.fromEntity(saved);
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private String generateReceiptCode(String prefix) {
        return prefix + System.currentTimeMillis() % 1_000_000;
    }
}

