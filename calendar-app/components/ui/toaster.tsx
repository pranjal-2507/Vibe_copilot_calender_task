"use client"

import { useToast } from "@/components/ui/use-toast"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { motion, AnimatePresence } from "framer-motion"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      <AnimatePresence>
        {toasts.map(({ id, title, description, action, ...props }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Toast {...props}>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
              {action}
              <ToastClose />
            </Toast>
          </motion.div>
        ))}
      </AnimatePresence>
      <ToastViewport className="fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:top-4 sm:right-4 sm:max-w-[420px]" />
    </ToastProvider>
  )
}

