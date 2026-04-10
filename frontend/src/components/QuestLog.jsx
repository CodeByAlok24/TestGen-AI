/* eslint-disable no-unused-vars */
import { motion } from "framer-motion"

export default function QuestLog({ children, title, description }) {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Quest header */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-black to-gray-900/50 p-6 backdrop-blur-md">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-cyan-400 font-bold">×</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-wider">
            {title}
          </h2>
        </div>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>

      {/* Content */}
      <div className="space-y-4">{children}</div>
    </motion.div>
  )
}
