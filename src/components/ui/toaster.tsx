"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props} className="p-0 border-none bg-transparent shadow-none h-auto">
            <div className="flex flex-col gap-2 w-full text-[10px] sm:text-xs z-50">
              <div className="succsess-alert cursor-default flex items-center justify-between w-full min-h-[3.5rem] rounded-lg bg-[#232531] px-[10px] border border-white/5 shadow-2xl">
                <div className="flex gap-3 items-center py-2">
                  <div className={variant === 'destructive' ? "text-red-500 bg-white/5 backdrop-blur-xl p-1.5 rounded-lg border border-red-500/10" : "text-[#2b9875] bg-white/5 backdrop-blur-xl p-1.5 rounded-lg border border-emerald-500/10"}>
                    {variant === 'destructive' ? (
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        ></path>
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    {title && <ToastTitle>{title}</ToastTitle>}
                    {description && (
                      <ToastDescription>{description}</ToastDescription>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {action}
                  <ToastClose />
                </div>
              </div>
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
