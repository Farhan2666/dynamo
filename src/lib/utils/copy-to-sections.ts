import type { Section, CopyElement, ContextProfile } from "@/types";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FEATURE_TEMPLATES: Record<string, { title: string[]; desc: string[] }> = {
  en: {
    title: ["Lightning-Fast Performance", "Enterprise-Grade Security", "Smart Automation", "Real-Time Analytics", "Seamless Integration", "Beautiful Dashboard", "Team Collaboration", "AI-Powered Insights"],
    desc: ["Built for speed. Pages load in under 200ms.", "Your data stays safe with end-to-end encryption.", "Automate repetitive tasks and focus on growth.", "Know exactly what's happening with live metrics.", "Connects with every tool you already use.", "Clean, intuitive interface that your team will love.", "Work together in real-time, from anywhere.", "Let artificial intelligence find patterns you'd miss."],
  },
  id: {
    title: ["Kinerja Super Cepat", "Keamanan Kelas Enterprise", "Otomatisasi Cerdas", "Analitik Real-Time", "Integrasi Mulus", "Dashboard Cantik", "Kolaborasi Tim", "Wawasan Bertenaga AI"],
    desc: ["Dibangun untuk kecepatan. Halaman muat di bawah 200ms.", "Data Anda aman dengan enkripsi end-to-end.", "Otomatiskan tugas berulang dan fokus pada pertumbuhan.", "Tahu persis apa yang terjadi dengan metrik langsung.", "Terhubung dengan semua alat yang sudah Anda pakai.", "Antarmuka bersih dan intuitif yang disukai tim.", "Bekerja bersama secara real-time, dari mana saja.", "Biarkan AI temukan pola yang Anda lewatkan."],
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
    ],
    name: ["Sarah Chen", "Marcus Johnson", "Aisha Patel", "David Kim", "Emma Rodriguez", "James Wilson"],
    role: ["CEO", "VP of Engineering", "Head of Product", "CTO", "Marketing Director", "Operations Lead"],
    company: ["TechFlow Inc.", "BrightMind Solutions", "NexGen Corp", "Pinnacle Systems"],
  },
  id: {
    quote: [
      "Ini benar-benar mengubah cara kami bekerja. Produktivitas naik 3x di bulan pertama.",
      "Kami coba 5 solusi lain sebelum ini. Tidak ada yang mendekati.",
      "ROI-nya langsung terasa. Kami lihat hasil di minggu pertama.",
      "Akhirnya, alat yang benar-benar melakukan apa yang dijanjikan.",
      "Pelanggan kami langsung lihat perbedaannya. Game changer.",
      "Investasi terbaik yang kami buat untuk tim tahun ini.",
    ],
    name: ["Sari Wijaya", "Budi Santoso", "Dewi Lestari", "Rudi Hermawan", "Maya Putri", "Andi Pratama"],
    role: ["CEO", "VP Teknik", "Kepala Produk", "CTO", "Direktur Marketing", "Kepala Operasi"],
    company: ["TechFlow Indonesia", "BrightMind Solusi", "NexGen Corp", "Pinnacle Systems"],
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
    ],
    a: [
      "Sign up for free and get full access for 14 days. No credit card required. Cancel anytime.",
      "Yes, you can upgrade or downgrade at any time. Changes take effect immediately and we'll prorate your billing.",
      "Absolutely. We use enterprise-grade encryption for all data. SOC 2 Type II certified. Your data never leaves our secure infrastructure.",
      "All plans include email support with 4-hour response time. Pro and Enterprise plans include priority support with 1-hour response.",
      "We offer native integrations with 200+ tools including Slack, GitHub, Jira, and Salesforce. Our API makes custom integration easy.",
      "Most teams are fully set up within a day. Our onboarding specialists guide you every step of the way.",
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
    ],
    a: [
      "Daftar gratis dan dapatkan akses penuh selama 14 hari. Tanpa kartu kredit. Batalkan kapan saja.",
      "Ya, Anda bisa upgrade atau downgrade kapan saja. Perubahan berlaku segera dan tagihan disesuaikan.",
      "Tentu. Kami menggunakan enkripsi kelas enterprise untuk semua data. Bersertifikat SOC 2 Type II.",
      "Semua paket termasuk dukungan email dengan respon 4 jam. Paket Pro dan Enterprise termasuk prioritas 1 jam.",
      "Kami menawarkan integrasi asli dengan 200+ alat termasuk Slack, GitHub, Jira, dan Salesforce.",
      "Kebanyakan tim siap dalam sehari. Spesialis onboarding kami memandu Anda setiap langkah.",
    ],
  },
};

const STATS_TEMPLATES: Record<string, { values: string[]; labels: string[] }> = {
  en: {
    values: ["50,000+", "99.9%", "4.9/5", "200+"],
    labels: ["Active Users", "Uptime", "Rating", "Integrations"],
  },
  id: {
    values: ["50.000+", "99.9%", "4.9/5", "200+"],
    labels: ["Pengguna Aktif", "Waktu Aktif", "Rating", "Integrasi"],
  },
};

export function mergeCopyIntoSections(
  sections: Section[],
  copy: CopyElement[],
  context?: ContextProfile,
): Section[] {
  const lang = context?.language || "en";

  const headlineEl = copy.find((c) => c.type === "headline");
  const subheaderEl = copy.find((c) => c.type === "subheader");
  const ctaEl = copy.find((c) => c.type === "cta");

  const headline = headlineEl?.content || "";
  const subheadline = subheaderEl?.content || "";
  const cta = ctaEl?.content || "";

  const fTemplates = FEATURE_TEMPLATES[lang] || FEATURE_TEMPLATES.en;
  const tTemplates = TESTIMONIAL_TEMPLATES[lang] || TESTIMONIAL_TEMPLATES.en;
  const pTemplates = PRICING_TEMPLATES[lang] || PRICING_TEMPLATES.en;
  const faqTemplates = FAQ_TEMPLATES[lang] || FAQ_TEMPLATES.en;
  const sTemplates = STATS_TEMPLATES[lang] || STATS_TEMPLATES.en;

  function shuffled<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  function pickN<T>(arr: T[], n: number): T[] {
    return shuffled(arr).slice(0, Math.min(n, arr.length));
  }

  const featureTitles = pickN(fTemplates.title, 3);
  const featureDescs = pickN(fTemplates.desc, 3);
  const testimonials = pickN(tTemplates.quote, 2);
  const testimonialNames = pickN(tTemplates.name, 2);
  const testimonialRoles = pickN(tTemplates.role, 2);
  const testimonialCos = pickN(tTemplates.company, 2);
  const faqs = pickN(faqTemplates.q, 3);
  const faqAs = faqs.map(() => pick(faqTemplates.a));

  return sections.map((section): Section => {
    switch (section.type) {
      case "hero":
        return {
          ...section,
          content: {
            headline: section.content.headline || headline,
            subheadline: section.content.subheadline || subheadline,
            cta: section.content.cta || cta,
          },
        };

      case "features":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Fitur Unggulan" : "Key Features"),
            subtitle: section.content.subtitle || subheadline,
            feature_1_title: featureTitles[0],
            feature_1_desc: featureDescs[0],
            feature_2_title: featureTitles[1] || featureTitles[0],
            feature_2_desc: featureDescs[1] || featureDescs[0],
            feature_3_title: featureTitles[2] || featureTitles[0],
            feature_3_desc: featureDescs[2] || featureDescs[0],
          },
        };

      case "testimonials":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Apa Kata Mereka" : "What People Say"),
            subtitle: section.content.subtitle || (lang === "id" ? "Dipercaya oleh ribuan pengguna" : "Trusted by thousands of users"),
            quote_1: testimonials[0],
            name_1: testimonialNames[0],
            role_1: testimonialRoles[0],
            company_1: testimonialCos[0],
            quote_2: testimonials[1] || testimonials[0],
            name_2: testimonialNames[1] || testimonialNames[0],
            role_2: testimonialRoles[1] || testimonialRoles[0],
            company_2: testimonialCos[1] || testimonialCos[0],
          },
        };

      case "pricing":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Harga Sederhana" : "Simple Pricing"),
            subtitle: section.content.subtitle || (lang === "id" ? "Pilih paket yang sesuai" : "Choose the plan that fits you"),
            plan_1_name: pTemplates.names[0],
            plan_1_desc: pTemplates.descs[0],
            plan_1_price: lang === "id" ? "Rp99rb" : "$9",
            plan_1_feat_1: pTemplates.features[0][0],
            plan_1_feat_2: pTemplates.features[0][1],
            plan_1_feat_3: pTemplates.features[0][2],
            plan_1_cta: cta,
            plan_2_name: pTemplates.names[1],
            plan_2_desc: pTemplates.descs[1],
            plan_2_price: lang === "id" ? "Rp299rb" : "$29",
            plan_2_feat_1: pTemplates.features[1][0],
            plan_2_feat_2: pTemplates.features[1][1],
            plan_2_feat_3: pTemplates.features[1][2],
            plan_2_feat_4: pTemplates.features[1][3],
            plan_2_cta: cta,
            plan_3_name: pTemplates.names[2],
            plan_3_desc: pTemplates.descs[2],
            plan_3_price: lang === "id" ? "Rp999rb" : "$99",
            plan_3_feat_1: pTemplates.features[2][0],
            plan_3_feat_2: pTemplates.features[2][1],
            plan_3_feat_3: pTemplates.features[2][2],
            plan_3_cta: lang === "id" ? "Hubungi Kami" : "Contact Us",
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
            subheadline: section.content.subheadline || subheadline,
            button: section.content.button || cta,
          },
        };
      }

      case "faq":
        return {
          ...section,
          content: {
            title: section.content.title || (lang === "id" ? "Pertanyaan Umum" : "Frequently Asked"),
            subtitle: section.content.subtitle || "",
            q_1: faqs[0],
            a_1: faqAs[0],
            q_2: faqs[1] || faqs[0],
            a_2: faqAs[1] || faqAs[0],
            q_3: faqs[2] || faqs[0],
            a_3: faqAs[2] || faqAs[0],
          },
        };

      case "stats":
        return {
          ...section,
          content: {
            title: section.content.title || headline,
            stat_1_value: sTemplates.values[0],
            stat_1_label: sTemplates.labels[0],
            stat_2_value: sTemplates.values[1],
            stat_2_label: sTemplates.labels[1],
            stat_3_value: sTemplates.values[2],
            stat_3_label: sTemplates.labels[2],
            stat_4_value: sTemplates.values[3],
            stat_4_label: sTemplates.labels[3],
          },
        };

      default:
        return {
          ...section,
          content: {
            title: section.content.title || section.type,
            subtitle: section.content.subtitle || subheadline,
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
