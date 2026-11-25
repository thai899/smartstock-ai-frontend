-- ============================================================
-- Dragon Vision AI — SmartStock: Lược đồ CSDL PostgreSQL
-- Phiên bản: 2.5.0 | Tác giả: Dragon Vision AI Team
-- ============================================================

-- ── Bảng 1: Danh mục sản phẩm ────────────────────────────────
CREATE TABLE IF NOT EXISTS product_category (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    image_url   VARCHAR(500),
    sort_order  INT          NOT NULL DEFAULT 0,
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE  product_category             IS 'Danh mục sản phẩm trong kho (Laptop, Linh kiện PC, Phụ kiện...)';
COMMENT ON COLUMN product_category.sort_order  IS 'Thứ tự hiển thị trên giao diện';

-- ── Bảng 2: Sản phẩm ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product (
    id               BIGSERIAL       PRIMARY KEY,
    category_id      BIGINT          REFERENCES product_category(id) ON DELETE SET NULL,
    sku              VARCHAR(100)    NOT NULL UNIQUE,
    name             VARCHAR(255)    NOT NULL,
    unit             VARCHAR(50)     NOT NULL DEFAULT 'Chiếc',
    cost_price       NUMERIC(15, 2)  NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    sell_price       NUMERIC(15, 2)  NOT NULL DEFAULT 0 CHECK (sell_price >= 0),
    qty_stock        INT             NOT NULL DEFAULT 0  CHECK (qty_stock  >= 0),
    min_stock_level  INT             NOT NULL DEFAULT 5  CHECK (min_stock_level >= 0),
    location         VARCHAR(100),
    image_url        VARCHAR(500),
    description      TEXT,
    active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN product.qty_stock        IS 'Số lượng tồn kho hiện tại (ràng buộc >= 0)';
COMMENT ON COLUMN product.min_stock_level  IS 'Ngưỡng tồn kho tối thiểu, kích hoạt cảnh báo';

CREATE INDEX IF NOT EXISTS idx_product_category ON product(category_id);
CREATE INDEX IF NOT EXISTS idx_product_sku       ON product(sku);

-- ── Bảng 3: Nhà cung cấp ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS supplier (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    contact     VARCHAR(100),
    phone       VARCHAR(20),
    email       VARCHAR(150),
    address     TEXT,
    tax_code    VARCHAR(50),
    active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── Bảng 4: Phiếu nhập/xuất kho ──────────────────────────────
CREATE TABLE IF NOT EXISTS stock_receipt (
    id            BIGSERIAL    PRIMARY KEY,
    code          VARCHAR(50)  NOT NULL UNIQUE,
    type          VARCHAR(10)  NOT NULL CHECK (type IN ('STOCK_IN', 'STOCK_OUT')),
    supplier_id   BIGINT       REFERENCES supplier(id) ON DELETE SET NULL,
    receiver      VARCHAR(255),
    total_amount  NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status        VARCHAR(20)  NOT NULL DEFAULT 'COMPLETED'
                               CHECK (status IN ('DRAFT', 'COMPLETED', 'CANCELLED')),
    note          TEXT,
    created_by    BIGINT,                -- FK → app_user (giản lược)
    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_receipt_type       ON stock_receipt(type);
CREATE INDEX IF NOT EXISTS idx_receipt_created_at ON stock_receipt(created_at DESC);

-- ── Bảng 5: Chi tiết phiếu nhập/xuất ─────────────────────────
CREATE TABLE IF NOT EXISTS stock_receipt_detail (
    id            BIGSERIAL      PRIMARY KEY,
    receipt_id    BIGINT         NOT NULL REFERENCES stock_receipt(id) ON DELETE CASCADE,
    product_id    BIGINT         REFERENCES product(id) ON DELETE SET NULL,
    product_name  VARCHAR(255)   NOT NULL,  -- snapshot tại thời điểm tạo phiếu
    product_sku   VARCHAR(100)   NOT NULL,
    unit_price    NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
    qty           INT            NOT NULL   CHECK (qty > 0),
    total         NUMERIC(15, 2) NOT NULL   CHECK (total >= 0),
    note          TEXT,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_detail_receipt_id  ON stock_receipt_detail(receipt_id);
CREATE INDEX IF NOT EXISTS idx_detail_product_id  ON stock_receipt_detail(product_id);

-- ── Bảng 6: Lịch sử biến động tồn kho ───────────────────────
CREATE TABLE IF NOT EXISTS inventory_history (
    id          BIGSERIAL   PRIMARY KEY,
    product_id  BIGINT      NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    receipt_id  BIGINT      REFERENCES stock_receipt(id) ON DELETE SET NULL,
    qty_before  INT         NOT NULL,
    qty_change  INT         NOT NULL,  -- dương: nhập, âm: xuất
    qty_after   INT         NOT NULL   CHECK (qty_after >= 0),
    type        VARCHAR(20) NOT NULL CHECK (type IN ('STOCK_IN','STOCK_OUT','ADJUSTMENT')),
    note        TEXT,
    operator_id BIGINT,                -- FK → app_user (giản lược)
    created_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN inventory_history.qty_change IS 'Dương (+) = nhập kho, Âm (-) = xuất kho';
COMMENT ON COLUMN inventory_history.qty_after  IS 'Ràng buộc tồn kho sau giao dịch phải >= 0';

CREATE INDEX IF NOT EXISTS idx_history_product_id ON inventory_history(product_id);
CREATE INDEX IF NOT EXISTS idx_history_created_at  ON inventory_history(created_at DESC);

-- ── Seed dữ liệu mẫu cho môi trường phát triển ───────────────
INSERT INTO product_category (name, sort_order) VALUES
  ('Laptop',          1),
  ('Linh kiện PC',    2),
  ('Thiết bị mạng',   3),
  ('Phụ kiện',        4)
ON CONFLICT (name) DO NOTHING;

