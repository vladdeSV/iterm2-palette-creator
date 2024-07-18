function parsePlistMultiTheme(content) {
  // can't parse if extra stuff in file
  content = content.replace(/^(.|\n)+(?=<plist )/, "");

  const parser = new DOMParser();
  const plist = parser.parseFromString(content, "text/xml");

  const nodes = plist.getElementsByTagName("dict")[0].children;

  const ret = {
    light: {},
    dark: {},
  };

  let currentKey = undefined;
  let currentTheme = "light";
  for (const node of nodes) {
    if (node.tagName === "key") {
      if (currentKey) {
        throw new Error(
          `Unexpected key '${node.tagName}', already have '${currentKey}; (missing color dict?)'`,
        );
      }

      let value = node.textContent;

      currentTheme = value.includes("Dark") ? "dark" : "light";
      value = value.replace(/ \((Dark|Light)\)/, "");

      currentKey = referenceFromColorName(value);
      continue;
    }

    if (node.tagName === "dict") {
      if (!currentKey) {
        throw new Error("Unexpected color dict without key");
      }

      const color = parseColorDict(node);

      ret[currentTheme][currentKey] = color;
      currentKey = undefined;
    }
  }

  if (Object.keys(ret.light).length === 0) {
    ret.light = undefined;
  }

  if (Object.keys(ret.dark).length === 0) {
    ret.dark = undefined;
  }

  return [ret.light, ret.dark];
}

function parseColorDict(colorDict) {
  let colorSpace = undefined;
  let red = undefined;
  let green = undefined;
  let blue = undefined;
  let alpha = undefined;

  for (const element of colorDict.children) {
    if (element.tagName === "key") {
      const key = element.textContent;
      const value = element.nextElementSibling.textContent;

      switch (key) {
        case "Color Space":
          colorSpace = value;
          break;
        case "Red Component":
          red = parseFloat(value);
          break;
        case "Green Component":
          green = parseFloat(value);
          break;
        case "Blue Component":
          blue = parseFloat(value);
          break;
        case "Alpha Component":
          alpha = parseFloat(value);
          break;
        default:
          throw new Error(`Unknown color dict key '${key}'`);
      }
    }
  }

  if (!colorSpace) {
    console.info(
      "No color space found;",
      "assuming sRGB",
      "(although iTerm defaults to 'Calibrated')",
    );
    colorSpace = "sRGB";
  }

  if (red == undefined || green == undefined || blue == undefined) {
    throw new Error("(unhelpful error) Missing color components");
  }

  let hex = rgb01ToHex(red, green, blue, alpha);

  return hex;
}

const keyNameMap = {
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

function xmlColorKeys(r, g, b, a = undefined, colorSpace = "sRGB") {
  return `\t\t<key>Color Space</key>\n\t\t<string>${colorSpace}</string>\n\t\t<key>Red Component</key>\n\t\t<real>${r}</real>\n\t\t<key>Green Component</key>\n\t\t<real>${g}</real>\n\t\t<key>Blue Component</key>\n\t\t<real>${b}</real>${a !== undefined ? `\n\t\t<key>Alpha Component</key>\n\t\t<real>${a}</real>` : ""}`;
}

function xmlColor(hex, key, colorSpace = undefined, theme = undefined) {
  const { r, g, b, a } = hexToRgb01(hex);
  console.debug(`converted ${hex} to ${r} ${g} ${b}`);
  const themeTitle =
    theme === undefined ? "" : theme === "dark" ? " (Dark)" : " (Light)";
  return `\t<key>${keyNameMap[key]}${themeTitle}</key>\n\t<dict>\n${xmlColorKeys(r, g, b, a, colorSpace)}\n\t</dict>`;
}

function xmlTheme(themes, colorSpace = "sRGB") {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0">\n<dict>\n`;

  const [light, dark] = themes;

  if (light && dark) {
    for (const [key, value] of Object.entries(light)) {
      xml += xmlColor(value, key, colorSpace, "light") + "\n";
    }
    for (const [key, value] of Object.entries(dark)) {
      xml += xmlColor(value, key, colorSpace, "dark") + "\n";
    }
  } else {
    for (const [key, value] of Object.entries(light || dark)) {
      xml += xmlColor(value, key, colorSpace) + "\n";
    }
  }
  xml += "</dict>\n</plist>";
  return xml;
}
