/// reference table for iterm2's colors
const _terminalColorCodes = {
  "ansi-0": "Ansi 0 Color",
  "ansi-1": "Ansi 1 Color",
  "ansi-2": "Ansi 2 Color",
  "ansi-3": "Ansi 3 Color",
  "ansi-4": "Ansi 4 Color",
  "ansi-5": "Ansi 5 Color",
  "ansi-6": "Ansi 6 Color",
  "ansi-7": "Ansi 7 Color",
  "ansi-8": "Ansi 8 Color",
  "ansi-9": "Ansi 9 Color",
  "ansi-10": "Ansi 10 Color",
  "ansi-11": "Ansi 11 Color",
  "ansi-12": "Ansi 12 Color",
  "ansi-13": "Ansi 13 Color",
  "ansi-14": "Ansi 14 Color",
  "ansi-15": "Ansi 15 Color",
  "foreground-color": "Foreground Color",
  "background-color": "Background Color",
  "bold-color": "Bold Color",
  "link-color": "Link Color",
  "find-match-color": "Match Background Color",
  "selection-color": "Selection Color",
  "selected-text-color": "Selected Text Color",
  "badge-color": "Badge Color",
  "tab-color": "Tab Color",
  "underline-color": "Underline Color",
  "cursor-color": "Cursor Color",
  "cursor-text-color": "Cursor Text Color",
  "cursor-guide-color": "Cursor Guide Color",
};

// TERMINOLOGY: 'reference' means my made up ids like 'ansi-0', 'foreground-color', etc
const references = Object.keys(_terminalColorCodes);

function referenceFromColorName(colorName) {
  const ret = references.find((ref) => _terminalColorCodes[ref] === colorName);

  if (ret) {
    return ret;
  }

  throw new Error(`Unkonwn name '${colorName}'`);
}

function isValidInputColorCode(input, usesAlpha) {
  const expectedLength = usesAlpha ? 8 : 6;

  return /^[0-9A-Fa-f]+$/i.test(input) && input.length === expectedLength;
}

function formatColorCodeForInputValue(colorCode) {
  return colorCode.replace("#", "");
}

function formatColorCodeForCSS(colorCode) {
  if (!colorCode) {
    return "";
  }

  if (colorCode.length === 6 || colorCode.length === 8) {
    return `#${colorCode}`;
  }

  if (colorCode.startsWith("#")) {
    return `${colorCode}`;
  }

  throw new Error(`Invalid (?) color code: ${colorCode}`);
}

function rgb01ToHex(red, green, blue, alpha = undefined) {
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  const r = Math.round(clamp(red, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const g = Math.round(clamp(green, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  const b = Math.round(clamp(blue, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0");
  let a = "";

  if (alpha !== undefined) {
    a = Math.round(clamp(alpha, 0, 1) * 255)
      .toString(16)
      .padStart(2, "0");
  }

  return `#${r}${g}${b}${a}`;
}

const lightDefaultPalette = {
  "foreground-color": "#000000",
  "background-color": "#ffffff",

  "ansi-0": "#000000",
  "ansi-1": "#CA1A00",
  "ansi-2": "#00C300",
  "ansi-3": "#C6C400",
  "ansi-4": "#0325C7",
  "ansi-5": "#CA30C7",
  "ansi-6": "#00C5C7",
  "ansi-7": "#C7C7C7",
  "ansi-8": "#686868",
  "ansi-9": "#FF6E67",
  "ansi-10": "#5EFA68",
  "ansi-11": "#FEFC68",
  "ansi-12": "#6A71FF",
  "ansi-13": "#FF77FF",
  "ansi-14": "#60FDFF",
  "ansi-15": "#FFFFFF",

  "link-color": "#015CBB",
  "find-match-color": "#FFFC00",
  "selection-color": "#C0DEFF",
  "cursor-color": "#000000",
  "cursor-text-color": "#ffffff",

  "bold-color": "#000000",
  "tab-color": "#ffffff",
  "selected-text-color": "#000000",
  "underline-color": "#000000",
  "badge-color": "#FF25007f",
  "cursor-guide-color": "#B4EDFE3f",
};
const darkDefaultPalette = {
  ...lightDefaultPalette,
  "background-color": "#000000",
  "foreground-color": "#C7C7C7",

  "find-match-color": "#FFFFFF",
  "cursor-color": "#C7C7C7",
};
