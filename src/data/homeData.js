import {
  FaAws,
  FaChartLine,
  FaGoogle,
  FaLaptopCode,
  FaRegIdCard,
  FaShieldAlt,
} from 'react-icons/fa'
import { SiComptia } from 'react-icons/si'

export const navLinks = ['Explore', 'Categories', 'Business', 'Teach on BSERC']

export const companyLogos = [
  {
    name: 'Google',
    icon: FaGoogle,
  },
  {
    name: 'AWS',
    icon: FaAws,
  },
  {
    name: 'Engineering',
    icon: FaLaptopCode,
  },
  {
    name: 'Security',
    icon: FaShieldAlt,
  },
  {
    name: 'Business',
    icon: FaChartLine,
  },
]

export const testimonials = [
  {
    name: 'Briana F.',
    feedback:
      'Because of this course I switched into a data role in under 3 months. The lessons were practical and clear.',
  },
  {
    name: 'Carlos M.',
    feedback:
      'The projects felt close to real-world work. I built confidence while learning concepts I can actually apply.',
  },
  {
    name: 'Daria K.',
    feedback:
      'I used AI to automate repetitive tasks in my team and saved hours each week. Worth every minute.',
  },
  {
    name: 'Ari N.',
    feedback:
      'The mentor sessions made a huge difference. I now have a complete portfolio and interview-ready stories.',
  },
]

export const certifications = [
  {
    title: 'CompTIA',
    subtitle: 'Cloud+, Security+',
    icon: SiComptia,
  },
  {
    title: 'AWS',
    subtitle: 'Cloud & DevOps',
    icon: FaAws,
  },
  {
    title: 'PMI',
    subtitle: 'Project Management',
    icon: FaRegIdCard,
  },
  {
    title: 'Cybersecurity',
    subtitle: 'SOC Analyst Path',
    icon: FaShieldAlt,
  },
]

export const footerColumns = [
  {
    heading: 'Explore',
    items: ['Web Development', 'AI & Data', 'Cloud', 'Design'],
  },
  {
    heading: 'Certifications',
    items: ['AWS', 'CompTIA', 'PMI', 'Microsoft'],
  },
  {
    heading: 'Development',
    items: ['React', 'Node.js', 'Python', 'Java'],
  },
  {
    heading: 'Business',
    items: ['Leadership', 'Finance', 'Communication', 'Marketing'],
  },
]
