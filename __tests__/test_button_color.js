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
  const message = doc.getElementById('message');

  assert(!!clickMeBtn, 'clickMe button exists');
  assert(!!changeColorBtn, 'changeColorBtn button exists (new button present)');
  assert(!!message, 'message div exists');

  clickMeBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
  assert(message.innerText.includes('Button was clicked'), 'clickMe still shows message on click');

  const initialColor = clickMeBtn.style.background;

  changeColorBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
  const afterFirstClick = clickMeBtn.style.background;
  assert(afterFirstClick !== initialColor, 'clicking changeColorBtn changes clickMe button color (1st click)');

  changeColorBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
  const afterSecondClick = clickMeBtn.style.background;
  assert(afterSecondClick !== afterFirstClick, 'clicking changeColorBtn changes color again (2nd click)');

  const seen = new Set([initialColor, afterFirstClick, afterSecondClick]);
  let wrapped = false;
  for (let i = 0; i < 6; i++) {
    changeColorBtn.dispatchEvent(new window.Event('click', { bubbles: true }));
    const c = clickMeBtn.style.background;
    if (seen.has(c)) { wrapped = true; break; }
    seen.add(c);
  }
  assert(wrapped, 'color cycle wraps around through a fixed palette');

  if (process.exitCode === 1) {
    console.error('\nSome tests failed.');
    process.exit(1);
  } else {
    console.log('\nAll tests passed.');
  }
}

run();
