<script setup>
import { ref, computed } from 'vue'
import { useInventoryStore } from '@/stores/inventory'
import {
  Search,
  Filter,
  Plus,
  Package,
  Layers,
  Coins,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Download
} from 'lucide-vue-next'

const store = useInventoryStore()

const searchQuery = ref('')
const selectedCategory = ref('Tất cả')
const showAddModal = ref(false)

// Form for new product
const newProduct = ref({
  sku: '',
  name: '',
  category: 'Linh kiện PC',
  unit: 'Chiếc',
  costPrice: '',
  sellPrice: '',
  stock: '',
  minStock: 5,
  location: 'Kho A-03'
})

const filteredProducts = computed(() => {
  return store.products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          item.sku.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'Tất cả' || item.category === selectedCategory.value
    return matchesSearch && matchesCategory
  })
})

const handleAddProduct = () => {
  if (!newProduct.value.name.trim()) {
    alert('Vui lòng nhập tên sản phẩm')
    return
  }
  if (!newProduct.value.costPrice || !newProduct.value.sellPrice) {
    alert('Vui lòng nhập đầy đủ giá nhập và giá bán')
    return
  }

  store.addProduct(newProduct.value)
  showAddModal.value = false

  // Reset form
  newProduct.value = {
    sku: '',
    name: '',
    category: 'Linh kiện PC',
    unit: 'Chiếc',
    costPrice: '',
    sellPrice: '',
    stock: '',
    minStock: 5,
    location: 'Kho A-03'
  }
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Header bar with Title, Search & Action -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
      <div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Package class="w-6 h-6 text-blue-700" />
          <span>Danh sách Sản phẩm & Quản lý Tồn kho</span>
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          Tổng số: <strong>{{ store.products.length }} mặt hàng</strong> • 
          <span class="text-rose-600 font-semibold">{{ store.lowStockCount }} mặt hàng chạm mức cảnh báo</span>
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click="showAddModal = true"
          class="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus class="w-4 h-4 stroke-[2.5]" />
          <span>+ Thêm sản phẩm</span>
        </button>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Tìm kiếm theo mã SKU, tên sản phẩm..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm transition-all text-slate-800 placeholder-slate-400"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
        <button
          v-for="cat in store.categories"
          :key="cat"
          @click="selectedCategory = cat"
          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0"
          :class="[
            selectedCategory === cat
              ? 'bg-blue-700 text-white shadow-sm shadow-blue-500/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          ]"
        >
          {{ cat }}
        </button>
      </div>
    </div>

    <!-- Products Table -->
    <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200/90">
            <tr>
              <th class="py-3.5 px-4">Mã SKU</th>
              <th class="py-3.5 px-4 min-w-[280px]">Tên sản phẩm</th>
              <th class="py-3.5 px-4">Danh mục</th>
              <th class="py-3.5 px-3 text-center">ĐVT</th>
              <th class="py-3.5 px-4 text-right">Giá nhập</th>
              <th class="py-3.5 px-4 text-right">Giá bán</th>
              <th class="py-3.5 px-4 text-center">Số lượng tồn</th>
              <th class="py-3.5 px-4 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="item in filteredProducts"
              :key="item.id"
              class="hover:bg-slate-50/70 transition-colors"
            >
              <!-- SKU -->
              <td class="py-4 px-4 font-mono font-bold text-xs text-blue-700">
                {{ item.sku }}
              </td>

              <!-- Name -->
              <td class="py-4 px-4 font-semibold text-slate-900">
                <div class="line-clamp-2" :title="item.name">{{ item.name }}</div>
                <div class="text-[11px] font-normal text-slate-400 mt-0.5">
                  Vị trí: <strong>{{ item.location }}</strong> • Cập nhật: {{ item.updatedAt }}
                </div>
              </td>

              <!-- Category -->
              <td class="py-4 px-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                  {{ item.category }}
                </span>
              </td>

              <!-- Unit -->
              <td class="py-4 px-3 text-center text-xs font-medium text-slate-600">
                {{ item.unit }}
              </td>

              <!-- Cost price -->
              <td class="py-4 px-4 text-right font-semibold text-slate-700 text-xs">
                {{ store.formatCurrency(item.costPrice) }}
              </td>

              <!-- Sell price -->
              <td class="py-4 px-4 text-right font-bold text-blue-700 text-sm">
                {{ store.formatCurrency(item.sellPrice) }}
              </td>

              <!-- Stock Quantity -->
              <td class="py-4 px-4 text-center">
                <div
                  class="inline-flex items-center gap-1 font-extrabold text-sm px-2.5 py-0.5 rounded-lg"
                  :class="item.stock <= item.minStock ? 'text-rose-700 bg-rose-50 border border-rose-200' : 'text-slate-800 bg-slate-50'"
                >
                  <span>{{ item.stock }}</span>
                  <span class="text-xs font-normal text-slate-400">/ min {{ item.minStock }}</span>
                </div>
              </td>

              <!-- Status badge -->
              <td class="py-4 px-4 text-center">
                <span
                  v-if="item.stock <= item.minStock"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200"
                >
                  <AlertTriangle class="w-3.5 h-3.5 shrink-0" />
                  <span>Cần nhập gấp</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  <CheckCircle2 class="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                  <span>Đầy đủ tồn</span>
                </span>
              </td>
            </tr>

            <tr v-if="filteredProducts.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400 text-sm">
                Không tìm thấy sản phẩm nào phù hợp với điều kiện tìm kiếm.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal: Thêm sản phẩm mới -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Package class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-base">+ Thêm Sản Phẩm Mới</h3>
              <p class="text-xs text-slate-400">Nhập thông tin sản phẩm và thiết lập định mức kho</p>
            </div>
          </div>
          <button
            @click="showAddModal = false"
            class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleAddProduct" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tên sản phẩm *</label>
            <input
              v-model="newProduct.name"
              required
              type="text"
              placeholder="Ví dụ: Laptop Dell Inspiron 15, Bàn phím cơ..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-medium"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Mã SKU (tự tạo nếu trống)</label>
              <input
                v-model="newProduct.sku"
                type="text"
                placeholder="SKU-XXXX"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Danh mục</label>
              <select
                v-model="newProduct.category"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-medium"
              >
                <option value="Laptop">Laptop</option>
                <option value="Linh kiện PC">Linh kiện PC</option>
                <option value="Thiết bị mạng">Thiết bị mạng</option>
                <option value="Phụ kiện">Phụ kiện</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Giá nhập (VNĐ) *</label>
              <input
                v-model="newProduct.costPrice"
                required
                type="number"
                placeholder="25000000"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-semibold"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Giá bán đề xuất (VNĐ) *</label>
              <input
                v-model="newProduct.sellPrice"
                required
                type="number"
                placeholder="28900000"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-semibold"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Đơn vị tính</label>
              <input
                v-model="newProduct.unit"
                type="text"
                placeholder="Chiếc, Hộp..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-medium"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Tồn ban đầu</label>
              <input
                v-model="newProduct.stock"
                type="number"
                placeholder="10"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-bold"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Định mức min</label>
              <input
                v-model="newProduct.minStock"
                type="number"
                placeholder="5"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-sm font-bold"
              />
            </div>
          </div>

          <div class="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-md shadow-blue-500/20"
            >
              Lưu sản phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

