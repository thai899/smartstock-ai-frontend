<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useInventoryStore } from '@/stores/inventory'
import {
  Sparkles,
  Send,
  Bot,
  User,
  AlertTriangle,
  Coins,
  Package,
  Layers,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw
} from 'lucide-vue-next'

const router = useRouter()
const store = useInventoryStore()

const chatContainer = ref(null)
const inputQuestion = ref('')
const isThinking = ref(false)

const quickPrompts = [
  'Mặt hàng nào sắp hết tồn kho?',
  'Thống kê tổng giá trị hàng tồn hiện tại',
  'Gợi ý kế hoạch nhập hàng tuần tới'
]

// Chat history
const messages = ref([
  {
    id: 1,
    sender: 'ai',
    time: 'Vừa xong',
    text: 'Xin chào anh Trịnh Hoàng Thái! Tôi là Trợ lý AI Kho hàng SmartStock. Tôi đã đồng bộ dữ liệu thời gian thực từ hệ thống kho thiết bị công nghệ & linh kiện. Anh có thể hỏi tôi bất kỳ thông tin nào về tình trạng tồn kho, định mức tối thiểu hoặc kế hoạch nhập xuất hàng.'
  }
])

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// Logic AI phân tích số liệu thời gian thực
const generateAiResponse = (query) => {
  const q = query.toLowerCase().trim()

  // 1. Mặt hàng sắp hết tồn kho
  if (q.includes('sắp hết') || q.includes('cảnh báo') || q.includes('hết tồn')) {
    const lowItems = store.lowStockProducts
    if (lowItems.length === 0) {
      return `Hiện tại kho hàng đang ở trạng thái an toàn tuyệt đối! Không có sản phẩm nào có số lượng tồn dưới định mức tối thiểu.`
    }

    let reply = `Dựa trên dữ liệu kho thực tế, hiện có **${lowItems.length} mặt hàng** đang ở mức cảnh báo nghiêm trọng (tồn kho $\\le$ định mức an toàn):\n\n`
    lowItems.forEach((item, idx) => {
      const need = (item.minStock * 2) - item.stock
      reply += `${idx + 1}. **${item.name}**\n`
      reply += `   - Mã SKU: \`${item.sku}\` | Danh mục: *${item.category}*\n`
      reply += `   - Tồn hiện tại: <span class="text-rose-600 font-bold">${item.stock} ${item.unit}</span> (Định mức tối thiểu: ${item.minStock} ${item.unit})\n`
      reply += `   - **Khuyến nghị AI**: Cần nhập bổ sung tối thiểu **+${need > 0 ? need : item.minStock} ${item.unit}** trong 48h tới.\n\n`
    })
    reply += `Anh có thể chuyển qua mục **Nhập kho** để lập ngay phiếu nhập bổ sung cho các mặt hàng trên.`
    return reply
  }

  // 2. Thống kê tổng giá trị hàng tồn
  if (q.includes('tổng giá trị') || q.includes('giá trị tồn') || q.includes('bao nhiêu tiền')) {
    const totalVal = store.totalInventoryValue
    const totalUnits = store.products.reduce((s, p) => s + p.stock, 0)
    
    // Category breakdown
    const catMap = {}
    store.products.forEach(p => {
      catMap[p.category] = (catMap[p.category] || 0) + (p.stock * p.costPrice)
    })

    let reply = `Báo cáo phân tích giá trị tồn kho thiết bị công nghệ & linh kiện tính đến thời điểm hiện tại:\n\n`
    reply += `- **Tổng giá trị vốn lưu kho**: <span class="text-blue-700 font-extrabold text-base">${store.formatCurrency(totalVal)}</span>\n`
    reply += `- **Tổng số lượng thiết bị thực tế**: **${store.formatNumber(totalUnits)} đơn vị sản phẩm** across 10 mã SKU.\n\n`
    reply += `**Phân bổ giá trị theo danh mục:**\n`
    Object.entries(catMap).forEach(([cat, val]) => {
      const pct = ((val / totalVal) * 100).toFixed(1)
      reply += `- **${cat}**: ${store.formatCurrency(val)} (${pct}%)\n`
    })
    reply += `\n*Lưu ý: Danh mục Laptop và Linh kiện PC chiếm tỷ trọng vốn lớn nhất (> 75%), khuyến nghị theo dõi sát vòng quay để tối ưu dòng tiền.*`
    return reply
  }

  // 3. Gợi ý kế hoạch nhập hàng tuần tới
  if (q.includes('kế hoạch') || q.includes('tuần tới') || q.includes('gợi ý') || q.includes('dự báo')) {
    const lowItems = store.lowStockProducts
    let reply = `Kế hoạch nhập hàng thông minh đề xuất cho tuần tới (Dựa trên tốc độ xuất kho 118 phiếu/tháng & các mặt hàng chạm ngưỡng):\n\n`
    reply += `| Mặt hàng đề xuất | Số lượng gợi ý | Đơn giá dự kiến | Nhà cung cấp tối ưu |\n`
    reply += `| :--- | :---: | :---: | :--- |\n`
    
    lowItems.forEach(item => {
      const suggestedQty = item.minStock * 2
      let supplier = 'Synnex FPT'
      if (item.category === 'Laptop') supplier = 'Digiworld'
      else if (item.category === 'Thiết bị mạng') supplier = 'ASUS VN'
      else if (item.category === 'Phụ kiện') supplier = 'Mai Hoàng'
      
      reply += `| **${item.name.slice(0, 28)}...** | **+${suggestedQty} ${item.unit}** | ${store.formatCurrency(item.costPrice)} | ${supplier} |\n`
    })

    const estimatedBudget = lowItems.reduce((s, i) => s + (i.minStock * 2 * i.costPrice), 0)
    reply += `\n**Dự toán ngân sách nhập hàng đợt 1:** <span class="text-emerald-700 font-bold">${store.formatCurrency(estimatedBudget)}</span>.\n`
    reply += `Kế hoạch này giúp khôi phục hệ số an toàn tồn kho lên mức 100%, tránh tình trạng đứt hàng khi showroom hoặc khách dự án đặt mua số lượng lớn.`
    return reply
  }

  // 4. Tìm kiếm cụ thể hoặc hỏi thông thường
  const matched = store.products.filter(p => 
    q.includes(p.name.toLowerCase()) || 
    q.includes(p.sku.toLowerCase()) ||
    q.includes(p.category.toLowerCase())
  )

  if (matched.length > 0) {
    let reply = `Hệ thống tìm thấy **${matched.length} sản phẩm** liên quan đến yêu cầu của anh:\n\n`
    matched.forEach(p => {
      reply += `- **[${p.sku}] ${p.name}**\n`
      reply += `  • Tồn kho: **${p.stock} ${p.unit}** (Ngưỡng min: ${p.minStock})\n`
      reply += `  • Giá vốn: ${store.formatCurrency(p.costPrice)} | Giá bán: ${store.formatCurrency(p.sellPrice)}\n`
      reply += `  • Trạng thái: ${p.stock <= p.minStock ? '<span class="text-rose-600 font-bold">Cần nhập gấp</span>' : '<span class="text-emerald-600 font-semibold">Tồn kho an toàn</span>'}\n\n`
    })
    return reply
  }

  return `Tôi đã ghi nhận câu hỏi của anh về "${query}". Dựa trên dữ liệu tổng quan, kho hiện đang quản lý **${store.products.length} mặt hàng** với tổng giá trị **${store.formatCurrency(store.totalInventoryValue)}**, trong đó có **${store.lowStockCount} mặt hàng** chạm ngưỡng cảnh báo. Anh có thể bấm các câu hỏi gợi ý bên dưới để xem phân tích tự động chi tiết!`
}

const handleSendMessage = (textToSend) => {
  const text = textToSend || inputQuestion.value
  if (!text || !text.trim()) return

  // Push user message
  messages.value.push({
    id: Date.now(),
    sender: 'user',
    time: 'Vừa xong',
    text: text.trim()
  })

  inputQuestion.value = ''
  isThinking.value = true
  scrollToBottom()

  // Simulate quick AI analysis
  setTimeout(() => {
    const aiReply = generateAiResponse(text)
    messages.value.push({
      id: Date.now() + 1,
      sender: 'ai',
      time: 'Vừa xong',
      text: aiReply
    })
    isThinking.value = false
    scrollToBottom()
  }, 450)
}

const formatMarkdown = (content) => {
  if (!content) return ''
  // Basic markdown formatting: bold, tables, lists
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 font-mono text-xs font-bold">$1</code>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')

  return formatted
}
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Top banner -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles class="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Trợ lý AI Kho hàng (SmartStock Intelligence)</span>
            <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold">v2.5 AI Engine</span>
          </h2>
          <p class="text-xs text-slate-500 mt-0.5">
            Phân tích tự động dữ liệu tồn kho thực tế, dự báo hết hàng & lập kế hoạch xuất nhập thông minh
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Đang kết nối kho dữ liệu trực tiếp
        </span>
      </div>
    </div>

    <!-- 2 Columns Grid: Chat Box (7 cols) + Warehouse Analytics Summary (5 cols) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <!-- LEFT: Chat Box (7 cols) -->
      <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[650px] overflow-hidden">
        <!-- Chat header -->
        <div class="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center">
              <Bot class="w-4 h-4" />
            </div>
            <div>
              <div class="text-xs font-bold text-slate-800">SmartStock AI Chatbot</div>
              <div class="text-[10px] text-slate-400">Thời gian phản hồi &lt; 0.3s • Dữ liệu nội bộ</div>
            </div>
          </div>
          <button
            @click="messages = [messages[0]]"
            class="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 font-semibold"
            title="Làm mới cuộc trò chuyện"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            <span>Xóa đoạn chat</span>
          </button>
        </div>

        <!-- Chat message list -->
        <div ref="chatContainer" class="flex-1 p-5 overflow-y-auto space-y-4">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex items-start gap-3"
            :class="msg.sender === 'user' ? 'flex-row-reverse' : ''"
          >
            <!-- Avatar -->
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-sm"
              :class="msg.sender === 'user' ? 'bg-blue-700 text-white' : 'bg-indigo-50 border border-indigo-200 text-indigo-700'"
            >
              <User v-if="msg.sender === 'user'" class="w-4 h-4" />
              <Bot v-else class="w-4 h-4" />
            </div>

            <!-- Content Bubble -->
            <div
              class="max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed"
              :class="[
                msg.sender === 'user'
                  ? 'bg-blue-700 text-white font-medium rounded-tr-none shadow-sm'
                  : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-none shadow-sm'
              ]"
            >
              <div class="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75">
                <span class="font-bold">{{ msg.sender === 'user' ? 'Trịnh Hoàng Thái (Thủ kho)' : 'SmartStock AI Assistant' }}</span>
                <span>{{ msg.time }}</span>
              </div>
              <div v-html="formatMarkdown(msg.text)" class="space-y-1"></div>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isThinking" class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <Bot class="w-4 h-4" />
            </div>
            <div class="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-700 animate-bounce"></span>
              <span class="w-2 h-2 rounded-full bg-blue-700 animate-bounce [animation-delay:0.2s]"></span>
              <span class="w-2 h-2 rounded-full bg-blue-700 animate-bounce [animation-delay:0.4s]"></span>
              <span class="text-[11px] font-semibold text-slate-600">Đang phân tích dữ liệu kho thiết bị công nghệ...</span>
            </div>
          </div>
        </div>

        <!-- Quick prompts buttons -->
        <div class="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 pl-1">
            Gợi ý nhanh:
          </span>
          <button
            v-for="(prompt, idx) in quickPrompts"
            :key="idx"
            @click="handleSendMessage(prompt)"
            class="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-700 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold whitespace-nowrap transition-all shadow-2xs"
          >
            {{ prompt }}
          </button>
        </div>

        <!-- Chat input area -->
        <div class="p-3.5 bg-white border-t border-slate-200/90 shrink-0">
          <form @submit.prevent="handleSendMessage()" class="flex items-center gap-2">
            <input
              v-model="inputQuestion"
              type="text"
              placeholder="Nhập câu hỏi cho AI (ví dụ: Tồn kho Laptop Dell còn bao nhiêu, kiểm tra CPU...)"
              class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700 text-xs font-medium text-slate-800 placeholder-slate-400"
            />
            <button
              type="submit"
              :disabled="!inputQuestion.trim() || isThinking"
              class="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Gửi</span>
              <Send class="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      <!-- RIGHT: Warehouse Analytics Summary (5 cols) -->
      <div class="lg:col-span-5 space-y-5">
        <!-- Live Statistics Card -->
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Package class="w-4 h-4 text-blue-700" />
              <span>Chỉ số Kho Phân tích Thời gian thực</span>
            </h3>
            <span class="text-[11px] font-bold text-slate-400">Live AI Feed</span>
          </div>

          <div class="grid grid-cols-2 gap-3.5">
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span class="text-[11px] font-semibold text-slate-400 uppercase">Mã hàng quản lý</span>
              <div class="text-xl font-extrabold text-slate-900 mt-0.5">
                {{ store.products.length }} SKU
              </div>
              <span class="text-[10px] text-slate-500">4 nhóm danh mục</span>
            </div>

            <div class="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80">
              <span class="text-[11px] font-semibold text-rose-600 uppercase">Cảnh báo sắp hết</span>
              <div class="text-xl font-extrabold text-rose-700 mt-0.5">
                {{ store.lowStockCount }} SP
              </div>
              <span class="text-[10px] text-rose-600 font-bold">Cần bổ sung gấp</span>
            </div>

            <div class="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80">
              <span class="text-[11px] font-semibold text-blue-700 uppercase">Tổng tồn kho</span>
              <div class="text-xl font-extrabold text-blue-700 mt-0.5">
                {{ store.formatCurrency(store.totalInventoryValue) }}
              </div>
              <span class="text-[10px] text-blue-600 font-medium">Giá vốn hiện thời</span>
            </div>

            <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
              <span class="text-[11px] font-semibold text-emerald-700 uppercase">Hệ số an toàn</span>
              <div class="text-xl font-extrabold text-emerald-700 mt-0.5">
                {{ Math.round(((store.products.length - store.lowStockCount) / store.products.length) * 100) }}%
              </div>
              <span class="text-[10px] text-emerald-600 font-medium">Mục tiêu: 100%</span>
            </div>
          </div>
        </div>

        <!-- Priority Reorder Widget -->
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <AlertTriangle class="w-4 h-4 text-rose-600" />
              <h3 class="font-bold text-slate-800 text-sm">Ưu tiên nhập hàng ngay</h3>
            </div>
            <router-link
              to="/stock-in"
              class="text-xs font-bold text-blue-700 hover:underline"
            >
              Lập phiếu &rarr;
            </router-link>
          </div>

          <div class="space-y-2.5">
            <div
              v-for="p in store.lowStockProducts.slice(0, 3)"
              :key="p.id"
              class="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3"
            >
              <div class="min-w-0">
                <div class="font-bold text-xs text-slate-800 truncate">{{ p.name }}</div>
                <div class="text-[10px] text-slate-400 font-mono">{{ p.sku }} • {{ p.category }}</div>
              </div>

              <div class="text-right shrink-0">
                <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                  Còn: {{ p.stock }} {{ p.unit }}
                </span>
                <div class="text-[10px] text-slate-400 mt-0.5">Min: {{ p.minStock }} {{ p.unit }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Engine Capabilities Card -->
        <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white space-y-3">
          <div class="flex items-center gap-2 text-xs font-bold text-blue-300">
            <Cpu class="w-4 h-4 text-blue-400" />
            <span>Mô hình phân tích thông minh</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            Hệ thống tự động phát hiện chu kỳ nhập xuất, tính toán điểm đặt hàng lại (Reorder Point - ROP) và tối ưu hóa ngân sách lưu kho cho ngành công nghệ linh kiện.
          </p>
          <div class="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Độ chính xác dữ liệu</span>
            <span class="text-emerald-400 font-bold">100% Đồng bộ</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

