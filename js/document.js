function setRootColor(ref, cssColor) {
  document.documentElement.style.setProperty(
    `--${ref}`,
    formatColorCodeForCSS(cssColor),
  );
}

const storage = window.localStorage;
let selectedTheme = storage.getItem("selected-theme") ?? "light";
let enableDualTheme = !!storage.getItem("dual-theme");

function loadPalette(theme) {
  console.debug("palette: loading", theme);
  const palette = {};
  for (const ref of references) {
    console.debug("palette: loading", theme + "-" + ref);
    const color = storage.getItem(theme + "-" + ref);
    if (color) {
      palette[ref] = color;
    } else {
      console.log("no color for ", theme + "-" + ref);
    }
  }
  return palette;
}

const themeSelector = document.getElementById("theme-selector");
themeSelector.value = selectedTheme;
themeSelector.disabled = !enableDualTheme;
themeSelector.addEventListener("change", (event) => {
  console.debug("theme-selector: changed to", event.target.value);
  selectedTheme = event.target.value;
  storage.setItem("selected-theme", selectedTheme);
  const palette = loadPalette(selectedTheme);
  setPalette(palette);
});

const dualTheme = document.getElementById("dual-theme");
dualTheme.checked = enableDualTheme;
dualTheme.addEventListener("change", (event) => {
  enableDualTheme = event.target.checked;
  storage.setItem("dual-theme", enableDualTheme ? "jippie" : "");
  themeSelector.disabled = !enableDualTheme;
});

const colorCodeInputs = document.querySelectorAll(".terminal input[type=text]");
function setPalette(palette) {
  for (const ref of references) {
    const _paletteColor = palette[ref];
    if (_paletteColor === undefined) {
      continue;
    }

    const referencedInput = Array.from(colorCodeInputs).find(
      (input) => input.id === ref,
    );
    if (!referencedInput) {
      throw new Error(`No input found for ${ref}`);
    }

    let inputColorCode = formatColorCodeForInputValue(_paletteColor);
    const usesAlpha = referencedInput.dataset.alpha !== undefined;

    // cut inputColorCode code to 6 or 8
    inputColorCode = inputColorCode.slice(0, usesAlpha ? 8 : 6);

    referencedInput.value = inputColorCode;
    storage.setItem(selectedTheme + "-" + ref, inputColorCode);
    if (isValidInputColorCode(inputColorCode, usesAlpha)) {
      setRootColor(ref, formatColorCodeForCSS(inputColorCode));
      delete referencedInput.dataset.invalid;
    } else {
      referencedInput.dataset.invalid = "";
    }

    if (inputColorCode === "") {
      setRootColor(ref, "transparent");
    }
  }
}

const livePalette = { ...lightDefaultPalette };
for (ref of references) {
  const storedColorCode = storage.getItem(selectedTheme + "-" + ref);
  if (storedColorCode) {
    livePalette[ref] = storedColorCode;
  }
}

setPalette(livePalette);

/// initialize input fields
for (const input of colorCodeInputs) {
  const ref = input.id;
  const usesAlpha = input.dataset.alpha !== undefined;
  const maxLength = usesAlpha ? 8 : 6;

  input.setAttribute("maxlength", maxLength);
  input.setAttribute("pattern", `[0-9a-fA-F]{${maxLength}}`);

  // on change
  input.addEventListener("input", (event) => {
    const colorCode = event.target.value;

    storage.setItem(selectedTheme + "-" + ref, colorCode);
    console.log("setting:", selectedTheme + "-" + ref, "=", colorCode);

    if (isValidInputColorCode(colorCode, usesAlpha)) {
      setRootColor(ref, formatColorCodeForCSS(colorCode));
      delete event.target.dataset.invalid;
    } else {
      event.target.dataset.invalid = "";
    }
  });
}

/// import theme
const importButton = document.getElementById("apply-theme");
importButton.addEventListener("click", async () => {
  const fileInput = document.getElementById("import-xml");
  const file = fileInput.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result;
    const colors = parsePlist(content);
    setPalette(colors);

    // store colors in storage
    for (const ref of references) {
      const color = colors[ref];
      if (color) {
        storage.setItem(selectedTheme + "-" + ref, color);
      }
    }
  };
  reader.readAsText(file);
});

/// reset fields
const resetButton = document.getElementById("clear-fields");
resetButton.addEventListener("click", () => {
  for (const input of colorCodeInputs) {
    let value = "";

    if (input.id === "background-color") {
      value = "ffffff";
    } else if (input.id === "foreground-color") {
      value = "000000";
    }

    input.value = value;
    setRootColor(input.id, value);
    storage.setItem(selectedTheme + "-" + input.id, value);
  }
});
