import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Gift,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Send,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { ImageGallery, type GalleryImage } from "@/components/ui/image-gallery";

type Product = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: string;
  image: string;
  status: string;
};

type Workshop = {
  title: string;
  description: string;
  icon: "circle" | "sparkle" | "brush";
};

type SiteContent = {
  brand: {
    name: string;
    tagline: string;
    description: string;
    instagram: string;
    telegram: string;
    whatsapp: string;
    email: string;
    phone: string;
    address: string;
    leadsSheetUrl?: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    text: string;
    primaryCta: string;
    secondaryCta: string;
    image: string;
    imageAlt: string;
  };
  stats: Array<{ value: string; label: string }>;
  products: Product[];
  gallery: GalleryImage[];
  about: {
    title: string;
    text: string;
    philosophy: string;
    image: string;
  };
  certificate: {
    title: string;
    text: string;
    options: string[];
  };
  custom: {
    title: string;
    text: string;
    steps: string[];
  };
  workshops: Workshop[];
  partners: {
    title: string;
    text: string;
    items: string[];
  };
  seo: {
    title: string;
    description: string;
  };
};

type LeadType = "catalog" | "workshop" | "custom" | "certificate" | "partner";

const navItems = [
  { href: "/catalog", label: "Каталог" },
  { href: "/about", label: "О нас" },
  { href: "/certificate", label: "Сертификат" },
  { href: "/contacts", label: "Контакты" },
];

const blockOptions: Array<{ key: keyof SiteContent; label: string }> = [
  { key: "brand", label: "Бренд и контакты" },
  { key: "hero", label: "Первый экран" },
  { key: "products", label: "Каталог" },
  { key: "gallery", label: "Галерея" },
  { key: "about", label: "О мастерской" },
  { key: "certificate", label: "Сертификат" },
  { key: "seo", label: "SEO" },
];

function App() {
  return (
    <BrowserRouter>
      <SiteDataProvider />
    </BrowserRouter>
  );
}

function SiteDataProvider() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadContent() {
      try {
        const draft = localStorage.getItem("toshu-content-draft");
        if (draft) {
          setContent(JSON.parse(draft) as SiteContent);
          return;
        }

        const response = await fetch("/api/get-content", {
          cache: "no-store",
        });

        const contentType = response.headers.get("content-type") ?? "";
        if (response.ok && contentType.includes("application/json")) {
          setContent((await response.json()) as SiteContent);
          return;
        }

        const fallback = await fetch("/content/site.json", {
            cache: "no-store",
          });

        if (!fallback.ok) {
          throw new Error("Content request failed");
        }
        setContent((await fallback.json()) as SiteContent);
      } catch {
        setError("Не удалось загрузить данные сайта.");
      }
    }
    void loadContent();
  }, []);

  useEffect(() => {
    if (content?.seo) {
      document.title = content.seo.title;
      const meta = document.querySelector('meta[name="description"]');
      meta?.setAttribute("content", content.seo.description);
    }
  }, [content]);

  if (error) {
    return <StatusScreen title="Ошибка" text={error} />;
  }

  if (!content) {
    return <StatusScreen title="Toshu Ceramics" text="Загружаем сайт..." />;
  }

  return (
    <Routes>
      <Route
        path="/admin"
        element={<AdminPage content={content} onDraftChange={setContent} />}
      />
      <Route path="*" element={<PublicSite content={content} />} />
    </Routes>
  );
}

function PublicSite({ content }: { content: SiteContent }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      <SiteFavicon />
      <ScrollToTop />
      <RouteSeo content={content} />
      <Header
        content={content}
        menuOpen={menuOpen}
        onMenuChange={setMenuOpen}
      />
      <main id="content">
        <Routes>
          <Route path="/" element={<HomePage content={content} />} />
          <Route path="/catalog" element={<CatalogPage content={content} />} />
          <Route path="/about" element={<AboutPage content={content} />} />
          <Route
            path="/certificate"
            element={<CertificatePage content={content} />}
          />
          <Route
            path="/contacts"
            element={<ContactsPage content={content} />}
          />
          <Route path="/privacy" element={<PrivacyPage content={content} />} />
        </Routes>
      </main>
      <Footer content={content} />
    </div>
  );
}

function SiteFavicon() {
  useEffect(() => {
    document
      .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')
      .forEach((node) => node.remove());

    const icon = document.createElement("link");
    icon.rel = "icon";
    icon.type = "image/png";
    icon.sizes = "32x32";
    icon.href = "/favicon-32.png?v=6";
    document.head.appendChild(icon);
  }, []);

  return null;
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return null;
}

function RouteSeo({ content }: { content: SiteContent }) {
  const location = useLocation();

  useEffect(() => {
    const origin = "https://toshu.ru";
    const seoByPath: Record<string, { title: string; description: string }> = {
      "/": {
        title: content.seo.title,
        description: content.seo.description,
      },
      "/catalog": {
        title: "Каталог керамики ручной работы | Toshu Ceramics",
        description:
          "Каталог Toshu Ceramics: чашки, пиалы, тарелки, вазы и интерьерная керамика ручной работы в Москве.",
      },
      "/about": {
        title: "О мастерской | Toshu Ceramics",
        description:
          "Toshu Ceramics — московская керамическая мастерская с ручной работой, спокойными формами и живой тактильной поверхностью.",
      },
      "/certificate": {
        title: "Подарочный сертификат на керамику | Toshu Ceramics",
        description:
          "Подарочный сертификат Toshu Ceramics на изделие ручной работы, индивидуальный заказ или авторский мастер-класс.",
      },
      "/contacts": {
        title: "Контакты | Toshu Ceramics",
        description:
          "Контакты Toshu Ceramics: мастерская в Москве, заявки на изделия, подарочные сертификаты и сотрудничество.",
      },
      "/privacy": {
        title: "Согласие на обработку персональных данных | Toshu Ceramics",
        description:
          "Условия обработки персональных данных при отправке заявки на сайте Toshu Ceramics.",
      },
    };
    const seo = seoByPath[location.pathname] ?? seoByPath["/"];
    const url = `${origin}${location.pathname === "/" ? "/" : location.pathname}`;

    document.title = seo.title;
    setMeta("name", "description", seo.description);
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.description);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", seo.title);
    setMeta("name", "twitter:description", seo.description);
    setCanonical(url);
  }, [content, location.pathname]);

  return null;
}

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(href: string) {
  let element = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.rel = "canonical";
    document.head.appendChild(element);
  }
  element.href = href;
}

function Header({
  content,
  menuOpen,
  onMenuChange,
}: {
  content: SiteContent;
  menuOpen: boolean;
  onMenuChange: (open: boolean) => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/82 backdrop-blur-xl">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        Перейти к содержанию
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center" aria-label={content.brand.name}>
          <img
            src="/brand-logo.png"
            alt={content.brand.name}
            width="900"
            height="340"
            className="h-10 w-auto max-w-[142px] object-contain"
          />
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                isActive
                  ? "text-primary"
                  : "text-foreground/68 transition hover:text-foreground"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <a className="soft-button" href={content.brand.instagram}>
            <InstagramIcon className="size-[17px]" aria-hidden="true" />
            Instagram
          </a>
          <Link className="clay-button" to="/contacts">
            Заявка
          </Link>
        </div>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-full border bg-white/45 lg:hidden"
          onClick={() => onMenuChange(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Открыть меню"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen ? (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid gap-1 border-t bg-background px-4 py-4 lg:hidden"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => onMenuChange(false)}
                className="rounded-full px-4 py-3 text-sm font-semibold hover:bg-white/55"
              >
                {item.label}
              </NavLink>
            ))}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

function HomePage({ content }: { content: SiteContent }) {
  return (
    <>
      <Hero content={content} />
      <FeaturedCatalog content={content} />
      <AboutPreview content={content} />
      <GallerySection content={content} />
      <ContactBand content={content} leadType="catalog" />
    </>
  );
}

function Hero({ content }: { content: SiteContent }) {
  return (
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={content.hero.image}
          alt={content.hero.imageAlt}
          width="1600"
          height="1100"
          fetchPriority="high"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/76 to-background/18" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
      <div className="section-shell relative grid min-h-[calc(100dvh-4rem)] items-end pb-12 pt-20 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="eyebrow">{content.hero.eyebrow}</p>
          <h1 className="mt-5 font-display text-6xl font-semibold leading-[0.9] text-foreground sm:text-7xl lg:text-8xl">
            {content.hero.title}
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-foreground/72 sm:text-xl">
            {content.hero.text}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="clay-button" to="/catalog">
              {content.hero.primaryCta}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="soft-button" to="/contacts">
              {content.hero.secondaryCta}
            </Link>
          </div>
        </motion.div>
        <div className="mt-16 grid gap-3 sm:grid-cols-3">
          {content.stats.map((item) => (
            <motion.div
              key={`${item.value}-${item.label}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-[28px] border bg-white/52 p-5 shadow-sm backdrop-blur"
            >
              <div className="font-display text-3xl font-semibold">
                {item.value}
              </div>
              <div className="mt-1 text-sm text-foreground/62">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCatalog({ content }: { content: SiteContent }) {
  return (
    <section className="section-shell" aria-labelledby="featured-title">
      <SectionIntro
        eyebrow="Каталог"
        title="Предметы для тихих ритуалов"
        text="Посуда, вазы и декор создаются небольшими партиями. Наличие и индивидуальные повторы уточняются через заявку."
      />
      <ProductGrid products={content.products.slice(0, 6)} variant="scroll" />
    </section>
  );
}

function CatalogPage({ content }: { content: SiteContent }) {
  return (
    <section className="section-shell">
      <PageTitle
        eyebrow="Каталог"
        title="Изделия мастерской"
        text="Небольшие партии посуды, ваз и интерьерных предметов ручной работы. Если изделие уже забронировано, мы можем обсудить повтор в близкой форме и глазури."
      />
      <ProductGrid products={content.products} />
      <ContactBand content={content} leadType="catalog" compact />
    </section>
  );
}

function ProductGrid({
  products,
  variant = "grid",
}: {
  products: Product[];
  variant?: "grid" | "scroll";
}) {
  const isScroll = variant === "scroll";
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const xRef = useRef(0);
  const maxShiftRef = useRef(0);
  const manualScrollRef = useRef(false);
  const [scrollState, setScrollState] = useState({ height: 0, x: 0 });

  useEffect(() => {
    if (!isScroll) return;

    let frame = 0;

    function update() {
      const wrapper = scrollRef.current;
      const sticky = stickyRef.current;
      const track = trackRef.current;

      if (!wrapper || !sticky || !track || window.innerWidth < 1024) {
        setScrollState({ height: 0, x: 0 });
        return;
      }

      const stickyHeight = sticky.offsetHeight;
      const maxShift = Math.max(track.scrollWidth - sticky.clientWidth, 0);
      const height = stickyHeight + maxShift + 48;
      const travel = Math.max(height - stickyHeight, 1);
      const rect = wrapper.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      maxShiftRef.current = maxShift;

      if (manualScrollRef.current) {
        xRef.current = Math.min(xRef.current, maxShift);
        setScrollState({
          height,
          x: Math.round(xRef.current),
        });
        return;
      }

      xRef.current = progress * maxShift;
      setScrollState({
        height,
        x: Math.round(xRef.current),
      });
    }

    function handleWheel(event: WheelEvent) {
      const wrapper = scrollRef.current;
      const sticky = stickyRef.current;

      if (!wrapper || !sticky || window.innerWidth < 1024) return;

      const rect = wrapper.getBoundingClientRect();
      const stickyTop = 96;
      const isPinned =
        rect.top <= stickyTop && rect.bottom >= stickyTop + sticky.offsetHeight;

      if (!isPinned) return;

      const delta =
        Math.abs(event.deltaY) >= Math.abs(event.deltaX)
          ? event.deltaY
          : event.deltaX;
      const maxShift = maxShiftRef.current;
      const currentX = xRef.current;
      const canMoveForward = delta > 0 && currentX < maxShift;
      const canMoveBack = delta < 0 && currentX > 0;

      if (!canMoveForward && !canMoveBack) return;

      event.preventDefault();
      manualScrollRef.current = true;
      const nextX = Math.min(maxShift, Math.max(0, currentX + delta * 1.15));
      xRef.current = nextX;
      setScrollState((previous) => ({
        ...previous,
        x: Math.round(nextX),
      }));
    }

    function scheduleUpdate() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    update();
    const stickyNode = stickyRef.current;
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    stickyNode?.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      stickyNode?.removeEventListener("wheel", handleWheel);
    };
  }, [isScroll, products.length]);

  const cards = products.map((product, index) => (
    <motion.article
      key={product.id}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay: Math.min(index * 0.04, 0.16) }}
      className={`group overflow-hidden rounded-[30px] border bg-white/48 shadow-sm transition hover:-translate-y-1 hover:shadow-soft ${
        isScroll
          ? "w-[74vw] max-w-[330px] shrink-0 snap-start sm:w-[420px] sm:max-w-none lg:w-[390px]"
          : ""
      }`}
    >
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.title}
          width="900"
          height="1125"
          loading="lazy"
          className="size-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-normal text-secondary">
          <span>{product.category}</span>
          <span>{product.status}</span>
        </div>
        <h2 className="mt-3 font-display text-3xl font-semibold">
          {product.title}
        </h2>
        <p className="mt-3 min-h-20 text-sm leading-6 text-foreground/68">
          {product.description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-semibold">{product.price}</span>
          <Link
            className="soft-button"
            to={`/contacts?type=catalog&product=${product.id}`}
          >
            Запросить
          </Link>
        </div>
      </div>
    </motion.article>
  ));

  if (isScroll) {
    return (
      <div
        ref={scrollRef}
        className="-mx-4 sm:-mx-6 lg:-mx-8"
        style={scrollState.height ? { height: scrollState.height } : undefined}
      >
        <div
          ref={stickyRef}
          className="overflow-x-auto px-4 pb-8 sm:px-6 lg:sticky lg:top-24 lg:min-h-[min(calc(100dvh-7rem),720px)] lg:overflow-x-hidden lg:overflow-y-visible lg:px-8 [scrollbar-color:rgb(155_98_70_/_0.45)_transparent] [scrollbar-width:thin]"
        >
          <div
            ref={trackRef}
            className="flex snap-x gap-5 pr-[18vw] transition-transform duration-75 ease-out sm:pr-0 lg:will-change-transform"
            style={{
              transform: scrollState.x
                ? `translate3d(-${scrollState.x}px, 0, 0)`
                : undefined,
            }}
          >
            {cards}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cards}</div>
  );
}

function AboutPage({ content }: { content: SiteContent }) {
  return (
    <>
      <section className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <PageTitle
            eyebrow="О нас"
            title={content.about.title}
            text={content.about.text}
          />
          <p className="mt-6 rounded-[28px] border bg-white/45 p-6 leading-8 text-foreground/72">
            {content.about.philosophy}
          </p>
        </div>
        <img
          src={content.about.image}
          alt="Работа с глиной в мастерской Toshu"
          className="aspect-[4/5] w-full rounded-[36px] object-cover shadow-soft"
        />
      </section>
      <GallerySection content={content} />
    </>
  );
}

function AboutPreview({ content }: { content: SiteContent }) {
  return (
    <section className="section-shell grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
      <div className="overflow-hidden rounded-[36px] shadow-soft">
        <img
          src={content.about.image}
          alt="Процесс ручной работы с керамикой"
          loading="lazy"
          className="aspect-[5/4] size-full object-cover"
        />
      </div>
      <div>
        <SectionIntro
          eyebrow="О мастерской"
          title="Форма, тактильность и спокойная повседневность"
          text={content.about.text}
        />
        <p className="text-lg leading-8 text-foreground/70">
          {content.about.philosophy}
        </p>
      </div>
    </section>
  );
}

function CertificatePage({ content }: { content: SiteContent }) {
  return (
    <section className="section-shell">
      <PageTitle
        eyebrow="Подарочный сертификат"
        title={content.certificate.title}
        text={content.certificate.text}
      />
      <div className="grid gap-5 md:grid-cols-3">
        {content.certificate.options.map((option) => (
          <FeatureCard
            key={option}
            icon={<Gift size={22} />}
            title={option}
            text="Оставьте заявку, и мы поможем оформить подарок в нужном формате."
          />
        ))}
      </div>
      <ContactBand content={content} leadType="certificate" compact />
    </section>
  );
}

function ContactsPage({ content }: { content: SiteContent }) {
  return (
    <section className="section-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
      <div>
        <PageTitle
          eyebrow="Контакты"
          title="Напишите нам"
          text="Запись на мастер-классы и заказы изделий возможны на сайте, по телефону, в мессенджере или по почте."
        />
        <div className="mt-8 grid gap-3">
          <ContactLink icon={<MapPin size={18} />} label={content.brand.address} />
          <ContactLink icon={<Phone size={18} />} label={content.brand.phone} href={`tel:${content.brand.phone.replace(/\D/g, "")}`} />
          <ContactLink icon={<Mail size={18} />} label={content.brand.email} href={`mailto:${content.brand.email}`} />
          <ContactLink icon={<InstagramIcon className="size-[18px]" />} label="Instagram" href={content.brand.instagram} />
          <ContactLink icon={<MessageCircle size={18} />} label="Telegram" href={content.brand.telegram} />
          <ContactLink icon={<MessageCircle size={18} />} label="WhatsApp" href={content.brand.whatsapp} />
        </div>
      </div>
      <div className="liquid-glass p-5 md:p-6">
        <LeadForm content={content} type="catalog" />
      </div>
    </section>
  );
}

function PrivacyPage({ content }: { content: SiteContent }) {
  return (
    <section className="section-shell">
      <PageTitle
        eyebrow="Персональные данные"
        title="Согласие на обработку персональных данных"
        text="Перед отправкой формы вы подтверждаете, что ознакомились с условиями обработки персональных данных и соглашаетесь на обратную связь по вашей заявке."
      />
      <article className="max-w-4xl rounded-[32px] border bg-white/50 p-6 leading-8 shadow-sm md:p-8">
        <h2 className="font-display text-3xl font-semibold">
          Какие данные обрабатываются
        </h2>
        <p className="mt-4 text-foreground/72">
          При отправке формы Toshu Ceramics может получить ваше имя, телефон,
          email, выбранное направление заявки и текст комментария. Эти данные
          используются только для связи с вами, уточнения деталей заказа,
          сертификата или другого обращения.
        </p>
        <h2 className="mt-8 font-display text-3xl font-semibold">
          Для чего нужны данные
        </h2>
        <ul className="mt-4 grid gap-3 text-foreground/72">
          <li>Ответить на заявку и согласовать детали обращения.</li>
          <li>Подготовить информацию по изделию или сертификату.</li>
          <li>Связаться с вами по телефону, email или в мессенджере.</li>
        </ul>
        <h2 className="mt-8 font-display text-3xl font-semibold">
          Хранение и передача
        </h2>
        <p className="mt-4 text-foreground/72">
          Данные не публикуются на сайте и не передаются третьим лицам для
          рекламных рассылок. Доступ к заявкам имеет только команда мастерской
          и технические сервисы, которые помогают принять и обработать форму.
        </p>
        <h2 className="mt-8 font-display text-3xl font-semibold">
          Как отозвать согласие
        </h2>
        <p className="mt-4 text-foreground/72">
          Вы можете попросить удалить или уточнить ваши данные, написав на{" "}
          <a className="font-semibold underline" href={`mailto:${content.brand.email}`}>
            {content.brand.email}
          </a>
          .
        </p>
      </article>
    </section>
  );
}

function GallerySection({ content }: { content: SiteContent }) {
  return (
    <section className="section-shell" aria-labelledby="gallery-title">
      <SectionIntro
        eyebrow="Галерея"
        title="Фактура, свет и живой край"
        text="Живые поверхности, следы ручной работы и спокойный свет, в котором лучше всего раскрываются форма и глазурь."
      />
      <ImageGallery images={content.gallery} />
    </section>
  );
}

function ContactBand({
  content,
  leadType,
  compact = false,
}: {
  content: SiteContent;
  leadType: LeadType;
  compact?: boolean;
}) {
  return (
    <section
      className={
        compact
          ? "mt-12 rounded-[34px] border bg-white/45 p-4 shadow-sm md:p-6"
          : "section-shell"
      }
    >
      <div className="liquid-glass grid gap-8 p-5 md:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="liquid-content">
          <p className="eyebrow">Обратная связь</p>
          <h2 className="mt-4 font-display text-4xl font-semibold">
            Обсудим изделие, занятие или сотрудничество
          </h2>
          <p className="mt-4 max-w-md text-[1.02rem] font-medium leading-8 text-foreground/70">
            Оставьте контакты и коротко расскажите, что вам интересно. Мы
            вернёмся с ответом и поможем выбрать подходящий формат.
          </p>
          <div className="mt-6 grid gap-2 text-sm font-semibold text-foreground/62">
            <span>Ответим бережно и по делу</span>
            <span>Без рассылок и лишних сообщений</span>
          </div>
        </div>
        <LeadForm content={content} type={leadType} />
      </div>
    </section>
  );
}

function LeadForm({
  content,
  type,
}: {
  content: SiteContent;
  type: LeadType;
}) {
  const [status, setStatus] = useState("");
  const [isSuccess, setSuccess] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    if (!data.consent) {
      setStatus("Нужно согласие на обработку персональных данных.");
      return;
    }

    setSubmitting(true);
    setSuccess(false);
    setStatus("");
    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          type,
          source: "toshu.ru",
          createdAt: new Date().toISOString(),
        }),
      });
      if (!response.ok) {
        throw new Error("Submit failed");
      }
      setStatus("Заявка отправлена. Мы скоро свяжемся с вами.");
      setSuccess(true);
      form.reset();
    } catch {
      setStatus(
        `Не удалось отправить автоматически. Напишите на ${content.brand.email} или в мессенджер.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="liquid-content grid gap-3">
        <div
          className="rounded-[28px] border border-white/60 bg-white/60 p-6 shadow-sm backdrop-blur-xl"
          role="status"
          aria-live="polite"
        >
          <h3 className="font-display text-3xl font-semibold">
            Заявка отправлена
          </h3>
          <p className="mt-2 text-sm leading-6 text-foreground/70">
            Спасибо. Мы получили обращение и скоро свяжемся с вами.
          </p>
          <button
            className="soft-button mt-4"
            type="button"
            onClick={() => {
              setSuccess(false);
              setStatus("");
            }}
          >
            Отправить ещё одну заявку
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="liquid-content grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Имя" name="name" required />
        <Field label="Телефон" name="phone" type="tel" required />
      </div>
      <Field label="Email" name="email" type="email" />
      <label className="grid gap-2 text-sm font-semibold">
        Направление
        <select
          name="interest"
          defaultValue={type}
          className="liquid-field appearance-none"
        >
          <option value="catalog">Каталог / покупка</option>
          <option value="workshop">Мастер-класс</option>
          <option value="custom">Изделие на заказ</option>
          <option value="certificate">Подарочный сертификат</option>
          <option value="partner">Сотрудничество</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Комментарий
        <textarea
          name="message"
          rows={4}
          className="liquid-field min-h-32 resize-y py-3 leading-7"
          placeholder="Что хотите обсудить?"
        />
      </label>
      <label className="flex gap-3 rounded-[22px] border border-white/50 bg-white/40 p-4 text-sm font-medium leading-6 text-foreground/72 shadow-sm backdrop-blur-xl">
        <input
          className="mt-1 size-4 shrink-0 accent-primary"
          type="checkbox"
          name="consent"
          value="yes"
          required
        />
        <span>
          Согласен/согласна на обработку персональных данных для обратной связи
          по заявке.{" "}
          <Link className="font-semibold underline" to="/privacy">
            Ознакомиться с условиями
          </Link>
        </span>
      </label>
      <button className="liquid-submit" type="submit" disabled={isSubmitting}>
        <Send size={17} aria-hidden="true" />
        {isSubmitting ? "Отправляем..." : "Отправить заявку"}
      </button>
      {status ? (
        <p className="rounded-[22px] border border-white/50 bg-white/60 p-4 text-sm font-medium text-foreground/72 backdrop-blur-xl">
          {status}
        </p>
      ) : null}
    </form>
  );
}

function AdminPage({
  content,
  onDraftChange,
}: {
  content: SiteContent;
  onDraftChange: (content: SiteContent) => void;
}) {
  const [password, setPassword] = useState(
    () => sessionStorage.getItem("toshu-admin-password") ?? "",
  );
  const [isUnlocked, setUnlocked] = useState(Boolean(password));
  const [draftContent, setDraftContent] = useState<SiteContent>(content);
  const [active, setActive] = useState<keyof SiteContent>("hero");
  const [status, setStatus] = useState("");

  function updateDraft(next: SiteContent) {
    setDraftContent(next);
    const formatted = JSON.stringify(next, null, 2);
    localStorage.setItem("toshu-content-draft", formatted);
    onDraftChange(next);
  }

  async function saveContent() {
    setStatus("Сохраняем изменения...");
    const response = await fetch("/api/save-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify(draftContent),
    });

    if (!response.ok) {
      const text = await response.text();
      setStatus(`Не удалось сохранить: ${text}`);
      return;
    }

    localStorage.removeItem("toshu-content-draft");
    setStatus("Готово. Изменения сохранены и скоро появятся на сайте.");
  }

  if (!isUnlocked) {
    return (
      <main className="grid min-h-dvh place-items-center p-4">
        <form
          className="w-full max-w-md rounded-[32px] border bg-white/55 p-6 shadow-soft"
          onSubmit={(event) => {
            event.preventDefault();
            sessionStorage.setItem("toshu-admin-password", password);
            setUnlocked(true);
          }}
        >
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 font-display text-4xl font-semibold">
            Панель Toshu
          </h1>
          <p className="mt-3 text-sm leading-6 text-foreground/66">
            Войдите, чтобы обновлять тексты, изображения, каталог и контактные
            данные сайта.
          </p>
          <Field
            className="mt-6"
            label="Пароль"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            required
          />
          <button className="clay-button mt-4 w-full" type="submit">
            Войти
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background">
      <div className="section-shell">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-2 font-display text-5xl font-semibold">
              Контент сайта
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="soft-button" to="/">
              На сайт
              <ExternalLink size={16} />
            </Link>
            <a
              className="soft-button"
              href={draftContent.brand.leadsSheetUrl || "#"}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!draftContent.brand.leadsSheetUrl}
            >
              Открыть заявки
            </a>
            <button className="clay-button" type="button" onClick={saveContent}>
              Сохранить изменения
            </button>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="grid content-start gap-2 rounded-[28px] border bg-white/45 p-3">
            {blockOptions.map((block) => (
              <button
                key={block.key}
                type="button"
                onClick={() => setActive(block.key)}
                className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                  active === block.key ? "bg-primary text-primary-foreground" : "hover:bg-white/60"
                }`}
              >
                {block.label}
              </button>
            ))}
          </aside>
          <section className="rounded-[28px] border bg-white/45 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-3xl font-semibold">
                {blockOptions.find((item) => item.key === active)?.label}
              </h2>
              <button
                className="soft-button"
                type="button"
                onClick={() => {
                  onDraftChange(draftContent);
                  localStorage.setItem("toshu-content-draft", JSON.stringify(draftContent, null, 2));
                  setStatus("Черновик применён локально.");
                }}
              >
                Применить черновик
              </button>
            </div>
            <AdminBlockEditor
              active={active}
              content={draftContent}
              onChange={(next) => {
                updateDraft(next);
                setStatus("");
              }}
            />
            <p className="mt-3 text-sm text-foreground/64">
              Меняйте тексты и ссылки на фотографии в выбранном блоке. Сайт
              применит черновик сразу, а кнопка сохранения отправит изменения в
              постоянное хранилище.
            </p>
            {status ? (
              <p className="mt-3 rounded-2xl bg-white/70 p-3 text-sm">
                {status}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}

function AdminBlockEditor({
  active,
  content,
  onChange,
}: {
  active: keyof SiteContent;
  content: SiteContent;
  onChange: (content: SiteContent) => void;
}) {
  const setBlock = <K extends keyof SiteContent>(key: K, value: SiteContent[K]) => {
    onChange({ ...content, [key]: value });
  };

  if (active === "brand") {
    const brand = content.brand;
    const setBrand = (patch: Partial<typeof brand>) => setBlock("brand", { ...brand, ...patch });
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <AdminInput label="Название" value={brand.name} onChange={(value) => setBrand({ name: value })} />
        <AdminInput label="Подпись" value={brand.tagline} onChange={(value) => setBrand({ tagline: value })} />
        <AdminTextarea label="Описание" value={brand.description} onChange={(value) => setBrand({ description: value })} />
        <AdminInput label="Instagram" value={brand.instagram} onChange={(value) => setBrand({ instagram: value })} />
        <AdminInput label="Telegram" value={brand.telegram} onChange={(value) => setBrand({ telegram: value })} />
        <AdminInput label="WhatsApp" value={brand.whatsapp} onChange={(value) => setBrand({ whatsapp: value })} />
        <AdminInput label="Почта" value={brand.email} onChange={(value) => setBrand({ email: value })} />
        <AdminInput label="Телефон" value={brand.phone} onChange={(value) => setBrand({ phone: value })} />
        <AdminInput label="Адрес" value={brand.address} onChange={(value) => setBrand({ address: value })} />
        <AdminInput label="Ссылка на заявки" value={brand.leadsSheetUrl ?? ""} onChange={(value) => setBrand({ leadsSheetUrl: value })} />
      </div>
    );
  }

  if (active === "hero") {
    const hero = content.hero;
    const setHero = (patch: Partial<typeof hero>) => setBlock("hero", { ...hero, ...patch });
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <AdminInput label="Надзаголовок" value={hero.eyebrow} onChange={(value) => setHero({ eyebrow: value })} />
        <AdminInput label="Заголовок" value={hero.title} onChange={(value) => setHero({ title: value })} />
        <AdminTextarea label="Текст" value={hero.text} onChange={(value) => setHero({ text: value })} />
        <AdminInput label="Главная кнопка" value={hero.primaryCta} onChange={(value) => setHero({ primaryCta: value })} />
        <AdminInput label="Вторая кнопка" value={hero.secondaryCta} onChange={(value) => setHero({ secondaryCta: value })} />
        <AdminInput label="Фото" value={hero.image} onChange={(value) => setHero({ image: value })} />
        <AdminInput label="Описание фото" value={hero.imageAlt} onChange={(value) => setHero({ imageAlt: value })} />
      </div>
    );
  }

  if (active === "products") {
    return <AdminProducts content={content} onChange={onChange} />;
  }

  if (active === "gallery") {
    return <AdminImageList content={content} onChange={onChange} />;
  }

  if (active === "about") {
    const about = content.about;
    const setAbout = (patch: Partial<typeof about>) => setBlock("about", { ...about, ...patch });
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <AdminInput label="Заголовок" value={about.title} onChange={(value) => setAbout({ title: value })} />
        <AdminInput label="Фото" value={about.image} onChange={(value) => setAbout({ image: value })} />
        <AdminTextarea label="Текст" value={about.text} onChange={(value) => setAbout({ text: value })} />
        <AdminTextarea label="Философия" value={about.philosophy} onChange={(value) => setAbout({ philosophy: value })} />
      </div>
    );
  }

  if (active === "certificate") {
    const certificate = content.certificate;
    const setCertificate = (patch: Partial<typeof certificate>) => setBlock("certificate", { ...certificate, ...patch });
    return (
      <div className="grid gap-4">
        <AdminInput label="Заголовок" value={certificate.title} onChange={(value) => setCertificate({ title: value })} />
        <AdminTextarea label="Текст" value={certificate.text} onChange={(value) => setCertificate({ text: value })} />
        <AdminOptions
          label="Варианты"
          values={certificate.options}
          onChange={(options) => setCertificate({ options })}
        />
      </div>
    );
  }

  if (active === "seo") {
    const seo = content.seo;
    return (
      <div className="grid gap-4">
        <AdminInput label="SEO title" value={seo.title} onChange={(value) => setBlock("seo", { ...seo, title: value })} />
        <AdminTextarea label="SEO description" value={seo.description} onChange={(value) => setBlock("seo", { ...seo, description: value })} />
      </div>
    );
  }

  return null;
}

function AdminProducts({
  content,
  onChange,
}: {
  content: SiteContent;
  onChange: (content: SiteContent) => void;
}) {
  const updateProduct = (index: number, patch: Partial<Product>) => {
    const products = content.products.map((product, itemIndex) =>
      itemIndex === index ? { ...product, ...patch } : product,
    );
    onChange({ ...content, products });
  };

  return (
    <div className="grid gap-4">
      {content.products.map((product, index) => (
        <article key={product.id} className="grid gap-4 rounded-3xl border bg-background/55 p-4 md:grid-cols-[140px_1fr]">
          <img src={product.image} alt={product.title} className="aspect-square w-full rounded-2xl object-cover" />
          <div className="grid gap-3 md:grid-cols-2">
            <AdminInput label="Название" value={product.title} onChange={(value) => updateProduct(index, { title: value })} />
            <AdminInput label="Категория" value={product.category} onChange={(value) => updateProduct(index, { category: value })} />
            <AdminInput label="Цена" value={product.price} onChange={(value) => updateProduct(index, { price: value })} />
            <AdminInput label="Статус" value={product.status} onChange={(value) => updateProduct(index, { status: value })} />
            <AdminInput label="Фото" value={product.image} onChange={(value) => updateProduct(index, { image: value })} />
            <AdminTextarea label="Описание" value={product.description} onChange={(value) => updateProduct(index, { description: value })} />
            <button
              className="soft-button w-fit"
              type="button"
              onClick={() => onChange({ ...content, products: content.products.filter((_, itemIndex) => itemIndex !== index) })}
            >
              Удалить изделие
            </button>
          </div>
        </article>
      ))}
      <button
        className="clay-button w-fit"
        type="button"
        onClick={() =>
          onChange({
            ...content,
            products: [
              ...content.products,
              {
                id: `product-${Date.now()}`,
                title: "Новое изделие",
                category: "Керамика",
                description: "Короткое описание изделия.",
                price: "по запросу",
                image: "/images/gallery/IMG_8423.webp",
                status: "доступно",
              },
            ],
          })
        }
      >
        Добавить изделие
      </button>
    </div>
  );
}

function AdminImageList({
  content,
  onChange,
}: {
  content: SiteContent;
  onChange: (content: SiteContent) => void;
}) {
  const updateImage = (index: number, patch: Partial<GalleryImage>) => {
    const gallery = content.gallery.map((image, itemIndex) =>
      itemIndex === index ? { ...image, ...patch } : image,
    );
    onChange({ ...content, gallery });
  };

  return (
    <div className="grid gap-4">
      {content.gallery.map((image, index) => (
        <article key={`${image.src}-${index}`} className="grid gap-4 rounded-3xl border bg-background/55 p-4 md:grid-cols-[150px_1fr_auto]">
          <img src={image.src} alt={image.alt} className="max-h-44 w-full rounded-2xl object-contain" />
          <div className="grid gap-3 md:grid-cols-2">
            <AdminInput label="Ссылка на фото" value={image.src} onChange={(value) => updateImage(index, { src: value })} />
            <AdminInput label="Описание" value={image.alt} onChange={(value) => updateImage(index, { alt: value })} />
            <AdminInput
              label="Пропорция"
              type="number"
              value={String(image.ratio)}
              onChange={(value) => updateImage(index, { ratio: Number(value) || 1 })}
            />
          </div>
          <button
            className="soft-button h-fit"
            type="button"
            onClick={() => onChange({ ...content, gallery: content.gallery.filter((_, itemIndex) => itemIndex !== index) })}
          >
            Удалить
          </button>
        </article>
      ))}
      <button
        className="clay-button w-fit"
        type="button"
        onClick={() =>
          onChange({
            ...content,
            gallery: [
              ...content.gallery,
              {
                src: "",
                alt: "Новое фото Toshu Ceramics",
                ratio: 0.75,
              },
            ],
          })
        }
      >
        Добавить фото по ссылке
      </button>
    </div>
  );
}

function AdminOptions({
  label,
  values,
  onChange,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold">{label}</p>
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="flex gap-2">
          <input
            className="min-h-12 flex-1 rounded-2xl border bg-background/70 px-4"
            value={value}
            onChange={(event) =>
              onChange(values.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
            }
          />
          <button className="soft-button" type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>
            Удалить
          </button>
        </div>
      ))}
      <button className="soft-button w-fit" type="button" onClick={() => onChange([...values, "Новый вариант"])}>
        Добавить вариант
      </button>
    </div>
  );
}

function AdminInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <input
        className="min-h-12 rounded-2xl border bg-background/70 px-4"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function AdminTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold md:col-span-2">
      {label}
      <textarea
        className="min-h-32 rounded-2xl border bg-background/70 px-4 py-3 leading-7"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SectionIntro({
  eyebrow,
  title,
  text,
  cta,
}: {
  eyebrow: string;
  title: string;
  text: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-4 font-display text-4xl font-semibold leading-tight md:text-6xl">
          {title}
        </h2>
        <p className="mt-5 text-lg leading-8 text-foreground/68">{text}</p>
      </div>
      {cta ? (
        <Link className="soft-button shrink-0" to={cta.href}>
          {cta.label}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

function PageTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mb-10 max-w-4xl">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 font-display text-5xl font-semibold leading-tight md:text-7xl">
        {title}
      </h1>
      <p className="mt-5 text-lg leading-8 text-foreground/68">{text}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-[28px] border bg-white/45 p-6 shadow-sm"
    >
      <div className="grid size-12 place-items-center rounded-full bg-accent text-primary">
        {icon}
      </div>
      <h2 className="mt-5 font-display text-3xl font-semibold">{title}</h2>
      <p className="mt-3 leading-7 text-foreground/68">{text}</p>
    </motion.article>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  value,
  onChange,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`grid gap-2 text-sm font-semibold ${className}`}>
      {label}
        <input
          name={name}
          type={type}
          required={required}
          autoComplete={
            name === "name"
              ? "name"
              : name === "phone"
                ? "tel"
                : name === "email"
                  ? "email"
                  : undefined
          }
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          className="liquid-field"
      />
    </label>
  );
}

function ContactLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
}) {
  const className =
    "flex min-h-12 items-center gap-3 rounded-2xl border bg-white/45 px-4 font-semibold";
  if (!href) {
    return (
      <div className={className}>
        {icon}
        {label}
      </div>
    );
  }
  return (
    <a className={className} href={href}>
      {icon}
      {label}
    </a>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" />
    </svg>
  );
}

function Footer({ content }: { content: SiteContent }) {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <img
            src="/brand-logo.png"
            alt={content.brand.name}
            width="900"
            height="340"
            className="h-12 w-auto max-w-[170px] object-contain invert"
          />
          <p className="mt-3 max-w-xl text-sm leading-6 text-background/70">
            {content.brand.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a className="soft-button !bg-white/10 !text-background" href={content.brand.instagram}>
            <InstagramIcon className="size-[17px]" /> Instagram
          </a>
          <a className="soft-button !bg-white/10 !text-background" href={`mailto:${content.brand.email}`}>
            <Mail size={17} /> Почта
          </a>
        </div>
        <p className="text-sm text-background/55 md:col-span-2">
          © 2026 {content.brand.name}. Все права защищены.
        </p>
      </div>
    </footer>
  );
}

function StatusScreen({ title, text }: { title: string; text: string }) {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-5xl font-semibold">{title}</h1>
        <p className="mt-4 text-foreground/68">{text}</p>
      </div>
    </main>
  );
}

export default App;
