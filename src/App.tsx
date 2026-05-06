import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/toast';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import HomePage from '@/app/page';

const JsonCsvPage = lazy(() => import('@/converters/json-csv/page'));
const Base64Page = lazy(() => import('@/converters/base64/page'));
const CryptoPage = lazy(() => import('@/converters/crypto/page'));
const ColorPage = lazy(() => import('@/converters/color/page'));
const JsonFormatterPage = lazy(() => import('@/converters/json-formatter/page'));
const MarkdownPage = lazy(() => import('@/converters/markdown/page'));
const UrlPage = lazy(() => import('@/converters/url/page'));
const TimestampPage = lazy(() => import('@/converters/timestamp/page'));
const YamlJsonPage = lazy(() => import('@/converters/yaml-json/page'));
const XmlJsonPage = lazy(() => import('@/converters/xml-json/page'));
const HexViewerPage = lazy(() => import('@/converters/hex-viewer/page'));
const JwtPage = lazy(() => import('@/converters/jwt/page'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--muted-foreground)] text-sm">加载中...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
          <Header />
          <main className="flex-1">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/json-csv" element={<JsonCsvPage />} />
                <Route path="/base64" element={<Base64Page />} />
                <Route path="/crypto" element={<CryptoPage />} />
                <Route path="/color" element={<ColorPage />} />
                <Route path="/json-formatter" element={<JsonFormatterPage />} />
                <Route path="/markdown" element={<MarkdownPage />} />
                <Route path="/url" element={<UrlPage />} />
                <Route path="/timestamp" element={<TimestampPage />} />
                <Route path="/yaml-json" element={<YamlJsonPage />} />
                <Route path="/xml-json" element={<XmlJsonPage />} />
                <Route path="/hex-viewer" element={<HexViewerPage />} />
                <Route path="/jwt" element={<JwtPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--primary)]">404</h1>
        <p className="mt-4 text-[var(--muted-foreground)]">页面未找到</p>
        <a
          href="/"
          className="mt-6 inline-block px-6 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:opacity-90 transition-opacity"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}

export default App;
