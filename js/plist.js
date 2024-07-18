function parsePlist(content) {
  // can't parse if extra stuff in file
  content = content.replace(/^(.|\n)+(?=<plist )/, "");

  const parser = new DOMParser();
  const plist = parser.parseFromString(content, "text/xml");

  const nodes = plist.getElementsByTagName("dict")[0].children;

  const ret = {};

  let currentKey = undefined;
  for (const node of nodes) {
    if (node.tagName === "key") {
      if (currentKey) {
        throw new Error(
          `Unexpected key '${node.tagName}', already have '${currentKey}; (missing color dict?)'`,
        );
      }

      let value = node.textContent;

      // fixme: ignore dark and light modes rn
      value = value.replace(/ \((Dark|Light)\)/, "");

      currentKey = referenceFromColorName(value);
      continue;
    }

    if (node.tagName === "dict") {
      if (!currentKey) {
        throw new Error("Unexpected color dict without key");
      }

      const color = parseColorDict(node);

      ret[currentKey] = color;
      currentKey = undefined;
    }
  }

  return ret;
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
