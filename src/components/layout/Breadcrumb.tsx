import Link from 'next/link';

interface BreadcrumbProps {
  title: string;
  items: { label: string; href?: string }[];
}

export default function Breadcrumb({ title, items }: BreadcrumbProps) {
  return (
    <div
      className="relative text-center text-white py-32 bg-cover bg-center z-[1]"
      style={{
        background: 'linear-gradient(135deg, #040836 0%, #1273eb 100%)',
      }}
    >
      <div className="absolute inset-0 bg-dark/50 z-[-1]"></div>
      <div className="container mx-auto max-w-container px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-white mb-4">
          {title}
        </h1>
        <ul className="flex items-center justify-center gap-2 text-sm">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              {index > 0 && <i className="fas fa-angle-right text-primary"></i>}
              {item.href ? (
                <Link href={item.href} className="text-gray-300 hover:text-white transition-colors">
                  {index === 0 && <i className="fas fa-home mr-1"></i>}
                  {item.label}
                </Link>
              ) : (
                <span className="text-primary">{item.label}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
