import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pentamaths - Premium Mathematics Tuition in Singapore",
  description: "Expert A Mathematics and H2 Mathematics tuition in Singapore",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Google reCAPTCHA Enterprise Script */}
        <script src="https://www.google.com/recaptcha/enterprise.js?render=6Ldq8NArAAAAADRscCMvQQuQN_uSSrPsHy1UEWy5"></script>

        {/* Google Analytics (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-R16YX7WVHV"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-R16YX7WVHV');

              // Google Ads Conversion Tracking - Only fires on successful form submission
              function gtag_report_conversion() {
                gtag('event', 'conversion', {
                  'send_to': 'AW-959614159/UZLgCPequZEYEM-ZyskD',
                  'value': 1.0,
                  'currency': 'SGD'
                });
                console.log('Conversion tracked: Contact form submission');
              }
            `,
          }}
        />

        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

              // Meta Pixel ID: 933156671448730
              fbq('init', '933156671448730');
              fbq('track', 'PageView');

              // Function to track form leads - call this on successful form submission
              function fbq_track_lead() {
                fbq('track', 'Lead');
                console.log('Meta Pixel: Lead tracked');
              }
            `,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{display: 'none'}}
               src="https://www.facebook.com/tr?id=933156671448730&ev=PageView&noscript=1" />
        </noscript>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
