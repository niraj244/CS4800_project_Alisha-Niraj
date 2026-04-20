import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://vibefit.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/banner1.webp`;

export default function SEO({ title, description, url = '/', image, type = 'website', children }) {
  const fullUrl = `${SITE_URL}${url}`;
  const ogImage = image || DEFAULT_IMAGE;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={fullUrl} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:type"        content={type} />

      {/* Twitter */}
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {children}
    </Helmet>
  );
}
