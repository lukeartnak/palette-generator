function rgbToHsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);

  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [r * 255, g * 255, b * 255];
}

const rgbs = [];
const hsls = [];

for (let h = 0; h < 360; h += 20) {
  hsls.push([h, 60, 50]);
  rgbs.push(hslToRgb(h, 60, 50));
}

const selectedIndexes = [0, 8];

function onSelectColor(index) {
  if (selectedIndexes.includes(index)) return;
  const removedIndex = selectedIndexes.shift();
  selectedIndexes.push(index);
  $(`.color:nth-of-type(${removedIndex + 1})`).removeClass('selected');
  $(`.color:nth-of-type(${index + 1})`).addClass('selected');
  createPalette();
}

function blendHues(hueA, hueB) {
  const [redA, greenA, blueA] = hslToRgb(hueA, 60, 50);
  const [redB, greenB, blueB] = hslToRgb(hueB, 60, 50);
  return rgbToHsl(redA + redB / 3, greenA + greenB / 3, blueA + blueB / 3)[0];
}

function createPalette() {
  const hues = [];
  hues.push(hsls[selectedIndexes[0]][0]);
  hues.push(hsls[selectedIndexes[0]][0] + 30);
  hues.push(hsls[selectedIndexes[1]][0]);
  hues.push(hsls[selectedIndexes[1]][0] + 30);
  hues.push((hues[0] + hues[2]) / 2 - 180);

  const blendHue = (hues[0] + hues[2]) / 2 - 150;
  $('#palette').html(hues.map(hue => createSwatch(blendHues(hue, blendHue))));
  //$('#palette').html(hues.map(createSwatch));
}

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

function createColor([r, g, b], index) {
  const div = $(
    `<div class="color" style="background: rgb(${r}, ${g}, ${b})"></div>`
  );
  if (selectedIndexes.includes(index)) div.addClass('selected');
  div.click(() => onSelectColor(index));
  return div;
}

$(document).ready(() => {
  for (let i = 0; i < 360; i += 20) {
    $('#colors').html(rgbs.map(createColor));
    createPalette();
  }
});
