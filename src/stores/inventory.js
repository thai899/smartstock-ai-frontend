import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  // Categories
  const categories = ref([
    'Tất cả',
    'Laptop',
    'Linh kiện PC',
    'Thiết bị mạng',
    'Phụ kiện'
  ])

  // Products
  const products = ref([
    {
      id: 1,
      sku: 'SKU-LT-01',
      name: 'Laptop Asus ROG Strix G16 (i7-13650HX/16GB/512GB/RTX 4060)',
      category: 'Laptop',
      unit: 'Chiếc',
      costPrice: 28500000,
      sellPrice: 32990000,
      stock: 12,
      minStock: 5,
      location: 'Kho A-01',
      updatedAt: '24/11/2026'
    },
    {
      id: 2,
      sku: 'SKU-LT-02',
      name: 'Laptop Dell XPS 13 Plus 9320 (i7-1360P/16GB/1TB 3.5K OLED)',
      category: 'Laptop',
      unit: 'Chiếc',
      costPrice: 34000000,
      sellPrice: 39500000,
      stock: 3,
      minStock: 5,
      location: 'Kho A-02',
      updatedAt: '23/11/2026'
    },
    {
      id: 3,
      sku: 'SKU-PC-01',
      name: 'CPU Intel Core i7-14700K (33M Cache, up to 5.60 GHz, 20C/28T)',
      category: 'Linh kiện PC',
      unit: 'Hộp',
      costPrice: 8800000,
      sellPrice: 10290000,
      stock: 2,
      minStock: 6,
      location: 'Kho B-03',
      updatedAt: '24/11/2026'
    },
    {
      id: 4,
      sku: 'SKU-PC-02',
      name: 'Card màn hình MSI GeForce RTX 4070 Super GAMING X SLIM 12G',
      category: 'Linh kiện PC',
      unit: 'Chiếc',
      costPrice: 16500000,
      sellPrice: 18990000,
      stock: 18,
      minStock: 8,
      location: 'Kho B-01',
      updatedAt: '22/11/2026'
    },
    {
      id: 5,
      sku: 'SKU-PC-03',
      name: 'RAM Corsair Vengeance RGB DDR5 32GB (2x16GB) 6000MHz Black',
      category: 'Linh kiện PC',
      unit: 'Bộ',
      costPrice: 2600000,
      sellPrice: 3190000,
      stock: 45,
      minStock: 10,
      location: 'Kho B-05',
      updatedAt: '21/11/2026'
    },
    {
      id: 6,
      sku: 'SKU-PC-04',
      name: 'Ổ cứng SSD Samsung 990 Pro 2TB PCIe Gen 4.0 x4 NVMe M.2',
      category: 'Linh kiện PC',
      unit: 'Chiếc',
      costPrice: 3800000,
      sellPrice: 4590000,
      stock: 25,
      minStock: 10,
      location: 'Kho B-02',
      updatedAt: '24/11/2026'
    },
    {
      id: 7,
      sku: 'SKU-NW-01',
      name: 'Router Wi-Fi 6 ASUS RT-AX88U Pro AX6000 Dual-Band AiMesh',
      category: 'Thiết bị mạng',
      unit: 'Bộ',
      costPrice: 5200000,
      sellPrice: 6390000,
      stock: 2,
      minStock: 4,
      location: 'Kho C-01',
      updatedAt: '20/11/2026'
    },
    {
      id: 8,
      sku: 'SKU-NW-02',
      name: 'Thiết bị chuyển mạch Switch Cisco Business 110-24T 24-Port GE',
      category: 'Thiết bị mạng',
      unit: 'Thiết bị',
      costPrice: 4100000,
      sellPrice: 4950000,
      stock: 14,
      minStock: 5,
      location: 'Kho C-02',
      updatedAt: '19/11/2026'
    },
    {
      id: 9,
      sku: 'SKU-PK-01',
      name: 'Bàn phím cơ không dây Leopold FC900RBT White Grey Cherry MX',
      category: 'Phụ kiện',
      unit: 'Chiếc',
      costPrice: 2700000,
      sellPrice: 3350000,
      stock: 3,
      minStock: 8,
      location: 'Kho D-01',
      updatedAt: '24/11/2026'
    },
    {
      id: 10,
      sku: 'SKU-PK-02',
      name: 'Chuột công thái học Logitech MX Master 3S Wireless Bluetooth',
      category: 'Phụ kiện',
      unit: 'Chiếc',
      costPrice: 1850000,
      sellPrice: 2390000,
      stock: 32,
      minStock: 10,
      location: 'Kho D-02',
      updatedAt: '24/11/2026'
    }
  ])

  // Suppliers
  const suppliers = ref([
    'Công ty Cổ phần Thế Giới Số (Digiworld)',
    'Công ty TNHH Phân Phối Synnex FPT',
    'Công ty TNHH Vi Tính Vĩnh Xuân (SPC)',
    'Công ty TNHH Tin học Mai Hoàng',
    'Nhà phân phối ASUS Việt Nam',
    'Nhà phân phối Corsair & Kingston Tech'
  ])

  // Stock In receipts
  const stockInReceipts = ref([
    {
      id: 'PN002',
      code: 'PN002',
      createdAt: '24/11/2026 14:30',
      supplier: 'Công ty TNHH Phân Phối Synnex FPT',
      createdBy: 'Trịnh Hoàng Thái',
      itemsCount: 2,
      totalAmount: 184000000,
      status: 'Đã nhập kho',
      items: [
        { productId: 4, productName: 'Card màn hình MSI GeForce RTX 4070 Super', sku: 'SKU-PC-02', quantity: 10, costPrice: 16500000, total: 165000000 },
        { productId: 5, productName: 'RAM Corsair Vengeance RGB DDR5 32GB', sku: 'SKU-PC-03', quantity: 10, costPrice: 2600000, total: 19000000 }
      ],
      note: 'Nhập hàng lô khuyến mãi tháng 11'
    },
    {
      id: 'PN001',
      code: 'PN001',
      createdAt: '22/11/2026 09:15',
      supplier: 'Công ty Cổ phần Thế Giới Số (Digiworld)',
      createdBy: 'Trịnh Hoàng Thái',
      itemsCount: 1,
      totalAmount: 142500000,
      status: 'Đã nhập kho',
      items: [
        { productId: 1, productName: 'Laptop Asus ROG Strix G16', sku: 'SKU-LT-01', quantity: 5, costPrice: 28500000, total: 142500000 }
      ],
      note: 'Nhập đơn hàng dự án khách VIP'
    }
  ])

  // Stock Out receipts
  const stockOutReceipts = ref([
    {
      id: 'PX002',
      code: 'PX002',
      createdAt: '24/11/2026 16:10',
      receiver: 'Showroom Chi nhánh Quận 1',
      createdBy: 'Trịnh Hoàng Thái',
      itemsCount: 2,
      totalAmount: 51980000,
      status: 'Đã xuất kho',
      items: [
        { productId: 1, productName: 'Laptop Asus ROG Strix G16', sku: 'SKU-LT-01', quantity: 1, price: 32990000, total: 32990000 },
        { productId: 4, productName: 'Card màn hình MSI GeForce RTX 4070 Super', sku: 'SKU-PC-02', quantity: 1, price: 18990000, total: 18990000 }
      ],
      note: 'Xuất hàng trưng bày & bán lẻ'
    },
    {
      id: 'PX001',
      code: 'PX001',
      createdAt: '23/11/2026 11:20',
      receiver: 'Khách hàng Doanh nghiệp FPT Software',
      createdBy: 'Trịnh Hoàng Thái',
      itemsCount: 2,
      totalAmount: 49500000,
      status: 'Đã xuất kho',
      items: [
        { productId: 6, productName: 'Ổ cứng SSD Samsung 990 Pro 2TB NVMe', sku: 'SKU-PC-04', quantity: 5, price: 4590000, total: 22950000 },
        { productId: 8, productName: 'Switch Cisco Business 110-24T', sku: 'SKU-NW-02', quantity: 2, price: 4950000, total: 9900000 }
      ],
      note: 'Giao hàng đợt 1 theo hợp đồng C-2026'
    }
  ])

  // Activities log for dashboard
  const activities = ref([
    {
      id: 1,
      type: 'OUT',
      code: 'PX002',
      title: 'Xuất 2 sản phẩm cho Showroom Chi nhánh Quận 1',
      timestamp: 'Hôm nay, 16:10',
      operator: 'Trịnh Hoàng Thái',
      amount: '51.980.000đ',
      badgeClass: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 2,
      type: 'IN',
      code: 'PN002',
      title: 'Nhập 20 linh kiện từ Synnex FPT',
      timestamp: 'Hôm nay, 14:30',
      operator: 'Trịnh Hoàng Thái',
      amount: '184.000.000đ',
      badgeClass: 'bg-blue-100 text-blue-700'
    },
    {
      id: 3,
      type: 'WARNING',
      code: 'CẢNH BÁO',
      title: 'CPU Intel i7-14700K chỉ còn 2 hộp (định mức tối thiểu: 6)',
      timestamp: 'Hôm nay, 10:00',
      operator: 'Hệ thống SmartStock AI',
      amount: 'Cần nhập gấp',
      badgeClass: 'bg-rose-100 text-rose-700'
    },
    {
      id: 4,
      type: 'OUT',
      code: 'PX001',
      title: 'Xuất 7 thiết bị cho FPT Software',
      timestamp: 'Hôm qua, 11:20',
      operator: 'Trịnh Hoàng Thái',
      amount: '49.500.000đ',
      badgeClass: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 5,
      type: 'IN',
      code: 'PN001',
      title: 'Nhập 5 Laptop Asus ROG Strix từ Digiworld',
      timestamp: '22/11/2026, 09:15',
      operator: 'Trịnh Hoàng Thái',
      amount: '142.500.000đ',
      badgeClass: 'bg-blue-100 text-blue-700'
    }
  ])

  // Getters
  const lowStockProducts = computed(() => {
    return products.value.filter(p => p.stock <= p.minStock)
  })

  const lowStockCount = computed(() => {
    return lowStockProducts.value.length
  })

  const totalInventoryValue = computed(() => {
    // Exact sum or default baseline ~1.480.000.000đ
    const rawSum = products.value.reduce((sum, p) => sum + (p.stock * p.costPrice), 0)
    // Scale or offset so baseline starts at 1.480.000.000đ
    return rawSum
  })

  const monthlyStockInCount = computed(() => {
    return 40 + stockInReceipts.value.length
  })

  const monthlyStockOutCount = computed(() => {
    return 116 + stockOutReceipts.value.length
  })

  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val).replace('₫', 'đ')
  }

  // Format number
  const formatNumber = (val) => {
    return new Intl.NumberFormat('vi-VN').format(val)
  }

  // Actions
  function addProduct(newProd) {
    const id = products.value.length + 1
    const product = {
      id,
      sku: newProd.sku || `SKU-${Date.now().toString().slice(-4)}`,
      name: newProd.name,
      category: newProd.category || 'Phụ kiện',
      unit: newProd.unit || 'Chiếc',
      costPrice: Number(newProd.costPrice) || 0,
      sellPrice: Number(newProd.sellPrice) || 0,
      stock: Number(newProd.stock) || 0,
      minStock: Number(newProd.minStock) || 5,
      location: newProd.location || 'Kho D-03',
      updatedAt: 'Hôm nay'
    }
    products.value.unshift(product)
    activities.value.unshift({
      id: Date.now(),
      type: 'PRODUCT',
      code: product.sku,
      title: `Thêm mới sản phẩm: ${product.name}`,
      timestamp: 'Vừa xong',
      operator: 'Trịnh Hoàng Thái',
      amount: `Tồn đầu: ${product.stock}`,
      badgeClass: 'bg-purple-100 text-purple-700'
    })
    return product
  }

  function createStockInReceipt(payload) {
    const nextNum = stockInReceipts.value.length + 1
    const code = `PN${String(nextNum).padStart(3, '0')}`
    
    let totalAmount = 0
    const processedItems = payload.items.map(item => {
      const prod = products.value.find(p => p.id === item.productId)
      const qty = Number(item.quantity)
      const price = Number(item.costPrice || prod?.costPrice || 0)
      const total = qty * price
      totalAmount += total

      // CỘNG DỒN VÀO TỒN KHO TRỰC TIẾP
      if (prod) {
        prod.stock += qty
        prod.updatedAt = 'Hôm nay'
      }

      return {
        productId: item.productId,
        productName: prod ? prod.name : 'Sản phẩm',
        sku: prod ? prod.sku : '',
        quantity: qty,
        costPrice: price,
        total
      }
    })

    const receipt = {
      id: code,
      code,
      createdAt: 'Hôm nay, ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      supplier: payload.supplier,
      createdBy: 'Trịnh Hoàng Thái',
      itemsCount: processedItems.length,
      totalAmount,
      status: 'Đã nhập kho',
      items: processedItems,
      note: payload.note || 'Nhập kho thông thường'
    }

    stockInReceipts.value.unshift(receipt)

    activities.value.unshift({
      id: Date.now(),
      type: 'IN',
      code,
      title: `Nhập kho từ ${payload.supplier} (${processedItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm)`,
      timestamp: 'Vừa xong',
      operator: 'Trịnh Hoàng Thái',
      amount: formatCurrency(totalAmount),
      badgeClass: 'bg-blue-100 text-blue-700'
    })

    return receipt
  }

  function createStockOutReceipt(payload) {
    // 1. Validation check
    for (const item of payload.items) {
      const prod = products.value.find(p => p.id === item.productId)
      if (!prod) {
        throw new Error('Sản phẩm không tồn tại trong hệ thống')
      }
      if (Number(item.quantity) > prod.stock) {
        throw new Error(`Sản phẩm "${prod.name}" chỉ còn ${prod.stock} ${prod.unit} trong kho, không đủ số lượng để xuất (${item.quantity} ${prod.unit})!`)
      }
    }

    // 2. Perform Stock Out
    const nextNum = stockOutReceipts.value.length + 1
    const code = `PX${String(nextNum).padStart(3, '0')}`

    let totalAmount = 0
    const processedItems = payload.items.map(item => {
      const prod = products.value.find(p => p.id === item.productId)
      const qty = Number(item.quantity)
      const price = Number(item.price || prod?.sellPrice || 0)
      const total = qty * price
      totalAmount += total

      // TRỪ TRỰC TIẾP VÀO TỒN KHO
      prod.stock -= qty
      prod.updatedAt = 'Hôm nay'

      return {
        productId: item.productId,
        productName: prod.name,
        sku: prod.sku,
        quantity: qty,
        price,
        total
      }
    })

    const receipt = {
      id: code,
      code,
      createdAt: 'Hôm nay, ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      receiver: payload.receiver,
      createdBy: 'Trịnh Hoàng Thái',
      itemsCount: processedItems.length,
      totalAmount,
      status: 'Đã xuất kho',
      items: processedItems,
      note: payload.note || 'Xuất kho phục vụ kinh doanh'
    }

    stockOutReceipts.value.unshift(receipt)

    activities.value.unshift({
      id: Date.now(),
      type: 'OUT',
      code,
      title: `Xuất kho cho ${payload.receiver} (${processedItems.reduce((s, i) => s + i.quantity, 0)} sản phẩm)`,
      timestamp: 'Vừa xong',
      operator: 'Trịnh Hoàng Thái',
      amount: formatCurrency(totalAmount),
      badgeClass: 'bg-emerald-100 text-emerald-700'
    })

    return receipt
  }

  return {
    categories,
    products,
    suppliers,
    stockInReceipts,
    stockOutReceipts,
    activities,
    lowStockProducts,
    lowStockCount,
    totalInventoryValue,
    monthlyStockInCount,
    monthlyStockOutCount,
    formatCurrency,
    formatNumber,
    addProduct,
    createStockInReceipt,
    createStockOutReceipt
  }
})

