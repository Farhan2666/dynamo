import type { ContextProfile, CopyElement } from "@/types";

const NUMBERS = ["10x", "3x", "2x", "87%", "93%", "5x", "68%", "42%", "4x", "76%"];

interface RichContent {
  headlines: string[];
  subheaders: string[];
  ctas: string[];
  benefits: string[];
  stories?: string[];
  microcopy?: string[];
  socialProof?: string[];
  hooks?: string[];
}

const EN: Record<string, RichContent> = {
  fintech: {
    headlines: ["Move Your Money Smarter", "Your Money, Under Your Control", "Banking That Finally Makes Sense", "Stop Paying Bank Fees. Start Growing.", "The Future of Finance Is Here"],
    subheaders: ["Zero hidden fees. Real-time transfers. Military-grade security.", "Smart budgeting tools that learn your spending habits.", "From payments to investments — all in one place."],
    ctas: ["Start Banking Smarter", "Open Free Account", "See Your Growth", "Get Early Access"],
    benefits: ["Save up to $480/year in bank fees", "Transfers arrive in seconds, not days", "AI-powered budgeting that actually works"],
    stories: ["Sarah was paying $40/month in overdraft fees until she switched. Now she saves $480/year and tracks every dollar — all from her phone.", "After his first startup failed from cashflow chaos, Mark built our platform to make sure no founder ever runs blind again. The result? A dashboard that shows you tomorrow's balance, today."],
    microcopy: ["No hidden fees. Ever.", "Your money, your rules.", "Bank-grade security. Consumer-grade experience."],
    socialProof: ["Trusted by 50,000+ savers across 14 countries", "4.8 stars on App Store with 12,000+ reviews", "$2B+ in transactions processed securely"],
    hooks: ["Tired of watching your savings vanish in bank fees?", "What if your bank account actually helped you grow wealth?", "Meet the finance app that 94% of users recommend to friends"],
  },
  saas: {
    headlines: ["Ship Faster, Break Less", "Your Team's Productivity Multiplier", "Automate the Boring. Focus on What Matters.", "Built for Teams That Ship", "Stop Juggling Tools. Start Moving."],
    subheaders: ["Integrate your stack in minutes, not weeks.", "Real-time collaboration that feels like magic.", "The platform that grows as you do."],
    ctas: ["Start Free Trial", "See It in Action", "Book a Demo", "Get Started Free"],
    benefits: ["Cut workflow time by 68% with smart automation", "One platform replaces 5 separate tools", "99.9% uptime — reliability you can count on"],
    stories: ["Acme Corp was using 7 different tools to manage their workflow. After switching, they cut their tool stack by 80% and their team shipped 3x faster. Their CTO calls it 'the best tech decision we made all year.'", "When Jenny's team kept missing deadlines because information was scattered across Slack, email, and Trello, she built an internal tool that later became our platform. Now 2,000+ teams use what started as a side project."],
    microcopy: ["From first commit to production in one click.", "Integrations that just work — no IT help desk needed.", "Your workflow, automated without the burnout."],
    socialProof: ["2,000+ teams shipped faster in 2024", "Reduced tool stack by 80% on average", "99.9% uptime — zero unplanned downtime in 18 months"],
    hooks: ["How many tools did you toggle between today?", "What if your team could ship 3x faster without burning out?", "The average company wastes 22 hours/week on manual workflows. Not anymore."],
  },
  wellness: {
    headlines: ["Find Your Calm", "Breathe. Reset. Thrive.", "Your Daily Wellness Ritual", "Slow Down. Show Up. Shine.", "Nurture Your Mind, Body & Soul"],
    subheaders: ["5-minute practices that transform your day.", "Guided sessions designed by mindfulness experts.", "Your personal wellness journey starts here."],
    ctas: ["Begin Your Journey", "Start Free Trial", "Find Your Calm", "Unlock Peace"],
    benefits: ["Reduce anxiety by 73% in just 14 days", "Sleep deeper with guided evening rituals", "Science-backed practices from top therapists"],
    stories: ["James was a burnt-out executive who couldn't sleep more than 4 hours a night. After 30 days of guided evening rituals, he's sleeping 7+ hours and his resting heart rate dropped by 12 bpm.", "Maria, a single mom of three, found 5 minutes of calm each morning using our breathing exercises. 'It's the only thing that keeps me centered through the chaos,' she says."],
    microcopy: ["Your peace of mind, delivered daily.", "No apps, no gym, no expensive gear. Just you.", "Small practices. Big shifts."],
    socialProof: ["1M+ mins of meditation completed this month", "94% of users report less stress within 2 weeks", "Created with guidance from 12 clinical psychologists"],
    hooks: ["When was the last time you truly exhaled?", "Your phone is stressing you out. This practice is different.", "You don't need an hour. You need 5 minutes."],
  },
  education: {
    headlines: ["Learn Skills That Matter", "Level Up Your Career", "From Zero to Pro — On Your Schedule", "Unlock Your Full Potential", "Knowledge That Transforms Lives"],
    subheaders: ["Expert-led courses with real-world projects.", "Learn at your pace. Graduate with confidence.", "The skills you need for the career you want."],
    ctas: ["Start Learning Free", "Explore Courses", "Begin Your Journey", "Enroll Now"],
    benefits: ["87% of graduates land their dream job within 3 months", "Learn from industry leaders at top companies", "Hands-on projects — not just theory"],
    stories: ["Aisha was a receptionist who taught herself UX design on our platform. Within 4 months, she landed a junior designer role at a FAANG company. That was 2 years ago. Today she leads a team of 8 designers.", "After being laid off from manufacturing, Carlos took our data analytics track. He went from zero coding experience to a data analyst role where he now earns 3x his previous salary."],
    microcopy: ["Learn by doing, not by watching.", "Your next promotion is one skill away.", "No fluff. No filler. Just what matters."],
    socialProof: ["87% job placement rate within 3 months", "2,500+ students hired at top tech companies", "Average salary increase of 64% after graduation"],
    hooks: ["What's stopping you from making the career move you've been thinking about?", "The skills that got you this far won't take you where you want to go next.", "You're one course away from a whole new career trajectory."],
  },
  ecommerce: {
    headlines: ["Shop the Unconventional", "Products You'll Love, Prices You'll Adore", "Your New Favorite Store Is Here", "Curated for the Bold", "Discover Better. Buy Smarter."],
    subheaders: ["Free shipping on your first order. Easy returns, always.", "Curated collections from independent makers.", "Quality you can feel. Prices that make sense."],
    ctas: ["Shop Now", "Get 20% Off First Order", "Explore Collection", "Start Shopping"],
    benefits: ["Free shipping worldwide on orders over $50", "Handpicked from 500+ independent artisans", "Easy 30-day returns, no questions asked"],
    stories: ["When Priya couldn't find ethically-made home decor that matched her style, she started making her own. Today, her brand lives on our marketplace alongside 500+ other independent artisans — each with a story as unique as their products.", "Thrifted since high school, Marcus turned his vintage curation hobby into a 6-figure business. He sources from 12 countries and ships to 40+. 'This platform let me turn my eye for design into a real company,' he says."],
    microcopy: ["Every product has a story. We'll tell you ours.", "Designed by someone. Made for you.", "Join the slow shopping revolution."],
    socialProof: ["10,000+ 5-star reviews from verified buyers", "500+ independent artisans from 30 countries", "4.9 average rating — the highest in our category"],
    hooks: ["Tired of buying the same mass-produced stuff everyone else has?", "What if your next purchase came with a story, not just a shipping label?", "The best things aren't made in factories. They're made by people like you."],
  },
  creative: {
    headlines: ["Make Something People Love", "Where Creativity Meets Craft", "Design Without Boundaries", "Your Vision, Amplified", "Crafted for the Curious Mind"],
    subheaders: ["Tools that spark inspiration, not friction.", "From concept to creation — we've got your back.", "Every creative journey deserves the right canvas."],
    ctas: ["Start Creating", "See the Possibilities", "Begin Your Project", "Get Inspired"],
    benefits: ["Award-winning tools used by 50,000+ creators", "From sketch to final in half the time", "Join a community of world-class designers"],
    stories: ["Graphic designer Tom was spending 60% of his time on repetitive tasks. After switching to our platform, he reclaimed 20 hours per week — time he now uses to mentor junior designers and work on passion projects.", "When indie filmmaker Aisha needed to create promotional materials on a zero budget, she discovered our tool. The campaign went viral, her film got funded, and she's been a customer ever since."],
    microcopy: ["Create like no one's watching. Design like everyone is.", "Your next masterpiece starts with a single click.", "Stop fighting your tools. Start making."],
    socialProof: ["50,000+ creators trust us daily", "Featured in Behance's 'Top Design Tools of 2024'", "Used by designers at Apple, Netflix, and Spotify"],
    hooks: ["How much time do you waste wrestling with your tools instead of creating?", "What would you make if the software never got in your way?", "Every great design starts with a tool that disappears."],
  },
  healthtech: {
    headlines: ["Better Care, Connected", "Your Health, Simplified", "Doctor Visits Without the Wait", "Healthcare That Comes to You", "Empowering Patients, Supporting Doctors"],
    subheaders: ["Book appointments, chat with doctors, get prescriptions — all from home.", "Your complete health record, always accessible.", "Secure. Private. Professional."],
    ctas: ["Find a Doctor", "Book Free Consultation", "Start Your Visit", "Get Care Now"],
    benefits: ["Average wait time: 3 minutes vs 45 minutes in-clinic", "Board-certified doctors available 24/7", "Prescriptions sent to your pharmacy instantly"],
    stories: ["When David's 3-year-old developed a rash at 11 PM on a Saturday, he didn't know what to do. Instead of waiting 8 hours in the ER, he had a video consultation in 4 minutes. The doctor diagnosed it as a mild allergic reaction and sent a prescription to his 24-hour pharmacy. Total cost: $29. David is now a subscriber.", "Dr. Hernandez was burning out seeing 40 patients a day in her clinic. Our platform lets her reach 80 patients with better outcomes — and she finishes her charting before dinner."],
    microcopy: ["Your health doesn't keep office hours. Neither do we.", "From symptom to treatment in under 10 minutes.", "Because waiting rooms shouldn't make you feel worse."],
    socialProof: ["2M+ virtual visits completed", "4.7 stars from 50,000+ patient reviews", "Board-certified doctors in 50+ specialties"],
    hooks: ["Why spend 2 hours in a waiting room for a 5-minute consult?", "What if your doctor came to you instead of the other way around?", "That thing you've been putting off? You can take care of it right now from your couch."],
  },
  food: {
    headlines: ["Taste the Extraordinary", "Your New Favorite Meal Awaits", "Fresh. Local. Unforgettable.", "Where Every Bite Tells a Story", "Food That Feeds the Soul"],
    subheaders: ["Farm-fresh ingredients crafted with passion.", "From our kitchen to your table — perfection delivered.", "Authentic flavors that transport you."],
    ctas: ["Order Now", "Book a Table", "View Menu", "Get Delivery"],
    benefits: ["Sourced from local farms within 50 miles", "Chef-crafted menus updated weekly", "Dietary preferences always accommodated"],
    stories: ["Chef Marco spent 15 years cooking at Michelin-starred restaurants before opening a small 20-seat place in his neighborhood. Every dish tells a story of his travels through Italy, Spain, and Morocco. 'I don't just feed people. I transport them,' he says.", "When the Nguyen family moved from Vietnam, they couldn't find the flavors of home. So grandma taught the family recipes, and now their pop-up kitchen has 4,000 Instagram followers and a waiting list every weekend."],
    microcopy: ["Eat what you love. Love what you eat.", "Recipes passed down. Flavors that last.", "From local earth to your table — intentionally."],
    socialProof: ["Sourced from 50+ local farms within 50 miles", "4.9 stars — named 'Best New Restaurant 2024'", "100% dietary accommodation rate (gluten-free, vegan, keto)"],
    hooks: ["When was the last time a meal moved you?", "You don't need a passport to taste the world. Just a fork.", "The best ingredients don't travel far. The best flavors do."],
  },
  agency: {
    headlines: ["Results That Speak Volumes", "Turn Clicks into Customers", "Your Growth Partner", "Strategy, Meet Execution", "From Good to Unforgettable"],
    subheaders: ["Data-driven strategies that deliver measurable ROI.", "We don't just consult — we build.", "A decade of experience. A future of results."],
    ctas: ["Book a Free Call", "See Our Work", "Get a Proposal", "Start Growing"],
    benefits: ["Average client ROI of 340% within 6 months", "Full-service team from strategy to execution", "Transparent pricing with no hidden fees"],
    stories: ["A B2B SaaS client came to us with $2M ARR and a churn problem. We rebuilt their positioning, redesigned their funnel, and within 8 months they hit $5M ARR with churn cut in half. Their CEO: 'This isn't consulting. This is a partnership.'", "A direct-to-consumer brand was getting lost in a crowded market. We helped them find their voice — literally. A brand refresh, a content strategy overhaul, and 6 months later, organic traffic grew 280% and revenue doubled."],
    microcopy: ["We don't do 'strategic advice.' We do results.", "Your growth is our only KPI.", "Strategy without execution is just a wish."],
    socialProof: ["Average client ROI: 340% within 6 months", "Clients include 3 Fortune 500 companies", "92% client retention rate over 5 years"],
    hooks: ["Are you leaving money on the table because your brand doesn't stand out?", "You've tried consultants before. We're not them.", "What if your next growth partner was also your best execution partner?"],
  },
  realestate: {
    headlines: ["Find Your Dream Home", "Your Perfect Space Awaits", "More Than a Home — a Lifestyle", "Live Where You Belong", "The Key to Your Future"],
    subheaders: ["Curated properties in the most sought-after neighborhoods.", "Virtual tours. Instant booking. Zero hassle.", "Your journey home starts here."],
    ctas: ["Browse Properties", "Book a Tour", "Find Your Home", "Start Searching"],
    benefits: ["500+ verified properties added daily", "Virtual tours save 12 hours of searching per week", "Expert agents with local market mastery"],
    stories: ["The Parkers had been searching for 8 months with no luck. Every house was either over budget or needed too much work. Our agent found them a hidden gem in a neighborhood they'd never considered — 15% under budget and move-in ready. They made an offer the same day.", "After her divorce, Nina needed to downsize but didn't know where to start. We matched her with an agent who specialized in exactly her situation. She found a beautiful condo, sold her house in 6 days, and says it was 'the least stressful move I've ever made.'"],
    microcopy: ["Not just a house. Your home.", "Find it. Love it. Live in it.", "Because where you live changes everything."],
    socialProof: ["500+ new listings daily across 200 cities", "94% buyer satisfaction rate", "Twice as fast as traditional agents — average 14 days to close"],
    hooks: ["You've scrolled through 200 listings and still haven't found 'the one.' What's going wrong?", "The best homes sell before they ever hit the open market. Want access?", "What if finding your dream home took 14 days, not 8 months?"],
  },
  nonprofit: {
    headlines: ["Make a Difference Today", "Your Support Changes Lives", "Together, We Can Do More", "Every Contribution Counts", "Be the Change You Wish to See"],
    subheaders: ["Your donation goes directly to those who need it most.", "Transparent. Impactful. Life-changing.", "Join thousands making a real difference."],
    ctas: ["Donate Now", "Join the Movement", "Make an Impact", "Give Today"],
    benefits: ["95% of donations go directly to programs", "10,000+ lives impacted in the past year", "Transparent reporting on every dollar"],
    stories: ["When 12-year-old Maya received her first school supplies through our program, she told her mom: 'Now I can be a doctor like I always dreamed.' Three years later, she's top of her class in science. Your $25 donation makes stories like Maya's possible.", "After the earthquake, our team was on the ground within 12 hours. We distributed 50,000 meals, set up 4 medical tents, and housed 300 families. We did it because your monthly donations meant we didn't have to wait for government funding."],
    microcopy: ["Small acts, big impact.", "Your spare change is someone's lifeline.", "Do good. Feel good. Actually."],
    socialProof: ["95% of every dollar goes to programs", "10,000+ lives directly impacted", "Charity Navigator 4-star rating for 7 consecutive years"],
    hooks: ["You want to help. But does your donation actually make a difference?", "What if your $25 could change the entire trajectory of a child's life?", "The world's problems feel overwhelming. Here's one you can actually solve."],
  },
  tech: {
    headlines: ["Build the Impossible", "Technology That Thinks Ahead", "Innovation at Every Layer", "The Platform for the Next Billion Users", "Future-Proof Your Business"],
    subheaders: ["Infrastructure that scales with your ambition.", "Developer tools that don't get in your way.", "From prototype to production at lightning speed."],
    ctas: ["Start Building Free", "Explore Documentation", "Get API Access", "Deploy Now"],
    benefits: ["Sub-second response times at any scale", "Built-in security — SOC 2, GDPR, HIPAA compliant", "Deploy 40x faster with our automated pipeline"],
    stories: ["A 2-person startup used our platform to handle 1M requests on launch day. They didn't scale up. They didn't hire a DevOps team. They just shipped — and our infrastructure handled the rest. They're now a 30-person company and still on the same plan.", "When a hospital system needed to process 500,000 patient records in real-time, their existing stack couldn't handle it. Our solution processed everything in under 3 seconds — and flagged 14 critical data anomalies that would have gone unnoticed for weeks."],
    microcopy: ["Build fast. Scale faster.", "Your code. Our infrastructure. No friction.", "Enterprise security. Startup speed."],
    socialProof: ["5M+ requests served daily with <100ms latency", "SOC 2 Type II, GDPR, and HIPAA compliant", "Used by 3,000+ developers at companies like Figma and Notion"],
    hooks: ["What would you build if infrastructure was never the bottleneck?", "Your users don't care about your stack. They care about speed.", "While your competitors are scaling, you're still debugging infrastructure. Let's fix that."],
  },
  travel: {
    headlines: ["Wander Without Worry", "Your Next Adventure Is One Click Away", "Explore the World, Effortlessly", "Pack Light. Travel Far. Live Big.", "Discover Hidden Gems"],
    subheaders: ["Curated trips that match your wanderlust.", "From booking to boarding — we handle everything.", "Travel smarter with AI-powered itineraries."],
    ctas: ["Book Your Trip", "Explore Destinations", "Start Planning", "Get Travel Deals"],
    benefits: ["Save up to 40% with early-bird booking", "24/7 concierge in every destination", "Flexible cancellation — free up to 48 hours"],
    stories: ["When Sarah quit her job to travel through Southeast Asia, she had a rough plan but no idea where to start. Our AI built a 3-week itinerary that took her to hidden spots no guidebook mentioned. She extended her trip twice. 'I found places I didn't know existed,' she says. 'And people I'll never forget.'", "Retired couple John and Ellen have visited 37 countries in 4 years using our service. 'Each trip is perfectly paced — not too rushed, not too slow. It feels like someone who knows us planned every detail.'"],
    microcopy: ["Go further. Stay longer. Come back different.", "Travel isn't about where you go. It's how you feel when you get there.", "Adventure is out there. We'll help you find yours."],
    socialProof: ["4.8 stars from 25,000+ travelers", "24/7 concierge in 200+ destinations", "98% of trips rated 'excellent' or 'life-changing'"],
    hooks: ["You've been saying 'next year' for 5 years. What are you waiting for?", "The world is big and your time is limited. Let's make every trip count.", "You don't need a 2-week vacation. You need the right 2-week vacation."],
  },
};

const ID: Record<string, RichContent> = {
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

  const elements: CopyElement[] = [
    {
      type: "headline",
      content: headlines[0].replace(/\d+x/g, () => pick(NUMBERS)),
      variants: headlines.slice(1).map((h) => h.replace(/\d+x/g, () => pick(NUMBERS))),
      hook: data.hooks?.[Math.floor(Math.random() * (data.hooks?.length || 1))] || undefined,
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

  if (data.microcopy?.length) {
    elements.push({
      type: "microcopy",
      content: pick(data.microcopy),
      variants: pickN(data.microcopy.filter((_, i) => i > 0), 2),
    });
  }

  if (data.stories?.length) {
    elements.push({
      type: "story",
      content: pick(data.stories),
      variants: data.stories.length > 1 ? [data.stories[1]] : [],
    });
  }

  if (data.socialProof?.length) {
    elements.push({
      type: "social_proof",
      content: pick(data.socialProof),
      variants: pickN(data.socialProof.filter((_, i) => i > 0), 2),
    });
  }

  return elements;
}
