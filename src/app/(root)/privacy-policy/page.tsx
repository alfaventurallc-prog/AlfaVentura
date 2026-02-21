import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy – Alfa Ventura</title>
        <meta
          name="description"
          content="Privacy Policy for Alfa Ventura"
        />
      </Head>

      {/* Full-height light background */}
      <div className="min-h-screen bg-gray-100 py-16">
        {/* Centered container with generous padding */}
        <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-12">
          {/* Header */}
          <header className="pb-8 border-b border-gray-200">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-3">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Effective Date: <span className="font-medium">July 3, 2025</span>
            </p>
          </header>

          {/* Table of Contents */}
          <nav className="mt-10 mb-12 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Contents</h2>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-indigo-600">
              {[
                ["introduction", "1. Introduction"],
                ["information", "2. Information We Collect"],
                ["use", "3. How We Use Your Information"],
                ["cookies", "4. Cookies & Tracking"],
                ["third-party", "5. Third-Party Sharing"],
                ["rights", "6. Your Rights"],
                ["contact", "7. Contact Us"],
              ].map(([id, label]) => (
                <li key={id}>
                  <Link
                    href={`#${id}`}
                    className="hover:underline"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Main Content */}
          <article className="space-y-16">
            {/* Section */}
            <section
              id="introduction"
              className="space-y-4"
            >
              <h2 className="text-2xl font-semibold text-gray-800">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Alfa Ventura (“we”, “us”, or “our”) is committed to protecting your privacy. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you visit our website.
              </p>
              <p></p>
            </section>

            <section
              id="information"
              className="space-y-4"
            >
              <h2 className="text-2xl font-semibold text-gray-800">2. Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <strong>Personal Data:</strong> name, email address, phone number, etc.
                </li>
                <li>
                  <strong>Usage Data:</strong> pages visited, time on site, cookies, browser type.
                </li>
                <li>
                  <strong>Device Data:</strong> IP address, operating system, device identifiers.
                </li>
              </ul>
              <p></p>
            </section>

            <section
              id="use"
              className="space-y-4"
            >
              <h2 className="text-2xl font-semibold text-gray-800">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed">We use your information to:</p>
              <ul className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Provide, maintain, and improve our services.</li>
                <li>Personalize your experience on our site.</li>
                <li>Communicate with you about updates, offers, and support.</li>
                <li>Comply with legal obligations and protect our rights.</li>
              </ul>
              <p></p>
            </section>

            <section
              id="cookies"
              className="space-y-4"
            >
              <h2 className="text-2xl font-semibold text-gray-800">4. Cookies &amp; Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to recognize you, track activity on our site, and store preferences. You
                can control cookies via your browser settings.
              </p>
              <p></p>
            </section>

            <section
              id="third-party"
              className="space-y-4"
            >
              <h2 className="text-2xl font-semibold text-gray-800">5. Third-Party Sharing</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Service providers who perform functions on our behalf.</li>
                <li>Affiliates and business partners.</li>
                <li>Law enforcement or regulators when required by law.</li>
              </ul>
              <p></p>
            </section>

            <section
              id="rights"
              className="space-y-4"
            >
              <h2 className="text-2xl font-semibold text-gray-800">6. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to access, correct, or delete your personal data, and to withdraw consent at any time. To
                exercise these rights, email us at{" "}
                <Link
                  href="mailto:info@alfa-ventura.com"
                  className="text-indigo-600 hover:underline"
                >
                  info@alfa-ventura.com
                </Link>
                .
              </p>
              <p></p>
            </section>

            <section
              id="contact"
              className="space-y-4"
            >
              <h2 className="text-2xl font-semibold text-gray-800">7. Contact Us</h2>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Email:</strong>{" "}
                  <Link
                    href="mailto:info@alfa-ventura.com"
                    className="text-indigo-600 hover:underline"
                  >
                    info@alfa-ventura.com
                  </Link>
                </li>
                <li>
                  <strong>Address:</strong> 1209 Mountain Road Place NE, STE N, Albuquerque, NM 87110, USA
                </li>
              </ul>
            </section>
          </article>
        </div>
      </div>
    </>
  );
}
