<script setup>
import { ref, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import {
  ArrowUpFromLine,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Eye,
  Store,
  User,
  AlertTriangle
} from 'lucide-vue-next'

const store = useInventoryStore()

const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedReceipt = ref(null)
const successMessage = ref('')
const errorMessage = ref('')

// Form state
const formReceiver = ref('Showroom Chi nhánh Quận 1')
const formNote = ref('')
const formItems = ref([
  {
    productId: store.products[0]?.id || 1,
    quantity: 1,
    price: store.products[0]?.sellPrice || 0
  }
])

const handleProductChange = (index) => {
  const item = formItems.value[index]
  const prod = store.products.find(p => p.id === item.productId)
  if (prod) {
    item.price = prod.sellPrice
  }
  // Clear any existing error message
  errorMessage.value = ''
}

const addItemRow = () => {
  formItems.value.push({
    productId: store.products[0]?.id || 1,
    quantity: 1,
    price: store.products[0]?.sellPrice || 0
  })
}

const removeItemRow = (index) => {
  if (formItems.value.length > 1) {
    formItems.value.splice(index, 1)
  }
}

const formTotalAmount = computed(() => {
  return formItems.value.reduce((sum, item) => {
    return sum + (Number(item.quantity) * Number(item.price))
  }, 0)
})

const handleSaveStockOut = () => {
  errorMessage.value = ''
  try {
    const receipt = store.createStockOutReceipt({
      receiver: formReceiver.value,
      note: formNote.value,
      items: formItems.value
    })

    showCreateModal.value = false
    successMessage.value = `Lập phiếu xuất ${receipt.code} thành công! Đã trừ số lượng trực tiếp trong tồn kho.`

    setTimeout(() => {
      successMessage.value = ''
    }, 4000)

    // Reset form
    formNote.value = ''
    formItems.value = [
      {
        productId: store.products[0]?.id || 1,
        quantity: 1,
        price: store.products[0]?.sellPrice || 0
      }
    ]
  } catch (err) {
    // Show validation error in red
    errorMessage.value = err.message
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
          <ArrowUpFromLine class="w-6 h-6 text-blue-700" />
          <span>Quản lý Xuất Kho & Danh sách Phiếu Xuất</span>
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          Xuất hàng cho đại lý, showroom, khách hàng & kiểm soát chặt chẽ tồn kho
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="showCreateModal = true"
          class="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>+ Lập phiếu xuất kho</span>
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
              <th class="py-3.5 px-4">Nơi nhận / Khách hàng</th>
              <th class="py-3.5 px-3 text-center">Số mặt hàng</th>
              <th class="py-3.5 px-4 text-right">Tổng giá trị xuất</th>
              <th class="py-3.5 px-4">Người lập</th>
              <th class="py-3.5 px-4 text-center">Trạng thái</th>
              <th class="py-3.5 px-4 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="rc in store.stockOutReceipts"
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
                <div>{{ rc.receiver }}</div>
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
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
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

    <!-- Modal: Lập phiếu xuất kho -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <ArrowUpFromLine class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-base">Lập Phiếu Xuất Kho Mới</h3>
              <p class="text-xs text-slate-400">Chọn nơi nhận và các sản phẩm cần xuất khỏi kho</p>
            </div>
          </div>
          <button
            @click="showCreateModal = false"
            class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- ERROR BANNER (THÔNG BÁO LỖI ĐỎ NẾU XUẤT VƯỢT QUÁ TỒN KHO) -->
        <div
          v-if="errorMessage"
          class="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 flex items-start gap-3 animate-in shake duration-300"
        >
          <AlertCircle class="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div class="text-xs">
            <div class="font-bold text-sm text-rose-900">Không thể thực hiện xuất kho!</div>
            <p class="mt-1 font-medium leading-relaxed">{{ errorMessage }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSaveStockOut" class="space-y-4">
          <!-- Receiver -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Nơi nhận / Khách hàng *</label>
            <input
              v-model="formReceiver"
              required
              type="text"
              placeholder="Ví dụ: Showroom Quận 1, FPT Software, Khách mua lẻ..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-semibold"
            />
          </div>

          <!-- Items Rows -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-600">
                Chi tiết sản phẩm xuất kho
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
                  <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>Sản phẩm</span>
                    <span class="text-slate-600">
                      Tồn:
                      <strong class="text-blue-700">
                        {{ store.products.find(p => p.id === row.productId)?.stock }}
                      </strong>
                    </span>
                  </div>
                  <select
                    v-model="row.productId"
                    @change="handleProductChange(idx)"
                    class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-blue-700 mt-0.5"
                  >
                    <option v-for="p in store.products" :key="p.id" :value="p.id">
                      [{{ p.sku }}] {{ p.name }} (Còn tồn: {{ p.stock }} {{ p.unit }})
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
                    class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center focus:outline-none focus:border-blue-700 mt-0.5"
                  />
                </div>

                <!-- Price -->
                <div class="w-36">
                  <label class="text-[10px] font-bold text-slate-400 uppercase">Giá xuất (đ)</label>
                  <input
                    v-model="row.price"
                    type="number"
                    min="0"
                    required
                    class="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-right focus:outline-none focus:border-blue-700 mt-0.5"
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
            <span class="text-xs font-bold text-blue-900">Tổng giá trị xuất kho:</span>
            <span class="text-xl font-extrabold text-blue-700">
              {{ store.formatCurrency(formTotalAmount) }}
            </span>
          </div>

          <!-- Note -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Ghi chú phiếu xuất</label>
            <input
              v-model="formNote"
              type="text"
              placeholder="Ví dụ: Xuất bán showroom, phục vụ hợp đồng doanh nghiệp..."
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
              <span>Xác nhận xuất kho & Trừ tồn</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal: Xem chi tiết phiếu xuất -->
    <div
      v-if="showDetailModal && selectedReceipt"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div class="font-mono text-xs font-bold text-blue-700">{{ selectedReceipt.code }}</div>
            <h3 class="font-bold text-slate-800 text-base">Chi tiết Phiếu Xuất Kho</h3>
          </div>
          <button
            @click="showDetailModal = false"
            class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <div><strong>Nơi nhận:</strong> {{ selectedReceipt.receiver }}</div>
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
              <div class="font-bold text-slate-900">{{ it.quantity }} x {{ store.formatCurrency(it.price) }}</div>
              <div class="font-extrabold text-blue-700 text-xs">{{ store.formatCurrency(it.total) }}</div>
            </div>
          </div>
        </div>

        <div class="p-3 bg-blue-50 rounded-xl flex items-center justify-between text-sm font-bold text-blue-900">
          <span>Tổng giá trị phiếu xuất:</span>
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

