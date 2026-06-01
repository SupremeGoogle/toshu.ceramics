import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Camera,
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

        let response = await fetch("/api/get-content", {
          cache: "no-store",
        });

        if (!response.ok) {
          response = await fetch("/content/site.json", {
            cache: "no-store",
          });
        }

        if (!response.ok) {
          throw new Error("Content request failed");
        }
        setContent((await response.json()) as SiteContent);
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
    <div className="min-h-dvh overflow-hidden bg-background">
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
        </Routes>
      </main>
      <Footer content={content} />
    </div>
  );
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
            <Camera size={17} aria-hidden="true" />
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
        cta={{ label: "Весь каталог", href: "/catalog" }}
      />
      <ProductGrid products={content.products.slice(0, 6)} />
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

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <motion.article
          key={product.id}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ delay: Math.min(index * 0.04, 0.16) }}
          className="group overflow-hidden rounded-[30px] border bg-white/48 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
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
      ))}
    </div>
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
          cta={{ label: "Больше о нас", href: "/about" }}
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
          <ContactLink icon={<MessageCircle size={18} />} label="Telegram" href={content.brand.telegram} />
          <ContactLink icon={<MessageCircle size={18} />} label="WhatsApp" href={content.brand.whatsapp} />
        </div>
      </div>
      <LeadForm content={content} type="catalog" />
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
      <div className="grid gap-8 rounded-[36px] border bg-white/50 p-5 shadow-soft md:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div>
          <p className="eyebrow">Заявка</p>
          <h2 className="mt-4 font-display text-4xl font-semibold">
            Обсудим изделие, занятие или сотрудничество
          </h2>
          <p className="mt-4 leading-7 text-foreground/68">
            Оставьте контакты и коротко расскажите, что вам интересно. Мы
            вернёмся с ответом и поможем выбрать подходящий формат.
          </p>
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
      form.reset();
    } catch {
      setStatus(
        `Не удалось отправить автоматически. Напишите на ${content.brand.email} или в мессенджер.`,
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
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
          className="min-h-12 rounded-2xl border bg-background/70 px-4"
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
          className="rounded-2xl border bg-background/70 px-4 py-3"
          placeholder="Что хотите обсудить?"
        />
      </label>
      <label className="flex gap-3 rounded-2xl border bg-background/50 p-3 text-sm leading-6 text-foreground/70">
        <input
          className="mt-1 size-4 shrink-0 accent-primary"
          type="checkbox"
          name="consent"
          value="yes"
          required
        />
        <span>
          Согласен/согласна на обработку персональных данных для обратной связи
          по заявке.
        </span>
      </label>
      <button className="clay-button" type="submit" disabled={isSubmitting}>
        <Send size={17} aria-hidden="true" />
        {isSubmitting ? "Отправляем..." : "Отправить заявку"}
      </button>
      {status ? (
        <p className="rounded-2xl bg-white/60 p-3 text-sm text-foreground/72">
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
  const [draft, setDraft] = useState(() => JSON.stringify(content, null, 2));
  const [active, setActive] = useState<keyof SiteContent>("hero");
  const [status, setStatus] = useState("");

  const parsedDraft = useMemo(() => {
    try {
      return JSON.parse(draft) as SiteContent;
    } catch {
      return null;
    }
  }, [draft]);

  function updateBlock(block: keyof SiteContent, value: string) {
    if (!parsedDraft) return;
    const next = { ...parsedDraft, [block]: JSON.parse(value) } as SiteContent;
    const formatted = JSON.stringify(next, null, 2);
    setDraft(formatted);
    localStorage.setItem("toshu-content-draft", formatted);
    onDraftChange(next);
  }

  async function saveContent() {
    if (!parsedDraft) {
      setStatus("JSON содержит ошибку. Проверьте текущий блок.");
      return;
    }

    setStatus("Сохраняем изменения...");
    const response = await fetch("/api/save-content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": password,
      },
      body: JSON.stringify(parsedDraft),
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

  const blockValue = parsedDraft
    ? JSON.stringify(parsedDraft[active], null, 2)
    : "";

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
              href={parsedDraft?.brand.leadsSheetUrl || "#"}
              target="_blank"
              rel="noreferrer"
              aria-disabled={!parsedDraft?.brand.leadsSheetUrl}
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
                  if (!parsedDraft) return;
                  onDraftChange(parsedDraft);
                  localStorage.setItem(
                    "toshu-content-draft",
                    JSON.stringify(parsedDraft, null, 2),
                  );
                  setStatus("Черновик применён локально.");
                }}
              >
                Применить черновик
              </button>
            </div>
            <textarea
              className="min-h-[520px] w-full rounded-2xl border bg-background/75 p-4 font-mono text-sm leading-6"
              value={blockValue}
              onChange={(event) => {
                try {
                  updateBlock(active, event.target.value);
                  setStatus("");
                } catch {
                  setStatus("В блоке временно невалидный JSON.");
                }
              }}
              spellCheck={false}
            />
            <p className="mt-3 text-sm text-foreground/64">
              Меняйте тексты и URL фотографий в выбранном блоке. Когда загрузишь
              реальные фото в проект, их можно указывать как `/images/name.jpg`.
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
        value={value}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
        className="min-h-12 rounded-2xl border bg-background/70 px-4"
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
            <Camera size={17} /> Instagram
          </a>
          <a className="soft-button !bg-white/10 !text-background" href={`mailto:${content.brand.email}`}>
            <Mail size={17} /> Почта
          </a>
        </div>
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
