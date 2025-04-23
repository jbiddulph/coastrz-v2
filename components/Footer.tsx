import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Shop',
      links: [
        { name: 'All Products', href: '/products' },
        // { name: 'New Arrivals', href: '/products?sort=new' },
        // { name: 'Featured', href: '/products?sort=featured' },
        // { name: 'Sale', href: '/products?sort=sale' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Contact', href: '/contact' },
        // { name: 'Careers', href: '/careers' },
        // { name: 'Press', href: '/press' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'Shipping', href: '/shipping' },
        { name: 'Returns', href: '/returns' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Size Guide', href: '/size-guide' },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div className="space-y-4">
            <Link href="/" className="text-xl font-bold text-primary flex items-center">
              <span className="text-2xl mr-2">🛍️</span> Shop
            </Link>
            <p className="text-secondary-light text-sm">
              Your one-stop shop for quality products at great prices.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary hover:text-primary">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-primary">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-primary">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-primary">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-secondary-light hover:text-primary text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-secondary-light text-sm">
            © {currentYear} Cissie Ednas Fancies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
} 