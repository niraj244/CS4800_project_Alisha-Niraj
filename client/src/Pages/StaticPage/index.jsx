import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';

const PAGES = {
  privacy: {
    title: 'Privacy Policy',
    url: '/privacy',
    sections: [
      { heading: 'What we collect', body: 'We collect your name, email, shipping address, and order history when you place an order or create an account. We also collect usage data (page views, clicks) via anonymous analytics.' },
      { heading: 'How we use it', body: 'Your data is used to fulfil orders, send order confirmations, process returns, and improve our website. We do not sell your data to third parties.' },
      { heading: 'Payments', body: 'Payment processing is handled by eSewa and Khalti. We never store your payment credentials on our servers.' },
      { heading: 'Cookies', body: 'We use essential session cookies and optional analytics cookies. You can disable non-essential cookies in your browser settings.' },
      { heading: 'Your rights', body: 'You can request deletion of your account and data at any time by emailing hello@vibefit.com.np.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    url: '/terms',
    sections: [
      { heading: 'Acceptance', body: 'By using VibeFit you agree to these terms. If you do not agree, please do not use the site.' },
      { heading: 'Products & pricing', body: 'All prices are in Nepalese Rupees (NPR). We reserve the right to update prices, discontinue products, or correct errors without prior notice.' },
      { heading: 'Orders', body: 'An order confirmation email does not constitute acceptance. We reserve the right to cancel orders in cases of stock error, pricing error, or suspected fraud.' },
      { heading: 'Returns', body: 'Returns are accepted within 30 days of delivery on unworn, unwashed items with original tags attached. See our Returns page for details.' },
      { heading: 'Limitation of liability', body: 'VibeFit is not liable for indirect, incidental, or consequential damages arising from use of the site or products beyond the value of the order.' },
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    url: '/returns',
    sections: [
      { heading: '30-day returns', body: 'You can return most items within 30 days of delivery — no questions asked. Items must be unworn, unwashed, and in original condition with tags attached.' },
      { heading: 'How to return', body: 'Email hello@vibefit.com.np with your order number and reason. We will send you a return address. Once received and inspected, we process refunds within 3–5 business days.' },
      { heading: 'Refund method', body: 'Refunds are returned to the original payment method (eSewa wallet or Khalti wallet). Cash/bank transfer refunds may take 5–7 business days.' },
      { heading: 'Exchanges', body: 'We offer free size exchanges on all full-price items. Contact us before sending back the item.' },
      { heading: 'Non-returnable items', body: 'Sale items marked "Final Sale", underwear, and customised/personalised items cannot be returned.' },
    ],
  },
};

export default function StaticPage({ page }) {
  const content = PAGES[page];
  if (!content) return null;

  return (
    <>
      <SEO title={`${content.title} — VibeFit`} description="" url={content.url} />

      <div className="container py-16 max-w-2xl">
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <span>/</span>
          <span className="text-text-primary font-medium">{content.title}</span>
        </div>

        <h1 className="font-display font-bold text-4xl mb-10">{content.title}</h1>

        <div className="space-y-8">
          {content.sections.map(({ heading, body }) => (
            <div key={heading}>
              <h2 className="font-bold text-lg mb-2">{heading}</h2>
              <p className="text-text-muted leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border text-sm text-text-muted">
          Questions? <a href="mailto:hello@vibefit.com.np" className="text-accent hover:underline">hello@vibefit.com.np</a>
        </div>
      </div>
    </>
  );
}
