import VenuePageClient from './venue-page-client';

// Generate static params for all demo venues
export function generateStaticParams() {
  return [
    { slug: 'nusr-et-steakhouse' },
    { slug: 'karakoy-gulluoglu' },
    { slug: 'mikla-restaurant' },
    { slug: 'kronotrop-coffee' },
    { slug: 'ciya-sofrasi' },
    { slug: 'big-chefs-zorlu' },
    { slug: 'sunset-grill-bar' },
    { slug: 'karakoy-lokantasi' },
    { slug: 'burger-king-taksim' },
    { slug: 'starbucks-bebek' },
    { slug: 'balikci-sabahattin' },
    { slug: 'hayvore-asmalimescit' },
    { slug: 'istanbul-modern-cafe' },
    { slug: 'gram' },
    { slug: 'privato-cafe' },
  ];
}

export default function VenuePage() {
  return <VenuePageClient />;
}
