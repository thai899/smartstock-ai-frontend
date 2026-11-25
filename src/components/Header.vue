<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import {
  Bell,
  Search,
  Calendar,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-vue-next'

const route = useRoute()
const store = useInventoryStore()
const showNotifications = ref(false)

const getBreadcrumb = () => {
  switch (route.path) {
    case '/': return 'Tổng quan kho & Hoạt động'
    case '/products': return 'Danh mục Sản phẩm & Tồn kho'
    case '/stock-in': return 'Quản lý Phiếu Nhập kho'
    case '/stock-out': return 'Quản lý Phiếu Xuất kho'
    case '/ai-assistant': return 'Trợ lý AI Kho hàng thông minh'
    default: return 'Hệ thống SmartStock AI'
  }
}

const currentDate = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric'
}).format(new Date())
</script>

<template>
  <header class="h-[52px] bg-white border-b border-slate-200 px-5 flex items-center justify-between sticky top-0 z-20">
    <!-- Left: Breadcrumbs & Page title -->
    <div>
      <div class="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <span>Dragon Vision</span>
        <span>/</span>
        <span class="text-blue-700 font-bold">{{ route.meta.title || 'Hệ thống' }}</span>
      </div>
      <h1 class="text-[18px] leading-tight font-bold text-slate-800 tracking-tight">
        {{ getBreadcrumb() }}
      </h1>
    </div>

    <!-- Right: Status info & User greeting -->
    <div class="flex items-center gap-5">
      <!-- Notification Bell -->
      <div class="relative">
        <button
          @click="showNotifications = !showNotifications"
          class="w-10 h-10 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 relative transition-colors"
          title="Thông báo cảnh báo kho"
        >
          <Bell class="w-5 h-5" />
          <span
            v-if="store.lowStockCount > 0"
            class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white"
          >
            {{ store.lowStockCount }}
          </span>
        </button>

        <!-- Dropdown Notifications -->
        <div
          v-if="showNotifications"
          class="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 class="font-bold text-slate-800 text-sm">Cảnh báo hệ thống</h4>
            <span class="text-xs bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded-full">
              {{ store.lowStockCount }} việc cần xử lý
            </span>
          </div>

          <div class="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
            <div
              v-for="p in store.lowStockProducts"
              :key="p.id"
              class="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 flex items-start gap-2.5"
            >
              <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div class="text-xs">
                <p class="font-bold text-slate-800 line-clamp-1">{{ p.name }}</p>
                <p class="text-rose-700 font-semibold mt-0.5">
                  Tồn: <span class="underline">{{ p.stock }} {{ p.unit }}</span> (Tối thiểu: {{ p.minStock }})
                </p>
              </div>
            </div>
          </div>
          <div class="pt-3 mt-2 border-t border-slate-100 text-center">
            <router-link
              to="/stock-in"
              @click="showNotifications = false"
              class="text-xs font-bold text-blue-700 hover:text-blue-800"
            >
              Lập phiếu nhập kho ngay &rarr;
            </router-link>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-8 w-px bg-slate-200"></div>

      <!-- User Profile Card -->
      <div class="flex items-center gap-3.5 pl-1">
        <div class="relative">
          <div class="w-11 h-11 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-bold text-base ring-2 ring-blue-100 shadow-md">
            TH
          </div>
          <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>
        <div class="text-left">
          <div class="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <span>Xin chào, Trịnh Hoàng Thái</span>
          </div>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-blue-700">
              Thủ kho
            </span>
            <span class="text-xs text-slate-400 font-medium">Kho Tổng Công Nghệ</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

