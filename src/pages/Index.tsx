import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface MarketResult {
  id: string;
  name: string;
  logo: string;
  color: string;
  cardClass: string;
  tagColor: string;
  price: number | null;
  originalPrice: number | null;
  rating: number;
  reviewCount: number;
  delivery: string;
  link: string;
  discount: number | null;
}

const MOCK_RESULTS: MarketResult[] = [
  {
    id: "ozon",
    name: "Ozon",
    logo: "🔵",
    color: "#0069FF",
    cardClass: "card-ozon",
    tagColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    price: 4890,
    originalPrice: 6200,
    rating: 4.7,
    reviewCount: 2341,
    delivery: "Завтра, бесплатно",
    link: "#",
    discount: 21,
  },
  {
    id: "wb",
    name: "Wildberries",
    logo: "🟣",
    color: "#9633E0",
    cardClass: "card-wb",
    tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    price: 5290,
    originalPrice: 7800,
    rating: 4.5,
    reviewCount: 5678,
    delivery: "Послезавтра",
    link: "#",
    discount: 32,
  },
  {
    id: "ym",
    name: "Яндекс Маркет",
    logo: "🟡",
    color: "#FFB300",
    cardClass: "card-ym",
    tagColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    price: 5100,
    originalPrice: null,
    rating: 4.6,
    reviewCount: 892,
    delivery: "Сегодня, 390 ₽",
    link: "#",
    discount: null,
  },
];

function formatPrice(price: number): string {
  return price.toLocaleString("ru-RU");
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-yellow-400 text-xs">★</span>
      <span className="text-sm font-medium text-white/80">{rating}</span>
    </div>
  );
}

function MarketCard({
  result,
  isBest,
  index,
}: {
  result: MarketResult;
  isBest: boolean;
  index: number;
}) {
  return (
    <div
      className={`glass ${result.cardClass} rounded-2xl p-4 transition-all duration-300 cursor-pointer animate-fade-in-up stagger-${index + 3} relative overflow-hidden`}
    >
      {isBest && (
        <div className="absolute top-3 right-3">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Лучшая цена
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{result.logo}</span>
          <div>
            <p className="text-sm font-semibold text-white/90">{result.name}</p>
            <StarRating rating={result.rating} />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span
            className="text-2xl font-bold font-mono-price"
            style={{ color: result.color }}
          >
            {result.price ? formatPrice(result.price) : "—"} ₽
          </span>
          {result.originalPrice && (
            <span className="text-sm text-white/35 line-through font-mono-price">
              {formatPrice(result.originalPrice)} ₽
            </span>
          )}
        </div>
        {result.discount && (
          <span
            className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${result.tagColor}`}
          >
            −{result.discount}%
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-white/45">
          <Icon name="Package" size={12} />
          <span>{result.delivery}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-white/45">
          <Icon name="MessageSquare" size={12} />
          <span>{result.reviewCount.toLocaleString("ru-RU")}</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5">
        <button
          className="w-full text-sm py-2 rounded-xl transition-all duration-200 font-medium text-white/70 hover:text-white/100"
          style={{
            background: `linear-gradient(135deg, ${result.color}22, ${result.color}11)`,
            border: `1px solid ${result.color}40`,
          }}
        >
          Перейти на сайт →
        </button>
      </div>
    </div>
  );
}

function ScanningAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-2xl border-2 border-cyan-500/30 animate-pulse-slow" />
        <div className="absolute inset-2 rounded-xl border border-cyan-500/20" />
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div
            className="absolute left-0 right-0 h-0.5 animate-scan"
            style={{
              background: "linear-gradient(90deg, transparent, #00c6ff, transparent)",
              top: "50%",
            }}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon name="Search" size={22} className="text-cyan-400" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-white/70 text-sm font-medium">Сканирую маркетплейсы</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          {["Ozon", "WB", "Яндекс"].map((name, i) => (
            <span
              key={name}
              className="text-xs text-white/35 animate-pulse-slow"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = ["iPhone 15", "AirPods Pro", "Samsung TV", "Dyson V15"];

function EmptyState({ onTagClick }: { onTagClick: (tag: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center animate-float">
        <span className="text-2xl">🔍</span>
      </div>
      <div className="text-center">
        <p className="text-white/50 text-sm">Введите название товара</p>
        <p className="text-white/25 text-xs mt-1">Найдём лучшую цену за секунды</p>
      </div>
      <div className="flex gap-2 mt-2 flex-wrap justify-center">
        {SUGGESTIONS.map((tag) => (
          <button
            key={tag}
            onClick={() => onTagClick(tag)}
            className="text-xs px-2.5 py-1 rounded-full glass border border-white/8 text-white/40 cursor-pointer hover:text-white/70 hover:border-white/20 transition-all"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Index() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<MarketResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = (q: string) => {
    if (!q.trim()) return;
    setIsSearching(true);
    setResults(null);
    setHasSearched(true);
    setTimeout(() => {
      setIsSearching(false);
      setResults(MOCK_RESULTS);
    }, 2000);
  };

  const handleSearch = () => doSearch(query);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    doSearch(tag);
  };

  const sortedResults = results
    ? [...results].sort((a, b) => (a.price ?? 999999) - (b.price ?? 999999))
    : null;

  const bestPrice = sortedResults?.[0]?.price;

  const maxPrice = sortedResults
    ? Math.max(...sortedResults.map((r) => r.price ?? 0))
    : 0;

  const saving = bestPrice && maxPrice ? maxPrice - bestPrice : 0;

  return (
    <div className="mesh-bg min-h-screen flex items-start justify-center py-6 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="animate-fade-in-up stagger-1 mb-5 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #00c6ff, #9b59f7)" }}
            >
              <Icon name="Zap" size={14} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              PriceHunter
            </span>
          </div>
          <p className="text-white/40 text-xs">Минимальная цена на маркетплейсах</p>
        </div>

        {/* Search input */}
        <div className="glass search-glow rounded-2xl flex items-center gap-2 px-3 py-2.5 mb-4 transition-all duration-300 animate-fade-in-up stagger-2">
          <Icon name="Search" size={16} className="text-white/35 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Название товара..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults(null);
                setHasSearched(false);
              }}
              className="text-white/25 hover:text-white/60 transition-colors"
            >
              <Icon name="X" size={14} />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-40 text-white"
            style={{
              background: "linear-gradient(135deg, #00c6ff, #9b59f7)",
              boxShadow: query.trim() ? "0 0 20px rgba(0,180,255,0.3)" : "none",
            }}
          >
            Найти
          </button>
        </div>

        {/* Content */}
        <div className="space-y-2">
          {isSearching && <ScanningAnimation />}

          {!isSearching && !hasSearched && (
            <EmptyState onTagClick={handleTagClick} />
          )}

          {!isSearching && sortedResults && (
            <>
              <div className="flex items-center justify-between mb-3 animate-fade-in-up stagger-3">
                <p className="text-xs text-white/40">
                  Найдено:{" "}
                  <span className="text-white/70 font-medium">
                    {sortedResults.length} магазина
                  </span>
                </p>
                {bestPrice && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-white/40">Мин.:</span>
                    <span className="text-xs font-bold font-mono-price text-emerald-400">
                      {formatPrice(bestPrice)} ₽
                    </span>
                  </div>
                )}
              </div>

              {sortedResults.map((result, i) => (
                <MarketCard
                  key={result.id}
                  result={result}
                  isBest={result.price === bestPrice}
                  index={i}
                />
              ))}

              {saving > 0 && (
                <div className="pt-2 animate-fade-in-up stagger-5">
                  <div className="glass rounded-2xl p-3 flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #00c6ff22, #9b59f722)",
                        border: "1px solid rgba(0,180,255,0.2)",
                      }}
                    >
                      <Icon name="TrendingDown" size={14} className="text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white/80">
                        Экономия{" "}
                        <span className="text-emerald-400 font-mono-price">
                          {formatPrice(saving)} ₽
                        </span>
                      </p>
                      <p className="text-xs text-white/35">
                        по сравнению с самой дорогой ценой
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-center gap-4 animate-fade-in-up stagger-4">
          {[
            { name: "Ozon", color: "#0069FF" },
            { name: "WB", color: "#9633E0" },
            { name: "ЯМ", color: "#FFB300" },
          ].map((m) => (
            <div key={m.name} className="flex items-center gap-1.5 opacity-30">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: m.color }}
              />
              <span className="text-xs text-white/60">{m.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
