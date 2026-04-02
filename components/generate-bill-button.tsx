"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function GenerateBillButton() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    setIsClicked(true)
    setTimeout(() => {
      router.push("/generate")
    }, 600)
  }

  return (
    <div className="my-2 flex justify-center">
      <motion.button
        type="button"
        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-linear-to-r from-slate-800 via-slate-700 to-slate-800 px-8 py-4 text-[0.9375rem] font-semibold tracking-tight text-white shadow-[0_20px_50px_-15px_rgba(15,23,42,0.65)] ring-1 ring-white/10 dark:from-primary dark:via-primary dark:to-primary dark:shadow-[0_16px_40px_-12px_oklch(0.2_0.04_265/0.45)] dark:ring-white/5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ boxShadow: "0 12px 40px -12px rgba(15, 23, 42, 0.45)" }}
        animate={{
          boxShadow: isHovered
            ? "0 24px 60px -16px rgba(15, 23, 42, 0.55)"
            : "0 12px 40px -12px rgba(15, 23, 42, 0.45)",
        }}
      >
        <motion.div
          className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{
            x: isHovered ? 0 : "-100%",
            opacity: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.35 }}
        />

        <motion.div
          className="relative z-10 flex items-center justify-center gap-2"
          animate={{
            y: isClicked ? -50 : 0,
            opacity: isClicked ? 0 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <span>Generate bill</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />
          </svg>
        </motion.div>

        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{
            y: isClicked ? 0 : 50,
            opacity: isClicked ? 1 : 0,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <svg
            className="animate-spin h-6 w-6 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </motion.div>

        <motion.div
          className="absolute inset-0 rounded-2xl bg-slate-600 dark:bg-primary"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isClicked ? 1.5 : 0,
            opacity: isClicked ? 0 : 0,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent"
          initial={{ scaleX: 0, originX: 0.5 }}
          animate={{
            scaleX: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </div>
  )
}

