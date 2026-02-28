import { WorldState } from './types';

// Epoch 1 — 10,000 BC
export const MOCK_WORLD_STATE_10000BC: WorldState = {
  year: -10000,
  epoch: 1,
  narrative: "The Ice Age is ending. Small bands of humans are scattered across the continents, beginning to experiment with agriculture in the Fertile Crescent. The first permanent settlements are emerging where wild grains grow abundantly.",
  cities: [
    { id: "jericho", name: "Proto-Jericho", lat: 31.87, lng: 35.44, population: 300, brightness: 0.3, techLevel: 2, civilization: "Natufian", description: "One of the earliest permanent settlements, cultivating wild wheat and barley." },
    { id: "gobekli", name: "Göbekli Tepe", lat: 37.22, lng: 38.92, population: 200, brightness: 0.4, techLevel: 2, civilization: "Pre-Pottery Neolithic", description: "A mysterious ceremonial site where massive stone pillars are being erected." },
    { id: "catalhoyuk", name: "Proto-Çatalhöyük", lat: 37.67, lng: 32.83, population: 150, brightness: 0.2, techLevel: 2, civilization: "Anatolian", description: "Early farming communities experimenting with domesticated crops." },
    { id: "mehrgarh", name: "Mehrgarh", lat: 29.38, lng: 67.54, population: 100, brightness: 0.2, techLevel: 1, civilization: "Indus Precursor", description: "One of the earliest farming villages in South Asia." },
    { id: "hemudu", name: "Hemudu Culture", lat: 30.05, lng: 121.35, population: 80, brightness: 0.2, techLevel: 1, civilization: "Yangtze", description: "Early rice cultivation communities along the Yangtze River." },
    { id: "nile_delta", name: "Nile Settlements", lat: 30.04, lng: 31.23, population: 120, brightness: 0.2, techLevel: 1, civilization: "Proto-Egyptian", description: "Fishing and farming communities along the fertile Nile floodplain." },
    { id: "zagros", name: "Zagros Foothills", lat: 35.5, lng: 46.0, population: 180, brightness: 0.25, techLevel: 2, civilization: "Proto-Sumerian", description: "Goat and sheep herders laying foundations for Mesopotamian civilization." },
    { id: "ubaid", name: "Proto-Ubaid", lat: 30.96, lng: 46.10, population: 100, brightness: 0.2, techLevel: 1, civilization: "Mesopotamian", description: "Early communities in the marshlands between the Tigris and Euphrates." },
    { id: "sahara", name: "Green Sahara Camps", lat: 23.0, lng: 12.0, population: 60, brightness: 0.15, techLevel: 1, civilization: "Saharan", description: "The Sahara is still green — pastoral communities herd cattle across grasslands." },
    { id: "baltic", name: "Baltic Hunter Camps", lat: 55.0, lng: 23.0, population: 40, brightness: 0.1, techLevel: 1, civilization: "Mesolithic European", description: "Hunter-gatherer bands following reindeer herds as the ice retreats." },
    { id: "doggerland", name: "Doggerland", lat: 54.0, lng: 2.0, population: 50, brightness: 0.1, techLevel: 1, civilization: "Mesolithic European", description: "A land bridge between Britain and Europe, soon to be flooded by rising seas." },
    { id: "clovis", name: "Clovis Culture", lat: 34.4, lng: -103.2, population: 30, brightness: 0.1, techLevel: 1, civilization: "Paleo-American", description: "Big-game hunters spreading across North America." },
    { id: "peru_coast", name: "Peruvian Coast", lat: -12.0, lng: -77.0, population: 40, brightness: 0.1, techLevel: 1, civilization: "Andean Precursor", description: "Fishing communities along the Pacific coast beginning to settle." },
    { id: "jomon", name: "Jōmon Japan", lat: 35.7, lng: 139.7, population: 50, brightness: 0.15, techLevel: 1, civilization: "Jōmon", description: "Sophisticated hunter-gatherers creating the world's oldest pottery." },
    { id: "australia", name: "Arnhem Land", lat: -12.5, lng: 133.0, population: 30, brightness: 0.1, techLevel: 1, civilization: "Aboriginal", description: "Ancient rock art traditions continue, songlines map the continent." },
  ],
  tradeRoutes: [
    { id: "fc1", from: { lat: 31.87, lng: 35.44, city: "Proto-Jericho" }, to: { lat: 37.22, lng: 38.92, city: "Göbekli Tepe" }, volume: 2, description: "Obsidian and grain exchange" },
    { id: "fc2", from: { lat: 37.22, lng: 38.92, city: "Göbekli Tepe" }, to: { lat: 35.5, lng: 46.0, city: "Zagros Foothills" }, volume: 1, description: "Early pastoral connections" },
    { id: "nl", from: { lat: 30.04, lng: 31.23, city: "Nile Settlements" }, to: { lat: 31.87, lng: 35.44, city: "Proto-Jericho" }, volume: 1, description: "Shells and grain trade" },
  ],
  regions: [
    { id: "fertile_crescent", civilization: "Natufian / Pre-Pottery Neolithic", color: "#8B4513", center: { lat: 34.0, lng: 38.0 }, radius: 8 },
    { id: "nile_valley", civilization: "Proto-Egyptian", color: "#CD853F", center: { lat: 26.0, lng: 32.0 }, radius: 5 },
    { id: "indus_region", civilization: "Indus Precursor", color: "#D2691E", center: { lat: 28.0, lng: 70.0 }, radius: 4 },
    { id: "yellow_river", civilization: "Yangtze / Yellow River", color: "#DAA520", center: { lat: 34.0, lng: 110.0 }, radius: 6 },
  ],
};

// Epoch 2 — 2,000 BC
export const MOCK_WORLD_STATE_2000BC: WorldState = {
  year: -2000,
  epoch: 2,
  narrative: "Bronze Age civilizations flourish. Writing has been invented, the first empires are forming, and trade networks span thousands of miles. Egypt, Mesopotamia, and the Indus Valley are the centers of the world.",
  cities: [
    { id: "ur", name: "Ur", lat: 30.96, lng: 46.10, population: 65000, brightness: 0.9, techLevel: 5, civilization: "Sumerian", description: "One of the world's largest cities, home to the great ziggurat." },
    { id: "babylon", name: "Babylon", lat: 32.54, lng: 44.42, population: 40000, brightness: 0.8, techLevel: 5, civilization: "Babylonian", description: "Rising power in Mesopotamia, will soon eclipse Ur." },
    { id: "memphis", name: "Memphis", lat: 29.85, lng: 31.25, population: 50000, brightness: 0.85, techLevel: 5, civilization: "Egyptian", description: "Capital of unified Egypt, the pyramids stand as monuments." },
    { id: "thebes", name: "Thebes", lat: 25.70, lng: 32.64, population: 30000, brightness: 0.7, techLevel: 5, civilization: "Egyptian", description: "Religious center of Egypt, temple complexes honor Amun-Ra." },
    { id: "knossos", name: "Knossos", lat: 35.30, lng: 25.16, population: 20000, brightness: 0.75, techLevel: 5, civilization: "Minoan", description: "Heart of Minoan civilization with its labyrinthine palace." },
    { id: "mohenjo_daro", name: "Mohenjo-daro", lat: 27.33, lng: 68.14, population: 40000, brightness: 0.8, techLevel: 5, civilization: "Indus Valley", description: "Masterwork of urban planning with grid streets and sewage." },
    { id: "harappa", name: "Harappa", lat: 30.63, lng: 72.87, population: 35000, brightness: 0.75, techLevel: 5, civilization: "Indus Valley", description: "Northern hub of Indus trade network." },
    { id: "anyang", name: "Erlitou", lat: 34.70, lng: 112.70, population: 25000, brightness: 0.6, techLevel: 4, civilization: "Xia Dynasty", description: "Legendary first dynasty of China, bronze casting advancing." },
    { id: "troy", name: "Troy", lat: 39.96, lng: 26.24, population: 8000, brightness: 0.5, techLevel: 4, civilization: "Anatolian", description: "Strategic fortress controlling the Dardanelles." },
    { id: "ugarit", name: "Ugarit", lat: 35.60, lng: 35.78, population: 15000, brightness: 0.6, techLevel: 4, civilization: "Canaanite", description: "Cosmopolitan port city with multiple scripts in daily use." },
  ],
  tradeRoutes: [
    { id: "me", from: { lat: 30.96, lng: 46.10, city: "Ur" }, to: { lat: 29.85, lng: 31.25, city: "Memphis" }, volume: 8, description: "Luxury goods, copper, and grain" },
    { id: "mie", from: { lat: 35.30, lng: 25.16, city: "Knossos" }, to: { lat: 29.85, lng: 31.25, city: "Memphis" }, volume: 6, description: "Olive oil, wine, and crafts" },
    { id: "im", from: { lat: 27.33, lng: 68.14, city: "Mohenjo-daro" }, to: { lat: 30.96, lng: 46.10, city: "Ur" }, volume: 5, description: "Sea trade via the Persian Gulf" },
    { id: "mt", from: { lat: 35.30, lng: 25.16, city: "Knossos" }, to: { lat: 39.96, lng: 26.24, city: "Troy" }, volume: 4, description: "Aegean metals trade" },
    { id: "lt", from: { lat: 35.60, lng: 35.78, city: "Ugarit" }, to: { lat: 32.54, lng: 44.42, city: "Babylon" }, volume: 5, description: "Cedar wood and purple dye" },
  ],
  regions: [
    { id: "mesopotamia", civilization: "Sumerian / Babylonian", color: "#4169E1", center: { lat: 32.0, lng: 45.0 }, radius: 6 },
    { id: "egypt", civilization: "Egyptian", color: "#FFD700", center: { lat: 27.0, lng: 31.0 }, radius: 5 },
    { id: "minoan", civilization: "Minoan", color: "#8A2BE2", center: { lat: 36.0, lng: 25.0 }, radius: 4 },
    { id: "indus", civilization: "Indus Valley", color: "#20B2AA", center: { lat: 28.0, lng: 70.0 }, radius: 5 },
    { id: "shang", civilization: "Xia / Early Shang", color: "#DC143C", center: { lat: 35.0, lng: 113.0 }, radius: 6 },
  ],
};

// Epoch 3 — 1 AD
export const MOCK_WORLD_STATE_1AD: WorldState = {
  year: 1,
  epoch: 3,
  narrative: "The Roman Empire dominates the Mediterranean. The Han Dynasty rules China. The Silk Road connects East and West for the first time. Great religions are spreading, reshaping cultures across continents.",
  cities: [
    { id: "rome", name: "Rome", lat: 41.90, lng: 12.50, population: 1000000, brightness: 1.0, techLevel: 7, civilization: "Roman", description: "Capital of the greatest empire the West has ever seen." },
    { id: "alexandria", name: "Alexandria", lat: 31.20, lng: 29.92, population: 500000, brightness: 0.9, techLevel: 7, civilization: "Roman-Egyptian", description: "Center of learning, home to the great Library." },
    { id: "changan", name: "Chang'an", lat: 34.26, lng: 108.94, population: 400000, brightness: 0.9, techLevel: 7, civilization: "Han Dynasty", description: "Eastern terminus of the Silk Road, capital of Han China." },
    { id: "antioch", name: "Antioch", lat: 36.20, lng: 36.15, population: 250000, brightness: 0.8, techLevel: 6, civilization: "Roman", description: "Rome's eastern jewel, a crossroads of cultures." },
    { id: "pataliputra", name: "Pataliputra", lat: 25.61, lng: 85.14, population: 300000, brightness: 0.8, techLevel: 6, civilization: "Kushan-Indian", description: "Grand city on the Ganges, Buddhist monks mingle with merchants." },
    { id: "carthage", name: "Carthage", lat: 36.85, lng: 10.32, population: 100000, brightness: 0.6, techLevel: 6, civilization: "Roman-African", description: "Rebuilt as a Roman province, thriving again." },
    { id: "teotihuacan", name: "Teotihuacan", lat: 19.69, lng: -98.84, population: 125000, brightness: 0.7, techLevel: 5, civilization: "Mesoamerican", description: "City of the gods, dominated by the Pyramid of the Sun." },
    { id: "aksum", name: "Aksum", lat: 14.12, lng: 38.73, population: 50000, brightness: 0.5, techLevel: 5, civilization: "Aksumite", description: "Ethiopian highland kingdom trading in gold and incense." },
    { id: "luoyang", name: "Luoyang", lat: 34.62, lng: 112.45, population: 350000, brightness: 0.85, techLevel: 7, civilization: "Han Dynasty", description: "Eastern capital where Buddhism first enters China." },
    { id: "petra", name: "Petra", lat: 30.33, lng: 35.44, population: 30000, brightness: 0.5, techLevel: 5, civilization: "Nabataean", description: "Rock-carved city controlling Arabian trade routes." },
    { id: "londinium", name: "Londinium", lat: 51.51, lng: -0.13, population: 15000, brightness: 0.3, techLevel: 4, civilization: "Roman-British", description: "Frontier settlement on the edge of the known world." },
    { id: "taxila", name: "Taxila", lat: 33.75, lng: 72.83, population: 40000, brightness: 0.5, techLevel: 5, civilization: "Indo-Greek", description: "Crossroads where Greek philosophy meets Buddhist thought." },
  ],
  tradeRoutes: [
    { id: "silk1", from: { lat: 34.26, lng: 108.94, city: "Chang'an" }, to: { lat: 33.75, lng: 72.83, city: "Taxila" }, volume: 7, description: "Silk Road: silk, spices, ideas" },
    { id: "silk2", from: { lat: 33.75, lng: 72.83, city: "Taxila" }, to: { lat: 36.20, lng: 36.15, city: "Antioch" }, volume: 6, description: "Silk Road western leg" },
    { id: "med", from: { lat: 41.90, lng: 12.50, city: "Rome" }, to: { lat: 31.20, lng: 29.92, city: "Alexandria" }, volume: 9, description: "Grain and luxury goods" },
    { id: "red_sea", from: { lat: 31.20, lng: 29.92, city: "Alexandria" }, to: { lat: 14.12, lng: 38.73, city: "Aksum" }, volume: 4, description: "Red Sea spice trade" },
    { id: "indian", from: { lat: 25.61, lng: 85.14, city: "Pataliputra" }, to: { lat: 34.62, lng: 112.45, city: "Luoyang" }, volume: 5, description: "Buddhist missionaries and trade" },
  ],
  regions: [
    { id: "roman", civilization: "Roman Empire", color: "#8B0000", center: { lat: 41.0, lng: 15.0 }, radius: 15 },
    { id: "han", civilization: "Han Dynasty", color: "#DC143C", center: { lat: 35.0, lng: 110.0 }, radius: 10 },
    { id: "kushan", civilization: "Kushan Empire", color: "#20B2AA", center: { lat: 30.0, lng: 70.0 }, radius: 8 },
    { id: "meso", civilization: "Mesoamerican", color: "#228B22", center: { lat: 19.0, lng: -99.0 }, radius: 5 },
    { id: "aksumite", civilization: "Aksumite", color: "#DAA520", center: { lat: 14.0, lng: 39.0 }, radius: 4 },
  ],
};

// Epoch 4 — 2000 AD
export const MOCK_WORLD_STATE_2000AD: WorldState = {
  year: 2000,
  epoch: 4,
  narrative: "A connected world of 6 billion people. The internet is transforming communication. Space agencies eye Mars. Climate change and geopolitics shape the future. The question: can humanity reach the stars?",
  cities: [
    { id: "new_york", name: "New York", lat: 40.71, lng: -74.01, population: 8000000, brightness: 1.0, techLevel: 9, civilization: "American", description: "Global financial and cultural capital." },
    { id: "london", name: "London", lat: 51.51, lng: -0.13, population: 7000000, brightness: 0.95, techLevel: 9, civilization: "British", description: "Historic world power, financial hub." },
    { id: "tokyo", name: "Tokyo", lat: 35.68, lng: 139.69, population: 13000000, brightness: 1.0, techLevel: 10, civilization: "Japanese", description: "Technological frontier, largest metro on Earth." },
    { id: "beijing", name: "Beijing", lat: 39.90, lng: 116.40, population: 11000000, brightness: 0.95, techLevel: 9, civilization: "Chinese", description: "Capital of a rising superpower investing in space." },
    { id: "mumbai", name: "Mumbai", lat: 19.08, lng: 72.88, population: 12000000, brightness: 0.85, techLevel: 8, civilization: "Indian", description: "Economic engine of the world's largest democracy." },
    { id: "sao_paulo", name: "São Paulo", lat: -23.55, lng: -46.63, population: 10000000, brightness: 0.8, techLevel: 8, civilization: "Brazilian", description: "Latin America's megacity, industrial powerhouse." },
    { id: "lagos", name: "Lagos", lat: 6.52, lng: 3.38, population: 8000000, brightness: 0.7, techLevel: 6, civilization: "Nigerian", description: "Africa's fastest-growing city, a continent's future." },
    { id: "dubai", name: "Dubai", lat: 25.20, lng: 55.27, population: 1000000, brightness: 0.9, techLevel: 9, civilization: "Emirati", description: "Desert transformed into a gleaming tech hub." },
    { id: "singapore", name: "Singapore", lat: 1.35, lng: 103.82, population: 4000000, brightness: 0.9, techLevel: 9, civilization: "Singaporean", description: "City-state at the crossroads of global trade." },
    { id: "san_francisco", name: "San Francisco", lat: 37.77, lng: -122.42, population: 800000, brightness: 0.95, techLevel: 10, civilization: "American", description: "Silicon Valley's front door, where the future is coded." },
    { id: "moscow", name: "Moscow", lat: 55.76, lng: 37.62, population: 10000000, brightness: 0.8, techLevel: 8, civilization: "Russian", description: "Former superpower with deep space heritage." },
    { id: "sydney", name: "Sydney", lat: -33.87, lng: 151.21, population: 4000000, brightness: 0.8, techLevel: 9, civilization: "Australian", description: "Pacific gateway, growing tech and research hub." },
  ],
  tradeRoutes: [
    { id: "transatlantic", from: { lat: 40.71, lng: -74.01, city: "New York" }, to: { lat: 51.51, lng: -0.13, city: "London" }, volume: 10, description: "Transatlantic finance and data" },
    { id: "transpacific", from: { lat: 37.77, lng: -122.42, city: "San Francisco" }, to: { lat: 35.68, lng: 139.69, city: "Tokyo" }, volume: 9, description: "Tech and manufacturing" },
    { id: "china_trade", from: { lat: 39.90, lng: 116.40, city: "Beijing" }, to: { lat: 1.35, lng: 103.82, city: "Singapore" }, volume: 8, description: "Manufacturing supply chain" },
    { id: "india_gulf", from: { lat: 19.08, lng: 72.88, city: "Mumbai" }, to: { lat: 25.20, lng: 55.27, city: "Dubai" }, volume: 7, description: "Energy and labor" },
    { id: "africa_rising", from: { lat: 6.52, lng: 3.38, city: "Lagos" }, to: { lat: 51.51, lng: -0.13, city: "London" }, volume: 5, description: "Resources and diaspora" },
  ],
  regions: [
    { id: "north_america", civilization: "NATO / Western", color: "#4169E1", center: { lat: 40.0, lng: -100.0 }, radius: 15 },
    { id: "europe", civilization: "European Union", color: "#0000CD", center: { lat: 50.0, lng: 10.0 }, radius: 10 },
    { id: "east_asia", civilization: "East Asian", color: "#DC143C", center: { lat: 35.0, lng: 115.0 }, radius: 12 },
    { id: "south_asia", civilization: "South Asian", color: "#FF8C00", center: { lat: 22.0, lng: 78.0 }, radius: 8 },
    { id: "africa", civilization: "African Union", color: "#228B22", center: { lat: 5.0, lng: 20.0 }, radius: 15 },
    { id: "south_america", civilization: "Latin American", color: "#FFD700", center: { lat: -15.0, lng: -55.0 }, radius: 12 },
  ],
};

// Lookup by epoch number
export const MOCK_DATA_BY_EPOCH: Record<number, WorldState> = {
  1: MOCK_WORLD_STATE_10000BC,
  2: MOCK_WORLD_STATE_2000BC,
  3: MOCK_WORLD_STATE_1AD,
  4: MOCK_WORLD_STATE_2000AD,
};
