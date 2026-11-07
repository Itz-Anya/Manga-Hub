export interface Creator {
  key: string;
  plain: string;
  name: string;
  handle: string;
  telegram: string;
  img: string;
  banner: string;
  role: string;
  about: string;
  focus: string[];
  accent: string;
}

export const CREATORS: Creator[] = [
  {
    key: "anya",
    plain: "Anya",
    name: "𝚨𝝒𝛄ꫝ",
    handle: "itz-Anya",
    telegram: "SylveonLab",
    img: "https://random-images-anya.vercel.app/anya",
    banner: "https://random-images-anya.vercel.app/ba",
    role: "Designer & Developer",
    about:
      "Anya designs and builds everything you see on Manga Hub. The layout, the colors, the reader and all the small details are her work, and she keeps polishing them with every release.",
    focus: ["Interface", "Design", "Frontend"],
    accent: "linear-gradient(135deg, oklch(0.75 0.18 320), oklch(0.7 0.2 350))",
  },
  {
    key: "murali",
    plain: "Murali",
    name: "𝐌 𝐔 𝐑 𝚨 𝐋 𝐈",
    handle: "Itz-Murali",
    telegram: "ChikuBots",
    img: "https://itz-murali-images.vercel.app/api",
    banner: "https://random-images-anya.vercel.app/bm",
    role: "API Owner & Pro Coder",
    about:
      "Murali runs the engine room. He set up the API and image proxies and the caching that keeps chapters loading fast, and he reviews most of what gets shipped.",
    focus: ["API", "Backend", "Performance"],
    accent: "linear-gradient(135deg, oklch(0.7 0.18 50), oklch(0.65 0.2 25))",
  },
];
