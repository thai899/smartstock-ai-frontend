<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import {
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Package,
  Layers,
  CheckCircle2,
  Clock
} from 'lucide-vue-next'

const router = useRouter()
const store = useInventoryStore()

const statCards = computed(() => [
  {
    title: 'Tổng giá trị tồn kho',
    value: '1.480.000.000đ',
    subValue: 'Tính theo giá vốn hiện tại',
    trend: '+5.4% so với tháng trước',
    isPositive: true,
    icon: Coins,
    iconBg: 'bg-blue-50 text-blue-700 border border-blue-200/60',
    borderColor: 'border-blue-100 hover:border-blue-300'
  },
  {
    title: 'Phiếu nhập tháng này',
    value: `${store.monthlyStockInCount} phiếu`,
    subValue: 'Tổng giá trị: 685.000.000đ',
    trend: '12 nhà cung cấp uy tín',
    isPositive: true,
    icon: ArrowDownToLine,
    iconBg: 'bg-indigo-50 text-indigo-700 border border-indigo-200/60',
    borderColor: 'border-indigo-100 hover:border-indigo-300'
  },
  {
    title: 'Phiếu xuất tháng này',
    value: `${store.monthlyStockOutCount} phiếu`,
    subValue: 'Doanh số xuất: 940.000.000đ',
    trend: '+18% tốc độ quay vòng kho',
    isPositive: true,
    icon: ArrowUpFromLine,
    iconBg: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    borderColor: 'border-emerald-100 hover:border-emerald-300'
  },
  {
    title: 'Cảnh báo sắp hết',
    value: `${store.lowStockCount} sản phẩm`,
    subValue: 'Tồn kho dưới ngưỡng an toàn',
    trend: 'Cần lập phiếu nhập gấp',
    isPositive: false,
    icon: AlertTriangle,
    iconBg: 'bg-rose-50 text-rose-600 border border-rose-200/60',
    borderColor: 'border-rose-200 hover:border-rose-400',
    highlight: true
  }
])

const navigateToStockInWithProduct = (productId) => {
  router.push({ path: '/stock-in', query: { productId } })
}
</script>

<template>
  <div class="space-y-5 pb-6">
    <!-- Top Greeting Banner with AI Status -->
    <div class="bg-gradient-to-r from-[#1d4ed8] via-[#1e40af] to-[#1e3a8a] rounded-2xl px-6 py-5 text-white shadow-lg shadow-blue-900/10 relative overflow-hidden h-[116px]">
      <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
      <div class="relative z-10 h-full flex items-center justify-between gap-5">
        <div class="space-y-1.5 min-w-0">
          <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-blue-100 border border-white/15">
            <Sparkles class="w-3.5 h-3.5 text-amber-300" />
            <span>Dragon Vision AI Engine • Trực quan hóa dữ liệu kho</span>
          </div>
          <h2 class="text-[23px] leading-tight font-extrabold tracking-tight">
            Báo cáo Tình trạng Kho & Nhập Xuất Hàng
          </h2>
          <p class="text-blue-100/90 text-[12px] max-w-3xl leading-relaxed">
            Hệ thống phân tích tự động phát hiện <strong>{{ store.lowStockCount }} mặt hàng</strong> sắp cạn tồn kho. Giá trị kho ổn định và tỷ lệ luân chuyển hàng công nghệ duy trì ở mức cao.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <router-link
            to="/ai-assistant"
            class="px-4 py-2.5 rounded-xl bg-white text-blue-800 font-bold text-xs hover:bg-blue-50 transition-all shadow-md flex items-center gap-2 group shrink-0"
          >
            <Sparkles class="w-4 h-4 text-indigo-600 group-hover:rotate-12 transition-transform" />
            <span>Hỏi Trợ lý AI</span>
          </router-link>
          <router-link
            to="/stock-in"
            class="px-4 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-600 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 shrink-0"
          >
            <ArrowDownToLine class="w-4 h-4" />
            <span>+ Nhập kho nhanh</span>
          </router-link>
        </div>
      </div>
    </div>

    <!-- 4 Statistic Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="(card, index) in statCards"
        :key="index"
        class="bg-white rounded-xl p-4 border transition-all duration-300 shadow-sm hover:shadow-md min-h-[116px]"
        :class="card.borderColor"
      >
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {{ card.title }}
            </span>
            <div class="text-2xl font-extrabold text-slate-900 tracking-tight pt-1">
              {{ card.value }}
            </div>
          </div>
          <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm', card.iconBg]">
            <component :is="card.icon" class="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-slate-500 font-medium truncate">{{ card.subValue }}</span>
          <span
            class="font-bold flex items-center gap-1 shrink-0 ml-2"
            :class="card.isPositive ? 'text-emerald-600' : 'text-rose-600'"
          >
            <TrendingUp v-if="card.isPositive" class="w-3.5 h-3.5" />
            <AlertTriangle v-else class="w-3.5 h-3.5" />
            {{ card.trend }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main Grid: Cảnh báo hàng sắp hết & Hoạt động gần đây -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Left: Bảng Cảnh báo hàng sắp hết tồn kho (7 cols) -->
      <div class="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60">
              <AlertTriangle class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-base">Cảnh báo hàng sắp hết tồn kho</h3>
              <p class="text-xs text-slate-400">Các mặt hàng có số lượng tồn &le; định mức tối thiểu</p>
            </div>
          </div>
          <router-link
            to="/products"
            class="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 group"
          >
            <span>Xem kho đầy đủ</span>
            <ArrowRight class="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </router-link>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto rounded-xl border border-slate-100">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th class="py-3 px-4">Mã SKU</th>
                <th class="py-3 px-4">Tên sản phẩm</th>
                <th class="py-3 px-3 text-center">Tồn hiện tại</th>
                <th class="py-3 px-3 text-center">Định mức</th>
                <th class="py-3 px-4 text-center">Trạng thái</th>
                <th class="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="item in store.lowStockProducts"
                :key="item.id"
                class="hover:bg-slate-50/70 transition-colors group"
              >
                <td class="py-2 px-4 font-mono font-bold text-[11px] text-blue-700">
                  {{ item.sku }}
                </td>
                <td class="py-2 px-4 font-medium text-slate-800">
                  <div class="line-clamp-1" :title="item.name">{{ item.name }}</div>
                  <span class="text-[11px] text-slate-400 font-normal">{{ item.category }} • {{ item.location }}</span>
                </td>
                <td class="py-3.5 px-3 text-center font-bold text-rose-600 text-sm">
                  {{ item.stock }} <span class="text-xs font-normal text-slate-500">{{ item.unit }}</span>
                </td>
                <td class="py-3.5 px-3 text-center text-xs font-semibold text-slate-600">
                  {{ item.minStock }} {{ item.unit }}
                </td>
                <td class="py-3.5 px-4 text-center">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200/60">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                    Cần nhập gấp
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right">
                  <button
                    @click="navigateToStockInWithProduct(item.id)"
                    class="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20"
                  >
                    + Nhập ngay
                  </button>
                </td>
              </tr>
              <tr v-if="store.lowStockProducts.length === 0">
                <td colspan="6" class="py-8 text-center text-slate-400 text-xs">
                  Kho hàng đang ở trạng thái an toàn, không có sản phẩm nào chạm ngưỡng tối thiểu!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right: Hoạt động nhập xuất gần đây (5 cols) -->
      <div class="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
              <Clock class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-slate-800 text-base">Hoạt động nhập xuất gần đây</h3>
              <p class="text-xs text-slate-400">Nhật ký theo thời gian thực</p>
            </div>
          </div>
          <span class="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
            Mới nhất
          </span>
        </div>

        <div class="space-y-2">
          <div
            v-for="act in store.activities"
            :key="act.id"
            class="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex items-start gap-3"
          >
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
              :class="act.badgeClass"
            >
              <ArrowDownToLine v-if="act.type === 'IN'" class="w-5 h-5" />
              <ArrowUpFromLine v-else-if="act.type === 'OUT'" class="w-5 h-5" />
              <AlertTriangle v-else-if="act.type === 'WARNING'" class="w-5 h-5" />
              <Package v-else class="w-5 h-5" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <span class="font-mono text-xs font-bold text-slate-800">{{ act.code }}</span>
                <span class="text-[11px] text-slate-400 font-medium">{{ act.timestamp }}</span>
              </div>
              <p class="text-xs font-semibold text-slate-700 mt-1 truncate">{{ act.title }}</p>
              <div class="flex items-center justify-between mt-1.5 text-[11px] text-slate-500">
                <span>Người lập: <strong>{{ act.operator }}</strong></span>
                <span class="font-bold text-slate-800">{{ act.amount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

