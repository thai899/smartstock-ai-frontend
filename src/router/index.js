import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import ProductView from '@/views/ProductView.vue'
import StockInView from '@/views/StockInView.vue'
import StockOutView from '@/views/StockOutView.vue'
import AiAssistantView from '@/views/AiAssistantView.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { title: 'Tổng quan' }
  },
  {
    path: '/products',
    name: 'Products',
    component: ProductView,
    meta: { title: 'Sản phẩm & Tồn kho' }
  },
  {
    path: '/stock-in',
    name: 'StockIn',
    component: StockInView,
    meta: { title: 'Nhập kho' }
  },
  {
    path: '/stock-out',
    name: 'StockOut',
    component: StockOutView,
    meta: { title: 'Xuất kho' }
  },
  {
    path: '/ai-assistant',
    name: 'AiAssistant',
    component: AiAssistantView,
    meta: { title: 'Trợ lý AI Kho hàng' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

