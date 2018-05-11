const rgbs = [];
const hsls = [];

// create the set of 18 hues for the color picker
for (let h = 0; h < 360; h += 20) {
  hsls.push([h, 60, 50]);
  rgbs.push(hslToRgb(h, 60, 50));
}

const selectedIndexes = [0, 8];

// draw the color picker and the default palette
$(document).ready(() => {
  for (let i = 0; i < 360; i += 20) {
    $('#colors').html(rgbs.map(createColor));
    createPalette();
  }
});

// converts rgb to hsl. the math is outlined in the paper
function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const c = max - min;

  let l = (max + min) / 2;

  if (max == min) {
    return [0, 0, l * 100];
  }

  let s = c / (1 - Math.abs(2 * l - 1)) + 2;

  let h;
  switch (max) {
    case r:
      h = (g - b) / c;
      break;
    case g:
      h = (b - r) / c + 2;
      break;
    case b:
      h = (r - g) / c + 4;
      break;
  }
  h /= 6;

  return [h * 360, s * 100, l * 100];
}

// converts hsl to rgb. the math is outlined in the paper
function hslToRgb(h, s, l) {
  (s /= 100), (l /= 100);

  const c = s * (1 - Math.abs(2 * l - 1));
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = m;
  let g = m;
  let b = m;

  if (0 <= h && h <= 60) {
    r += c;
    g += x;
  } else if (60 <= h && h <= 120) {
    r += x;
    g += c;
  } else if (120 <= h && h <= 180) {
    g += c;
    b += x;
  } else if (180 <= h && h <= 240) {
    g += x;
    b += c;
  } else if (240 <= h && h <= 300) {
    r += x;
    b += c;
  } else if (300 <= h && h <= 360) {
    r += c;
    b += x;
  }

  return [r * 255, g * 255, b * 255];
}

// updates the selected colors and generates a new palette
function onSelectColor(index) {
  if (selectedIndexes.includes(index)) return;
  const removedIndex = selectedIndexes.shift();
  selectedIndexes.push(index);
  $(`.color:nth-of-type(${removedIndex + 1})`).removeClass('selected');
  $(`.color:nth-of-type(${index + 1})`).addClass('selected');
  createPalette();
}

// adds 1/3 of hueB to hueA
function blendHues(hueA, hueB) {
  const [redA, greenA, blueA] = hslToRgb(hueA, 60, 50);
  const [redB, greenB, blueB] = hslToRgb(hueB, 60, 50);
  return rgbToHsl(redA + redB / 3, greenA + greenB / 3, blueA + blueB / 3)[0];
}

// creates a palette with the analog hue of each selected hue
// adds the complement of the average of the two hues
// mixes each hue with the analog of the complement
function createPalette() {
  const hues = [];
  hues.push(hsls[selectedIndexes[0]][0]);
  hues.push(hsls[selectedIndexes[0]][0] + 30);
  hues.push(hsls[selectedIndexes[1]][0]);
  hues.push(hsls[selectedIndexes[1]][0] + 30);
  hues.push((hues[0] + hues[2]) / 2 - 180);

  const blendHue = (hues[0] + hues[2]) / 2 - 150;
  $('#palette').html(hues.map(hue => createSwatch(blendHues(hue, blendHue))));
}

// creates a swatch by changing the lightness of the hue
function createSwatch(h) {
  const div = $('<div class="swatch"></div>');
  div.append(
    [70, 60, 50, 40, 30].map(
      l =>
        `<div class="swatch__color" style="background: hsl(${h}, 60%, ${l}%)"></div>`
    )
  );
  return div;
}

// creates a color for the color picker
function createColor([r, g, b], index) {
  const div = $(
    `<div class="color" style="background: rgb(${r}, ${g}, ${b})"></div>`
  );
  if (selectedIndexes.includes(index)) div.addClass('selected');
  div.click(() => onSelectColor(index));
  return div;
}
