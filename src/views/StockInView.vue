<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import {
  ArrowDownToLine,
  Plus,
  Trash2,
  Calendar,
  Building2,
  CheckCircle2,
  FileText,
  X,
  Search,
  Receipt,
  Eye
} from 'lucide-vue-next'

const route = useRoute()
const store = useInventoryStore()

const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedReceipt = ref(null)
const successMessage = ref('')

// Pre-fill if navigated from dashboard
const initialProductId = route.query.productId ? Number(route.query.productId) : (store.products[0]?.id || 1)

// Form state
const formSupplier = ref(store.suppliers[0])
const formNote = ref('')
const formItems = ref([
  {
    productId: initialProductId,
    quantity: 5,
    costPrice: store.products.find(p => p.id === initialProductId)?.costPrice || 0
  }
])

const handleProductChange = (index) => {
  const item = formItems.value[index]
  const prod = store.products.find(p => p.id === item.productId)
  if (prod) {
    item.costPrice = prod.costPrice
  }
}

const addItemRow = () => {
  formItems.value.push({
    productId: store.products[0]?.id || 1,
    quantity: 5,
    costPrice: store.products[0]?.costPrice || 0
  })
}

const removeItemRow = (index) => {
  if (formItems.value.length > 1) {
    formItems.value.splice(index, 1)
  }
}

const formTotalAmount = computed(() => {
  return formItems.value.reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.costPrice))
  }, 0)
})

const handleSaveStockIn = () => {
  try {
    const receipt = store.createStockInReceipt({
      supplier: formSupplier.value,
      note: formNote.value,
      items: formItems.value
    })

    showCreateModal.value = false
    successMessage.value = `Lập phiếu nhập ${receipt.code} thành công! Đã cộng dồn số lượng vào tồn kho.`

    // Auto dismiss toast
    setTimeout(() => {
      successMessage.value = ''
    }, 4000)

    // Reset form
    formNote.value = ''
    formItems.value = [
      {
        productId: store.products[0]?.id || 1,
        quantity: 5,
        costPrice: store.products[0]?.costPrice || 0
      }
    ]
  } catch (err) {
    alert(err.message)
  }
}

const viewDetails = (receipt) => {
  selectedReceipt.value = receipt
  showDetailModal.value = true
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Success Toast -->
    <div
      v-if="successMessage"
      class="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-4 duration-200"
    >
      <div class="flex items-center gap-3 text-sm font-semibold">
        <CheckCircle2 class="w-5 h-5 text-emerald-200 shrink-0" />
        <span>{{ successMessage }}</span>
      </div>
      <button @click="successMessage = ''" class="text-emerald-200 hover:text-white">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Header bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ArrowDownToLine class="w-6 h-6 text-blue-700" />
          <span>Quản lý Nhập Kho & Danh sách Phiếu Nhập</span>
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          Theo dõi các lô hàng nhập từ nhà cung cấp & tự động gia tăng tồn kho
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="showCreateModal = true"
          class="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>+ Lập phiếu nhập kho</span>
        </button>
      </div>
    </div>

    <!-- Receipts Table -->
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/90">
            <tr>
              <th class="py-3.5 px-4">Mã phiếu</th>
              <th class="py-3.5 px-4">Thời gian</th>
              <th class="py-3.5 px-4">Nhà cung cấp</th>
              <th class="py-3.5 px-3 text-center">Số mặt hàng</th>
              <th class="py-3.5 px-4 text-right">Tổng tiền nhập</th>
              <th class="py-3.5 px-4">Người lập</th>
              <th class="py-3.5 px-4 text-center">Trạng thái</th>
              <th class="py-3.5 px-4 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="rc in store.stockInReceipts"
              :key="rc.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <td class="py-4 px-4 font-mono font-bold text-xs text-blue-700">
                {{ rc.code }}
              </td>
              <td class="py-4 px-4 text-xs font-medium text-slate-600">
                {{ rc.createdAt }}
              </td>
              <td class="py-4 px-4 font-semibold text-slate-800">
                <div>{{ rc.supplier }}</div>
                <div class="text-[11px] text-slate-400 font-normal italic">{{ rc.note }}</div>
              </td>
              <td class="py-4 px-3 text-center font-bold text-slate-700">
                {{ rc.itemsCount }} loại
              </td>
              <td class="py-4 px-4 text-right font-extrabold text-blue-700 text-sm">
                {{ store.formatCurrency(rc.totalAmount) }}
              </td>
              <td class="py-4 px-4 text-xs text-slate-600 font-medium">
                {{ rc.createdBy }}
              </td>
              <td class="py-4 px-4 text-center">
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <CheckCircle2 class="w-3.5 h-3.5 text-blue-600" />
                  <span>{{ rc.status }}</span>
                </span>
              </td>
              <td class="py-4 px-4 text-right">
                <button
                  @click="viewDetails(rc)"
                  class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>Xem</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Lập phiếu nhập kho -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ArrowDownToLine class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-base">Lập Phiếu Nhập Kho Mới</h3>
              <p class="text-xs text-slate-400">Chọn nhà cung cấp và danh mục sản phẩm nhập kho</p>
            </div>
          </div>
          <button
            @click="showCreateModal = false"
            class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleSaveStockIn" class="space-y-4">
          <!-- Supplier -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Nhà cung cấp *</label>
            <select
              v-model="formSupplier"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-semibold"
            >
              <option v-for="sup in store.suppliers" :key="sup" :value="sup">
                {{ sup }}
              </option>
            </select>
          </div>

          <!-- Items Rows -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-600">
                Chi tiết sản phẩm nhập kho
              </label>
              <button
                type="button"
                @click="addItemRow"
                class="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
              >
                <Plus class="w-3.5 h-3.5" />
                <span>+ Thêm dòng sản phẩm</span>
              </button>
            </div>

            <div class="space-y-2.5">
              <div
                v-for="(row, idx) in formItems"
                :key="idx"
                class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3"
              >
                <!-- Product select -->
                <div class="flex-1">
                  <label class="text-[10px] font-bold text-slate-400 uppercase">Sản phẩm</label>
                  <select
                    v-model="row.productId"
                    @change="handleProductChange(idx)"
                    class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-blue-700"
                  >
                    <option v-for="p in store.products" :key="p.id" :value="p.id">
                      [{{ p.sku }}] {{ p.name }} (Tồn hiện tại: {{ p.stock }} {{ p.unit }})
                    </option>
                  </select>
                </div>

                <!-- Quantity -->
                <div class="w-24">
                  <label class="text-[10px] font-bold text-slate-400 uppercase">Số lượng</label>
                  <input
                    v-model="row.quantity"
                    type="number"
                    min="1"
                    required
                    class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center focus:outline-none focus:border-blue-700"
                  />
                </div>

                <!-- Price -->
                <div class="w-36">
                  <label class="text-[10px] font-bold text-slate-400 uppercase">Giá nhập (đ)</label>
                  <input
                    v-model="row.costPrice"
                    type="number"
                    min="0"
                    required
                    class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-right focus:outline-none focus:border-blue-700"
                  />
                </div>

                <!-- Remove Row -->
                <div class="pt-4">
                  <button
                    type="button"
                    @click="removeItemRow(idx)"
                    :disabled="formItems.length === 1"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Calculation card -->
          <div class="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <span class="text-xs font-bold text-blue-900">Tổng giá trị phiếu nhập:</span>
            <span class="text-xl font-extrabold text-blue-700">
              {{ store.formatCurrency(formTotalAmount) }}
            </span>
          </div>

          <!-- Note -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Ghi chú phiếu nhập</label>
            <input
              v-model="formNote"
              type="text"
              placeholder="Ví dụ: Nhập hàng bổ sung đợt khuyến mãi, hóa đơn kèm theo..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-medium"
            />
          </div>

          <!-- Submit Buttons -->
          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              @click="showCreateModal = false"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>Xác nhận nhập kho & Lưu</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Xem chi tiết phiếu nhập -->
    <div
      v-if="showDetailModal && selectedReceipt"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div class="font-mono text-xs font-bold text-blue-700">{{ selectedReceipt.code }}</div>
            <h3 class="font-bold text-slate-800 text-base">Chi tiết Phiếu Nhập Kho</h3>
          </div>
          <button
            @click="showDetailModal = false"
            class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <div><strong>Nhà cung cấp:</strong> {{ selectedReceipt.supplier }}</div>
          <div><strong>Thời gian:</strong> {{ selectedReceipt.createdAt }}</div>
          <div><strong>Người lập:</strong> {{ selectedReceipt.createdBy }}</div>
          <div><strong>Ghi chú:</strong> {{ selectedReceipt.note }}</div>
        </div>

        <div class="space-y-2 max-h-56 overflow-y-auto">
          <div
            v-for="(it, idx) in selectedReceipt.items"
            :key="idx"
            class="p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
          >
            <div>
              <div class="font-bold text-slate-800">{{ it.productName }}</div>
              <div class="text-[11px] text-slate-400 font-mono">{{ it.sku }}</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-slate-900">{{ it.quantity }} x {{ store.formatCurrency(it.costPrice) }}</div>
              <div class="font-extrabold text-blue-700 text-xs">{{ store.formatCurrency(it.total) }}</div>
            </div>
          </div>
        </div>

        <div class="p-3 bg-blue-50 rounded-xl flex items-center justify-between text-sm font-bold text-blue-900">
          <span>Tổng thanh toán:</span>
          <span class="text-base text-blue-700">{{ store.formatCurrency(selectedReceipt.totalAmount) }}</span>
        </div>

        <div class="pt-2 text-right">
          <button
            @click="showDetailModal = false"
            class="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

