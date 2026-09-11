const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL: ' + msg);
    process.exitCode = 1;
  } else {
    console.log('PASS: ' + msg);
  }
}

async function run() {
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
  const { window } = dom;

  await new Promise((r) => setTimeout(r, 50));

  const doc = window.document;
  const clickMeBtn = doc.getElementById('clickMe');
  const changeColorBtn = doc.getElementById('changeColorBtn');

  // Extract the palette array straight from the page's own script so this
  // test verifies the real running palette, not a hardcoded copy of it.
  const scriptText = Array.from(doc.querySelectorAll('script'))
    .map((s) => s.textContent)
    .join('\n');
  const match = scriptText.match(/const buttonColors = (\[[^\]]*\]);/);
  assert(!!match, 'buttonColors palette array is present in the script');
  const palette = JSON.parse(match[1].replace(/'/g, '"'));

  // The ask was "add more colors" on top of the previous 12-color palette.
  assert(palette.length > 12, `palette has more than 12 colors (found ${palette.length})`);
  assert(new Set(palette).size === palette.length, 'every color in the palette is unique (no accidental duplicates)');
  palette.forEach((c) => assert(/^#[0-9a-fA-F]{6}$/.test(c), `"${c}" is a valid 6-digit hex color`));

  // Click through the entire palette length and confirm we land back on the
  // first advanced color (index 1), proving colorIndex % buttonColors.length
  // still wraps correctly for the new, larger array.
  let lastColor;
  for (let i = 0; i < palette.length; i++) {
    changeColorBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
    lastColor = clickMeBtn.style.background;
  }
  const rgbToHex = (rgb) => {
    const m = rgb.match(/\d+/g).map(Number);
    return '#' + m.map((n) => n.toString(16).padStart(2, '0')).join('');
  };
  assert(rgbToHex(lastColor) === palette[0].toLowerCase(), 'after exactly one full lap of clicks, color wraps back to the first palette color (no off-by-one)');

  // One click further should move to the *second* color again, not repeat
  // the first, confirming the cycle continues correctly past the wrap.
  changeColorBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
  const nextColor = rgbToHex(clickMeBtn.style.background);
  assert(nextColor === palette[1].toLowerCase(), 'the click after wrapping advances to the second palette color as expected');

  if (process.exitCode === 1) {
    console.error('\nSome tests failed.');
    process.exit(1);
  } else {
    console.log('\nAll tests passed.');
  }
}

run();
