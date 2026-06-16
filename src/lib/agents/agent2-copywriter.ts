import type { ContextProfile, CopyElement } from "@/types";

const NUMBERS = ["10x", "3x", "2x", "87%", "93%", "5x", "68%", "42%", "4x", "76%"];

const EN: Record<string, { headlines: string[]; subheaders: string[]; ctas: string[]; benefits: string[] }> = {
  fintech: {
    headlines: ["Move Your Money Smarter", "Your Money, Under Your Control", "Banking That Finally Makes Sense", "Stop Paying Bank Fees. Start Growing.", "The Future of Finance Is Here"],
    subheaders: ["Zero hidden fees. Real-time transfers. Military-grade security.", "Smart budgeting tools that learn your spending habits.", "From payments to investments — all in one place."],
    ctas: ["Start Banking Smarter", "Open Free Account", "See Your Growth", "Get Early Access"],
    benefits: ["Save up to $480/year in bank fees", "Transfers arrive in seconds, not days", "AI-powered budgeting that actually works"],
  },
  saas: {
    headlines: ["Ship Faster, Break Less", "Your Team's Productivity Multiplier", "Automate the Boring. Focus on What Matters.", "Built for Teams That Ship", "Stop Juggling Tools. Start Moving."],
    subheaders: ["Integrate your stack in minutes, not weeks.", "Real-time collaboration that feels like magic.", "The platform that grows as you do."],
    ctas: ["Start Free Trial", "See It in Action", "Book a Demo", "Get Started Free"],
    benefits: ["Cut workflow time by 68% with smart automation", "One platform replaces 5 separate tools", "99.9% uptime — reliability you can count on"],
  },
  wellness: {
    headlines: ["Find Your Calm", "Breathe. Reset. Thrive.", "Your Daily Wellness Ritual", "Slow Down. Show Up. Shine.", "Nurture Your Mind, Body & Soul"],
    subheaders: ["5-minute practices that transform your day.", "Guided sessions designed by mindfulness experts.", "Your personal wellness journey starts here."],
    ctas: ["Begin Your Journey", "Start Free Trial", "Find Your Calm", "Unlock Peace"],
    benefits: ["Reduce anxiety by 73% in just 14 days", "Sleep deeper with guided evening rituals", "Science-backed practices from top therapists"],
  },
  education: {
    headlines: ["Learn Skills That Matter", "Level Up Your Career", "From Zero to Pro — On Your Schedule", "Unlock Your Full Potential", "Knowledge That Transforms Lives"],
    subheaders: ["Expert-led courses with real-world projects.", "Learn at your pace. Graduate with confidence.", "The skills you need for the career you want."],
    ctas: ["Start Learning Free", "Explore Courses", "Begin Your Journey", "Enroll Now"],
    benefits: ["87% of graduates land their dream job within 3 months", "Learn from industry leaders at top companies", "Hands-on projects — not just theory"],
  },
  ecommerce: {
    headlines: ["Shop the Unconventional", "Products You'll Love, Prices You'll Adore", "Your New Favorite Store Is Here", "Curated for the Bold", "Discover Better. Buy Smarter."],
    subheaders: ["Free shipping on your first order. Easy returns, always.", "Curated collections from independent makers.", "Quality you can feel. Prices that make sense."],
    ctas: ["Shop Now", "Get 20% Off First Order", "Explore Collection", "Start Shopping"],
    benefits: ["Free shipping worldwide on orders over $50", "Handpicked from 500+ independent artisans", "Easy 30-day returns, no questions asked"],
  },
  creative: {
    headlines: ["Make Something People Love", "Where Creativity Meets Craft", "Design Without Boundaries", "Your Vision, Amplified", "Crafted for the Curious Mind"],
    subheaders: ["Tools that spark inspiration, not friction.", "From concept to creation — we've got your back.", "Every creative journey deserves the right canvas."],
    ctas: ["Start Creating", "See the Possibilities", "Begin Your Project", "Get Inspired"],
    benefits: ["Award-winning tools used by 50,000+ creators", "From sketch to final in half the time", "Join a community of world-class designers"],
  },
  healthtech: {
    headlines: ["Better Care, Connected", "Your Health, Simplified", "Doctor Visits Without the Wait", "Healthcare That Comes to You", "Empowering Patients, Supporting Doctors"],
    subheaders: ["Book appointments, chat with doctors, get prescriptions — all from home.", "Your complete health record, always accessible.", "Secure. Private. Professional."],
    ctas: ["Find a Doctor", "Book Free Consultation", "Start Your Visit", "Get Care Now"],
    benefits: ["Average wait time: 3 minutes vs 45 minutes in-clinic", "Board-certified doctors available 24/7", "Prescriptions sent to your pharmacy instantly"],
  },
  food: {
    headlines: ["Taste the Extraordinary", "Your New Favorite Meal Awaits", "Fresh. Local. Unforgettable.", "Where Every Bite Tells a Story", "Food That Feeds the Soul"],
    subheaders: ["Farm-fresh ingredients crafted with passion.", "From our kitchen to your table — perfection delivered.", "Authentic flavors that transport you."],
    ctas: ["Order Now", "Book a Table", "View Menu", "Get Delivery"],
    benefits: ["Sourced from local farms within 50 miles", "Chef-crafted menus updated weekly", "Dietary preferences always accommodated"],
  },
  agency: {
    headlines: ["Results That Speak Volumes", "Turn Clicks into Customers", "Your Growth Partner", "Strategy, Meet Execution", "From Good to Unforgettable"],
    subheaders: ["Data-driven strategies that deliver measurable ROI.", "We don't just consult — we build.", "A decade of experience. A future of results."],
    ctas: ["Book a Free Call", "See Our Work", "Get a Proposal", "Start Growing"],
    benefits: ["Average client ROI of 340% within 6 months", "Full-service team from strategy to execution", "Transparent pricing with no hidden fees"],
  },
  realestate: {
    headlines: ["Find Your Dream Home", "Your Perfect Space Awaits", "More Than a Home — a Lifestyle", "Live Where You Belong", "The Key to Your Future"],
    subheaders: ["Curated properties in the most sought-after neighborhoods.", "Virtual tours. Instant booking. Zero hassle.", "Your journey home starts here."],
    ctas: ["Browse Properties", "Book a Tour", "Find Your Home", "Start Searching"],
    benefits: ["500+ verified properties added daily", "Virtual tours save 12 hours of searching per week", "Expert agents with local market mastery"],
  },
  nonprofit: {
    headlines: ["Make a Difference Today", "Your Support Changes Lives", "Together, We Can Do More", "Every Contribution Counts", "Be the Change You Wish to See"],
    subheaders: ["Your donation goes directly to those who need it most.", "Transparent. Impactful. Life-changing.", "Join thousands making a real difference."],
    ctas: ["Donate Now", "Join the Movement", "Make an Impact", "Give Today"],
    benefits: ["95% of donations go directly to programs", "10,000+ lives impacted in the past year", "Transparent reporting on every dollar"],
  },
  tech: {
    headlines: ["Build the Impossible", "Technology That Thinks Ahead", "Innovation at Every Layer", "The Platform for the Next Billion Users", "Future-Proof Your Business"],
    subheaders: ["Infrastructure that scales with your ambition.", "Developer tools that don't get in your way.", "From prototype to production at lightning speed."],
    ctas: ["Start Building Free", "Explore Documentation", "Get API Access", "Deploy Now"],
    benefits: ["Sub-second response times at any scale", "Built-in security — SOC 2, GDPR, HIPAA compliant", "Deploy 40x faster with our automated pipeline"],
  },
  travel: {
    headlines: ["Wander Without Worry", "Your Next Adventure Is One Click Away", "Explore the World, Effortlessly", "Pack Light. Travel Far. Live Big.", "Discover Hidden Gems"],
    subheaders: ["Curated trips that match your wanderlust.", "From booking to boarding — we handle everything.", "Travel smarter with AI-powered itineraries."],
    ctas: ["Book Your Trip", "Explore Destinations", "Start Planning", "Get Travel Deals"],
    benefits: ["Save up to 40% with early-bird booking", "24/7 concierge in every destination", "Flexible cancellation — free up to 48 hours"],
  },
};

const ID: Record<string, { headlines: string[]; subheaders: string[]; ctas: string[]; benefits: string[] }> = {
  fintech: {
    headlines: ["Kelola Uang Lebih Cerdas", "Uang Anda, Kendali Anda", "Perbankan yang Akhirnya Masuk Akal", "Berhenti Bayar Biaya Bank. Mulai Tumbuh.", "Masa Depan Keuangan Sudah di Sini"],
    subheaders: ["Tanpa biaya tersembunyi. Transfer real-time. Keamanan kelas militer.", "Alat anggaran pintar yang belajar dari kebiasaan Anda.", "Dari pembayaran hingga investasi — semua dalam satu tempat."],
    ctas: ["Mulai Bank Cerdas", "Buka Akun Gratis", "Lihat Pertumbuhan Anda", "Dapatkan Akses Awal"],
    benefits: ["Hemat hingga Rp7 juta/tahun biaya bank", "Transfer tiba dalam hitungan detik", "Anggaran AI yang benar-benar bekerja"],
  },
  saas: {
    headlines: ["Kirim Lebih Cepat, Jarang Error", "Pengali Produktivitas Tim Anda", "Otomatiskan yang Membosankan. Fokus pada yang Penting.", "Dibangun untuk Tim yang Berkirim", "Berhenti Berganti Alat. Mulai Bergerak."],
    subheaders: ["Integrasi stack Anda dalam hitungan menit.", "Kolaborasi real-time yang terasa seperti sihir.", "Platform yang tumbuh bersama Anda."],
    ctas: ["Coba Gratis", "Lihat Aksi", "Pesan Demo", "Mulai Gratis"],
    benefits: ["Potong waktu kerja 68% dengan otomatisasi cerdas", "Satu platform gantikan 5 alat terpisah", "99.9% uptime — keandalan terpercaya"],
  },
  wellness: {
    headlines: ["Temukan Ketenangan Anda", "Tarik Napas. Reset. Bersinar.", "Ritual Kesehatan Harian Anda", "Pelambat. Hadir. Bersinar.", "Rawat Pikiran, Tubuh & Jiwa"],
    subheaders: ["Latihan 5 menit yang mengubah hari Anda.", "Sesi terpandu oleh ahli mindfulness.", "Perjalanan kesehatan pribadi Anda dimulai di sini."],
    ctas: ["Mulai Perjalanan", "Coba Gratis", "Temukan Ketenangan", "Buka Kedamaian"],
    benefits: ["Kurangi kecemasan 73% hanya dalam 14 hari", "Tidur lebih nyenyak dengan ritual malam terpandu", "Praktik berbasis sains dari terapis top"],
  },
  education: {
    headlines: ["Pelajari Skill yang Berguna", "Tingkatkan Karir Anda", "Dari Nol ke Pro — Sesuai Jadwal Anda", "Buka Potensi Penuh Anda", "Pengetahuan yang Mengubah Hidup"],
    subheaders: ["Kursus pimpinan ahli dengan proyek nyata.", "Belajar sesuai ritme Anda. Lulus dengan percaya diri.", "Skill yang Anda butuhkan untuk karir yang Anda inginkan."],
    ctas: ["Mulai Belajar Gratis", "Jelajahi Kursus", "Mulai Perjalanan", "Daftar Sekarang"],
    benefits: ["87% lulusan dapat kerja impian dalam 3 bulan", "Belajar dari pemimpin industri di perusahaan top", "Proyek langsung — bukan teori saja"],
  },
  ecommerce: {
    headlines: ["Belanja yang Tak Biasa", "Produk yang Anda Cinta, Harga yang Anda Suka", "Toko Favorit Baru Anda di Sini", "Kurasi untuk yang Berani", "Temukan Lebih Baik. Belanja Lebih Cerdas."],
    subheaders: ["Gratis ongkir pesanan pertama. Pengembalian mudah.", "Koleksi kurasi dari pengrajin independen.", "Kualitas terasa. Harga masuk akal."],
    ctas: ["Belanja Sekarang", "Dapatkan Diskon 20%", "Lihat Koleksi", "Mulai Belanja"],
    benefits: ["Gratis ongkir ke seluruh dunia minimal Rp500rb", "Pilihan dari 500+ pengrajin independen", "Pengembalian 30 hari, tanpa syarat"],
  },
  creative: {
    headlines: ["Buat yang Dicinta Orang", "Di Mana Kreativitas Bertemu Keahlian", "Desain Tanpa Batas", "Visi Anda, Diperkuat", "Dikurasi untuk Pikiran Penasaran"],
    subheaders: ["Alat yang memicu inspirasi, bukan gesekan.", "Dari konsep ke kreasi — kami siap.", "Setiap perjalanan kreatif butuh kanvas yang tepat."],
    ctas: ["Mulai Berkarya", "Lihat Kemungkinan", "Mulai Proyek", "Dapatkan Inspirasi"],
    benefits: ["Alat pemenang penghargaan dipakai 50.000+ kreator", "Dari sketsa ke final dalam separuh waktu", "Bergabung dengan komunitas desainer kelas dunia"],
  },
  healthtech: {
    headlines: ["Perawatan Lebih Baik, Terhubung", "Kesehatan Anda, Sederhana", "Kunjungan Dokter Tanpa Antri", "Layanan Kesehatan yang Datang ke Anda", "Memberdayakan Pasien, Mendukung Dokter"],
    subheaders: ["Booking, chat dokter, resep — semua dari rumah.", "Rekam kesehatan lengkap, selalu terakses.", "Aman. Privasi. Profesional."],
    ctas: ["Cari Dokter", "Booking Konsultasi Gratis", "Mulai Kunjungan", "Dapatkan Perawatan"],
    benefits: ["Rata-rata tunggu: 3 menit vs 45 menit di klinik", "Dokter bersertifikat 24/7", "Resep dikirim ke apotek instan"],
  },
  food: {
    headlines: ["Rasakan yang Luar Biasa", "Makanan Favorit Baru Menanti", "Segar. Lokal. Tak Terlupakan.", "Di Mana Setiap Gigitan Bercerita", "Makanan yang Menyentuh Jiwa"],
    subheaders: ["Bahan segar dari petani, diolah dengan passion.", "Dari dapur ke meja Anda — kesempurnaan terkirim.", "Cita rasa autentik yang membawa Anda bepergian."],
    ctas: ["Pesan Sekarang", "Booking Meja", "Lihat Menu", "Pesan Antar"],
    benefits: ["Bahan dari petani lokal dalam 50km", "Menu buatan chef diperbarui mingguan", "Preferensi diet selalu diakomodasi"],
  },
  agency: {
    headlines: ["Hasil yang Bicara", "Ubah Klik Jadi Pelanggan", "Mitra Pertumbuhan Anda", "Strategi, Bertemu Eksekusi", "Dari Baik ke Tak Terlupakan"],
    subheaders: ["Strategi berbasis data dengan ROI terukur.", "Kami bukan hanya konsultan — kami membangun.", "10 tahun pengalaman. Masa depan hasil."],
    ctas: ["Booking Call Gratis", "Lihat Portofolio", "Dapatkan Proposal", "Mulai Tumbuh"],
    benefits: ["Rata-rata ROI klien 340% dalam 6 bulan", "Tim full-service dari strategi ke eksekusi", "Harga transparan, tanpa biaya tersembunyi"],
  },
  realestate: {
    headlines: ["Temukan Rumah Impian", "Ruang Sempurna Menanti", "Lebih dari Rumah — Gaya Hidup", "Tinggal di Tempat Anda Berpulang", "Kunci Masa Depan Anda"],
    subheaders: ["Properti kurasi di lingkungan paling dicari.", "Tur virtual. Booking instan. Tanpa repot.", "Perjalanan rumah Anda dimulai di sini."],
    ctas: ["Lihat Properti", "Booking Tur", "Temukan Rumah", "Mulai Cari"],
    benefits: ["500+ properti terverifikasi ditambahkan tiap hari", "Tur virtual hemat 12 jam pencarian per minggu", "Agen ahli dengan penguasaan pasar lokal"],
  },
  nonprofit: {
    headlines: ["Buat Perubahan Hari Ini", "Dukungan Anda Ubah Hidup", "Bersama, Kita Bisa Lebih Banyak", "Setiap Kontribusi Berarti", "Jadi Perubahan yang Ingin Anda Lihat"],
    subheaders: ["Donasi Anda langsung ke yang paling membutuhkan.", "Transparan. Berdampak. Mengubah hidup.", "Bergabung dengan ribuan pembuat perubahan."],
    ctas: ["Donasi Sekarang", "Gabung Gerakan", "Buat Dampak", "Berikan Hari Ini"],
    benefits: ["95% donasi langsung ke program", "10.000+ jiwa terdampak dalam setahun", "Laporan transparan untuk setiap rupiah"],
  },
  tech: {
    headlines: ["Bangun yang Mustahil", "Teknologi yang Berpikir ke Depan", "Inovasi di Setiap Lapisan", "Platform untuk Miliaran Pengguna Berikutnya", "Masa Depan-Bukti Bisnis Anda"],
    subheaders: ["Infrastruktur yang skala dengan ambisi Anda.", "Alat developer yang tidak menghalangi.", "Dari prototipe ke produksi dalam sekejap."],
    ctas: ["Mulai Bangun Gratis", "Lihat Dokumentasi", "Dapatkan API", "Deploy Sekarang"],
    benefits: ["Respon sub-detik di skala berapapun", "Keamanan bawaan — SOC 2, GDPR, HIPAA", "Deploy 40x lebih cepat dengan pipeline otomatis"],
  },
  travel: {
    headlines: ["Jalan-jalan Tanpa Khawatir", "Petualangan Berikutnya Satu Klik Lagi", "Jelajahi Dunia, Tanpa Repot", "Bawa Ringan. Jauh. Hidup Besar.", "Temukan Permata Tersembunyi"],
    subheaders: ["Perjalanan kurasi yang cocok jiwa petualang.", "Dari booking hingga boarding — kami urus semua.", "Travel lebih cerdas dengan rencana perjalanan AI."],
    ctas: ["Booking Trip", "Jelajahi Destinasi", "Mulai Rencana", "Dapatkan Deal"],
    benefits: ["Hemat hingga 40% dengan booking awal", "Concierge 24/7 di setiap destinasi", "Pembatalan fleksibel — gratis hingga 48 jam"],
  },
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

export function generateCopy(context: ContextProfile): CopyElement[] {
  const lang = context.language || "en";
  const niche = context.niche;
  const pool = lang === "id" ? ID : EN;
  const data = pool[niche] || (lang === "id" ? ID.saas : EN.saas);

  const headlines = pickN(data.headlines, 3);
  const ctas = pickN(data.ctas, 3);
  const benefits = pickN(data.benefits, 3);
  const subheader = pick(data.subheaders);

  const seoDesc = lang === "id"
    ? `${headlines[0]} — ${subheader} Bergabung dengan ribuan pengguna puas hari ini.`
    : `${headlines[0]} — ${subheader} Join thousands of satisfied users today.`;

  return [
    {
      type: "headline",
      content: headlines[0].replace(/\d+x/g, () => pick(NUMBERS)),
      variants: headlines.slice(1).map((h) => h.replace(/\d+x/g, () => pick(NUMBERS))),
    },
    {
      type: "subheader",
      content: subheader,
      variants: data.subheaders.filter((s) => s !== subheader),
    },
    {
      type: "cta",
      content: ctas[0],
      variants: ctas.slice(1),
    },
    {
      type: "benefit",
      content: benefits[0],
      variants: benefits.slice(1),
    },
    {
      type: "seo",
      content: seoDesc,
      variants: [],
    },
  ];
}
