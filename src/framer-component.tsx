import * as React from "react"
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

export default function VoltxProductShowcase(props: any) {
    const { variant = "solar-sunset", explodedView = false } = props
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateX = useSpring(useTransform(mouseY, [-250, 250], [18, -18]), { stiffness: 220, damping: 24 })
    const rotateY = useSpring(useTransform(mouseX, [-250, 250], [-22, 22]), { stiffness: 220, damping: 24 })

    return (
        <motion.div
            style={{ width: "100%", height: "100%", minHeight: 520, perspective: 1200, display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseMove={(e: any) => {
                const rect = e.currentTarget.getBoundingClientRect()
                mouseX.set(e.clientX - (rect.left + rect.width / 2))
                mouseY.set(e.clientY - (rect.top + rect.height / 2))
            }}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        >
            <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d", width: 580, height: 500 }}>
                <motion.div animate={{ scale: explodedView ? 1.05 : 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                    {/* SVG Assembly */}
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

addPropertyControls(VoltxProductShowcase, {
    variant: {
        type: ControlType.Enum,
        title: "Product Finish",
        options: ["solar-sunset", "obsidian-cyan", "aurora-emerald"],
        optionTitles: ["Solar Sunset", "Obsidian Cyan", "Aurora Mint"],
        defaultValue: "solar-sunset",
    },
    explodedView: {
        type: ControlType.Boolean,
        title: "Exploded View",
        defaultValue: false,
    }
})