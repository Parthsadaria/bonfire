/**
 * VIRGIL - CONFIGURATION & CONSTANTS
 */

(() => {
  const CONFIG = {
    API_KEY: "", // Programmable Search JSON API key. If empty, uses Google CSE JSONP engine.
    categories: {
      games: {
        cx: "904ead0bae8c845f0",
        cselibv: "dc6f600a0d4404e5",
        cse_tok: "AHbIdThMSRZFwnuEEg-N6Pwqa50B:1792353891635",
        rurl: "https://virgil.samidy.com/?engine=games",
        exp: "cc,esbfa",
        fexp: "122108196,122108195,121877338,121877336",
        filter: "1",
        rsz: "filtered_cse",
        lr: "en",
        placeholder: "Search a game, Steam ID or repack",
        sites: [
          { name: "SteamRIP", domain: "steamrip.com" },
          { name: "FitGirl", domain: "fitgirl-repacks.site" },
          { name: "AnkerGames", domain: "ankergames.net" },
          { name: "Online-Fix", domain: "online-fix.me" },
          { name: "GLOAD", domain: "gload.to" },
          { name: "DODI", domain: "dodi-repacks.site" }
        ],
        suggest: ["Vholume", "Elden Ring", "Cyberpunk 2077", "Hades II", "Silksong", "1593500"]
      },
      software: {
        cx: "c288da2c020ec4091",
        cselibv: "3735a6ee3000c0cb",
        cse_tok: "AHbIdTizcnMWluAxRVjUM2ZgACaH:1792354866928",
        rurl: "https://virgil.samidy.com/?engine=software",
        exp: "cc,sps,esbfa",
        fexp: "122108199,121877337,121877336,122108201",
        filter: "0",
        rsz: "10",
        lr: "en",
        placeholder: "Search an app, tool or version",
        sites: [
          { name: "FileCR", domain: "filecr.com" },
          { name: "Repack.me", domain: "repack.me" },
          { name: "Monkrus", domain: "monkrus.ws" },
          { name: "PortableAppz", domain: "portableappz.blogspot.com" }
        ],
        suggest: ["Blender", "OBS Studio", "Audacity", "VLC"]
      },
      android: {
        cx: "d175f6f92fc134b38",
        cselibv: "dc6f600a0d4404e5",
        cse_tok: "AHbIdTheWZb7vX1D3sHHw5Oz5wML:1792355037763",
        rurl: "https://virgil.samidy.com/?engine=android",
        exp: "cc,sps,esbfa",
        fexp: "122108197,122108195,121877337,121877336",
        filter: "0",
        rsz: "filtered_cse",
        lr: "",
        placeholder: "Search an Android app or APK",
        sites: [
          { name: "Mobilism", domain: "forum.mobilism.org" },
          { name: "APKDone", domain: "apkdone.com" },
          { name: "Androeed", domain: "androeed.ru" },
          { name: "F-Droid", domain: "f-droid.org" }
        ],
        suggest: ["NewPipe", "Termux", "Obtainium"]
      }
    },
    PAGE: 10
  };

  const THEME_ROWS = [
    ["midnight", "Midnight", 0, "#0a0a10", "#11121a", "#1d1e2b", "#32344a", "#e9eaf5", "#9799b3", "#6a6d8c", "#7c8cff", "#0a0b24", "#ff7a90"],
    ["ember", "Ember", 0, "#0d0a08", "#161210", "#261f1a", "#3d322a", "#f3ebe3", "#a5978a", "#7a6c60", "#ff7a30", "#1f0c02", "#ff6370"],
    ["graphite", "Graphite", 0, "#0a0a0b", "#121213", "#202022", "#38383c", "#f2f2f3", "#9c9ca2", "#70707a", "#f2f2f3", "#0a0a0b", "#ff7b7b"],
    ["nord", "Nord", 0, "#232831", "#2a303c", "#394152", "#4c566a", "#eceff4", "#a9b4c6", "#7f8ca3", "#88c0d0", "#17202a", "#e0848d"],
    ["rosepine", "Rosé Pine", 0, "#191724", "#1f1d2e", "#2a2740", "#403d52", "#e0def4", "#908caa", "#7a7694", "#ebbcba", "#1f1520", "#eb6f92"],
    ["gruvbox", "Gruvbox", 0, "#1d2021", "#282828", "#3c3836", "#504945", "#ebdbb2", "#bdae93", "#8a7c70", "#fabd2f", "#1d1600", "#fb4934"],
    ["dracula", "Dracula", 0, "#1e1f29", "#282a36", "#373a4d", "#4d5170", "#f8f8f2", "#b4b8d4", "#7f87b3", "#bd93f9", "#1c1230", "#ff6e6e"],
    ["neon", "Neon", 0, "#0b0418", "#130827", "#21104a", "#3a1f78", "#f3eaff", "#b79ee0", "#8a72c0", "#ff2e97", "#1d0012", "#ff8a5c"],
    ["terminal", "Terminal", 0, "#040804", "#091109", "#12231a", "#1f4430", "#d4f5d9", "#86b891", "#5a8c68", "#34f27a", "#02140a", "#ff6b6b"],
    ["crimson", "Crimson", 0, "#0c0708", "#150c0e", "#26151a", "#40222a", "#f5e9ea", "#b39a9d", "#8a6c70", "#ff3d52", "#1c0508", "#ffa05c"],
    ["paper", "Paper", 1, "#f3f0e8", "#fbfaf6", "#e2ddd0", "#c9c2b0", "#181510", "#453f35", "#665f53", "#c2410c", "#fff6ee", "#b42318"],
    ["snow", "Snow", 1, "#f5f6f8", "#ffffff", "#e2e5ea", "#c6ccd6", "#0a0c10", "#353b47", "#555d6e", "#2f5bff", "#ffffff", "#d92d20"]
  ];

  const THEMES = {};
  THEME_ROWS.forEach(([id, name, light, bg, surface, line, line2, text, muted, faint, accent, ink, bad]) => {
    THEMES[id] = { name, light, v: { bg, surface, line, line2, text, muted, faint, accent, ink, bad } };
  });

  const TRENDING = [
    {
      title: "Elden Ring",
      sub: "FromSoftware",
      id: "1245620",
      img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/capsule_616x353.jpg",
      tag: "Action RPG"
    },
    {
      title: "Cyberpunk 2077",
      sub: "CD Projekt Red",
      id: "1091500",
      img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/capsule_616x353.jpg",
      tag: "Open World"
    },
    {
      title: "Baldur's Gate 3",
      sub: "Larian Studios",
      id: "1086940",
      img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/capsule_616x353.jpg",
      tag: "CRPG"
    },
    {
      title: "Black Myth: Wukong",
      sub: "Game Science",
      id: "2358720",
      img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/capsule_616x353.jpg",
      tag: "Soulslike"
    },
    {
      title: "Hades II",
      sub: "Supergiant Games",
      id: "1145350",
      img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145350/capsule_616x353.jpg",
      tag: "Roguelike"
    },
    {
      title: "Hollow Knight: Silksong",
      sub: "Team Cherry",
      id: "1030300",
      img: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1030300/capsule_616x353.jpg",
      tag: "Metroidvania"
    }
  ];

  const LINE = "Traveler, what do you seek?";
  const LOAD = [
    "Lighting the bonfire",
    "Rolling for initiative",
    "Consulting the wiki",
    "Sacrificing a chicken",
    "Checking behind the waterfall",
    "Reading the item description",
    "Asking the guy who just stands there",
    "Loading… please don’t alt-F4"
  ];

  const RAR = i => i === 0 ? ["legendary", "LEGENDARY"] : i < 3 ? ["epic", "EPIC"] : i < 6 ? ["rare", "RARE"] : ["common", "COMMON"];

  const ACH = {
    first: ["swords", "First Blood", "Ran your first search"],
    id: ["target", "Fashionably Specific", "Searched by Steam ID"],
    class: ["wand-sparkles", "Class Change", "Switched category"],
    looter: ["coins", "Loot Goblin", "Opened a result"],
    hoarder: ["backpack", "Inventory Full", "Copied 3 links"],
    skill: ["skull", "Skill Issue", "Found nothing at all"],
    grass: ["sprout", "Touch Grass", "10 searches. Go outside"],
    cheat: ["gamepad-2", "Cheat Code", "You know the code"],
    style: ["palette", "Fashion Souls", "Changed the theme"]
  };

  window.Virgil = window.Virgil || {};
  window.Virgil.CONFIG = CONFIG;
  window.Virgil.THEME_ROWS = THEME_ROWS;
  window.Virgil.THEMES = THEMES;
  window.Virgil.TRENDING = TRENDING;
  window.Virgil.LINE = LINE;
  window.Virgil.LOAD = LOAD;
  window.Virgil.RAR = RAR;
  window.Virgil.ACH = ACH;
})();
