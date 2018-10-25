// This function receives color in hexadecimal format
// converts and returns color in RGB format
const getRGBComponents = function (color) {
  const r = color.substring(1, 3);
  const g = color.substring(3, 5);
  const b = color.substring(5, 7);
  return {
    R: parseInt(r, 16),
    G: parseInt(g, 16),
    B: parseInt(b, 16)
  };
};

// This function takes the background color of a cell in
// hexadecimal format and then calculates a value bgDelta
// using the RGB components in the background color and
// decides whether the text color needs to be black or white
// based on intensity of background color
export function idealTextColor(bgColor) {
  if (bgColor) {
    const nThreshold = 105;
    const components = getRGBComponents(bgColor);
    const bgDelta = (components.R * 0.299) + (components.G * 0.587) + (components.B * 0.114);
    return ((255 - bgDelta) < nThreshold) ? '#000000' : '#ffffff';
  } else {
    return '#000000';
  }
}

/**
 *    CSS provides HSL color mode that controls Hue, Saturation,
 *    Luminosity(Lightness) and optionaly Opacity
 *
 *    color: hsla(50, 80%, 20%, 0.5);
 *    background-color: hsl(120, 100%, 50%);
 *
 *    hex —> hex color value such as “#abc” or “#123456″ (the hash is optional)
 *    lum —> luminosity factor: -0.1 is 10% darker, 0.2 is 20% lighter
 **/
export function colorLuminance(hex, lum) {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;

  // convert to decimal and change luminosity
  let rgb = '#';
  let c;
  let i;
  for (i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    rgb += ('00' + c).substr(c.length);
  }
  return rgb;
}

