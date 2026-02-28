// Generate preset city images using Gemini and save to public/cities/
// Run: node scripts/generate-city-images.mjs

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-2.0-flash-preview-image-generation';
const OUT_DIR = path.join(process.cwd(), 'public', 'cities');

// All cities across 4 playable epochs
const CITIES = [
  // Epoch 1 — 10000 BC
  { id: 'jericho', prompt: 'Ancient proto-Jericho settlement at dawn. Small cluster of round mud-brick houses in a fertile Jordan Valley. People in animal skins tending early wheat fields. Warm golden light, cinematic, painterly style.' },
  { id: 'gobekli', prompt: 'Göbekli Tepe ceremonial site. Massive carved stone T-shaped pillars on a hilltop at sunset. Neolithic people gathered around the stones in reverence. Dramatic sky, cinematic, painterly style.' },
  { id: 'catalhoyuk', prompt: 'Proto-Çatalhöyük dense settlement. Tightly packed mud-brick houses with roof-top entrances on Anatolian highlands. People climbing ladders, cooking on rooftops. Warm earth tones, cinematic, painterly style.' },
  { id: 'mehrgarh', prompt: 'Mehrgarh ancient farming village in South Asian plains. Small mud houses surrounded by wheat fields. Villagers with early pottery and domesticated animals. Golden hour, cinematic, painterly style.' },
  { id: 'hemudu', prompt: 'Hemudu rice cultivation settlement along the Yangtze River. Stilt houses over wetlands, people planting rice in paddies. Misty morning atmosphere. Cinematic, painterly style.' },
  { id: 'nile_delta', prompt: 'Ancient Nile river settlements. Papyrus reed huts along the green Nile floodplain. Fishermen with nets, women carrying water jars. Sunset over the river. Cinematic, painterly style.' },
  { id: 'zagros', prompt: 'Zagros mountain foothills camp. Herders with flocks of goats and sheep among rolling green hills. Stone and brush shelters. Dramatic mountain backdrop. Cinematic, painterly style.' },
  { id: 'ubaid', prompt: 'Proto-Ubaid marsh dwellings in southern Mesopotamia. Reed houses on platforms between the Tigris and Euphrates. People in reed boats fishing. Golden light reflecting on water. Cinematic, painterly style.' },
  { id: 'sahara', prompt: 'Green Sahara pastoral scene. Lush grasslands with a lake, cattle herders and their animals. Rock art visible on nearby stones. Dramatic clouds. Cinematic, painterly style.' },
  { id: 'baltic', prompt: 'Baltic mesolithic hunter camp in a snowy birch forest. People in fur clothing around a fire, drying fish and meat. Northern winter light through trees. Cinematic, painterly style.' },
  { id: 'doggerland', prompt: 'Doggerland coastal settlement on low-lying land between Britain and Europe. Hunters overlooking a vast flat landscape with marshes. Overcast sky, moody atmosphere. Cinematic, painterly style.' },
  { id: 'clovis', prompt: 'Clovis culture mammoth hunters on the Great Plains of North America. Spear-wielding hunters approaching a woolly mammoth at sunset. Vast grasslands stretching to the horizon. Cinematic, painterly style.' },
  { id: 'peru_coast', prompt: 'Ancient Peruvian coastal fishing village. Simple shelters on rocky Pacific shore, people drying fish on racks. Dramatic coastal cliffs and crashing waves. Cinematic, painterly style.' },
  { id: 'jomon', prompt: 'Jōmon period Japan. Forest settlement with pit dwellings, people crafting elaborate cord-marked pottery. Cherry trees and misty mountains in background. Cinematic, painterly style.' },
  { id: 'australia', prompt: 'Aboriginal Arnhem Land camp. People creating rock art on cliff walls, campfire in the foreground. Australian outback landscape with red earth. Starry sky beginning to appear. Cinematic, painterly style.' },

  // Epoch 2 — 2000 BC
  { id: 'ur', prompt: 'Ancient city of Ur in Sumer. The Great Ziggurat dominates the skyline. Bustling market streets below, merchants and priests in robes. Golden desert light. Cinematic, painterly style.' },
  { id: 'babylon', prompt: 'Early Babylon rising in Mesopotamia. Massive mud-brick walls and temple towers under construction. Workers and ox-carts on wide streets. Warm amber light. Cinematic, painterly style.' },
  { id: 'memphis', prompt: 'Ancient Memphis, capital of Egypt. The pyramids of Giza visible in the background. Pharaonic procession along the Nile with boats and banners. Golden light. Cinematic, painterly style.' },
  { id: 'thebes', prompt: 'Ancient Thebes, Egypt. Massive temple columns of Karnak with hieroglyphs. Priests performing rituals, incense smoke rising. Dramatic warm lighting. Cinematic, painterly style.' },
  { id: 'knossos', prompt: 'Minoan palace of Knossos on Crete. Red columns, bull-leaping fresco visible, people in colorful Minoan dress in a grand courtyard. Mediterranean blue sky. Cinematic, painterly style.' },
  { id: 'mohenjo_daro', prompt: 'Mohenjo-daro, Indus Valley civilization. Geometric grid streets, the Great Bath in center. People in cotton garments walking orderly streets. Warm light. Cinematic, painterly style.' },
  { id: 'harappa', prompt: 'Harappa, Indus Valley trade city. Merchants weighing goods with standardized weights. Fortified citadel and granaries visible. Dusty golden atmosphere. Cinematic, painterly style.' },
  { id: 'anyang', prompt: 'Erlitou, early Chinese bronze-age city. Bronze vessel casting workshop, workers pouring molten metal. Palace complex in background. Warm amber tones. Cinematic, painterly style.' },
  { id: 'troy', prompt: 'Troy, fortress city overlooking the Dardanelles strait. Massive stone walls and towers. Ships in the harbor below. Dramatic sunset over the Aegean. Cinematic, painterly style.' },
  { id: 'ugarit', prompt: 'Ugarit, Levantine port city. Busy harbor with merchant ships from many lands. Scribes with clay tablets, multilingual bazaar. Mediterranean golden light. Cinematic, painterly style.' },

  // Epoch 3 — 1 AD
  { id: 'rome', prompt: 'Imperial Rome at its height. The Colosseum and Roman Forum bustling with citizens in togas. Marble temples and triumphal arches. Golden sunset light. Cinematic, painterly style.' },
  { id: 'alexandria', prompt: 'Alexandria, Egypt, 1 AD. The great Lighthouse (Pharos) on the harbor. The famous Library visible. Scholars and merchants on busy streets. Mediterranean light. Cinematic, painterly style.' },
  { id: 'changan', prompt: 'Chang\'an (Xi\'an), Han Dynasty capital. Grand palace gates, Silk Road caravans arriving. Officials in silk robes, bustling market streets. Warm golden light. Cinematic, painterly style.' },
  { id: 'antioch', prompt: 'Antioch, Roman eastern metropolis. Colonnaded main street lined with mosaic-decorated buildings. Diverse crowd of Romans, Greeks, and easterners. Warm evening light. Cinematic, painterly style.' },
  { id: 'pataliputra', prompt: 'Pataliputra, ancient Indian imperial capital. Grand wooden palace on the Ganges river bank. Elephants, merchants, Buddhist monks in saffron robes. Misty morning. Cinematic, painterly style.' },
  { id: 'carthage', prompt: 'Roman Carthage, rebuilt North African city. Grand basilicas and baths, Roman-style forum. Ships in the harbor, African and Roman culture blending. Warm light. Cinematic, painterly style.' },
  { id: 'teotihuacan', prompt: 'Teotihuacan, Mesoamerican metropolis. The Pyramid of the Sun towers over the Avenue of the Dead. Colorful murals, priests in feathered headdresses. Dramatic sky. Cinematic, painterly style.' },
  { id: 'aksum', prompt: 'Aksum, Ethiopian highland kingdom. Towering stone obelisks (stelae) in a royal plaza. Traders with camels, incense and gold. Dramatic African light. Cinematic, painterly style.' },
  { id: 'luoyang', prompt: 'Luoyang, Eastern Han capital. Buddhist pagodas alongside Confucian academies. Scholars in flowing robes crossing an arched stone bridge. Misty atmosphere. Cinematic, painterly style.' },
  { id: 'petra', prompt: 'Petra, Nabataean rock-carved city. The Treasury facade carved into red sandstone cliffs. Camel caravans arriving through the narrow Siq canyon. Warm red light. Cinematic, painterly style.' },
  { id: 'londinium', prompt: 'Roman Londinium, frontier settlement on the Thames. Small Roman fort and wooden bridge. Soldiers and Celtic traders mixing. Overcast British sky, moody atmosphere. Cinematic, painterly style.' },
  { id: 'taxila', prompt: 'Taxila, Gandhara crossroads city. Indo-Greek architecture, Buddhist stupas, and Greek-style columns. Scholars and monks studying. Mountain backdrop. Cinematic, painterly style.' },

  // Epoch 4 — 2000 AD
  { id: 'new_york', prompt: 'New York City at night. Manhattan skyline from across the East River. Glowing skyscrapers, city lights reflecting on water. Modern and vibrant. Cinematic, painterly style with dark tones.' },
  { id: 'london', prompt: 'Modern London. Big Ben and Parliament along the Thames at blue hour. City lights beginning to glow, double-decker buses. Cinematic, painterly style with dark tones.' },
  { id: 'tokyo', prompt: 'Tokyo at night. Shibuya crossing with neon signs and crowds. Futuristic and vibrant energy. Rain-slicked streets reflecting light. Cinematic, painterly style with dark tones.' },
  { id: 'beijing', prompt: 'Modern Beijing. The Forbidden City in foreground with modern glass towers rising behind it. Contrast of ancient and modern. Sunset. Cinematic, painterly style with dark tones.' },
  { id: 'mumbai', prompt: 'Modern Mumbai. Gateway of India with the city skyline behind. Busy harbor, diverse crowds. Warm sunset over the Arabian Sea. Cinematic, painterly style with dark tones.' },
  { id: 'sao_paulo', prompt: 'São Paulo, Brazil at dusk. Vast sprawling megacity skyline stretching to the horizon. Dense urban towers, lights coming on. Cinematic, painterly style with dark tones.' },
  { id: 'lagos', prompt: 'Modern Lagos, Nigeria. Bustling African megacity with markets, flyovers, and skyscrapers emerging. Vibrant energy and dense crowds. Sunset. Cinematic, painterly style with dark tones.' },
  { id: 'dubai', prompt: 'Dubai at twilight. Burj Khalifa towering over the desert skyline. Futuristic architecture, artificial islands visible. Purple and gold sky. Cinematic, painterly style with dark tones.' },
  { id: 'singapore', prompt: 'Singapore Marina Bay at night. Futuristic Gardens by the Bay supertrees glowing. Clean modern architecture reflected in calm water. Cinematic, painterly style with dark tones.' },
  { id: 'san_francisco', prompt: 'San Francisco at golden hour. Golden Gate Bridge in foreground, tech campus visible in distance. Fog rolling in over the bay. Cinematic, painterly style with dark tones.' },
  { id: 'moscow', prompt: 'Moscow at night. Red Square with St. Basil\'s Cathedral illuminated. Snow on the ground, Kremlin walls in background. Cold dramatic lighting. Cinematic, painterly style with dark tones.' },
  { id: 'sydney', prompt: 'Sydney harbor at blue hour. Opera House and Harbour Bridge illuminated. City skyline reflected in calm water. Cinematic, painterly style with dark tones.' },
];

async function generateImage(city) {
  const outPath = path.join(OUT_DIR, `${city.id}.png`);

  // Skip if already generated
  if (fs.existsSync(outPath)) {
    console.log(`  SKIP ${city.id} (already exists)`);
    return;
  }

  const fullPrompt = `Generate a cinematic illustration. ${city.prompt} 16:9 aspect ratio. No text overlays. Rich warm color palette with amber and gold tones on a dark background.`;

  try {
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: fullPrompt,
    });

    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          const buffer = Buffer.from(part.inlineData.data, 'base64');
          fs.writeFileSync(outPath, buffer);
          console.log(`  OK   ${city.id} (${(buffer.length / 1024).toFixed(0)} KB)`);
          return;
        }
      }
    }
    console.log(`  FAIL ${city.id} (no image data in response)`);
  } catch (err) {
    console.log(`  FAIL ${city.id}: ${err.message}`);
  }
}

async function main() {
  console.log(`\nGenerating ${CITIES.length} city images...\n`);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  // Process in batches of 3 concurrent requests
  const BATCH = 3;
  for (let i = 0; i < CITIES.length; i += BATCH) {
    const batch = CITIES.slice(i, i + BATCH);
    const batchNum = Math.floor(i / BATCH) + 1;
    const totalBatches = Math.ceil(CITIES.length / BATCH);
    console.log(`Batch ${batchNum}/${totalBatches}:`);
    await Promise.allSettled(batch.map(c => generateImage(c)));
  }

  // Count results
  const generated = CITIES.filter(c => fs.existsSync(path.join(OUT_DIR, `${c.id}.png`))).length;
  console.log(`\nDone: ${generated}/${CITIES.length} images generated in public/cities/`);
}

main();
