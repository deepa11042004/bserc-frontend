import { motion as Motion } from 'framer-motion'
import partnerCollage from '../assets/POPOIK.png'

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

function SupportingSection() {
    return (
        <Motion.section
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            className="-mx-4 rounded-3xl px-4 py-10 text-white sm:-mx-6 sm:px-8 lg:-mx-8"
        >
            <div className="mx-auto max-w-7xl">

                {/* Heading */}
                <div className="text-center">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                        Inspired by Global Space & Research Organizations
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                        Our curriculum is aligned with real-world technologies used by leading organizations.
                    </p>
                </div>

                {/* Image (reduced gap) */}
                <div className="mt-3 sm:mt-4">
                    <div className="overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.25)] transition duration-300 hover:scale-[1.02]">
                        <img
                            src={partnerCollage}
                            alt="Supporting partners collage"
                            className="mx-auto w-full max-w-5xl object-contain"
                            loading="lazy"
                        />
                    </div>
                </div>

            </div>
        </Motion.section>
    )
}

export default SupportingSection