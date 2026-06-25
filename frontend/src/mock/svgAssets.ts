// SVG Clothing Asset Generator
// Returns a unique, themed SVG data URL based on category, color, name, and tags.

export function getClothingSvgDataUrl(
  categoryKey: string,
  colorHex: string,
  name: string,
  tags: string[]
): string {
  const strokeColor = '#1e293b'; // Sleek dark charcoal stroke
  const strokeWidth = '3';
  const lowercaseName = name.toLowerCase();
  const lowercaseTags = tags.map(t => t.toLowerCase());

  let svgContent = '';

  switch (categoryKey) {
    case 'short_sleeve_top':
      // T-Shirt with short sleeves
      svgContent = `
        <path d="M 20,28 L 36,16 C 40,18 44,19 50,19 C 56,19 60,18 64,16 L 80,28 L 71,40 L 65,35 L 65,84 L 35,84 L 35,35 L 29,40 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
      `;
      // Decals based on name/tags
      if (lowercaseName.includes('unicorn') || lowercaseTags.includes('unicorn print')) {
        // Draw unicorn decal
        svgContent += `
          <path d="M 50,38 L 47,48 L 53,48 Z" fill="#fef08a" stroke="${strokeColor}" stroke-width="1.5" />
          <circle cx="45" cy="52" r="1.5" fill="${strokeColor}" />
          <circle cx="55" cy="52" r="1.5" fill="${strokeColor}" />
          <path d="M 43,56 C 45,58 55,58 57,56" stroke="${strokeColor}" stroke-width="1.5" stroke-linecap="round" fill="none" />
          <path d="M 38,46 C 40,43 45,43 45,46" stroke="#f472b6" stroke-width="2" fill="none" />
          <path d="M 62,46 C 60,43 55,43 55,46" stroke="#f472b6" stroke-width="2" fill="none" />
        `;
      } else if (lowercaseName.includes('soccer') || lowercaseName.includes('jersey') || lowercaseTags.includes('soccer theme')) {
        // Soccer jersey design
        svgContent += `
          <line x1="50" y1="20" x2="50" y2="84" stroke="#ffffff" stroke-width="4" />
          <circle cx="50" cy="52" r="12" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.5" />
          <polygon points="50,44 55,48 53,54 47,54 45,48" fill="${strokeColor}" />
          <line x1="50" y1="44" x2="50" y2="40" stroke="${strokeColor}" stroke-width="1" />
          <line x1="55" y1="48" x2="59" y2="47" stroke="${strokeColor}" stroke-width="1" />
          <line x1="53" y1="54" x2="56" y2="58" stroke="${strokeColor}" stroke-width="1" />
          <line x1="47" y1="54" x2="44" y2="58" stroke="${strokeColor}" stroke-width="1" />
          <line x1="45" y1="48" x2="41" y2="47" stroke="${strokeColor}" stroke-width="1" />
        `;
      } else if (lowercaseName.includes('spirit') || lowercaseTags.includes('school-spirit')) {
        // School spirit star/badge
        svgContent += `
          <polygon points="50,42 53,49 60,49 55,54 57,61 50,57 43,61 45,54 40,49 47,49" fill="#f59e0b" stroke="${strokeColor}" stroke-width="1.5" stroke-linejoin="round" />
          <text x="50" y="34" font-size="7" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="sans-serif">SPIRIT</text>
        `;
      } else if (lowercaseName.includes('butterfly') || lowercaseTags.includes('graphic print')) {
        // Butterfly print
        svgContent += `
          <path d="M 44,46 C 40,40 40,52 45,50 C 40,54 42,58 46,54 C 47,54 47,48 44,46 Z" fill="#f472b6" stroke="${strokeColor}" stroke-width="1" />
          <path d="M 56,46 C 60,40 60,52 55,50 C 60,54 58,58 54,54 C 53,54 53,48 56,46 Z" fill="#f472b6" stroke="${strokeColor}" stroke-width="1" />
          <line x1="50" y1="44" x2="50" y2="56" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />
        `;
      } else {
        // Simple pocket tee
        svgContent += `
          <rect x="53" y="36" width="10" height="11" rx="1" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
          <line x1="53" y1="36" x2="63" y2="36" stroke="${strokeColor}" stroke-width="1.5" />
        `;
      }
      break;

    case 'long_sleeve_top':
      // T-Shirt with long sleeves
      svgContent = `
        <path d="M 22,26 L 36,16 C 40,18 44,19 50,19 C 56,19 60,18 64,16 L 78,26 L 68,60 L 64,58 L 64,84 L 36,84 L 36,58 L 32,60 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <line x1="36" y1="26" x2="36" y2="84" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="2 2" />
        <line x1="64" y1="26" x2="64" y2="84" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="2 2" />
      `;
      // Stripe patterns for styling
      if (lowercaseName.includes('lace') || lowercaseTags.includes('formal wear')) {
        // Draw elegant collar & lace details
        svgContent += `
          <path d="M 40,18 C 42,24 58,24 60,18" fill="none" stroke="#f8fafc" stroke-width="2" />
          <circle cx="50" cy="30" r="2" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />
          <circle cx="50" cy="40" r="2" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />
          <path d="M 23,28 C 25,32 30,30 32,34" fill="none" stroke="#ffffff" stroke-width="1" />
          <path d="M 77,28 C 75,32 70,30 68,34" fill="none" stroke="#ffffff" stroke-width="1" />
        `;
      } else {
        // Cool stripes on sleeves
        svgContent += `
          <line x1="24" y1="36" x2="30" y2="34" stroke="#ffffff" stroke-width="2" />
          <line x1="26" y1="44" x2="32" y2="42" stroke="#ffffff" stroke-width="2" />
          <line x1="76" y1="36" x2="70" y2="34" stroke="#ffffff" stroke-width="2" />
          <line x1="74" y1="44" x2="68" y2="42" stroke="#ffffff" stroke-width="2" />
        `;
      }
      break;

    case 'sweater_hoodie':
      // Hoodie with pocket and hood
      svgContent = `
        <path d="M 22,28 L 34,18 C 36,12 40,8 50,8 C 60,8 64,12 66,18 L 78,28 L 69,56 L 63,54 L 63,82 L 37,82 L 37,54 L 31,56 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <path d="M 37,16 C 39,22 43,24 50,24 C 57,24 61,22 63,16" fill="none" stroke="${strokeColor}" stroke-width="2" />
        <path d="M 40,54 L 60,54 L 57,70 L 43,70 Z" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round" />
        <line x1="47" y1="24" x2="45" y2="36" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" />
        <line x1="53" y1="24" x2="55" y2="36" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" />
      `;
      // Fleece/fuzzy styling
      if (lowercaseTags.includes('fuzzy warm') || lowercaseName.includes('fuzzy')) {
        svgContent += `
          <circle cx="50" cy="40" r="1.5" fill="#ffffff" opacity="0.7" />
          <circle cx="42" cy="45" r="1.5" fill="#ffffff" opacity="0.7" />
          <circle cx="58" cy="45" r="1.5" fill="#ffffff" opacity="0.7" />
        `;
      }
      break;

    case 'jacket_coat':
      // Jacket/coat with zipper and collar
      svgContent = `
        <path d="M 20,28 L 35,16 C 37,17 42,18 50,18 C 58,18 63,17 65,16 L 80,28 L 71,58 L 65,56 L 65,84 L 35,84 L 35,56 L 29,58 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <line x1="50" y1="18" x2="50" y2="84" stroke="${strokeColor}" stroke-width="3" stroke-linecap="round" />
        <path d="M 35,16 L 45,28" stroke="${strokeColor}" stroke-width="2.5" />
        <path d="M 65,16 L 55,28" stroke="${strokeColor}" stroke-width="2.5" />
        <rect x="48" y="32" width="4" height="6" rx="1" fill="#94a3b8" stroke="${strokeColor}" stroke-width="1" />
      `;
      if (lowercaseTags.includes('puffy insulation') || lowercaseName.includes('puffy')) {
        // Puffy horizontal stitch lines
        svgContent += `
          <path d="M 35,40 Q 50,43 65,40" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="0.6" />
          <path d="M 35,54 Q 50,57 65,54" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="0.6" />
          <path d="M 35,68 Q 50,71 65,68" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="0.6" />
        `;
      }
      break;

    case 'leggings':
      // Tight leggings
      svgContent = `
        <path d="M 33,14 L 67,14 L 71,84 L 54,84 L 50,36 L 46,84 L 29,84 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <line x1="33" y1="20" x2="67" y2="20" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3 2" />
      `;
      // Glitter or stars for Emma
      if (lowercaseName.includes('heart') || lowercaseTags.includes('stretchy')) {
        svgContent += `
          <path d="M 35,40 C 33,37 38,34 38,37 C 38,34 43,37 41,40 L 38,43 Z" fill="#f472b6" />
          <path d="M 65,50 C 63,47 68,44 68,47 C 68,44 73,47 71,50 L 68,53 Z" fill="#f472b6" />
        `;
      }
      break;

    case 'jeans':
      // Jeans outline with pockets and button
      svgContent = `
        <path d="M 30,14 L 70,14 L 75,84 L 54,84 L 50,38 L 46,84 L 25,84 Z" fill="${colorHex === '#475569' ? '#3b82f6' : colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <path d="M 30,22 C 38,24 62,24 70,22" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <circle cx="50" cy="18" r="3" fill="#f59e0b" stroke="${strokeColor}" stroke-width="1" />
        <path d="M 50,22 L 50,32 A 4,4 0 0,0 54,36" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <path d="M 32,22 C 34,28 42,28 44,22" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
        <path d="M 68,22 C 66,28 58,28 56,22" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
      `;
      break;

    case 'skirt':
      // Flared skirt
      svgContent = `
        <path d="M 36,20 L 64,20 L 84,72 C 84,72 50,78 16,72 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <path d="M 36,25 Q 50,27 64,25" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
      `;
      // Star patterns for Emma, stripes for others
      if (lowercaseName.includes('star') || lowercaseName.includes('pink')) {
        svgContent += `
          <polygon points="32,45 34,50 39,50 35,53 37,58 32,55 27,58 29,53 25,50 30,50" fill="#fef08a" />
          <polygon points="50,38 52,43 57,43 53,46 55,51 50,48 45,51 47,46 43,43 48,43" fill="#fef08a" />
          <polygon points="68,48 70,53 75,53 71,56 73,61 68,58 63,61 65,56 61,53 66,53" fill="#fef08a" />
        `;
      } else {
        // Elegant pleats
        svgContent += `
          <line x1="42" y1="26" x2="30" y2="71" stroke="${strokeColor}" stroke-width="1.5" opacity="0.4" />
          <line x1="50" y1="27" x2="50" y2="74" stroke="${strokeColor}" stroke-width="1.5" opacity="0.4" />
          <line x1="58" y1="26" x2="70" y2="71" stroke="${strokeColor}" stroke-width="1.5" opacity="0.4" />
        `;
      }
      break;

    case 'shorts':
      // Shorts
      svgContent = `
        <path d="M 30,16 L 70,16 L 76,56 L 53,56 L 50,34 L 47,56 L 24,56 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <line x1="30" y1="24" x2="70" y2="24" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 2" />
      `;
      // Side stripes for sporty shorts
      if (lowercaseName.includes('soccer') || lowercaseTags.includes('sporty styles')) {
        svgContent += `
          <path d="M 27,24 L 29,54" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
          <path d="M 73,24 L 71,54" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
        `;
      }
      break;

    case 'dress':
      // Flowy dress
      svgContent = `
        <path d="M 34,16 L 42,16 L 42,32 L 20,74 C 20,74 50,80 80,74 L 58,32 L 58,16 L 66,16 L 70,30 L 61,35 L 64,74 C 64,74 50,76 36,74 L 39,35 L 30,30 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <path d="M 42,32 Q 50,35 58,32" fill="none" stroke="${strokeColor}" stroke-width="1.5" />
      `;
      // Decals for fancy dress
      if (lowercaseName.includes('unicorn') || lowercaseName.includes('fancy')) {
        svgContent += `
          <text x="50" y="27" font-size="12">🦄</text>
          <circle cx="34" cy="55" r="3.5" fill="#fdf2f8" />
          <circle cx="50" cy="58" r="4.5" fill="#fdf2f8" />
          <circle cx="66" cy="55" r="3.5" fill="#fdf2f8" />
        `;
      } else if (lowercaseTags.includes('sporty styles')) {
        // Sporty collar
        svgContent += `
          <path d="M 42,16 L 50,26 L 58,16" fill="none" stroke="#ffffff" stroke-width="2" />
          <circle cx="50" cy="30" r="1.5" fill="#ffffff" />
        `;
      }
      break;

    case 'sneakers':
      // Sneakers
      svgContent = `
        <path d="M 12,65 L 35,34 L 60,34 L 88,58 L 90,76 L 12,76 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <path d="M 10,76 L 92,76 L 90,82 L 12,82 Z" fill="#ffffff" stroke="${strokeColor}" stroke-width="2.5" />
        <line x1="38" y1="42" x2="48" y2="52" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <line x1="43" y1="38" x2="53" y2="48" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <circle cx="76" cy="62" r="5" fill="#ffffff" opacity="0.7" />
      `;
      if (lowercaseName.includes('light-up')) {
        // Sparkle stars
        svgContent += `
          <polygon points="18,79 20,81 22,79 20,77" fill="#f59e0b" />
          <polygon points="34,79 36,81 38,79 36,77" fill="#38bdf8" />
          <polygon points="50,79 52,81 54,79 52,77" fill="#22c55e" />
        `;
      }
      break;

    case 'boots':
      // Winter boots
      svgContent = `
        <path d="M 28,24 L 58,24 L 58,52 L 85,58 L 85,78 L 22,78 L 22,46 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <rect x="20" y="78" width="67" height="6" rx="2" fill="#475569" stroke="${strokeColor}" stroke-width="1.5" />
        <rect x="24" y="16" width="38" height="10" rx="4" fill="#f8fafc" stroke="${strokeColor}" stroke-width="2" />
        <path d="M 40,36 L 50,36" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
        <path d="M 40,46 L 50,46" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
      `;
      break;

    case 'ballet_flats':
      // Ballet flats
      svgContent = `
        <path d="M 12,68 C 12,68 18,50 32,46 C 46,42 66,42 80,50 C 88,54 90,68 90,74 L 12,74 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <path d="M 10,74 L 92,74 L 91,78 L 11,78 Z" fill="#94a3b8" stroke="${strokeColor}" stroke-width="1.5" />
        <circle cx="50" cy="46" r="3.5" fill="#fda4af" stroke="${strokeColor}" stroke-width="1" />
        <path d="M 48,46 Q 50,40 52,46" fill="none" stroke="${strokeColor}" stroke-width="1" />
      `;
      break;

    case 'rain_boots':
      // Tall rain boots
      svgContent = `
        <path d="M 28,16 L 52,16 L 52,50 L 82,56 L 82,78 L 22,78 L 22,40 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
        <rect x="20" y="78" width="64" height="6" rx="2" fill="#334155" stroke="${strokeColor}" stroke-width="1.5" />
        <line x1="28" y1="24" x2="52" y2="24" stroke="#ffffff" stroke-width="2" />
      `;
      // Raindrops decal
      svgContent += `
        <path d="M 34,36 A 2,3 0 0,0 38,36 Q 36,30 36,36 Z" fill="#38bdf8" />
        <path d="M 44,44 A 2,3 0 0,0 48,44 Q 46,38 46,44 Z" fill="#38bdf8" />
      `;
      break;

    case 'accessory':
      if (lowercaseName.includes('headband') || lowercaseName.includes('crown')) {
        // Crown/headband
        svgContent = `
          <path d="M 20,68 A 32,32 0 0,1 80,68" fill="none" stroke="${colorHex}" stroke-width="6" stroke-linecap="round" />
          <polygon points="50,14 41,38 59,38" fill="#fbbf24" stroke="${strokeColor}" stroke-width="2" stroke-linejoin="round" />
          <circle cx="50" cy="12" r="3" fill="#ef4444" />
          <circle cx="36" cy="45" r="6" fill="#f472b6" stroke="${strokeColor}" stroke-width="1.5" />
          <circle cx="64" cy="45" r="6" fill="#c084fc" stroke="${strokeColor}" stroke-width="1.5" />
        `;
      } else if (lowercaseName.includes('cap') || lowercaseName.includes('hat')) {
        // Sporty cap
        svgContent = `
          <path d="M 25,60 C 25,30 75,30 75,60 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
          <path d="M 72,55 C 80,55 88,58 92,64 L 72,64 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
          <circle cx="50" cy="30" r="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.5" />
        `;
        if (lowercaseName.includes('dinosaur')) {
          // Dinosaur spikes
          svgContent += `
            <polygon points="35,32 32,24 40,28" fill="#10b981" />
            <polygon points="50,28 50,18 56,24" fill="#10b981" />
            <polygon points="65,32 68,24 60,28" fill="#10b981" />
          `;
        }
      } else if (lowercaseName.includes('scarf')) {
        // Winter scarf
        svgContent = `
          <path d="M 30,30 C 30,30 40,42 50,42 C 60,42 70,30 70,30 C 70,30 74,48 50,48 C 26,48 30,30 30,30 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
          <path d="M 60,44 L 64,80 L 74,80 L 68,44 Z" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linejoin="round" />
          <line x1="64" y1="80" x2="64" y2="84" stroke="${strokeColor}" stroke-width="1.5" />
          <line x1="68" y1="80" x2="68" y2="84" stroke="${strokeColor}" stroke-width="1.5" />
          <line x1="72" y1="80" x2="72" y2="84" stroke="${strokeColor}" stroke-width="1.5" />
        `;
      } else {
        // Sweatband / wristbands
        svgContent = `
          <rect x="25" y="38" width="50" height="24" rx="6" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
          <circle cx="50" cy="50" r="7" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.5" />
        `;
        if (lowercaseName.includes('soccer') || lowercaseName.includes('sporty')) {
          svgContent += `
            <polygon points="50,46 53,49 52,53 48,53 47,49" fill="${strokeColor}" />
          `;
        }
      }
      break;

    default:
      svgContent = `<circle cx="50" cy="50" r="40" fill="${colorHex}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  }

  const fullSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.15" />
        </filter>
      </defs>
      <g filter="url(#shadow)">
        ${svgContent}
      </g>
    </svg>
  `.trim();

  // Convert to clean, compact UTF-8 SVG data URL
  // SVG strings are safe to include in data URLs if we encode them properly.
  return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
}
