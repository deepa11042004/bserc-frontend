import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa'
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi'
import logo from '../assets/logo.png'

const socialLinks = [
  { icon: FaFacebookF, label: 'Facebook', href: '#' },
  { icon: FaInstagram, label: 'Instagram', href: '#' },
  { icon: FaTwitter, label: 'Twitter', href: '#' },
  { icon: FaLinkedinIn, label: 'LinkedIn', href: '#' },
]

const learningLinks = ['All Courses', 'My Learning', 'Categories', 'Certifications', 'Skill Tracks']

const companyLinks = ['About Us', 'Careers', 'Blog / Articles', 'Privacy Policy', 'Terms & Conditions']

const contactItems = [
  { icon: FiMapPin, label: 'New Delhi, India' },
  { icon: FiPhone, label: '+91 7042880241' },
  { icon: FiMail, label: 'info@bserc.org' },
  { icon: FiMail, label: 'contact@bserc.org' },
]

const Footer = () => {
  return (
    <footer className="mt-20 bg-[#020617] text-white border-t border-[rgba(59,130,246,0.2)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center">
                <img src={logo} alt="BSERC logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-xl font-bold">BSERC</p>
                <p className="text-xs tracking-[0.2em] text-slate-400">HUB FOR SPACE EDUCATION</p>
              </div>
            </div>
            {/* <div className="mt-2 flex items-center gap-3">
              {[
                { src: ministryLogo, alt: 'Partner logo', style: { filter: 'brightness(0) invert(1)' } },
                { src: drdoLogo, alt: 'Partner logo' },
                { src: isroLogo, alt: 'Partner logo' },
                { src: iitDelhiLogo, alt: 'Partner logo' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex h-10 w-20 items-center justify-center"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full object-contain"
                    style={item.style}
                  />
                </div>
              ))}
            </div> */}
            <p className="text-sm text-slate-300 leading-relaxed">
              Empowering Future Innovators in Space Exploration. We are dedicated to advancing space
              science education and fostering innovation across India.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0b1224] text-slate-200 transition hover:text-white hover:scale-105 hover:shadow-[0_0_18px_rgba(59,130,246,0.45)]"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Learning */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Learning</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              {learningLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 transition hover:text-[#3B82F6] hover:translate-x-1"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Company</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              {companyLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="inline-flex items-center gap-2 transition hover:text-[#3B82F6] hover:translate-x-1"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Head Office</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              {contactItems.map(({ icon: Icon, label }, idx) => (
                <li key={`${label}-${idx}`} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-[#0b1224] text-[#3B82F6]">
                    <Icon size={16} />
                  </span>
                  <span className="leading-relaxed">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-6 flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BSERC. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="transition hover:text-[#3B82F6]">Privacy</a>
            <span className="text-slate-600">|</span>
            <a href="#" className="transition hover:text-[#3B82F6]">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
