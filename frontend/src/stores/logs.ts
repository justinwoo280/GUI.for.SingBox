import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

interface TaskLogRecord<T = any> {
  name: string
  startTime: number
  endTime: number
  result: T
}

// Ring-buffer caps to keep WebView memory bounded under verbose kernel logging.
// At ~500 lines/sec (typical sing-box verbose under load), an uncapped log
// store will exhaust memory and freeze the WebView in under an hour.
// 5000 lines × ~300 bytes ≈ 1.5 MB — plenty for live inspection while safe.
const MAX_KERNEL_LOGS = 5000
const MAX_TASK_LOGS = 1000

export const useLogsStore = defineStore('logs', () => {
  const kernelLogs = ref<string[]>([])
  const scheduledtasksLogs = ref<TaskLogRecord[]>([])

  const recordKernelLog = (msg: string) => {
    kernelLogs.value.unshift(msg)
    // O(1) truncation; oldest entries (at the tail) are dropped.
    if (kernelLogs.value.length > MAX_KERNEL_LOGS) {
      kernelLogs.value.length = MAX_KERNEL_LOGS
    }
  }

  const recordScheduledTasksLog = (log: TaskLogRecord) => {
    scheduledtasksLogs.value.unshift(log)
    if (scheduledtasksLogs.value.length > MAX_TASK_LOGS) {
      scheduledtasksLogs.value.length = MAX_TASK_LOGS
    }
  }

  const isTasksLogEmpty = computed(() => scheduledtasksLogs.value.length === 0)

  const isEmpty = computed(() => kernelLogs.value.length === 0)

  const clearKernelLog = () => kernelLogs.value.splice(0)

  return {
    recordKernelLog,
    clearKernelLog,
    kernelLogs,
    isEmpty,
    scheduledtasksLogs,
    isTasksLogEmpty,
    recordScheduledTasksLog,
  }
})
