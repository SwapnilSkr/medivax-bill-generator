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
    <div className="flex justify-center my-8">
      <motion.button
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-4 font-bold text-white shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
        animate={{
          boxShadow: isHovered ? "0 10px 25px rgba(59, 130, 246, 0.5)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-300"
          initial={{ x: "-100%", opacity: 0 }}
          animate={{
            x: isHovered ? 0 : "-100%",
            opacity: isHovered ? 0.3 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="relative flex items-center justify-center gap-2 z-10"
          animate={{
            y: isClicked ? -50 : 0,
            opacity: isClicked ? 0 : 1,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <span className="text-lg">Generate Bill</span>
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
          className="absolute inset-0 bg-blue-600 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isClicked ? 1.5 : 0,
            opacity: isClicked ? 0 : 0,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-white"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{
            scaleX: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </div>
  )
}

