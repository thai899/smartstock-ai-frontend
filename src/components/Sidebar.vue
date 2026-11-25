<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
  Warehouse
} from 'lucide-vue-next'

const route = useRoute()
const store = useInventoryStore()

// Badge value helper - safe computed at component level
const lowStockBadge = computed(() => store.lowStockCount > 0 ? store.lowStockCount : null)

const navigationItems = [
  {
    name: 'Tổng quan',
    path: '/',
    icon: LayoutDashboard,
    getBadge: () => null,
    badgeType: null
  },
  {
    name: 'Sản phẩm & Tồn kho',
    path: '/products',
    icon: Package,
    getBadge: () => lowStockBadge.value,
    badgeType: 'danger'
  },
  {
    name: 'Nhập kho',
    path: '/stock-in',
    icon: ArrowDownToLine,
    getBadge: () => null,
    badgeType: null
  },
  {
    name: 'Xuất kho',
    path: '/stock-out',
    icon: ArrowUpFromLine,
    getBadge: () => null,
    badgeType: null
  },
  {
    name: 'Trợ lý AI Kho hàng',
    path: '/ai-assistant',
    icon: Sparkles,
    getBadge: () => 'AI v2.5',
    badgeType: 'ai'
  }
]

const isActive = (path) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside class="w-[254px] bg-white border-r border-slate-200 flex flex-col h-screen select-none shrink-0 transition-all duration-300">
    <!-- Brand / Logo -->
    <div class="px-3 py-3 border-b border-slate-100">
      <div class="w-full h-[50px] bg-[#03112c] rounded-[10px] px-1.5 flex items-center justify-center shadow-sm border border-slate-800/40">
        <img
          src="/logo.png"
          alt="Dragon Vision - Technology & AI Research"
          class="w-full h-[48px] object-contain"
        />
      </div>
      <div class="mt-2 px-1 flex items-center justify-between text-[11px]">
        <span class="font-bold text-slate-700 tracking-tight">SmartStock AI</span>
        <span class="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
          v2.5
        </span>
      </div>
    </div>

    <!-- Navigation List -->
    <nav class="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
      <div class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Menu Quản lý
      </div>

      <router-link
        v-for="item in navigationItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group"
        :class="[
          isActive(item.path)
            ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm shadow-blue-100/50'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        ]"
      >
        <div class="flex items-center gap-3.5">
          <component
            :is="item.icon"
            class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
            :class="isActive(item.path) ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'"
          />
          <span>{{ item.name }}</span>
        </div>

        <!-- Badges -->
        <span
          v-if="item.getBadge()"
          class="text-xs px-2 py-0.5 rounded-full font-bold transition-transform"
          :class="{
            'bg-rose-100 text-rose-700 animate-pulse': item.badgeType === 'danger',
            'bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] shadow-sm shadow-indigo-300': item.badgeType === 'ai'
          }"
        >
          {{ item.getBadge() }}
        </span>
      </router-link>
    </nav>

    <!-- Bottom Warehouse Status Widget -->
    <div class="p-4 border-t border-slate-100">
      <div class="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Máy chủ AI Trực tuyến
          </span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">v2.5</span>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed mb-3">
          Tự động phân tích tồn kho & gợi ý xuất nhập theo thời gian thực.
        </p>
        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60 font-medium">
          <span>Chi nhánh chính</span>
          <span class="text-slate-700 font-semibold">Kho Kỹ thuật Q1</span>
        </div>
      </div>
    </div>
  </aside>
</template>

