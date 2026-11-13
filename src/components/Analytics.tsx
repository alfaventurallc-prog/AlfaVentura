import Script from "next/script";

// Google Analytics 4 and Microsoft Clarity (both free). Nothing loads until
// the IDs are set in Vercel: NEXT_PUBLIC_GA_ID ("G-XXXXXXX") and
// NEXT_PUBLIC_CLARITY_ID. Scripts load after the page is interactive so
// they don't slow down the first paint.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

const Analytics = () => (
  <>
    {GA_ID && (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(GA_ID)});`}
        </Script>
      </>
    )}
    {CLARITY_ID && (
      <Script id="clarity" strategy="lazyOnload">
        {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(CLARITY_ID)});`}
      </Script>
    )}
  </>
);

export default Analytics;

/** Records a submitted lead form as a GA4 "generate_lead" conversion (no-op
 * when analytics isn't configured). */
export const trackLead = (kind: string) => {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  w.gtag?.("event", "generate_lead", { lead_type: kind, page_path: window.location.pathname });
};
