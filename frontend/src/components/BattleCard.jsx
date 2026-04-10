/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

export default function BattleCard({
  icon,
  title,
  description,
  children,
  glowColor = "cyan",
}) {
  const glowColors = {
    cyan: "border-cyan-500/30 hover:border-cyan-500/60 shadow-cyan-500/20",
    magenta:
      "border-magenta-500/30 hover:border-magenta-500/60 shadow-magenta-500/20",
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`rounded-2xl border bg-gradient-to-br from-gray-900/40 to-black p-6 backdrop-blur-md transition-all ${glowColors[glowColor]} shadow-lg`}
    >
      {/* Card header */}
      {icon && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="text-lg font-bold text-white uppercase tracking-wide">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-400">{description}</p>
            )}
          </div>
        </div>
      )}

      {/* Card content */}
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}
