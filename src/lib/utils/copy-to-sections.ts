import type { Section, CopyElement, ContextProfile } from "@/types";

function hashNiche(niche: string): number {
  let h = 0;
  for (let i = 0; i < niche.length; i++) {
    h = ((h << 5) - h) + niche.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let m = copy.length;
  let s = seed;
  while (m) {
    s = (s * 9301 + 49297) % 233280;
    const i = Math.floor((s / 233280) * m--);
    [copy[m], copy[i]] = [copy[i], copy[m]];
  }
  return copy;
}

function pickNSeeded<T>(arr: T[], n: number, seed: number): T[] {
  return seededShuffle(arr, seed).slice(0, Math.min(n, arr.length));
}

const FEATURE_TEMPLATES: Record<string, { title: string[]; desc: string[] }> = {
  en: {
    title: [
      "Lightning-Fast Performance", "Enterprise-Grade Security", "Smart Automation",
      "Real-Time Analytics", "Seamless Integration", "Beautiful Dashboard",
      "Team Collaboration", "AI-Powered Insights", "Zero Downtime",
      "One-Click Setup", "Global CDN", "Advanced Reporting",
    ],
    desc: [
      "Built for speed. Pages load in under 200ms.",
      "Your data stays safe with end-to-end encryption.",
      "Automate repetitive tasks and focus on growth.",
      "Know exactly what's happening with live metrics.",
      "Connects with every tool you already use.",
      "Clean, intuitive interface that your team will love.",
      "Work together in real-time, from anywhere.",
      "Let artificial intelligence find patterns you'd miss.",
      "99.99% uptime guarantee. Never miss a beat.",
      "Get started in minutes, not days. Zero learning curve.",
      "Deliver content at lightning speed from 50+ edge locations.",
      "Make data-driven decisions with beautiful visualizations.",
    ],
  },
  id: {
    title: [
      "Kinerja Super Cepat", "Keamanan Kelas Enterprise", "Otomatisasi Cerdas",
      "Analitik Real-Time", "Integrasi Mulus", "Dashboard Cantik",
      "Kolaborasi Tim", "Wawasan Bertenaga AI", "Nol Downtime",
      "Setup Satu Klik", "CDN Global", "Laporan Lanjutan",
    ],
    desc: [
      "Dibangun untuk kecepatan. Halaman muat di bawah 200ms.",
      "Data Anda aman dengan enkripsi end-to-end.",
      "Otomatiskan tugas berulang dan fokus pada pertumbuhan.",
      "Tahu persis apa yang terjadi dengan metrik langsung.",
      "Terhubung dengan semua alat yang sudah Anda pakai.",
      "Antarmuka bersih dan intuitif yang disukai tim.",
      "Bekerja bersama secara real-time, dari mana saja.",
      "Biarkan AI temukan pola yang Anda lewatkan.",
      "Garansi uptime 99.99%. Jangan pernah lewatkan momen.",
      "Mulai dalam hitungan menit, bukan hari. Tanpa kurva belajar.",
      "Kirim konten dengan kecepatan kilat dari 50+ lokasi edge.",
      "Buat keputusan berbasis data dengan visualisasi indah.",
    ],
  },
};

const TESTIMONIAL_TEMPLATES: Record<string, { quote: string[]; name: string[]; role: string[]; company: string[] }> = {
  en: {
    quote: [
      "This completely transformed how we work. Our productivity shot up 3x in the first month.",
      "We tried 5 other solutions before this. Nothing comes close.",
      "The ROI was immediate. We saw results within the first week.",
      "Finally, a tool that actually does what it promises.",
      "Our customers noticed the difference immediately. Game changer.",
      "The best investment we've made for our team this year.",
      "I wish we had found this sooner. It's been a revelation.",
      "The support team is incredible. They truly care about our success.",
    ],
    name: ["Sarah Chen", "Marcus Johnson", "Aisha Patel", "David Kim", "Emma Rodriguez", "James Wilson", "Priya Sharma", "Tom Nakamura"],
    role: ["CEO", "VP of Engineering", "Head of Product", "CTO", "Marketing Director", "Operations Lead", "Founder", "Product Manager"],
    company: ["TechFlow Inc.", "BrightMind Solutions", "NexGen Corp", "Pinnacle Systems", "CloudPeak Labs", "StarForge Inc."],
  },
  id: {
    quote: [
      "Ini benar-benar mengubah cara kami bekerja. Produktivitas naik 3x di bulan pertama.",
      "Kami coba 5 solusi lain sebelum ini. Tidak ada yang mendekati.",
      "ROI-nya langsung terasa. Kami lihat hasil di minggu pertama.",
      "Akhirnya, alat yang benar-benar melakukan apa yang dijanjikan.",
      "Pelanggan kami langsung lihat perbedaannya. Game changer.",
      "Investasi terbaik yang kami buat untuk tim tahun ini.",
      "Seharusnya kami pakai ini dari dulu. Sungguh menakjubkan.",
      "Tim dukungannya luar biasa. Mereka benar-benar peduli.",
    ],
    name: ["Sari Wijaya", "Budi Santoso", "Dewi Lestari", "Rudi Hermawan", "Maya Putri", "Andi Pratama", "Rina Kurniawan", "Doni Prasetyo"],
    role: ["CEO", "VP Teknik", "Kepala Produk", "CTO", "Direktur Marketing", "Kepala Operasi", "Pendiri", "Manajer Produk"],
    company: ["TechFlow Indonesia", "BrightMind Solusi", "NexGen Corp", "Pinnacle Systems", "CloudPeak Labs", "StarForge Inc."],
  },
};

const PRICING_TEMPLATES: Record<string, { names: string[]; descs: string[]; features: string[][] }> = {
  en: {
    names: ["Starter", "Professional", "Enterprise"],
    descs: ["Perfect for getting started", "Best for growing teams", "For large organizations"],
    features: [
      ["Up to 5 users", "Basic analytics", "24h support", "1 project", "API access"],
      ["Unlimited users", "Advanced analytics", "Priority support", "Unlimited projects", "API + Webhooks", "Custom integrations", "Team roles"],
      ["Everything in Pro", "Dedicated account manager", "99.99% SLA", "Custom development", "On-premise option", "24/7 phone support", "Security audit"],
    ],
  },
  id: {
    names: ["Pemula", "Professional", "Enterprise"],
    descs: ["Cocok untuk memulai", "Terbaik untuk tim berkembang", "Untuk organisasi besar"],
    features: [
      ["Hingga 5 pengguna", "Analitik dasar", "Dukungan 24 jam", "1 proyek", "Akses API"],
      ["Pengguna tak terbatas", "Analitik lanjutan", "Dukungan prioritas", "Proyek tak terbatas", "API + Webhooks", "Integrasi kustom", "Peran tim"],
      ["Semua fitur Pro", "Account manager khusus", "SLA 99.99%", "Pengembangan kustom", "Opsi on-premise", "Dukungan telepon 24/7", "Audit keamanan"],
    ],
  },
};

const FAQ_TEMPLATES: Record<string, { q: string[]; a: string[] }> = {
  en: {
    q: [
      "How does the free trial work?",
      "Can I change my plan later?",
      "Is my data secure?",
      "What kind of support do you offer?",
      "Can I integrate with my existing tools?",
      "How long does onboarding take?",
      "Do you offer refunds?",
      "Can I cancel anytime?",
    ],
    a: [
      "Sign up for free and get full access for 14 days. No credit card required. Cancel anytime.",
      "Yes, you can upgrade or downgrade at any time. Changes take effect immediately.",
      "Absolutely. We use enterprise-grade encryption. SOC 2 Type II certified.",
      "All plans include email support with 4-hour response. Pro plans get priority 1-hour support.",
      "We offer native integrations with 200+ tools including Slack, GitHub, and Jira.",
      "Most teams are fully set up within a day. Our onboarding team guides you every step.",
      "Yes, we offer a 30-day money-back guarantee. No questions asked.",
      "Absolutely. Cancel anytime from your dashboard. No hidden fees or penalties.",
    ],
  },
  id: {
    q: [
      "Bagaimana cara kerja uji coba gratis?",
      "Bisakah saya ganti paket nanti?",
      "Apakah data saya aman?",
      "Dukungan seperti apa yang ditawarkan?",
      "Bisakah integrasi dengan alat yang sudah ada?",
      "Berapa lama proses onboarding?",
      "Apakah ada refund?",
      "Bisakah berhenti kapan saja?",
    ],
    a: [
      "Daftar gratis dan dapatkan akses penuh selama 14 hari. Tanpa kartu kredit.",
      "Ya, Anda bisa upgrade atau downgrade kapan saja. Perubahan berlaku segera.",
      "Tentu. Kami menggunakan enkripsi kelas enterprise. SOC 2 Type II certified.",
      "Semua paket termasuk dukungan email dengan respon 4 jam. Pro dapat prioritas 1 jam.",
      "Kami punya integrasi asli dengan 200+ alat termasuk Slack, GitHub, dan Jira.",
      "Kebanyakan tim siap dalam sehari. Tim onboarding kami memandu Anda.",
      "Ya, kami menawarkan jaminan uang kembali 30 hari. Tanpa syarat.",
      "Tentu. Batalkan kapan saja dari dashboard. Tanpa biaya tersembunyi.",
    ],
  },
};

const STATS_TEMPLATES: Record<string, { values: string[]; labels: string[] }> = {
  en: {
    values: ["50,000+", "99.9%", "4.9/5", "200+", "10M+", "99.99%"],
    labels: ["Active Users", "Uptime", "Rating", "Integrations", "Data Points", "SLA"],
  },
  id: {
    values: ["50.000+", "99.9%", "4.9/5", "200+", "10Jt+", "99.99%"],
    labels: ["Pengguna Aktif", "Waktu Aktif", "Rating", "Integrasi", "Titik Data", "SLA"],
  },
};

const GALLERY_TEMPLATES: Record<string, { tags: string[]; categories: string[] }> = {
  en: {
    tags: ["Design", "Development", "Branding", "Strategy", "Creative", "Innovation", "UX", "Mobile"],
    categories: ["All", "Web", "Mobile", "Brand", "Print", "UI/UX"],
  },
  id: {
    tags: ["Desain", "Pengembangan", "Branding", "Strategi", "Kreatif", "Inovasi", "UX", "Mobile"],
    categories: ["Semua", "Web", "Mobile", "Brand", "Cetak", "UI/UX"],
  },
};

const LOGOS_TEMPLATES: Record<string, string[]> = {
  en: ["TechFlow", "BrightMind", "NexGen", "Pinnacle", "CloudPeak", "StarForge", "Quantum", "Apex"],
  id: ["TechFlow", "BrightMind", "NexGen", "Pinnacle", "CloudPeak", "StarForge", "Quantum", "Apex"],
};

const CONTACT_TEMPLATES: Record<string, { email: string; phone: string; address: string; hours: string }> = {
  en: {
    email: "hello@company.com",
    phone: "+1 (555) 000-0000",
    address: "123 Innovation Drive, San Francisco, CA 94105",
    hours: "Mon-Fri 9AM-6PM",
  },
  id: {
    email: "halo@perusahaan.com",
    phone: "+62 21 0000 0000",
    address: "Jl. Inovasi No. 123, Jakarta",
    hours: "Sen-Jum 9AM-6PM",
  },
};

const TEAM_TEMPLATES: Record<string, { names: string[]; roles: string[]; bios: string[] }> = {
  en: {
    names: ["Alex Morgan", "Jordan Lee", "Taylor Kim", "Casey Rivera", "Riley Patel", "Sam Chen"],
    roles: ["CEO & Founder", "CTO", "Head of Design", "VP Engineering", "COO", "Head of Marketing"],
    bios: [
      "15+ years in tech. Previously led teams at Google & Stripe.",
      "Ex-Apple, built infrastructure serving 100M+ users.",
      "Award-winning designer. Previously at Airbnb.",
      "Scaled engineering org from 5 to 100 in 2 years.",
      "Built and exited two startups before joining us.",
      "Growth expert who scaled brands from zero to millions.",
    ],
  },
  id: {
    names: ["Alex Morgan", "Jordan Lee", "Taylor Kim", "Casey Rivera", "Riley Patel", "Sam Chen"],
    roles: ["CEO & Pendiri", "CTO", "Kepala Desain", "VP Teknik", "COO", "Kepala Marketing"],
    bios: [
      "15+ tahun di tech. Sebelumnya pimpin tim di Google & Stripe.",
      "Ex-Apple, bangun infrastruktur layani 100M+ pengguna.",
      "Desainer pemenang penghargaan. Sebelumnya di Airbnb.",
      "Skalakan org teknik dari 5 ke 100 dalam 2 tahun.",
      "Bangun dan exit dua startup sebelum bergabung.",
      "Ahli pertumbuhan yang skalakan brand dari nol ke jutaan.",
    ],
  },
};

const COMPARISON_TEMPLATES: Record<string, { rows: string[]; our_vals: string[]; their_vals: string[] }> = {
  en: {
    rows: ["Price", "Setup Time", "Support", "Security", "Uptime", "Integrations", "Customization", "Onboarding"],
    our_vals: ["$29/mo", "5 minutes", "24/7 Priority", "SOC 2 Type II", "99.99%", "200+", "Full API", "Guided"],
    their_vals: ["$99/mo", "2 weeks", "Email only", "Basic", "99.5%", "50+", "Limited", "Self-serve"],
  },
  id: {
    rows: ["Harga", "Waktu Setup", "Dukungan", "Keamanan", "Waktu Aktif", "Integrasi", "Kustomisasi", "Onboarding"],
    our_vals: ["Rp299rb/bln", "5 menit", "Prioritas 24/7", "SOC 2 Type II", "99.99%", "200+", "API Penuh", "Terpandu"],
    their_vals: ["Rp999rb/bln", "2 minggu", "Email saja", "Dasar", "99.5%", "50+", "Terbatas", "Mandiri"],
  },
};

const TIMELINE_TEMPLATES: Record<string, { years: string[]; events: string[]; descs: string[] }> = {
  en: {
    years: ["2019", "2020", "2021", "2022", "2023", "2024"],
    events: ["Idea Born", "MVP Launched", "First 1K Users", "Series A", "Global Launch", "1M Users"],
    descs: ["Started with a whiteboard and a dream", "Shipped v1 to 100 beta testers", "Reached 1,000 users organically", "Raised $10M from top VCs", "Expanded to 50+ countries", "Hit the 1M user milestone"],
  },
  id: {
    years: ["2019", "2020", "2021", "2022", "2023", "2024"],
    events: ["Ide Lahir", "MVP Diluncurkan", "1.000 Pengguna Pertama", "Seri A", "Peluncuran Global", "1Jt Pengguna"],
    descs: ["Dimulai dengan papan tulis dan mimpi", "Rilis v1 ke 100 penguji beta", "Capai 1.000 pengguna secara organik", "Raise $10M dari VC top", "Ekspansi ke 50+ negara", "Capai milestone 1 juta pengguna"],
  },
};

type NicheTemplates = Record<string, { title: string; subtitle: string; cta: string; features: string[] }>;

const NICHE_CONTENT: NicheTemplates = {
  fintech: {
    title: "Smart Finance, Smarter Future",
    subtitle: "Manage your money with AI-powered insights and zero effort",
    cta: "Start Free Trial",
    features: ["Real-time transaction monitoring", "Automated savings & investments", "Fraud detection AI"],
  },
  saas: {
    title: "Built for Scale",
    subtitle: "Enterprise-grade infrastructure that grows with you",
    cta: "Get Started Free",
    features: ["99.99% uptime guarantee", "Unlimited team seats", "Advanced analytics dashboard"],
  },
  wellness: {
    title: "Find Your Balance",
    subtitle: "Mindful wellness tools for a healthier, happier you",
    cta: "Begin Your Journey",
    features: ["Guided meditation sessions", "Personalized wellness plans", "Progress tracking & insights"],
  },
  education: {
    title: "Learn Without Limits",
    subtitle: "World-class education, accessible from anywhere",
    cta: "Start Learning Free",
    features: ["Expert-led video courses", "Interactive coding exercises", "AI-powered personalized path"],
  },
  ecommerce: {
    title: "Sell More, Work Less",
    subtitle: "All-in-one platform to grow your online store",
    cta: "Open Your Store",
    features: ["Smart inventory management", "One-click upsells & cross-sells", "Abandoned cart recovery"],
  },
  creative: {
    title: "Bring Your Vision to Life",
    subtitle: "Creative tools that turn ideas into masterpieces",
    cta: "Start Creating",
    features: ["Professional design templates", "Real-time team collaboration", "AI-assisted creative tools"],
  },
  healthtech: {
    title: "Better Care, Connected",
    subtitle: "Empowering healthcare providers with intelligent tools",
    cta: "Book a Demo",
    features: ["Secure patient portal", "AI diagnostic assistance", "Seamless EHR integration"],
  },
  food: {
    title: "Taste the Difference",
    subtitle: "Fresh ingredients, bold flavors, unforgettable experiences",
    cta: "Order Now",
    features: ["Farm-to-table ingredients", "Chef-crafted recipes", "Contactless delivery"],
  },
  agency: {
    title: "Results That Speak",
    subtitle: "Full-service agency delivering measurable growth",
    cta: "Let's Talk",
    features: ["Data-driven strategy", "Creative excellence", "End-to-end execution"],
  },
  realestate: {
    title: "Find Your Dream Space",
    subtitle: "Smart tools for buyers, sellers, and agents",
    cta: "Search Properties",
    features: ["AI-powered property matching", "Virtual tour technology", "Real-time market analytics"],
  },
  nonprofit: {
    title: "Make a Difference Today",
    subtitle: "Tools that amplify your mission and impact",
    cta: "Donate Now",
    features: ["Smart donor management", "Impact tracking & reporting", "Peer-to-peer fundraising"],
  },
  tech: {
    title: "Innovation Accelerated",
    subtitle: "Build tomorrow's technology with today's best tools",
    cta: "Get Early Access",
    features: ["Developer-first platform", "Edge computing ready", "Zero-config deployment"],
  },
  travel: {
    title: "Explore the World",
    subtitle: "Curated experiences for the modern traveler",
    cta: "Book Adventure",
    features: ["AI trip planner", "Local experience curator", "24/7 travel support"],
  },
};

function getNicheContent(niche: string): { title: string; subtitle: string; cta: string; features: string[] } {
  const key = niche.toLowerCase().replace(/[^a-z]/g, "");
  for (const [n, content] of Object.entries(NICHE_CONTENT)) {
    if (key.includes(n)) return content;
  }
  return NICHE_CONTENT.saas;
}

export function mergeCopyIntoSections(
  sections: Section[],
  copy: CopyElement[],
  context?: ContextProfile,
): Section[] {
  const lang = context?.language || "en";
  const niche = context?.niche || "saas";
  const seed = hashNiche(niche + lang + String(sections.length));

  const headlineEl = copy.find((c) => c.type === "headline");
  const subheaderEl = copy.find((c) => c.type === "subheader");
  const ctaEl = copy.find((c) => c.type === "cta");

  const headline = headlineEl?.content || "";
  const subheadline = subheaderEl?.content || "";
  const cta = ctaEl?.content || "";

  const nicheContent = getNicheContent(niche);

  const fTemplates = FEATURE_TEMPLATES[lang] || FEATURE_TEMPLATES.en;
  const tTemplates = TESTIMONIAL_TEMPLATES[lang] || TESTIMONIAL_TEMPLATES.en;
  const pTemplates = PRICING_TEMPLATES[lang] || PRICING_TEMPLATES.en;
  const faqTemplates = FAQ_TEMPLATES[lang] || FAQ_TEMPLATES.en;
  const sTemplates = STATS_TEMPLATES[lang] || STATS_TEMPLATES.en;
  const gTemplates = GALLERY_TEMPLATES[lang] || GALLERY_TEMPLATES.en;
  const lTemplates = LOGOS_TEMPLATES[lang] || LOGOS_TEMPLATES.en;
  const cTemplates = CONTACT_TEMPLATES[lang] || CONTACT_TEMPLATES.en;
  const teamTemplates = TEAM_TEMPLATES[lang] || TEAM_TEMPLATES.en;
  const compTemplates = COMPARISON_TEMPLATES[lang] || COMPARISON_TEMPLATES.en;
  const tlTemplates = TIMELINE_TEMPLATES[lang] || TIMELINE_TEMPLATES.en;

  const featureTitles = pickNSeeded(fTemplates.title, 3, seed);
  const featureDescs = pickNSeeded(fTemplates.desc, 3, seed + 1);
  const testimonials = pickNSeeded(tTemplates.quote, 2, seed + 2);
  const testimonialNames = pickNSeeded(tTemplates.name, 2, seed + 3);
  const testimonialRoles = pickNSeeded(tTemplates.role, 2, seed + 4);
  const testimonialCos = pickNSeeded(tTemplates.company, 2, seed + 5);
  const faqs = pickNSeeded(faqTemplates.q, 3, seed + 6);
  const faqAs = faqs.map((_, i) => faqTemplates.a[(seed + i) % faqTemplates.a.length]);

  const statValues = pickNSeeded(sTemplates.values, 4, seed + 7);
  const statLabels = pickNSeeded(sTemplates.labels, 4, seed + 8);

  return sections.map((section): Section => {
    switch (section.type) {
      case "hero":
        return {
          ...section,
          content: {
            headline: section.content.headline || headline || nicheContent.title,
            subheadline: section.content.subheadline || subheadline || nicheContent.subtitle,
            cta: section.content.cta || cta || nicheContent.cta,
          },
        };

      case "features":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Fitur Unggulan" : "Key Features"),
            subtitle: section.content.subtitle || subheadline || nicheContent.subtitle,
            feature_1_title: section.content.feature_1_title || featureTitles[0],
            feature_1_desc: section.content.feature_1_desc || featureDescs[0],
            feature_2_title: section.content.feature_2_title || featureTitles[1] || featureTitles[0],
            feature_2_desc: section.content.feature_2_desc || featureDescs[1] || featureDescs[0],
            feature_3_title: section.content.feature_3_title || featureTitles[2] || featureTitles[0],
            feature_3_desc: section.content.feature_3_desc || featureDescs[2] || featureDescs[0],
          },
        };

      case "testimonials":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Apa Kata Mereka" : "What People Say"),
            subtitle: section.content.subtitle || (lang === "id" ? "Dipercaya oleh ribuan pengguna" : "Trusted by thousands of users"),
            quote_1: section.content.quote_1 || testimonials[0],
            name_1: section.content.name_1 || testimonialNames[0],
            role_1: section.content.role_1 || testimonialRoles[0],
            company_1: section.content.company_1 || testimonialCos[0],
            quote_2: section.content.quote_2 || testimonials[1] || testimonials[0],
            name_2: section.content.name_2 || testimonialNames[1] || testimonialNames[0],
            role_2: section.content.role_2 || testimonialRoles[1] || testimonialRoles[0],
            company_2: section.content.company_2 || testimonialCos[1] || testimonialCos[0],
          },
        };

      case "pricing":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Harga Sederhana" : "Simple Pricing"),
            subtitle: section.content.subtitle || (lang === "id" ? "Pilih paket yang sesuai" : "Choose the plan that fits you"),
            plan_1_name: section.content.plan_1_name || pTemplates.names[0],
            plan_1_desc: section.content.plan_1_desc || pTemplates.descs[0],
            plan_1_price: section.content.plan_1_price || (lang === "id" ? "Rp99rb" : "$9"),
            plan_1_feat_1: section.content.plan_1_feat_1 || pTemplates.features[0][0],
            plan_1_feat_2: section.content.plan_1_feat_2 || pTemplates.features[0][1],
            plan_1_feat_3: section.content.plan_1_feat_3 || pTemplates.features[0][2],
            plan_1_cta: section.content.plan_1_cta || cta || nicheContent.cta,
            plan_2_name: section.content.plan_2_name || pTemplates.names[1],
            plan_2_desc: section.content.plan_2_desc || pTemplates.descs[1],
            plan_2_price: section.content.plan_2_price || (lang === "id" ? "Rp299rb" : "$29"),
            plan_2_feat_1: section.content.plan_2_feat_1 || pTemplates.features[1][0],
            plan_2_feat_2: section.content.plan_2_feat_2 || pTemplates.features[1][1],
            plan_2_feat_3: section.content.plan_2_feat_3 || pTemplates.features[1][2],
            plan_2_feat_4: section.content.plan_2_feat_4 || pTemplates.features[1][3],
            plan_2_cta: section.content.plan_2_cta || cta || nicheContent.cta,
            plan_3_name: section.content.plan_3_name || pTemplates.names[2],
            plan_3_desc: section.content.plan_3_desc || pTemplates.descs[2],
            plan_3_price: section.content.plan_3_price || (lang === "id" ? "Rp999rb" : "$99"),
            plan_3_feat_1: section.content.plan_3_feat_1 || pTemplates.features[2][0],
            plan_3_feat_2: section.content.plan_3_feat_2 || pTemplates.features[2][1],
            plan_3_feat_3: section.content.plan_3_feat_3 || pTemplates.features[2][2],
            plan_3_cta: section.content.plan_3_cta || (lang === "id" ? "Hubungi Kami" : "Contact Us"),
          },
        };

      case "cta": {
        const ctaHeadline = lang === "id"
          ? "Siap Memulai?"
          : "Ready to Get Started?";
        return {
          ...section,
          content: {
            headline: section.content.headline || headline || ctaHeadline,
            subheadline: section.content.subheadline || subheadline || nicheContent.subtitle,
            button: section.content.button || cta || nicheContent.cta,
          },
        };
      }

      case "faq":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Pertanyaan Umum" : "Frequently Asked"),
            subtitle: section.content.subtitle || "",
            q_1: section.content.q_1 || faqs[0],
            a_1: section.content.a_1 || faqAs[0],
            q_2: section.content.q_2 || faqs[1] || faqs[0],
            a_2: section.content.a_2 || faqAs[1] || faqAs[0],
            q_3: section.content.q_3 || faqs[2] || faqs[0],
            a_3: section.content.a_3 || faqAs[2] || faqAs[0],
          },
        };

      case "stats":
        return {
          ...section,
          content: {
            title: section.content.title || headline || nicheContent.title,
            stat_1_value: section.content.stat_1_value || statValues[0],
            stat_1_label: section.content.stat_1_label || statLabels[0],
            stat_2_value: section.content.stat_2_value || statValues[1],
            stat_2_label: section.content.stat_2_label || statLabels[1],
            stat_3_value: section.content.stat_3_value || statValues[2],
            stat_3_label: section.content.stat_3_label || statLabels[2],
            stat_4_value: section.content.stat_4_value || statValues[3],
            stat_4_label: section.content.stat_4_label || statLabels[3],
          },
        };

      case "gallery":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Portofolio" : "Our Work"),
            subtitle: section.content.subtitle || (lang === "id" ? "Lihat hasil karya terbaik kami" : "Browse our latest projects"),
            category_1: section.content.category_1 || gTemplates.categories[0],
            category_2: section.content.category_2 || gTemplates.categories[1],
            category_3: section.content.category_3 || gTemplates.categories[2],
            category_4: section.content.category_4 || gTemplates.categories[3],
            category_5: section.content.category_5 || gTemplates.categories[4],
            category_6: section.content.category_6 || gTemplates.categories[5],
            tag_1: section.content.tag_1 || gTemplates.tags[0],
            tag_2: section.content.tag_2 || gTemplates.tags[1],
            tag_3: section.content.tag_3 || gTemplates.tags[2],
            tag_4: section.content.tag_4 || gTemplates.tags[3],
            tag_5: section.content.tag_5 || gTemplates.tags[4],
            tag_6: section.content.tag_6 || gTemplates.tags[5],
          },
        };

      case "logos":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Dipercaya Oleh" : "Trusted By"),
            logo_1: section.content.logo_1 || lTemplates[0],
            logo_2: section.content.logo_2 || lTemplates[1],
            logo_3: section.content.logo_3 || lTemplates[2],
            logo_4: section.content.logo_4 || lTemplates[3],
            logo_5: section.content.logo_5 || lTemplates[4],
            logo_6: section.content.logo_6 || lTemplates[5],
            logo_7: section.content.logo_7 || lTemplates[6],
            logo_8: section.content.logo_8 || lTemplates[7],
          },
        };

      case "contact":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Hubungi Kami" : "Get in Touch"),
            subtitle: section.content.subtitle || (lang === "id" ? "Kami siap membantu" : "We'd love to hear from you"),
            email: section.content.email || cTemplates.email,
            phone: section.content.phone || cTemplates.phone,
            address: section.content.address || cTemplates.address,
            hours: section.content.hours || cTemplates.hours,
            cta: section.content.cta || (lang === "id" ? "Kirim Pesan" : "Send Message"),
          },
        };

      case "comparison":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Bandingkan" : "Why Choose Us"),
            subtitle: section.content.subtitle || subheadline || nicheContent.subtitle,
            row_1: section.content.row_1 || compTemplates.rows[0],
            row_2: section.content.row_2 || compTemplates.rows[1],
            row_3: section.content.row_3 || compTemplates.rows[2],
            row_4: section.content.row_4 || compTemplates.rows[3],
            row_5: section.content.row_5 || compTemplates.rows[4],
            row_6: section.content.row_6 || compTemplates.rows[5],
            row_7: section.content.row_7 || compTemplates.rows[6],
            row_8: section.content.row_8 || compTemplates.rows[7],
            our_val_1: section.content.our_val_1 || compTemplates.our_vals[0],
            our_val_2: section.content.our_val_2 || compTemplates.our_vals[1],
            our_val_3: section.content.our_val_3 || compTemplates.our_vals[2],
            our_val_4: section.content.our_val_4 || compTemplates.our_vals[3],
            our_val_5: section.content.our_val_5 || compTemplates.our_vals[4],
            our_val_6: section.content.our_val_6 || compTemplates.our_vals[5],
            our_val_7: section.content.our_val_7 || compTemplates.our_vals[6],
            our_val_8: section.content.our_val_8 || compTemplates.our_vals[7],
            their_val_1: section.content.their_val_1 || compTemplates.their_vals[0],
            their_val_2: section.content.their_val_2 || compTemplates.their_vals[1],
            their_val_3: section.content.their_val_3 || compTemplates.their_vals[2],
            their_val_4: section.content.their_val_4 || compTemplates.their_vals[3],
            their_val_5: section.content.their_val_5 || compTemplates.their_vals[4],
            their_val_6: section.content.their_val_6 || compTemplates.their_vals[5],
            their_val_7: section.content.their_val_7 || compTemplates.their_vals[6],
            their_val_8: section.content.their_val_8 || compTemplates.their_vals[7],
          },
        };

      case "timeline":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Perjalanan Kami" : "Our Journey"),
            subtitle: section.content.subtitle || (lang === "id" ? "Dari awal hingga sekarang" : "From the beginning to now"),
            year_1: section.content.year_1 || tlTemplates.years[0],
            year_2: section.content.year_2 || tlTemplates.years[1],
            year_3: section.content.year_3 || tlTemplates.years[2],
            year_4: section.content.year_4 || tlTemplates.years[3],
            year_5: section.content.year_5 || tlTemplates.years[4],
            year_6: section.content.year_6 || tlTemplates.years[5],
            event_1: section.content.event_1 || tlTemplates.events[0],
            event_2: section.content.event_2 || tlTemplates.events[1],
            event_3: section.content.event_3 || tlTemplates.events[2],
            event_4: section.content.event_4 || tlTemplates.events[3],
            event_5: section.content.event_5 || tlTemplates.events[4],
            event_6: section.content.event_6 || tlTemplates.events[5],
            desc_1: section.content.desc_1 || tlTemplates.descs[0],
            desc_2: section.content.desc_2 || tlTemplates.descs[1],
            desc_3: section.content.desc_3 || tlTemplates.descs[2],
            desc_4: section.content.desc_4 || tlTemplates.descs[3],
            desc_5: section.content.desc_5 || tlTemplates.descs[4],
            desc_6: section.content.desc_6 || tlTemplates.descs[5],
          },
        };

      case "team":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Tim Kami" : "Meet the Team"),
            subtitle: section.content.subtitle || (lang === "id" ? "Orang di balik kesuksesan" : "The people behind the vision"),
            name_1: section.content.name_1 || teamTemplates.names[0],
            name_2: section.content.name_2 || teamTemplates.names[1],
            name_3: section.content.name_3 || teamTemplates.names[2],
            name_4: section.content.name_4 || teamTemplates.names[3],
            name_5: section.content.name_5 || teamTemplates.names[4],
            name_6: section.content.name_6 || teamTemplates.names[5],
            role_1: section.content.role_1 || teamTemplates.roles[0],
            role_2: section.content.role_2 || teamTemplates.roles[1],
            role_3: section.content.role_3 || teamTemplates.roles[2],
            role_4: section.content.role_4 || teamTemplates.roles[3],
            role_5: section.content.role_5 || teamTemplates.roles[4],
            role_6: section.content.role_6 || teamTemplates.roles[5],
            bio_1: section.content.bio_1 || teamTemplates.bios[0],
            bio_2: section.content.bio_2 || teamTemplates.bios[1],
            bio_3: section.content.bio_3 || teamTemplates.bios[2],
            bio_4: section.content.bio_4 || teamTemplates.bios[3],
            bio_5: section.content.bio_5 || teamTemplates.bios[4],
            bio_6: section.content.bio_6 || teamTemplates.bios[5],
          },
        };

      default:
        return {
          ...section,
          content: {
            title: section.content.title || section.type,
            subtitle: section.content.subtitle || subheadline || nicheContent.subtitle,
          },
        };
    }
  });
}

export function generateLayoutHTML(
  sections: Section[],
  primaryColor: string,
  secondaryColor: string,
): string {
  const sectionHTML = sections
    .map((s) => {
      const bg =
        s.type === "hero" || s.type === "cta"
          ? `background:linear-gradient(135deg,${primaryColor},${secondaryColor});color:white;`
          : s.type === "stats"
          ? `background:${primaryColor};color:white;`
          : "";
      return `<section style="padding:4rem 1.5rem;${bg}">
    <div style="max-width:1200px;margin:0 auto;">
      <h2 style="font-size:2rem;font-weight:700;margin-bottom:0.5rem;">${s.content.title || s.type}</h2>
      <p style="color:#666;">${s.content.subtitle || ""}</p>
    </div>
  </section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; color: #1A1A2E; }
  </style>
</head>
<body>${sectionHTML}</body>
</html>`;
}
