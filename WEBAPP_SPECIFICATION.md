# Land Measurement & Digital Amin WebApp — Complete Project Blueprint & Specification
> **প্রিমিয়াম স্কিউমরফিক ডিজাইন ও এআই ল্যান্ড অ্যাসিস্ট্যান্টসহ একটি পূর্ণাঙ্গ আধুনিক ওয়েব অ্যাপ্লিকেশন আর্কিটেকচার**

---

## ১. ওভারভিউ (Overview & Vision)

এই ডকুমেন্টটি **"জমি পরিমাপ ও ডিজিটাল আমিন" (Land Measurement & Digital Amin)** মোবাইল অ্যাপ্লিকেশনের সমস্ত ফিচার, গাণিতিক অ্যালগরিদম, রিয়েল-টাইম কনভার্সন, এআই সহকারী এবং প্রিমিয়াম **Skeuomorphic (ট্যাকটাইল ডিজিটাল সার্ভেয়ার ইনস্ট্রুমেন্ট)** ইউআই/ইউএক্স-কে একটি আধুনিক **Web Application (React / Next.js / Vue / HTML5)** হিসেবে গড়ে তোলার সম্পূর্ণ নির্দেশিকা।

---

## ২. মূল প্রযুক্তি স্ট্যাক (Recommended Tech Stack for WebApp)

| উপাদান | প্রস্তাবিত প্রযুক্তি | বিকল্প |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** বা **React (Vite)** | Nuxt.js / SvelteKit |
| **Styling** | **Tailwind CSS + CSS Modules** (3D gradients, skeuomorphic box-shadows) | Styled Components / Vanilla CSS |
| **Icons** | **Lucide-React** / Heroicons | Material Symbols Web |
| **Fonts** | Google Fonts: **Hind Siliguri** (বাংলা) + **Outfit** (ডিজিটাল সংখ্যা ও হেডিং) | Noto Sans Bengali + Orbitron / Inter |
| **AI Integration** | **Google Gemini API** (`gemini-2.5-flash` বা `gemini-1.5-flash`) | Vercel AI SDK |
| **Canvas Engine** | **HTML5 Canvas API / Fabric.js / Konva.js** (আঁকাবাঁকা কাস্টম ড্রয়িংয়ের জন্য) | SVG Path Manipulation |
| **Local Persistence** | **IndexedDB (via Dexie.js)** বা **LocalStorage** | Supabase / Firebase |

---

## ৩. ডিজাইন ও ইউআই/ইউএক্স নির্দেশিকা (Skeuomorphic Design System)

### ৩.১ স্কিউমরফিক প্যালেট (Skeuomorphic Color Palette)
অ্যাপের মূল ডিজাইনটি একটি পেশাদার **টোটাল স্টেশন (Digital Total Station / Surveyor Chassis)**-এর মতো দেখতে হবে:

```css
:root {
  /* Chassis Colors (Light Mode) */
  --chassis-ivory: #F7F5F0;
  --surface-top: #FFFFFF;
  --surface-bottom: #EBE6DC;
  --bevel-highlight: #FFFFFF;
  --bevel-shadow: rgba(0, 0, 0, 0.15);
  --deep-shadow: rgba(0, 0, 0, 0.25);

  /* Chassis Colors (Dark Mode / Gunmetal Titanium) */
  --chassis-dark: #1B201D;
  --surface-dark-top: #28302C;
  --surface-dark-bottom: #151917;
  --bevel-dark-highlight: rgba(255, 255, 255, 0.15);
  --bevel-dark-shadow: rgba(0, 0, 0, 0.45);

  /* Surveyor Digital LCD Display */
  --lcd-bg-top: #04180E;
  --lcd-bg-bottom: #082819;
  --lcd-bezel-outer: #1E3A2B;
  --lcd-bezel-inner: #0C2016;
  --lcd-digit-green: #4EFA8A;
  --lcd-digit-amber: #FFD166;
  --lcd-digit-red: #FF6E6E;
  --lcd-digit-cyan: #64B5F6;
  --lcd-label-mint: #81C784;

  /* 3D Physical Extruded Buttons */
  --btn-green-top: #388E3C;
  --btn-green-bottom: #1B5E20;
  --btn-green-extrusion: #0E3813;
  --btn-blue-top: #1E88E5;
  --btn-blue-bottom: #0D47A1;
  --btn-blue-extrusion: #082B66;
}
```

### ৩.২ টাইপোগ্রাফি (Eye-Catching Typography)
- **বাংলা ফন্ট**: `'Hind Siliguri', sans-serif`
- **সংখ্যা ও ডিজিটাল মিটার**: `'Outfit', monospace`
- **হেডিংস**: `'Hind Siliguri', 'Outfit', sans-serif` (Letter spacing: `0.5px`, Weight: `700` বা `900`)

### ৩.৩ মূল স্কিউমরফিক কম্পোনেন্টস (Key UI Components)
1. **`SkeuoCard`**:
   - উপরের প্রান্তে `1px` হালকা হাইলাইট লাইন (`border-t: 1px solid rgba(255,255,255,0.7)`).
   - নিচের প্রান্তে মৃদু ড্রপ শ্যাডো (`box-shadow: 0 4px 10px rgba(0,0,0,0.12), inset 0 -2px 4px rgba(0,0,0,0.06)`).
   - চারকোণায় স্ক্রু/রিভেটের সূক্ষ্ম টেক্সচার।

2. **`SkeuoButton` (3D পুশ বাটন)**:
   - সাধারণ অবস্থায় `4px` এক্সট্রুশন শ্যাডো নিচে থাকে (`transform: translateY(0); box-shadow: 0 4px 0 var(--btn-green-extrusion)`).
   - বাটন চাপার সময় বাটনটি নিচে নেমে আসে (`transform: translateY(3px); box-shadow: 0 1px 0 var(--btn-green-extrusion)`).

3. **`SkeuoMeterDisplay` (ডিজিটাল সার্ভেয়ার এলসিডি স্ক্রিন)**:
   - মেটালিক ডার্ক ফ্রেম (`border: 2px solid #436B54; border-radius: 18px`).
   - এলসিডি ব্যাকগ্রাউন্ড গ্র্যাডিয়েন্ট (`background: linear-gradient(180deg, #04180E 0%, #082819 100%)`).
   - ডিজিটাল গ্লোয়িং টেক্সট (`color: #4EFA8A; text-shadow: 0 0 10px rgba(78, 250, 138, 0.4)`).
   - উপরে "TOTAL STATION • ONLINE" স্ট্যাটাস বার ও ডানপাশে রিসেট বাটন।
   - নিচে ৪টি ল্যান্ড গেজ (শতাংশ, কাঠা, বিঘা, একর) কালার-কোডেড কার্ডে প্রদর্শিত।

4. **`SkeuoUnitRocker` (মেকানিক্যাল রকার সুইচ - ফুট ⇄ মিটার)**:
   - দুই পাশের টগল যেখানে নির্বাচিত ইউনিটটি ৩D এলিভেশনের সাথে সক্রিয় হয় এবং অপ্রয়োজনীয় ইউনিটটি ফ্ল্যাট গর্তের ভেতর রিসেসড থাকে।

---

## ৪. ইউনিট কনভার্সন এবং ভূমি পরিমাপের স্ট্যান্ডার্ড ফর্মুলা

### ৪.১ কনভার্সন ফ্যাক্টর (Feet ⇄ Meters)
```javascript
const FT_PER_METER = 3.2808398950131235;

// লিনিয়ার রূপান্তর
function feetToMeters(ft) { return ft / FT_PER_METER; }
function metersToFeet(m) { return m * FT_PER_METER; }

// ক্ষেত্রফল রূপান্তর (Area)
function sqFeetToSqMeters(sqFt) { return sqFt / (FT_PER_METER * FT_PER_METER); } // ~ 10.7639
function sqMetersToSqFeet(sqM) { return sqM * (FT_PER_METER * FT_PER_METER); }
```

### ৪.২ বাংলাদেশি ভূমি পরিমাপের একক (Standard Bangladesh Land Units)
```javascript
// ১ শতাংশ = ৪৩৫.৬ বর্গফুট = ৪০.৪৬৭ বর্গমিটার
const SQ_FEET_PER_SOTANGSO = 435.6;

// ১ কাঠা = ৭২০.০ বর্গফুট = ১.৬৫২৮৯ শতাংশ (সাধারণত ১.৬৫ শতাংশ ধরা হয়)
const SQ_FEET_PER_KATHA = 720.0; 

// ১ বিঘা = ১৪,৪০০.০ বর্গফুট = ৩৩.০৫৭৮ শতাংশ = ২০ কাঠা
const SQ_FEET_PER_BIGHA = 14400.0;

// ১ একর = ৪৩,৫৬০.০ বর্গফুট = ১০০ শতাংশ
const SQ_FEET_PER_ACRE = 43560.0;

// ১ হেক্টর = ২.৪৭ একর
const SQ_FEET_PER_HECTARE = 107639.1;
```

---

## ৫. মূল ফিচারসমূহ ও পেজ আর্কিটেকচার (Features & Modules)

ওয়েব অ্যাপটিতে নিচের ৫টি প্রধান ট্যাব/মডিউল থাকবে:

```
[ Land Measurement WebApp ]
├── 1. Calculator (আকার অনুযায়ী পরিমাপ)
├── 2. Triangulation (ত্রিভুজ / আঁকাবাঁকা জমি)
├── 3. Khatian (খতিয়ানের হিস্যা বণ্টন)
├── 4. AI Land Assistant (ডিজিটাল আমিন - Gemini 3.5)
└── 5. History & Pricing (সংরক্ষিত হিসাব ও মূল্য নির্ধারণ)
```

---

### ৫.১ মডিউল ১: সাধারণ ক্যালকুলেটর (Calculator Tab)

ব্যবহারকারী ড্রপডাউন বা আইকন গ্রিড থেকে আকার নির্বাচন করবেন:
1. **Rectangle (আয়তক্ষেত্র)**: দৈর্ঘ্য ও প্রস্থ (বা উত্তর-দক্ষিণ ও পূর্ব-পশ্চিম গড়)।
2. **Parallelogram (সামান্তরিক)**: ভূমি ও উচ্চতা।
3. **Triangle (ত্রিভুজ)**:
   - হেরনের সূত্র (৩ বাহু $a, b, c$): 
     $$s = \frac{a + b + c}{2}, \quad \text{Area} = \sqrt{s(s - a)(s - b)(s - c)}$$
   - ভূমি ও উচ্চতা: $\text{Area} = 0.5 \times \text{Base} \times \text{Height}$
   - সমকোণী ত্রিভুজ: $\text{Area} = 0.5 \times \text{Perpendicular} \times \text{Base}$
4. **Trapezoid (ট্রাপিজিয়াম)**: সমান্তরাল বাহুদ্বয় $a, b$ এবং লম্ব দূরত্ব $h$:
   $$\text{Area} = \frac{a + b}{2} \times h$$
5. **Circle (বৃত্ত)**: ব্যাসার্ধ $r$: $\text{Area} = \pi r^2$
6. **Ellipse (উপবৃত্ত)**: অর্ধ-অক্ষ $a, b$: $\text{Area} = \pi a b$
7. **Freeform / Custom Drawing (ক্যানভাসে সরাসরি অঙ্কন)**:
   - ইন্টার-অ্যাকটিভ টাচ ও মাউস ক্যানভাস।
   - ব্যবহারকারী জমিতে ক্লিক করে পলিগন পয়েন্ট বসাতে পারবেন।
   - সুলেস ফর্মুলা (Shoelace Formula) দ্বারা এরিয়া বের হবে:
     $$\text{Area} = \frac{1}{2} \left| \sum_{i=1}^{n-1} (x_i y_{i+1} - x_{i+1} y_i) + (x_n y_1 - x_1 y_n) \right|$$
8. **3D Cube / মাটিকাটা হিসাব**: দৈর্ঘ্য $\times$ প্রস্থ $\times$ গভীরতা দিয়ে মাটির ঘনফুট (CFT / ঘনমিটার) এবং ক্ষেত্রফল নির্ণয়।

**স্মার্ট ফিচার**:
- যখন ব্যবহারকারী **"ফুট"** থেকে **"মিটার"** সিলেক্ট করবেন, ইনপুট ফিল্ডের মানগুলো মুছে যাবে না, স্বয়ংক্রিয়ভাবে $3.28084$ দিয়ে ভাগ/গুণ হয়ে নতুন ইউনিটে কনভার্ট হবে।

---

### ৫.২ মডিউল ২: ট্রায়াঙ্গুলেশন পদ্ধতি (Triangulation Tab)

বাংলাদেশ ও ভারতীয় উপমহাদেশের সবচেয়ে নির্ভুল জমি পরিমাপ পদ্ধতি হলো ত্রিভুজায়ন (Triangulation)।
- আঁকাবাঁকা বা বহুভুজাকার (৪ বাহু, ৫ বাহু বা ততোধিক) জমিকে একটি বা একাধিক কর্ণ (Diagonal) মেপে ত্রিভুজে ভাগ করা হয়।
- প্রতিটি ত্রিভুজের ৩টি বাহু ইনপুট দেওয়া হয়।
- ডায়নামিক **"+ ত্রিভুজ যোগ করুন"** বাটন থাকে।
- প্রতিটি ত্রিভুজের ক্ষেত্রফল হেরনের ফর্মুলা দিয়ে বের করে যোগ করে মোট জমি নির্ধারণ করা হয়।

---

### ৫.৩ মডিউল ৩: খতিয়ান ও হিস্যা বণ্টন (Khatian Share Calculator)

খতিয়ানের আনা, গণ্ডা, কড়া, ক্রান্তি, তিল কিংবা দশমিক হিস্যা অনুযায়ী শরীকদের মধ্যে জমি বণ্টনের বিশেষ ক্যালকুলেটর:

#### ঐতিহ্যবাহী একক কনভার্সন:
- **১৬ আনা** = সম্পূর্ণ হিস্যা (১.০০০)
- **১ আনা** = ২০ গণ্ডা
- **১ গণ্ডা** = ৪ কড়া
- **১ কড়া** = ৩ ক্রান্তি
- **১ ক্রান্তি** = ২০ তিল
- মোট তিল = $16 \times 20 \times 4 \times 3 \times 20 = 1,53,600$ তিল।

#### কার্যপ্রণালী:
1. মোট জমি ইনপুট (শতাংশ, কাঠা বা একরে)।
2. একাধিক অংশীদার যোগ করার সুবিধা (নাম, হিস্যা)।
3. হিস্যা ইনপুট মোড:
   - **দশমিক হিস্যা (যেমন: ০.২৫০, ০.১২৫)**
   - **আনা-গণ্ডা-কড়া-ক্রান্তি মোড**
4. ফলাফল: কার ভাগে কত শতাংশ, কাঠা বা বর্গফুট জমি পড়েছে তা টেবিল আকারে প্রদর্শন ও প্রিন্ট/পিডিএফ করার অপশন।

---

### ৫.৪ মডিউল ৪: ডিজিটাল আমিন AI সহকারী (Land AI Assistant)

Gemini 3.5 / 2.5 Flash API দ্বারা চালিত ইন্টেলিজেন্ট ল্যান্ড কনসালট্যান্ট।

#### সিস্টেম প্রম্পট (System Prompt for Gemini API):
```markdown
You are "Digital Amin" (ডিজিটাল আমিন), an expert legal and mathematical Land Measurement AI Assistant specializing in Bangladesh and South Asian land laws, survey systems, and mathematical calculations.

Capabilities & Rules:
1. Languages: You must seamlessly understand and answer in Bengali (বাংলা), English, and Banglish (Bengali written in English letters).
2. Domain Expertise:
   - Land conversions: Sq. Feet, Sq. Meters, Sotangso/Decimal, Katha, Bigha, Acre, Hectare, Kani, Gonda.
   - Survey formulas: Heron's formula, average method vs triangulation, shoelace formula for irregular land.
   - Land records & law: CS, SA, RS, BS/City Survey, Namjari/Mutation (নামজারি/খারিজ), DCR, Porcha, Khatian, deeds (হেবা, সাফ-কবলা, দানপত্র, ওসিয়তনামা).
3. Tone: Helpful, highly respectful, mathematically rigorous, and clear.
4. Structure: Always present calculations with step-by-step mathematical breakdown. Use Markdown bullet points and bold headers for clarity.
```

#### কুইক সাজেশন চিপস (Suggestion Chips):
- *"১ শতাংশে কত বর্গফুট ও বর্গমিটার?"*
- *"আঁকাবাঁকা ৪ বাহুর জমি মাপার সঠিক নিয়ম কি?"*
- *"নামজারি (খারিজ) করতে কি কি কাগজপত্র লাগে?"*
- *"হেবা দলিল ও সাফ কবলা দলিলের মধ্যে পার্থক্য কি?"*
- *"৫০ ফুট × ৩০ ফুট জমিতে কত কাঠা ও শতাংশ?"*

---

### ৫.৫ মডিউল ৫: আর্থিক মূল্যায়ন ও ইতিহাস (Valuation & History)

1. **জমির মূল্য হিসাব (Land Price Calculator)**:
   - শতাংশ, কাঠা বা বিঘা প্রতি দর ইনপুট।
   - স্বয়ংক্রিয়ভাবে মোট জমির মূল্য বাংলাদেশি টাকা ফরম্যাটে (`৳ ১২,৫০,০০০.০০`) ক্যালকুলেট করা।
2. **হিস্ট্রি লগ (History Store)**:
   - প্রতিটি ক্যালকুলেশন লোকাল স্টোরেজে স্বয়ংক্রিয়ভাবে সেভ হবে।
   - তারিখ, আকার, ইনপুট মাপ, ক্ষেত্রফল ও মূল্যসহ কার্ড আকারে তালিকাভুক্ত হবে।
   - এক ক্লিকে কপি, এক্সপোর্ট বা ক্লিয়ার করার সুবিধা।

---

## ৬. ফ্রন্টএন্ড কোড স্ট্রাকচার (Full Next.js / React Project Structure)

```
land-measurement-web/
├── public/
│   ├── favicon.ico
│   └── fonts/
│       ├── HindSiliguri-Regular.ttf
│       ├── HindSiliguri-Bold.ttf
│       └── Outfit-Bold.ttf
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root HTML, Fonts & Theme Provider
│   │   ├── page.tsx                # Main Dashboard with Skeuomorphic Tabs
│   │   └── api/
│   │       └── ai-chat/
│   │           └── route.ts        # Next.js Server Route for Gemini API
│   ├── components/
│   │   ├── skeuomorphic/
│   │   │   ├── SkeuoCard.tsx       # 3D Raised Beveled Container
│   │   │   ├── SkeuoButton.tsx     # Physical Push Button with depth
│   │   │   ├── SkeuoMeterDisplay.tsx # Digital Green Total Station LCD
│   │   │   └── SkeuoUnitRocker.tsx # Mechanical Toggle (ft / m)
│   │   ├── calculator/
│   │   │   ├── ShapeSelector.tsx   # Visual shape picker
│   │   │   ├── DimensionInputs.tsx # Dynamic input inputs based on shape
│   │   │   └── FreeformCanvas.tsx  # Interactive polygon drawing
│   │   ├── triangulation/
│   │   │   └── TriangulationTab.tsx # Multiple triangle management
│   │   ├── khatian/
│   │   │   └── KhatianTab.tsx      # Ana-Gonda-Kara & Decimal distribution
│   │   ├── ai/
│   │   │   └── LandAiChat.tsx      # Digital Amin Chatbot UI
│   │   └── history/
│   │       └── HistoryModal.tsx    # Saved records & local storage
│   ├── lib/
│   │   ├── calculations.ts         # Math engine (Heron, Shoelace, Units)
│   │   ├── translations.ts         # EN & BN localization strings
│   │   └── gemini.ts               # Gemini API client
│   └── styles/
│       └── globals.css             # Tailwind & Skeuomorphic CSS Utilities
├── tailwind.config.js
├── package.json
└── README.md
```

---

## ৭. সম্পূর্ণ এক্সিকিউটেবল কোড স্নিপেটস (Ready-to-Use Code)

### ৭.১ গণিত ও রূপান্তর লাইব্রেরি (`src/lib/calculations.ts`)

```typescript
export const FT_PER_METER = 3.2808398950131235;
export const SQ_FT_PER_SOTANGSO = 435.6;
export const SQ_FT_PER_KATHA = 720.0;
export const SQ_FT_PER_BIGHA = 14400.0;
export const SQ_FT_PER_ACRE = 43560.0;

export interface CalculationResult {
  sqFeet: number;
  sqMeters: number;
  sotangso: number;
  katha: number;
  bigha: number;
  acre: number;
}

export function computeLandMetrics(sqFeet: number): CalculationResult {
  const sqMeters = sqFeet / (FT_PER_METER * FT_PER_METER);
  return {
    sqFeet,
    sqMeters,
    sotangso: sqFeet / SQ_FT_PER_SOTANGSO,
    katha: sqFeet / SQ_FT_PER_KATHA,
    bigha: sqFeet / SQ_FT_PER_BIGHA,
    acre: sqFeet / SQ_FT_PER_ACRE
  };
}

// হেরনের ফর্মুলা (ত্রিভুজ)
export function heronFormula(a: number, b: number, c: number): number {
  if (a + b <= c || a + c <= b || b + c <= a) return 0;
  const s = (a + b + c) / 2.0;
  return Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
}

// সুলেস ফর্মুলা (আঁকাবাঁকা পলিগন)
export function shoelaceFormula(points: { x: number; y: number }[]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2.0;
}
```

---

### ৭.২ স্কিউমরফিক এলসিডি ডিসপ্লে (`SkeuoMeterDisplay.tsx`)

```tsx
'use client';
import React from 'react';

interface MeterProps {
  sqFeet: number;
  sqMeters: number;
  sotangso: number;
  katha: number;
  bigha: number;
  unit: 'FEET' | 'METERS';
  lang: 'BN' | 'EN';
  onReset?: () => void;
}

export const SkeuoMeterDisplay: React.FC<MeterProps> = ({
  sqFeet,
  sqMeters,
  sotangso,
  katha,
  bigha,
  unit,
  lang,
  onReset
}) => {
  const isFeet = unit === 'FEET';
  const primaryVal = isFeet ? sqFeet : sqMeters;
  const secondaryVal = isFeet ? sqMeters : sqFeet;

  return (
    <div className="w-full rounded-[20px] p-2 bg-gradient-to-b from-[#1E3A2B] to-[#0C2016] shadow-[0_10px_25px_rgba(0,0,0,0.3)] border-2 border-[#436B54]">
      {/* LCD Panel */}
      <div className="w-full rounded-[14px] p-4 bg-gradient-to-b from-[#04180E] to-[#082819] border border-[#4EFA8A]/20 shadow-inner">
        {/* Header Indicator */}
        <div className="flex justify-between items-center pb-2 border-b border-[#4EFA8A]/15 text-[11px] font-bold tracking-wider text-[#81C784]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4EFA8A] animate-pulse"></span>
            <span>{isFeet ? 'PRIMARY: SQ. FEET (বর্গফুট)' : 'PRIMARY: SQ. METERS (বর্গমিটার)'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#4EFA8A]/20 text-[#4EFA8A] px-2 py-0.5 rounded text-[9px] font-black border border-[#4EFA8A]/30">
              TOTAL STATION
            </span>
            {onReset && (
              <button 
                onClick={onReset} 
                className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#4EFA8A]"
                title="রিসেট করুন"
              >
                ↺
              </button>
            )}
          </div>
        </div>

        {/* Primary Phosphor Numbers */}
        <div className="flex justify-between items-end my-3">
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#4EFA8A] drop-shadow-[0_0_8px_rgba(78,250,138,0.5)]">
              {primaryVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-gray-400">
              {isFeet ? 'বর্গমিটার (SQ.M)' : 'বর্গফুট (SQ.FT)'}
            </div>
            <div className="text-lg font-bold font-mono text-[#FFD166] drop-shadow-[0_0_5px_rgba(255,209,102,0.4)]">
              {secondaryVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Traditional Bangladesh Land Gauges */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#4EFA8A]/15 text-center">
          <div className="p-1">
            <div className="text-[9px] font-bold text-gray-400">{lang === 'BN' ? 'শতাংশ / শতক' : 'SOTANGSO'}</div>
            <div className="text-xs sm:text-sm font-black font-mono text-[#FF6E6E]">{sotangso.toFixed(4)}</div>
          </div>
          <div className="p-1">
            <div className="text-[9px] font-bold text-gray-400">{lang === 'BN' ? 'কাঠা' : 'KATHA'}</div>
            <div className="text-xs sm:text-sm font-black font-mono text-[#FFD166]">{katha.toFixed(3)}</div>
          </div>
          <div className="p-1">
            <div className="text-[9px] font-bold text-gray-400">{lang === 'BN' ? 'বিঘা' : 'BIGHA'}</div>
            <div className="text-xs sm:text-sm font-black font-mono text-[#64B5F6]">{bigha.toFixed(4)}</div>
          </div>
          <div className="p-1">
            <div className="text-[9px] font-bold text-gray-400">{lang === 'BN' ? 'একর' : 'ACRE'}</div>
            <div className="text-xs sm:text-sm font-black font-mono text-[#4EFA8A]">{(sqFeet / 43560.0).toFixed(4)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### ৭.৩ ৩D ট্যাকটাইল পুশ বাটন (`SkeuoButton.tsx`)

```tsx
'use client';
import React from 'react';

interface ButtonProps {
  label: string;
  icon?: string;
  onClick: () => void;
  colorScheme?: 'green' | 'blue' | 'brass';
  className?: string;
}

export const SkeuoButton: React.FC<ButtonProps> = ({
  label,
  icon,
  onClick,
  colorScheme = 'green',
  className = ''
}) => {
  const colors = {
    green: 'from-[#388E3C] to-[#1B5E20] border-t-[#81C784]/40 active:translate-y-1 shadow-[0_4px_0_#0E3813]',
    blue: 'from-[#1E88E5] to-[#0D47A1] border-t-[#90CAF9]/40 active:translate-y-1 shadow-[0_4px_0_#082B66]',
    brass: 'from-[#E6B800] to-[#B38600] border-t-[#FFEE58]/40 active:translate-y-1 shadow-[0_4px_0_#805F00]'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full py-3.5 px-6 rounded-xl font-extrabold text-white text-base tracking-wide flex items-center justify-center gap-2 bg-gradient-to-b border-t transition-all duration-75 cursor-pointer ${colors[colorScheme]} ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
```

---

### ৭.৪ মেকানিক্যাল রকার ইউনিট সুইচ (`SkeuoUnitRocker.tsx`)

```tsx
'use client';
import React from 'react';

interface RockerProps {
  unit: 'FEET' | 'METERS';
  onUnitChange: (newUnit: 'FEET' | 'METERS') => void;
  lang: 'BN' | 'EN';
}

export const SkeuoUnitRocker: React.FC<RockerProps> = ({ unit, onUnitChange, lang }) => {
  const isFeet = unit === 'FEET';

  return (
    <div className="w-full p-1.5 rounded-2xl bg-gradient-to-b from-[#EBE6DC] to-[#D5CEBF] dark:from-[#1E2420] dark:to-[#121513] border border-[#B8B0A0] dark:border-[#2C352F] shadow-inner flex gap-1">
      {/* Feet Knob */}
      <button
        onClick={() => onUnitChange('FEET')}
        className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
          isFeet
            ? 'bg-gradient-to-b from-[#388E3C] to-[#1B5E20] text-white shadow-[0_3px_8px_rgba(27,94,32,0.4)] border border-white/30'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
        }`}
      >
        <span>📐</span>
        <span>{lang === 'BN' ? 'ফুট (FEET)' : 'FEET (FT)'}</span>
      </button>

      {/* Meter Knob */}
      <button
        onClick={() => onUnitChange('METERS')}
        className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
          !isFeet
            ? 'bg-gradient-to-b from-[#1E88E5] to-[#0D47A1] text-white shadow-[0_3px_8px_rgba(13,71,161,0.4)] border border-white/30'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800'
        }`}
      >
        <span>📏</span>
        <span>{lang === 'BN' ? 'মিটার (METERS)' : 'METERS (M)'}</span>
      </button>
    </div>
  );
};
```

---

### ৭.৫ Gemini AI API সার্ভার রুট (`src/app/api/ai-chat/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
You are "Digital Amin" (ডিজিটাল আমিন), a world-class land calculation and legal surveyor assistant for Bangladesh.
Always respond in the user's preferred language (Bangla, English, or Banglish).
Explain Heron's formula, Triangulation, CS/SA/RS/BS Khatian, Namjari, Mutation, Kabala vs Heba deeds, and regional units (Sotangso, Katha, Bigha, Acre).
`;

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured' }, { status: 500 });
    }

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: 'আমি ডিজিটাল আমিন। জমি সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন।' }] },
      ...(conversationHistory || []).map((msg: any) => ({
        role: msg.sender === 'USER' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'কোনো উত্তর পাওয়া যায়নি।';

    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
```

---

## ৮. ডিপ্লয়মেন্ট ও হোস্ট করার ধাপসমূহ (Deployment Guide)

### ১. Vercel / Netlify তে ডিপ্লয়মেন্ট
1. কোডটি গিটহাবে পুশ করুন (`git init`, `git commit -m "feat: land measurement webapp"`).
2. [Vercel](https://vercel.com) এ লগইন করে রিপোজিটরি ইমপোর্ট করুন।
3. এনভায়রনমেন্ট ভ্যারিয়েবল যোগ করুন:
   - `GEMINI_API_KEY = your_google_gemini_api_key_here`
4. **Deploy** বাটনে ক্লিক করলেই সেকেন্ডের মধ্যে লাইভ লিঙ্ক তৈরি হবে!

### ২. PWA (Progressive Web App) হিসেবে তৈরি করা
- `next-pwa` প্লাগইন ব্যবহার করে এটিকে একটি ইনস্টলেবল ওয়েব অ্যাপে রূপান্তর করা যাবে, যাতে ব্যবহারকারী ব্রাউজার ছাড়াও অ্যান্ড্রয়েড বা আইফোনে হোমস্ক্রিন আইকন হিসেবে ব্যবহার করতে পারেন এবং অফলাইনেও ক্যাশড ক্যালকুলেশন চালাতে পারেন।

---

## ৯. সামারি চেকলিস্ট (Verification Checklist)

- [x] **দ্বৈত একক**: ফুট ও মিটার উভয় পদ্ধতিতে ইনপুট দেওয়া এবং মান না হারিয়ে সরাসরি টগল করা।
- [x] **বাংলাদেশি একক**: শতাংশ, কাঠা, বিঘা, একর, ছটাক এবং দামের স্বয়ংক্রিয় হিসাব।
- [x] **জটিল ও আঁকাবাঁকা জমি**: ত্রিভুজায়ন (Triangulation) ও ক্যানভাস পলিগন ড্রয়িং।
- [x] **খতিয়ান হিস্যা**: ১৬ আনা বা ১.০০০ হিস্যার সমানুপাতিক বণ্টন।
- [x] **AI সহকারী**: বাংলা, ইংরেজি এবং বাংলিশে জমি ও আইনের সমস্ত প্রশ্নের উত্তর।
- [x] **স্কিউমরফিক ডিজাইন**: টোটাল স্টেশন ডিজিটাল এলসিডি, 3D পুশ বাটন ও রকার সুইচ।
- [x] **টাইপোগ্রাফি**: Hind Siliguri এবং Outfit ফন্টের মার্জিত সমন্বয়।
