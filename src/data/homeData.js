import {
  FaAws,
  FaChartLine,
  FaCode,
  FaGoogle,
  FaLaptopCode,
  FaRegIdCard,
  FaRobot,
  FaShieldAlt,
  FaUsers,
} from 'react-icons/fa'
import { SiComptia } from 'react-icons/si'

export const navLinks = ['Explore', 'Categories', 'Business', 'Teach on BSERC']

export const exploreMenuData = [
  {
    label: 'Learn AI',
    children: ['AI Fundamentals', 'AI For Professionals', 'AI For Developers', 'AI For Creatives'],
  },
  {
    label: 'Career Growth',
    children: ['Resume Mastery', 'Interview Prep', 'Leadership', 'Time Management'],
  },
  {
    label: 'Software',
    children: ['Web Development', 'Data Science', 'Cloud Engineering', 'DevOps'],
  },
  {
    label: 'Business',
    children: ['Project Management', 'Marketing', 'Finance', 'Entrepreneurship'],
  },
  {
    label: 'Learn AI',
    children: ['AI Fundamentals', 'AI For Professionals', 'AI For Developers', 'AI For Creatives'],
  },
  {
    label: 'Career Growth',
    children: ['Resume Mastery', 'Interview Prep', 'Leadership', 'Time Management'],
  },
  {
    label: 'Software',
    children: ['Web Development', 'Data Science', 'Cloud Engineering', 'DevOps'],
  },
  {
    label: 'Business',
    children: ['Project Management', 'Marketing', 'Finance', 'Entrepreneurship'],
  },
  {
    label: 'Learn AI',
    children: ['AI Fundamentals', 'AI For Professionals', 'AI For Developers', 'AI For Creatives'],
  },
  {
    label: 'Career Growth',
    children: ['Resume Mastery', 'Interview Prep', 'Leadership', 'Time Management'],
  },
  {
    label: 'Software',
    children: ['Web Development', 'Data Science', 'Cloud Engineering', 'DevOps'],
  },
  {
    label: 'Business',
    children: ['Project Management', 'Marketing', 'Finance', 'Entrepreneurship'],
  },
  {
    label: 'Learn AI',
    children: ['AI Fundamentals', 'AI For Professionals', 'AI For Developers', 'AI For Creatives',],
  },
]

export const courseDetailsData = {
  title: 'Orbital Systems Engineering 2026: Complete Space Tech Bootcamp',
  subtitle:
    'Master spacecraft design, propulsion, telemetry, autonomy, and mission operations for modern space programs',
  tags: ['Bestseller'],
  rating: 4.6,
  ratingsCount: '17,930 ratings',
  learners: '121,550 learners',
  lastUpdated: '3/2026',
  language: 'English',
  captions: ['Arabic', 'Hindi', 'Bulgarian', 'Italian'],
  price: '₹3,089',
  guarantee: '30-day money-back guarantee',
  lifetimeAccess: true,
  couponApplied: 'KEEPLEARNING',
  videoPreview:
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
  instructor: 'Dr. Aanya Patel',
  description:
    'Engineer complete orbital missions from concept to de-orbit. Learn how modern spacecraft systems are designed, validated, and flown—covering propulsion, autonomy, fault protection, RF links, ground passes, and mission control. You will practice building telemetry dashboards, running delta-v trades, and drafting flight-readiness artifacts so your projects mirror real aerospace workflows.',
  courseContent: [
    {
      title: 'Mission Design & Launch Systems',
      lectures: [
        { title: 'Mission profile blueprint', duration: '06:45', durationMinutes: 7, preview: true },
        { title: 'Delta-v budgets and margins', duration: '12:18', durationMinutes: 12 },
        { title: 'Risk, contingencies, and go/no-go gates', duration: '08:02', durationMinutes: 8 },
      ],
    },
    {
      title: 'Spacecraft Architecture & Subsystems',
      lectures: [
        { title: 'Power, thermal, and comms baselines', duration: '11:21', durationMinutes: 11 },
        { title: 'ADCS tuning with reaction wheels', duration: '09:34', durationMinutes: 10, preview: true },
        { title: 'Propulsion stack trade-offs', duration: '10:28', durationMinutes: 10 },
        { title: 'Radiation and shielding considerations', duration: '07:50', durationMinutes: 8 },
      ],
    },
    {
      title: 'Autonomy, FDIR, and Telemetry',
      lectures: [
        { title: 'Command and data handling pipelines', duration: '09:16', durationMinutes: 9 },
        { title: 'FDIR playbooks and safing modes', duration: '08:47', durationMinutes: 9 },
        { title: 'Ground pass scheduling with TLEs', duration: '10:59', durationMinutes: 11, preview: true },
      ],
    },
    {
      title: 'Integration, Test, and Ops',
      lectures: [
        { title: 'Hardware-in-the-loop validation', duration: '08:12', durationMinutes: 8 },
        { title: 'Vibe, thermal-vac, and EMI/EMC', duration: '07:55', durationMinutes: 8 },
        { title: 'Launch rehearsals and ops consoles', duration: '12:44', durationMinutes: 13 },
        { title: 'De-orbit and disposal planning', duration: '06:32', durationMinutes: 7 },
      ],
    },
    {
      title: 'Capstone & Portfolio',
      lectures: [
        { title: 'Capstone design walkthrough', duration: '09:05', durationMinutes: 9 },
        { title: 'Telemetry dashboard build', duration: '07:26', durationMinutes: 7 },
        { title: 'Presenting flight readiness data', duration: '06:58', durationMinutes: 7 },
      ],
    },
  ],
  instructorProfile: {
    name: 'Dr. Aanya Patel',
    title: 'Lead Orbital Systems Architect (ex-ISRO)',
    rating: 4.8,
    reviews: '18,420 reviews',
    students: '210,000 students',
    courses: 12,
    bioShort:
      'Dr. Patel led orbital systems across GEO comsats and lunar probes, building FDIR strategies and telemetry pipelines trusted on live missions.',
    bioLong:
      'Across 14+ years, Dr. Patel has architected multi-satellite fleets, authored flight software for autonomous safing, and guided launch rehearsals with international agencies. She mentors teams on link budgets, delta-v trades, hardware-in-the-loop validation, and mission ops consoles so engineers ship reliable, on-orbit systems.',
    profileUrl: '#',
  },
  whatYouWillLearn: [
    'Design orbital trajectories and delta-v budgets for LEO and GEO missions',
    'Model spacecraft subsystems: power, thermal, comms, ADCS, and propulsion',
    'Set up telemetry/command pipelines and ground-station passes',
    'Implement autonomy for fault detection, isolation, and recovery (FDIR)',
    'Simulate ascent, staging, and payload deployment with mission profiles',
    'Build a drone/rover testbed to prototype guidance and navigation',
    'Qualify hardware/software with environmental and vibration test plans',
    'Prepare flight-readiness artifacts and launch checklists',
  ],
  includes: [
    '29.5 hours on-demand video',
    '107 coding exercises',
    '28 articles',
    '156 downloadable resources',
    'Access on mobile and TV',
    'Closed captions',
    'Certificate of completion',
  ],
  relatedTopics: ['Artificial Intelligence (AI)', 'Data Science', 'Development'],
}

export const categories = [
  {
    title: 'Orbital Mechanics',
    image:
      'https://images.unsplash.com/photo-1451187863213-d1bcbaae3fa3?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Rocket Propulsion',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Aerospace Systems',
    image:
      'https://kalapurna.com/public//storage/blog_image_file/blog-detail.webp',
  },
  {
    title: 'Robotics & Rovers',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/NASA_Mars_Rover.jpg/960px-NASA_Mars_Rover.jpg',
  },
  {
    title: 'Drones & UAV Ops',
    image:
      'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Satellite Comms',
    image:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Space Manufacturing',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Mission Operations',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
]

export const aiCourses = [
  {
    title: 'Orbital Mechanics Foundations',
    duration: '4 weeks',
    image:
      'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Calculate delta-v, Hohmann transfers, and inclination changes',
      'Simulate LEO/GEO trajectories with perturbations',
      'Plan rendezvous and docking profiles safely',
    ],
  },
  {
    title: 'Spacecraft Systems & Telemetry',
    duration: '6 weeks',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Design power, thermal, ADCS, and comms subsystems',
      'Model downlink/uplink passes and TLE-driven contacts',
      'Build dashboards for health, trends, and FDIR alerts',
    ],
  },
  {
    title: 'Autonomous Rovers & Robotics',
    duration: '5 weeks',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/NASA_Mars_Rover.jpg/960px-NASA_Mars_Rover.jpg',
    learningPoints: [
      'Implement SLAM, waypoint planning, and obstacle avoidance',
      'Integrate perception stacks with sensor fusion',
      'Validate autonomy in sim before field tests',
    ],
  },
  {
    title: 'Drone Operations & BVLOS at BSERC',
    duration: '4 weeks',
    image:
      'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Plan missions with airspace rules and safety cases',
      'Tune flight controllers and redundancy checks',
      'Capture aerial data with stabilized payloads',
    ],
  },
  {
    title: 'Rocket Propulsion Essentials',
    duration: '3 weeks',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Compare solid, liquid, and hybrid propulsion stacks',
      'Model thrust curves, ISP, and staging performance',
      'Run ascent sims with stability margins',
    ],
  },
]

export const skillsCourses = [
  {
    title: 'Satellite Operations & Ground',
    instructor: 'Mina Verma',
    rating: 4.7,
    price: '₹2,499',
    image:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Configure ground passes, TLEs, and doppler correction',
      'Automate downlink/telemetry processing pipelines',
      'Build alerting for anomalies and power/comms margins',
    ],
  },
  {
    title: 'Space Robotics Integration',
    instructor: 'Aly Khan',
    rating: 4.8,
    price: '₹2,899',
    image:
      'https://kalapurna.com/public//storage/blog_image_file/blog-detail.webp',
    learningPoints: [
      'Wire actuators, sensors, and bus comms for robotic arms',
      'Program kinematics and motion planning with safety stops',
      'Test in hardware-in-the-loop before deployment',
    ],
  },
  {
    title: 'Launch & Range Safety',
    instructor: 'Elena Scott',
    rating: 4.6,
    price: '₹3,299',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Prepare flight termination systems and range coordination',
      'Run readiness reviews with hazard tracking',
      'Simulate dispersion envelopes and keep-out zones',
    ],
  },
  {
    title: 'Drone Mapping & Surveying',
    instructor: 'Rahul Das',
    rating: 4.9,
    price: '₹1,699',
    image:
      'https://images.unsplash.com/photo-1508614999368-9260051292e5?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Plan LiDAR/photogrammetry missions with GCPs',
      'Process point clouds into DEM/orthos quickly',
      'Deliver QA-checked survey reports to stakeholders',
    ],
  },
]

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

export const careerPaths = [
  {
    title: '🚀 Rocket Engineering Path',
    description: 'Master propulsion, staging, and launch operations through simulation-led modules.',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
    icon: FaCode,
  },
  {
    title: '🛰️ Satellite Systems Path',
    description: 'Learn spacecraft subsystems, telemetry, mission control, and ground station workflows.',
    image:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
    icon: FaRobot,
  },
  {
    title: '🤖 Robotics Engineer Path',
    description: 'Build intelligent autonomous systems with control, perception, and mission planning.',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/NASA_Mars_Rover.jpg/960px-NASA_Mars_Rover.jpg',
    icon: FaUsers,
  },
  {
    title: '🧠 AI for Space Applications',
    description: 'Apply machine learning to orbital operations, robotics navigation, and mission analytics.',
    image:
      'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=900&q=80',
    icon: FaUsers,
  },
]

export const trendingCourses = [
  {
    title: 'Reusable Rocket Design By BSERC',
    instructor: 'Ritesh Jain',
    rating: 4.7,
    price: '₹2,349',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Engineer boosters, staging, and re-entry profiles',
      'Balance thrust, ISP, and structural margins',
      'Plan recovery ops with landing corridors',
    ],
  },
  {
    title: 'Satellite Communications Pro By BSERC',
    instructor: 'Noah Kim',
    rating: 4.8,
    price: '₹3,599',
    image:
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Design RF links, link budgets, and antenna configs',
      'Optimize ground passes and doppler correction',
      'Secure TT&C channels with redundancy',
    ],
  },
  {
    title: 'Drone Swarms & Coordination',
    instructor: 'Jenny Park',
    rating: 4.6,
    price: '₹2,699',
    image:
      'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Build swarm behaviors with collision avoidance',
      'Coordinate multi-vehicle missions and comms relays',
      'Test failovers and degraded modes safely',
    ],
  },
  {
    title: 'Human-Rated Spacecraft Safety',
    instructor: 'Pavel Anton',
    rating: 4.9,
    price: '₹3,799',
    image:
      'https://images.unsplash.com/photo-1451187863213-d1bcbaae3fa3?auto=format&fit=crop&w=900&q=80',
    learningPoints: [
      'Apply safety factors and redundancy for crewed flight',
      'Run fault trees, FMEA, and hazard analyses',
      'Author flight-readiness and contingency plans',
    ],
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
