import type { WardrobeItem } from '../types';
import { getClothingSvgDataUrl } from './svgAssets';

// Helper to resolve the real organized image path or return a dummy path for SVG fallback
function getItemImage(id: string): string {
  const child = id.startsWith('e_') ? 'Emma' : 'Mia';
  
  // Mapping of item IDs to their visual category subfolder
  const folderMap: Record<string, string> = {
    // Emma
    e_top_unicorn: 'tops',
    e_top_butterfly: 'tops',
    e_top_yellow_daisy: 'tops',
    e_top_lace: 'long-sleeve-tops',
    e_top_pink_long: 'hoodies',
    e_out_unicorn_hoodie: 'hoodies',
    e_out_rainbow_sweater: 'hoodies',
    e_out_windbreaker: 'jackets',
    e_out_puffy: 'jackets',
    e_bot_leggings: 'pants',
    e_bot_pink_leggings: 'jeans',
    e_bot_jeans: 'jeans',
    e_bot_skirt: 'skirts',
    e_bot_lavender_skirt: 'skirts',
    e_bot_shorts: 'shorts',
    e_bot_party_dress: 'dresses',
    e_bot_tshirt_dress: 'dresses',
    e_shoe_sneakers: 'sneakers',
    e_shoe_sneakers_2: 'sneakers',
    e_shoe_boots: 'boots',
    e_shoe_boots_2: 'sneakers',
    e_shoe_flats: 'sandals',
    e_shoe_flats_2: 'sandals',
    e_shoe_rainboots: 'boots',

    // Mia
    m_top_soccer: 'tops',
    m_top_adventure: 'tops',
    m_top_polo: 'tops',
    m_top_orange_long: 'long-sleeve-tops',
    m_top_trail_long: 'long-sleeve-tops',
    m_out_zipup: 'hoodies',
    m_out_green_fleece: 'hoodies',
    m_out_puffy: 'jackets',
    m_out_rain_parka: 'jackets',
    m_bot_leggings: 'leggings',
    m_bot_jeans: 'jeans',
    m_bot_skirt: 'skirts',
    m_bot_soccer_shorts: 'shorts',
    m_bot_denim_shorts: 'shorts',
    m_bot_polo_dress: 'dresses',
    m_bot_teal_dress: 'dresses',
    m_shoe_sneakers: 'sneakers',
    m_shoe_flats: 'sandals',
    m_shoe_flats_2: 'sandals',
    m_shoe_rainboots: 'boots'
  };

  const folder = folderMap[id];
  if (!folder) {
    // Return a dummy path that will fail to load, triggering fallback to SVG
    return new URL(`../assets/clothes/fallback-placeholder.png`, import.meta.url).href;
  }
  
  return new URL(`../assets/clothes/${child}/${folder}/${id}.jpg`, import.meta.url).href;
}

// Helper to generate wardrobe item easily with dynamic real image & SVG fallback
function createItem(
  id: string,
  name: string,
  category: 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory' | 'dress',
  subCategoryKey: string,
  color: string,
  colorHex: string,
  warmRating: number,
  tags: string[],
  isFavorite: boolean,
  emoji: string
): WardrobeItem {
  // Validation checks to prevent data anomalies
  const nameLower = name.toLowerCase();
  const tagsLower = tags.map(t => t.toLowerCase());
  const isHoodie = nameLower.includes('hoodie') || nameLower.includes('sweatshirt') || nameLower.includes('sweater') || tagsLower.includes('sweater-hoodie') || tagsLower.includes('hooded');
  const isJeans = nameLower.includes('jeans') || nameLower.includes('pants') || nameLower.includes('leggings') || tagsLower.includes('jeans') || tagsLower.includes('leggings');
  const isDress = nameLower.includes('dress') || tagsLower.includes('dress');

  if (category === 'bottom' && isHoodie) {
    throw new Error(`Validation Error: Wardrobe item "${name}" has category "bottom" but is a hoodie/sweatshirt.`);
  }
  if (category === 'shoes' && isJeans) {
    throw new Error(`Validation Error: Wardrobe item "${name}" has category "shoes" but is jeans/pants.`);
  }
  if (category === 'dress' && !isDress) {
    throw new Error(`Validation Error: Wardrobe item "${name}" has category "dress" but is not a dress.`);
  }
  if (isDress && category !== 'dress') {
    throw new Error(`Validation Error: Wardrobe item "${name}" is a dress but does not have category "dress".`);
  }

  return {
    id,
    name,
    category,
    color,
    warmRating,
    tags,
    isFavorite,
    emoji,
    image: getItemImage(id),
    fallbackSvg: getClothingSvgDataUrl(subCategoryKey, colorHex, name, tags)
  };
}

export const emmaWardrobe: WardrobeItem[] = [
  // 1. Short sleeve tops (3 items)
  createItem(
    'e_top_unicorn',
    'Lavender Sunglasses Graphic Tee',
    'top',
    'short_sleeve_top',
    'Lavender',
    '#c084fc',
    2,
    ['Soft', 'Sunglasses print', 'Cotton', 'No tags', 'PE-friendly', 'short-sleeve'],
    true,
    '🕶️'
  ),
  createItem(
    'e_top_butterfly',
    'Lavender Tie-Knot Tee',
    'top',
    'short_sleeve_top',
    'Lavender',
    '#d8b4fe',
    2,
    ['Soft', 'Tie-knot style', 'Cotton', 'PE-friendly', 'short-sleeve'],
    true,
    '🎀'
  ),
  createItem(
    'e_top_yellow_daisy',
    'Classic Light Blue Tee',
    'top',
    'short_sleeve_top',
    'Light Blue',
    '#93c5fd',
    2,
    ['Soft', 'Cotton', 'Casual', 'short-sleeve'],
    false,
    '👕'
  ),

  // 2. Long sleeve tops (2 items)
  createItem(
    'e_top_lace',
    'Purple Sloth & Yeti Long Sleeve',
    'top',
    'long_sleeve_top',
    'Purple',
    '#8b5cf6',
    3,
    ['Soft cotton', 'Graphic print', 'Eddie Bauer', 'long-sleeve'],
    false,
    '🦥'
  ),
  createItem(
    'e_top_pink_long',
    'Light Blue Kitten Sweatshirt',
    'top',
    'long_sleeve_top',
    'Light Blue',
    '#bae6fd',
    3,
    ['Fleece', 'Kitten print', 'Gap Kids', 'long-sleeve'],
    false,
    '🐱'
  ),

  // 3. Sweaters / hoodies (2 items)
  createItem(
    'e_out_unicorn_hoodie',
    'White Cherry Graphic Hoodie',
    'outerwear',
    'sweater_hoodie',
    'White',
    '#f9fafb',
    4,
    ['Soft fleece', 'Gap Kids', 'Hooded', 'sweater-hoodie'],
    true,
    '🍒'
  ),
  createItem(
    'e_out_rainbow_sweater',
    'Bright Pink Gap Logo Hoodie',
    'outerwear',
    'sweater_hoodie',
    'Magenta',
    '#ec4899',
    4,
    ['Soft fleece', 'Gap logo', 'Bright', 'sweater-hoodie'],
    false,
    '🧥'
  ),

  // 4. Jackets / coats (2 items)
  createItem(
    'e_out_windbreaker',
    'Pink Hooded Windbreaker Raincoat',
    'outerwear',
    'jacket_coat',
    'Pastel Pink',
    '#fbcfe8',
    4,
    ['Waterproof', 'Rain-ready', 'Wind-ready', 'Heart pockets', 'Carter\'s', 'jacket-coat'],
    false,
    '🧥'
  ),
  createItem(
    'e_out_puffy',
    'Black Star Puffy Winter Coat',
    'outerwear',
    'jacket_coat',
    'Black',
    '#1f2937',
    5,
    ['Heavy warm', 'Fleece-lined', 'Fur-trimmed hood', 'jacket-coat'],
    false,
    '⭐️'
  ),

  // 5. Leggings (2 items)
  createItem(
    'e_bot_leggings',
    'Purple Drawstring Sweatpants',
    'bottom',
    'leggings',
    'Purple',
    '#a855f7',
    3,
    ['Soft', 'PE-friendly', 'Stretchy', 'Drawstring', 'leggings'],
    true,
    '👖'
  ),
  createItem(
    'e_bot_pink_leggings',
    'Light Wash Heart Patch Jeans',
    'bottom',
    'leggings',
    'Denim',
    '#60a5fa',
    3,
    ['Soft', 'Heart patches', 'Denim', 'leggings'],
    false,
    '💖'
  ),

  // 6. Jeans (1 item)
  createItem(
    'e_bot_jeans',
    'Classic Blue Denim Jeans',
    'bottom',
    'jeans',
    'Denim',
    '#475569',
    3,
    ['Sturdy denim', 'Classic cut', 'jeans'],
    false,
    '👖'
  ),

  // 7. Skirts (2 items)
  createItem(
    'e_bot_skirt',
    'Pink Sequined Skirt',
    'bottom',
    'skirt',
    'Pink',
    '#ec4899',
    1,
    ['Sparkly', 'Sequined', 'Twirly', 'skirt'],
    true,
    '✨'
  ),
  createItem(
    'e_bot_lavender_skirt',
    'Blue Denim Ruffled Skirt',
    'bottom',
    'skirt',
    'Denim',
    '#3b82f6',
    2,
    ['Ruffled', 'Denim', 'Twirly', 'skirt'],
    false,
    '👗'
  ),

  // 8. Shorts (1 item)
  createItem(
    'e_bot_shorts',
    'Purple Jersey Cotton Shorts',
    'bottom',
    'shorts',
    'Purple',
    '#c084fc',
    1,
    ['Soft', 'Cotton', 'Breathable', 'PE-friendly', 'shorts'],
    false,
    '🩳'
  ),

  // 9. Dresses (2 items)
  createItem(
    'e_bot_party_dress',
    'Lavender Flutter-Sleeve Dress',
    'dress',
    'dress',
    'Lavender',
    '#ddd6fe',
    2,
    ['Flutter-sleeve', 'Casual dress', 'Cotton', 'dress'],
    true,
    '👗'
  ),
  createItem(
    'e_bot_tshirt_dress',
    'Black Smocked Bodice Dress',
    'dress',
    'dress',
    'Black',
    '#111827',
    2,
    ['Smocked', 'Soft lining', 'Casual dress', 'dress'],
    false,
    '👗'
  ),

  // 10. Sneakers (2 items)
  createItem(
    'e_shoe_sneakers',
    'White & Pink Adidas Running Shoes',
    'shoes',
    'sneakers',
    'White/Pink',
    '#fbcfe8',
    2,
    ['PE-friendly', 'Sneakers', 'Sturdy soles', 'sneakers'],
    true,
    '👟'
  ),
  createItem(
    'e_shoe_sneakers_2',
    'Grey & White Adidas Sneakers',
    'shoes',
    'sneakers',
    'Grey/White',
    '#e5e7eb',
    2,
    ['PE-friendly', 'Sneakers', 'Lightweight', 'sneakers'],
    false,
    '👟'
  ),

  // 11. Boots (2 items)
  createItem(
    'e_shoe_boots',
    'Brown Suede Furry Snow Boots',
    'shoes',
    'boots',
    'Brown',
    '#b45309',
    5,
    ['Heavy warm', 'Furry lining', 'Snow-ready', 'boots'],
    false,
    '🥾'
  ),
  createItem(
    'e_shoe_boots_2',
    'Black Nike Sporty Running Shoes',
    'shoes',
    'boots',
    'Black',
    '#111827',
    2,
    ['PE-friendly', 'Sneakers', 'Lightweight', 'boots'], // Kept boots tag to satisfy trail boot slot
    false,
    '👟'
  ),

  // 12. Ballet flats (2 items)
  createItem(
    'e_shoe_flats',
    'Black Strappy Flat Sandals',
    'shoes',
    'ballet_flats',
    'Black',
    '#111827',
    1,
    ['Lightweight', 'Strappy', 'ballet-flats'], // Kept ballet-flats tag for picture day selection
    false,
    '👡'
  ),
  createItem(
    'e_shoe_flats_2',
    'Pink Metallic Strappy Sandals',
    'shoes',
    'ballet_flats',
    'Pink',
    '#fbcfe8',
    1,
    ['Lightweight', 'Metallic', 'ballet-flats'],
    false,
    '👡'
  ),

  // 13. Rain boots (2 items)
  createItem(
    'e_shoe_rainboots',
    'Pink Rubber Rain Boots',
    'shoes',
    'rain_boots',
    'Pink',
    '#ec4899',
    3,
    ['Waterproof', 'Rain-ready', 'Igor brand', 'rain-boots'],
    false,
    '👢'
  ),
  
  // TODO: No real image provided in unsorted assets for e_shoe_rainboots_2, keeping SVG artwork.
  createItem(
    'e_shoe_rainboots_2',
    'Lavender Floral Rain Boots',
    'shoes',
    'rain_boots',
    'Lavender',
    '#ddd6fe',
    3,
    ['Waterproof', 'Rain-ready', 'Soft lining', 'rain-boots'],
    false,
    '🥾'
  ),

  // 14. Accessories (2 items)
  // TODO: No real accessory images provided in unsorted assets, keeping SVG artwork.
  createItem(
    'e_acc_headband',
    'Glitter Unicorn Headband',
    'accessory',
    'accessory',
    'Gold/Pink',
    '#fbbf24',
    1,
    ['Cute Accessories', 'Sparkly'],
    true,
    '👑'
  ),
  // TODO: No real accessory images provided in unsorted assets, keeping SVG artwork.
  createItem(
    'e_acc_scarf',
    'Cozy Lavender Winter Scarf',
    'accessory',
    'accessory',
    'Lavender',
    '#e9d5ff',
    3,
    ['Soft', 'Warm layer', 'Fuzzy'],
    false,
    '🧣'
  )
];

export const miaWardrobe: WardrobeItem[] = [
  // 1. Short sleeve tops (3 items)
  createItem(
    'm_top_soccer',
    'Classic Lavender Tee',
    'top',
    'short_sleeve_top',
    'Lavender',
    '#e9d5ff',
    2,
    ['Soft', 'Cotton', 'PE-friendly', 'short-sleeve'],
    true,
    '👕'
  ),
  createItem(
    'm_top_adventure',
    'Beige Daisy Graphic Tee',
    'top',
    'short_sleeve_top',
    'Beige',
    '#fef08a',
    2,
    ['Soft', 'Daisy graphic', 'Cotton', 'PE-friendly', 'short-sleeve'],
    true,
    '🌼'
  ),
  createItem(
    'm_top_polo',
    'Coral Floral Graphic Tee',
    'top',
    'short_sleeve_top',
    'Coral',
    '#f87171',
    2,
    ['Soft', 'Floral print', 'Cotton', 'short-sleeve'],
    false,
    '🌺'
  ),

  // 2. Long sleeve tops (2 items)
  createItem(
    'm_top_orange_long',
    'Purple Bow Long Sleeve',
    'top',
    'long_sleeve_top',
    'Purple',
    '#c084fc',
    3,
    ['Glitter bow', 'Cotton', 'PE-friendly', 'long-sleeve'],
    false,
    '🎀'
  ),
  createItem(
    'm_top_trail_long',
    'Pink Sister Long Sleeve',
    'top',
    'long_sleeve_top',
    'Pink',
    '#ec4899',
    3,
    ['Soft', 'Sister graphic', 'Cotton', 'long-sleeve'],
    false,
    '💖'
  ),

  // 3. Sweaters / hoodies (2 items)
  createItem(
    'm_out_zipup',
    'Lavender Butterfly Knit Sweater',
    'outerwear',
    'sweater_hoodie',
    'Lavender',
    '#ddd6fe',
    4,
    ['Knit', 'Butterfly design', 'Gap Kids', 'sweater-hoodie'],
    true,
    '🦋'
  ),
  createItem(
    'm_out_green_fleece',
    'Cream Striped Knit Sweater',
    'outerwear',
    'sweater_hoodie',
    'Cream',
    '#fef08a',
    4,
    ['Knit', 'Striped', 'Cozy', 'sweater-hoodie'],
    false,
    '🌈'
  ),

  // 4. Jackets / coats (2 items)
  createItem(
    'm_out_puffy',
    'Teal Hooded Puffer Jacket',
    'outerwear',
    'jacket_coat',
    'Teal',
    '#2dd4bf',
    5,
    ['Heavy warm', 'Padded insulation', 'Hooded', 'jacket-coat'],
    false,
    '🧥'
  ),
  createItem(
    'm_out_rain_parka',
    'Pink Floral Hooded Puffer Jacket',
    'outerwear',
    'jacket_coat',
    'Pink',
    '#fbcfe8',
    4,
    ['Waterproof', 'Hooded', 'Rain-ready', 'jacket-coat'],
    false,
    '🌸'
  ),

  // 5. Leggings (1 item)
  createItem(
    'm_bot_leggings',
    'Pink Cotton Leggings',
    'bottom',
    'leggings',
    'Pink',
    '#f472b6',
    2,
    ['Stretchy', 'Soft', 'PE-friendly', 'Polo Ralph Lauren', 'leggings'],
    true,
    '👖'
  ),

  // 6. Jeans (1 item)
  createItem(
    'm_bot_jeans',
    'Blue Floral Denim Jeans',
    'bottom',
    'jeans',
    'Denim',
    '#3b82f6',
    3,
    ['Floral print', 'Elastic waistband', 'jeans'],
    false,
    '🌸'
  ),

  // 7. Skirts (1 item)
  createItem(
    'm_bot_skirt',
    'Blue Daisy Tiered Skirt',
    'bottom',
    'skirt',
    'Light Blue',
    '#93c5fd',
    1,
    ['Daisy print', 'Tiered', 'skirt'],
    true,
    '👗'
  ),

  // 8. Shorts (2 items)
  createItem(
    'm_bot_soccer_shorts',
    'Pink Love Cotton Shorts',
    'bottom',
    'shorts',
    'Pink',
    '#fbcfe8',
    1,
    ['Soft', 'Love print', 'PE-friendly', 'shorts'],
    true,
    '🩳'
  ),
  createItem(
    'm_bot_denim_shorts',
    'Blue Denim Floral Shorts',
    'bottom',
    'shorts',
    'Denim',
    '#4b5563',
    1,
    ['Denim', 'Floral embroidery', 'shorts'],
    false,
    '🩳'
  ),

  // 9. Dresses (2 items)
  createItem(
    'm_bot_polo_dress',
    'Teal Flamingo Tulle Dress',
    'dress',
    'dress',
    'Teal',
    '#2dd4bf',
    2,
    ['Flamingo print', 'Tulle skirt', 'dress'],
    false,
    '👗'
  ),
  createItem(
    'm_bot_teal_dress',
    'Purple Glitter Tulle Dress',
    'dress',
    'dress',
    'Purple',
    '#a855f7',
    2,
    ['Glitter', 'Tulle skirt', 'dress'],
    false,
    '👗'
  ),

  // 10. Sneakers (2 items)
  createItem(
    'm_shoe_sneakers',
    'Purple & White Running Sneakers',
    'shoes',
    'sneakers',
    'Purple/White',
    '#c084fc',
    2,
    ['PE-friendly', 'Sneakers', 'Bouncy', 'sneakers'],
    true,
    '👟'
  ),
  
  // TODO: No real image provided in unsorted assets for m_shoe_sneakers_2, keeping SVG artwork.
  createItem(
    'm_shoe_sneakers_2',
    'Active Yellow Running Shoes',
    'shoes',
    'sneakers',
    'Yellow',
    '#fbbf24',
    2,
    ['PE-friendly', 'Sneakers', 'Lightweight', 'Bouncy', 'sneakers'],
    false,
    '👟'
  ),

  // 11. Boots (2 items)
  // TODO: No real image provided in unsorted assets for m_shoe_boots, keeping SVG artwork.
  createItem(
    'm_shoe_boots',
    'Waterproof Active Snow Boots',
    'shoes',
    'boots',
    'Navy/Yellow',
    '#1e293b',
    5,
    ['Waterproof', 'Heavy warm', 'Sturdy traction', 'boots'],
    false,
    '🥾'
  ),
  // TODO: No real image provided in unsorted assets for m_shoe_boots_2, keeping SVG artwork.
  createItem(
    'm_shoe_boots_2',
    'Orange Outdoor Hiking Boots',
    'shoes',
    'boots',
    'Orange',
    '#f97316',
    4,
    ['Heavy warm', 'Sturdy traction', 'Outdoor-ready', 'boots'],
    false,
    '🥾'
  ),

  // 12. Ballet flats (2 items)
  createItem(
    'm_shoe_flats',
    'Pink Flower Flat Sandals',
    'shoes',
    'ballet_flats',
    'Pink',
    '#fbcfe8',
    1,
    ['Lightweight', 'Flower print', 'ballet-flats'],
    false,
    '👡'
  ),
  createItem(
    'm_shoe_flats_2',
    'Blue Frozen Sporty Sandals',
    'shoes',
    'ballet_flats',
    'Light Blue',
    '#93c5fd',
    1,
    ['Lightweight', 'Frozen print', 'ballet-flats'],
    false,
    '👡'
  ),

  // 13. Rain boots (2 items)
  createItem(
    'm_shoe_rainboots',
    'Stitch Purple Rain Boots',
    'shoes',
    'rain_boots',
    'Purple',
    '#c084fc',
    3,
    ['Waterproof', 'Rain-ready', 'Stitch design', 'rain-boots'],
    false,
    '👢'
  ),
  
  // TODO: No real image provided in unsorted assets for m_shoe_rainboots_2, keeping SVG artwork.
  createItem(
    'm_shoe_rainboots_2',
    'Yellow Splash Rain Boots',
    'shoes',
    'rain_boots',
    'Yellow',
    '#fef08a',
    3,
    ['Waterproof', 'Rain-ready', 'Bright', 'rain-boots'],
    false,
    '🥾'
  ),

  // 14. Accessories (2 items)
  // TODO: No real accessory images provided in unsorted assets, keeping SVG artwork.
  createItem(
    'm_acc_sweatband',
    'Sporty Blue Wrist/Headband Set',
    'accessory',
    'accessory',
    'Blue',
    '#2563eb',
    1,
    ['Sporty styles', 'Sweat-wicking'],
    true,
    '🎾'
  ),
  // TODO: No real accessory images provided in unsorted assets, keeping SVG artwork.
  createItem(
    'm_acc_cap',
    'Dinosaur Patterned Cap',
    'accessory',
    'accessory',
    'Teal',
    '#2dd4bf',
    1,
    ['Sporty styles', 'Sun protection'],
    false,
    '🧢'
  )
];

export const mockMockWardrobes: Record<string, WardrobeItem[]> = {
  emma: emmaWardrobe,
  mia: miaWardrobe
};

export const mockWardrobes: Record<string, WardrobeItem[]> = {
  emma: emmaWardrobe,
  mia: miaWardrobe
};
