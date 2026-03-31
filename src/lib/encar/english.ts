export interface SourceVehicleLabels {
  make: string;
  model: string;
  title: string;
}

export interface DisplayVehicleLabels {
  sourceMake: string;
  sourceModel: string;
  sourceTitle: string;
  displayMake: string;
  displayModel: string;
  displayTitle: string;
}

const STATUS_TOKEN_PATTERN = /^(?:\uCC1C|\uACC4\uC57D\uC911|\uC9C4\uB2E8(?:\+{1,2})?|\uBCF4\uC99D|\uBB34\uC0AC\uACE0|\uD5DB\uAC78\uC74C\uBCF4\uC0C1|\uC5D4\uCE74\uBBFF\uACE0)$/;
const HANGUL_BLOCK_PATTERN = /[\uAC00-\uD7A3]+/g;
const HANGUL_RANGE_START = 0xac00;
const HANGUL_RANGE_END = 0xd7a3;

const CHOSEONG = [
  "g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h",
];

const JUNGSEONG = [
  "a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i",
];

const JONGSEONG = [
  "", "k", "k", "ks", "n", "nj", "nh", "t", "l", "lk", "lm", "lb", "ls", "lt", "lp", "lh", "m", "p", "ps", "t", "t", "ng", "t", "t", "k", "t", "p", "h",
];

const MAKE_MAP = new Map<string, string>([
  ["\uD604\uB300", "Hyundai"],
  ["\uAE30\uC544", "Kia"],
  ["\uC81C\uB124\uC2DC\uC2A4", "Genesis"],
  ["\uBCA4\uCE20", "Mercedes-Benz"],
  ["\uC544\uC6B0\uB514", "Audi"],
  ["\uD3ED\uC2A4\uBC14\uAC90", "Volkswagen"],
  ["\uD3EC\uB4DC", "Ford"],
  ["\uBBF8\uB2C8", "Mini"],
  ["\uD3EC\uB974\uC250", "Porsche"],
  ["\uB809\uC11C\uC2A4", "Lexus"],
  ["\uD398\uB77C\uB9AC", "Ferrari"],
  ["\uB9C8\uC138\uB77C\uD2F0", "Maserati"],
  ["\uB8F0\uC2A4\uB85C\uC774\uC2A4", "Rolls-Royce"],
  ["\uB9E5\uB77C\uB80C", "McLaren"],
  ["\uB7DC\uBCF4\uB974\uAE30\uB2C8", "Lamborghini"],
  ["\uC778\uD53C\uB2C8\uD2F0", "Infiniti"],
  ["\uB2DB\uC0B0", "Nissan"],
  ["\uD1A0\uC694\uD0C0", "Toyota"],
  ["\uC3D8\uBCF4", "Volvo"],
  ["\uC7AC\uADC0\uC5B4", "Jaguar"],
  ["\uB79C\uB4DC\uB85C\uBC84", "Land Rover"],
  ["\uC250\uBCF4\uB808", "Chevrolet"],
  ["\uB974\uB178\uCF54\uB9AC\uC544", "Renault Korea"],
  ["\uB974\uB178\uC0BC\uC131", "Renault Samsung"],
  ["\uC30D\uC6A9", "SsangYong"],
  ["\uCF00\uC774\uC9C0\uBAA8\uBE4C\uB9AC\uD2F0", "KG Mobility"],
]);

const PHRASE_REPLACEMENTS: Array<[string, string]> = [];
PHRASE_REPLACEMENTS.push(
  ["\uAC00\uC194\uB9B0+\uC804\uAE30", "Gasoline + Electric"],
  ["\uC778\uD154\uB9AC\uC804\uD2B8 \uB4DC\uB77C\uC774\uBE0C", "Intelligent Drive"],
  ["\uC77C\uB809\uD2B8\uB9AD \uC544\uD2B8", "Electric Art"],
  ["\uB9E4\uB274\uD329\uCC98", "Manufaktur"],
  ["\uB871\uB808\uC778\uC9C0", "Long Range"],
  ["\uC5D0\uCF54\uBD80\uC2A4\uD2B8", "EcoBoost"],
  ["\uCEE8\uBC84\uD130\uBE14", "Convertible"],
  ["\uC775\uC2A4\uD50C\uB85C\uB7EC", "Explorer"],
  ["\uB9AC\uBBF8\uD2F0\uB4DC", "Limited"],
  ["\uC775\uC2A4\uD074\uB8E8\uC2DC\uBE0C", "Exclusive"],
  ["\uD074\uB798\uC2DD", "Classic"],
  ["\uD074\uB7FD\uB9E8", "Clubman"],
  ["\uB77C\uC774\uD2B8", "Lite"],
  ["\uC778\uC2A4\uD37C\uB808\uC774\uC158", "Inspiration"],
  ["\uC544\uBC18\uB5BC", "Avante"],
  ["\uC5D0\uBE44\uC5D0\uC774\uD130", "Aviator"],
  ["\uBE14\uB799\uB77C\uBCA8", "Black Label"],
  ["\uC774\uD2B8\uB860", "e-tron"],
  ["\uB974\uBE14\uB791", "Le Blanc"],
  ["\uCE98\uB9AC\uADF8\uB798\uD53C", "Calligraphy"],
  ["\uD504\uB808\uC2A4\uD2F0\uC9C0", "Prestige"],
  ["\uC2DC\uADF8\uB2C8\uCC98", "Signature"],
  ["\uB178\uBE14\uB808\uC2A4", "Noblesse"],
  ["\uC544\uBC29\uAC00\uB974\uB4DC", "Avantgarde"],
  ["\uD504\uB9AC\uBBF8\uC5C4", "Premium"],
  ["\uD2B8\uB80C\uB514", "Trendy"],
  ["\uAE30\uBCF8\uD615", "Standard"],
  ["\uD558\uC774\uBE0C\uB9AC\uB4DC", "Hybrid"],
  ["\uAC00\uC194\uB9B0", "Gasoline"],
  ["\uB514\uC824", "Diesel"],
  ["\uC804\uAE30", "Electric"],
  ["\uD130\uBCF4", "Turbo"],
  ["\uC2A4\uD3EC\uCE20", "Sport"],
  ["\uC5B4\uC2A4", "Earth"],
  ["\uBAA8\uB358", "Modern"],
  ["\uCF70\uD2B8\uB85C", "Quattro"],
  ["\uD329\uB9AC\uC138\uC774\uB4DC", "Palisade"],
  ["\uD330\uB9AC\uC138\uC774\uB4DC", "Palisade"],
  ["\uBA38\uC2A4\uD0F1", "Mustang"],
  ["\uD2F0\uBCFC\uB9AC", "Tivoli"],
  ["\uC5D0\uC5B4", "Air"],
  ["\uADF8\uB79C\uC800", "Grandeur"],
  ["\uC2FC\uD0C0\uD398", "Santa Fe"],
  ["\uCE74\uB2C8\uBC1C", "Carnival"],
  ["\uC3D8\uB80C\uD1A0", "Sorento"],
  ["\uC2A4\uD3EC\uD2F0\uC9C0", "Sportage"],
  ["\uC140\uD1A0\uC2A4", "Seltos"],
  ["\uCF54\uB098", "Kona"],
  ["\uC81C\uD0C0", "Jetta"],
  ["\uCFE0\uD37C", "Cooper"],
  ["\uC2DC\uB9AC\uC988", "Series"],
  ["\uD074\uB798\uC2A4", "Class"],
  ["\uB354 \uB274", "The New"],
);
PHRASE_REPLACEMENTS.sort((left, right) => right[0].length - left[0].length);

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripStatusTokens(value: string) {
  return normalizeWhitespace(
    value
      .split(" ")
      .filter((token) => !STATUS_TOKEN_PATTERN.test(token))
      .join(" "),
  );
}

function ordinalLabel(value: number) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${value}st`;
  }
  if (mod10 === 2 && mod100 !== 12) {
    return `${value}nd`;
  }
  if (mod10 === 3 && mod100 !== 13) {
    return `${value}rd`;
  }
  return `${value}th`;
}

function romanizeHangulChar(char: string) {
  const code = char.codePointAt(0);
  if (!code || code < HANGUL_RANGE_START || code > HANGUL_RANGE_END) {
    return char;
  }

  const syllableIndex = code - HANGUL_RANGE_START;
  const choseongIndex = Math.floor(syllableIndex / 588);
  const jungseongIndex = Math.floor((syllableIndex % 588) / 28);
  const jongseongIndex = syllableIndex % 28;

  return `${CHOSEONG[choseongIndex]}${JUNGSEONG[jungseongIndex]}${JONGSEONG[jongseongIndex]}`;
}

function romanizeHangulBlock(value: string) {
  return Array.from(value).map((char) => romanizeHangulChar(char)).join("");
}

function replaceKnownPhrases(value: string) {
  let result = value;
  for (const [source, target] of PHRASE_REPLACEMENTS) {
    result = result.split(source).join(target);
  }
  return result;
}

function replaceCounters(value: string) {
  return value
    .replace(/(\d+)\uC138\uB300/g, (_, count: string) => `${ordinalLabel(Number(count))} Generation`)
    .replace(/(\d+)\uC778\uC2B9/g, "$1-Seater")
    .replace(/(\d+)\uB3C4\uC5B4/g, "$1-Door");
}

function capitalizeRomanizedWords(value: string) {
  return value.replace(/\b[a-z][a-z-]*\b/g, (token) => token[0].toUpperCase() + token.slice(1));
}

function cleanupDisplayText(value: string) {
  return normalizeWhitespace(
    value
      .replace(/(\d)Series/g, "$1 Series")
      .replace(/\s+\/\s+/g, " / ")
      .replace(/\s+\+\s+/g, " + ")
      .replace(/\s+-\s+/g, " - "),
  );
}

function normalizeDisplayText(value: string) {
  const stripped = stripStatusTokens(value);
  const withKnownPhrases = replaceKnownPhrases(stripped);
  const withCounters = replaceCounters(withKnownPhrases);
  const romanized = withCounters.replace(HANGUL_BLOCK_PATTERN, (block) => romanizeHangulBlock(block));
  return cleanupDisplayText(capitalizeRomanizedWords(romanized));
}

function replaceSourceMake(value: string, sourceMake: string, displayMake: string) {
  return sourceMake ? value.split(sourceMake).join(displayMake) : value;
}

function removeLeadingMake(value: string, make: string) {
  if (!value) {
    return value;
  }

  return value.startsWith(`${make} `) ? value.slice(make.length + 1).trim() : value;
}

export function normalizeDisplayMake(sourceMake: string) {
  const cleaned = normalizeWhitespace(sourceMake);
  return MAKE_MAP.get(cleaned) ?? normalizeDisplayText(cleaned);
}

export function normalizeVehicleLabels(source: SourceVehicleLabels): DisplayVehicleLabels {
  const sourceMake = normalizeWhitespace(source.make);
  const sourceModel = normalizeWhitespace(source.model);
  const sourceTitle = normalizeWhitespace(source.title);
  const displayMake = normalizeDisplayMake(sourceMake);
  const displayModel = removeLeadingMake(
    normalizeDisplayText(replaceSourceMake(sourceModel, sourceMake, displayMake)),
    displayMake,
  );
  const displayTitle = cleanupDisplayText(
    normalizeDisplayText(replaceSourceMake(sourceTitle, sourceMake, displayMake)),
  );

  return {
    sourceMake,
    sourceModel,
    sourceTitle,
    displayMake,
    displayModel,
    displayTitle,
  };
}
