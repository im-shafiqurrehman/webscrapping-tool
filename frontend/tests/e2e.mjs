import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const baseUrl = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3010';
const chromePath =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const outputDirectory = path.resolve('test-results');
mkdirSync(outputDirectory, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setCacheEnabled(false);
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
const browserErrors = [];
page.on('pageerror', (error) => browserErrors.push(`page: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') {
    const location = message.location().url;
    browserErrors.push(`console${location ? ` (${location})` : ''}: ${message.text()}`);
  }
});

const pause = (milliseconds = 180) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const bodyText = () => page.evaluate(() => document.body.innerText);

async function replaceInput(input, value) {
  await input.evaluate((element) => {
    element.value = '';
  });
  await input.type(value);
}

async function go(route) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle0' });
  assert.equal(response?.status(), 200, `${route} should return HTTP 200`);
}

async function waitForText(text) {
  try {
    await page.waitForFunction(
      (expected) => document.body.innerText.toLowerCase().includes(expected.toLowerCase()),
      {},
      text,
    );
  } catch (error) {
    const visibleText = (await bodyText()).replaceAll(/\s+/g, ' ').slice(0, 700);
    throw new Error(
      `Timed out waiting for “${text}” at ${page.url()}. Visible text: ${visibleText}. Browser errors: ${browserErrors.join(' | ') || 'none'}`,
      { cause: error },
    );
  }
}

async function clickText(text, selector = 'button') {
  const clicked = await page.evaluate(
    ({ expected, query }) => {
      const candidates = [...document.querySelectorAll(query)];
      const normalized = expected.toLowerCase();
      const element =
        candidates.find((candidate) => candidate.textContent?.trim().toLowerCase() === normalized) ??
        candidates.find((candidate) =>
          candidate.textContent?.trim().toLowerCase().includes(normalized),
        );
      if (!(element instanceof HTMLElement)) return false;
      element.click();
      return true;
    },
    { expected: text, query: selector },
  );
  assert.equal(clicked, true, `Expected a clickable ${selector} containing “${text}”`);
  await pause();
}

async function test(name, callback) {
  await callback();
  console.log(`PASS ${name}`);
}

try {
  await test('signup, logout, failed login, and restored login work', async () => {
    await go('/dashboard');
    await page.waitForFunction(() => location.pathname === '/login');
    await waitForText('Welcome back');

    const initialEmail = await page.$('input[name="email"]');
    const password = await page.$('input[name="password"]');
    assert.ok(initialEmail && password, 'login fields should exist');
    assert.equal(await initialEmail.evaluate((element) => element.value), '');
    assert.equal(await password.evaluate((element) => element.value), '');
    assert.equal(
      await initialEmail.evaluate((element) => element.getAttribute('placeholder')),
      'admin@northstar.local',
    );
    assert.equal(
      await password.evaluate((element) => element.getAttribute('placeholder')),
      'Northstar123!',
    );
    await initialEmail.type('admin@northstar.local');
    await replaceInput(password, 'WrongPassword1');
    await clickText('Sign in');
    await waitForText('Invalid credentials');

    await clickText('Create an account', 'a');
    await page.waitForFunction(() => location.pathname === '/signup');
    await waitForText('Create your account');
    await page.screenshot({ path: path.join(outputDirectory, 'signup.png'), fullPage: true });
    const registeredEmail = `qa-${Date.now()}@example.com`;
    await page.type('input[name="name"]', 'QA Account');
    await page.type('input[name="email"]', registeredEmail);
    await page.type('input[name="password"]', 'Verified123!');
    await page.type('input[name="confirmPassword"]', 'Verified123!');
    await clickText('Create account');
    await page.waitForFunction(() => location.pathname === '/dashboard');
    await page.reload({ waitUntil: 'networkidle0' });
    await waitForText('Good morning, QA');
    await page.click('button[aria-label="Open account menu"]');
    await waitForText(registeredEmail);
    await page.screenshot({ path: path.join(outputDirectory, 'authenticated-dashboard.png') });
    await clickText('Sign out');
    await page.waitForFunction(() => location.pathname === '/login');

    const email = await page.$('input[name="email"]');
    const loginPassword = await page.$('input[name="password"]');
    assert.ok(email && loginPassword, 'login fields should exist after signing out');
    await replaceInput(email, registeredEmail);
    await replaceInput(loginPassword, 'Verified123!');
    await clickText('Sign in');
    await page.waitForFunction(() => location.pathname === '/dashboard');
  });

  await test('dashboard renders metrics, charts, and top opportunities', async () => {
    await go('/dashboard');
    await waitForText('Good morning, QA');
    assert.match(await bodyText(), /Top opportunities/);
    assert.ok((await page.$$('svg.recharts-surface')).length >= 2, 'dashboard charts should render');
    await page.screenshot({ path: path.join(outputDirectory, 'dashboard.png'), fullPage: true });
    await page.click('[data-testid="dashboard-prospect-prospect-1"]');
    await page.waitForFunction(() => location.pathname === '/businesses/prospect-1');
    await waitForText('Northstar Heating & Air');
  });

  await test('workspace navigation opens niche and audit views', async () => {
    await clickText('Niches', 'a');
    await page.waitForFunction(() => location.pathname === '/niches');
    await waitForText('Niche opportunities');
    await clickText('HVAC', 'a');
    await page.waitForFunction(() => location.pathname === '/niches/hvac');
    await waitForText('Niche details');
    await waitForText('Businesses in HVAC');
    await go('/niches');
    await page.click('a[aria-label="View Remodeling niche details"]');
    await page.waitForFunction(() => location.pathname === '/niches/remodeling');
    await waitForText('Businesses in Remodeling');
    await clickText('Audits', 'a');
    await page.waitForFunction(() => location.pathname === '/audits');
    await waitForText('Audit center');
  });

  await test('notifications close outside and expose an empty state after being read', async () => {
    await page.click('button[aria-label="Open notifications"]');
    await waitForText('3 unread');
    await page.click('main');
    await page.waitForFunction(
      () => document.querySelector('button[aria-label="Open notifications"]')?.getAttribute('aria-expanded') === 'false',
    );
    await page.click('button[aria-label="Open notifications"]');
    await clickText('Mark all read');
    await waitForText('No notifications');
    await page.keyboard.press('Escape');
    await page.waitForFunction(
      () => document.querySelector('button[aria-label="Open notifications"]')?.getAttribute('aria-expanded') === 'false',
    );
  });

  await test('workspace selector opens and links to market management', async () => {
    await page.click('button[aria-label="Select workspace"]');
    await waitForText('Current workspace');
    const manageMarkets = await page.$('a[href="/settings/markets"]');
    assert.ok(manageMarkets, 'workspace menu should link to market management');
    await page.click('button[aria-label="Select workspace"]');
  });

  await test('additional markets can be added, selected, and used for research', async () => {
    await go('/settings/markets');
    await waitForText('Markets & locations');
    await clickText('Add market');
    await waitForText('Add a research market');
    await page.select('select[aria-label="Market country"]', 'United Kingdom');
    await page.type('input[aria-label="Market city"]', 'London');
    await page.type('input[aria-label="Market region"]', 'Greater London');
    await page.type('input[aria-label="Market areas"]', 'Westminster, Camden, Islington');
    await clickText('Add and select market');
    await waitForText('London market added');
    await page.click('button[aria-label="Select workspace"]');
    await waitForText('Current workspace');
    await waitForText('United Kingdom');
    await page.click('button[aria-label="Select London market"]');
    await clickText('Research', 'a');
    await page.waitForFunction(() => location.pathname === '/research');
    const location = await page.$('input[aria-label="Research location"]');
    assert.ok(location, 'research location should be available');
    assert.equal(
      await location.evaluate((element) => element.value),
      'London, Greater London, United Kingdom',
    );
    const areaOptions = await page.$$eval('select', (selects) =>
      selects.flatMap((select) => [...select.options].map((option) => option.text)),
    );
    assert.ok(areaOptions.includes('Westminster'), 'new market areas should be available');
  });

  await test('business table search, filters, export, and add flow work', async () => {
    await go('/businesses');
    const search = await page.$('input[placeholder="Search name, niche, or area…"]');
    assert.ok(search, 'business search input should exist');
    await search.type('Northstar');
    await pause();
    assert.equal((await page.$$('tbody tr')).length, 1, 'search should reduce the table to one row');
    await search.click({ clickCount: 3 });
    await search.press('Backspace');

    const selects = await page.$$('select');
    assert.ok(selects.length >= 3, 'table filter controls should exist');
    await selects[0].select('Home Services');
    await pause();
    const filteredText = await bodyText();
    assert.doesNotMatch(filteredText, /Valley Smile Studio/);
    await selects[0].select('All industries');
    await go('/businesses');

    const cdp = await page.createCDPSession();
    await cdp.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: outputDirectory,
    });
    await clickText('Export CSV');
    await pause(500);
    assert.ok(
      readdirSync(outputDirectory).some((file) => file.endsWith('.csv')),
      'CSV export should download a file',
    );

    await clickText('Add business');
    await waitForText('Start with observed public information');
    await page.type('input[placeholder="Business name"]', 'QA Verified Business');
    await clickText('Add to research queue');
    await waitForText('QA Verified Business');
    await page.waitForSelector('[data-sonner-toast]');
    assert.match(await bodyText(), /QA Verified Business added/);
  });

  await test('business profile tabs and audit save controls work', async () => {
    await go('/businesses');
    await clickText('Northstar Heating & Air', 'a');
    await page.waitForFunction(() => location.pathname === '/businesses/prospect-1');
    await waitForText('Northstar Heating & Air');
    await waitForText('Illustrative demo record');
    const sourceLinks = await page.$$('a[target="_blank"]');
    assert.ok(sourceLinks.length >= 3, 'demo website and source links should be actionable');
    const mapsSource = await page.$('a[href^="https://www.google.com/maps/search/"]');
    assert.ok(mapsSource, 'public business profile search should have a working URL');
    await clickText('Website Audit');
    await waitForText('Mark only what you can verify');
    await clickText('weak');
    const evidence = await page.$('input[placeholder="https://public-source.example"]');
    assert.ok(evidence, 'evidence URL field should exist');
    await evidence.type('https://example.com/evidence');
    await clickText('Save audit');
    await waitForText('Saved');
    await clickText('Scoring');
    await waitForText('Client score breakdown');
    await clickText('Start outreach');
    await waitForText('Personalized cold email');
    await page.screenshot({ path: path.join(outputDirectory, 'business-detail.png'), fullPage: true });
  });

  await test('research wizard advances through scope, import, and review', async () => {
    await go('/research');
    await clickText('Continue to data');
    await waitForText('Add public business data');
    await waitForText('Live business discovery');
    await clickText('Search live data');
    await waitForText('Live search is disabled');
    await clickText('CSV');
    await waitForText('Drop your CSV file here');
    await clickText('Create research run');
    await waitForText('Research run created');
  });

  await test('prospect ranking and outreach generation respond to clicks', async () => {
    await go('/prospects');
    await waitForText('Highest priority prospect');
    await clickText('Top 100');
    await page.waitForFunction(() => {
      const button = [...document.querySelectorAll('button')].find(
        (candidate) => candidate.textContent?.trim() === 'Top 100',
      );
      return button?.classList.contains('bg-ink');
    });
    await go('/outreach');
    await page.select('select', 'prospect-2');
    await clickText('Generate message');
    await waitForText('Claim validation passed');
    assert.match(await bodyText(), /A quick idea for Cedar & Stone Remodels/);
    await clickText('Save draft');
    await waitForText('Draft saved in this outreach workspace');
    await clickText('Mark complete');
    await waitForText('Outreach task marked complete');
    const sendEmail = await page.$('[data-testid="outreach-send-email"]');
    assert.ok(sendEmail, 'send email action should be available for prospects with public email');
    const gmailHref = (await sendEmail.evaluate((element) => element.getAttribute('href'))) ?? '';
    assert.match(gmailHref, /^https:\/\/mail\.google\.com\/mail\/\?/);
    assert.match(gmailHref, /to=hello%40demo-2\.example/);
  });

  await test('pipeline supports native drag and drop between stages', async () => {
    await go('/pipeline');
    await clickText('Follow-ups');
    await waitForText('Contacted leads that need a next action');
    await page.click('button[aria-label="Close follow-ups"]');
    await clickText('Add lead');
    await waitForText('Create a lead in the New Lead stage');
    await page.type('input[aria-label="Lead name"]', 'QA Pipeline Lead');
    await page.type('input[aria-label="Lead niche"]', 'Roofing');
    await page.type('input[aria-label="Lead email"]', 'qa-pipeline@example.com');
    await clickText('Create lead');
    await waitForText('QA Pipeline Lead');
    await page.waitForSelector('[data-sonner-toast]');
    await page.click('button[aria-label="Open notifications"]');
    await waitForText('New lead created in the pipeline');
    await page.click('main');
    const moved = await page.evaluate(async () => {
      const card = [...document.querySelectorAll('[draggable="true"]')].find((element) =>
        element.textContent?.includes('Northstar Heating & Air'),
      );
      const heading = [...document.querySelectorAll('h3')].find(
        (element) => element.textContent?.trim() === 'New Lead',
      );
      const column = heading?.parentElement?.parentElement?.parentElement;
      if (!(card instanceof HTMLElement) || !(column instanceof HTMLElement)) return false;
      const transfer = new DataTransfer();
      card.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: transfer }));
      await new Promise((resolve) => setTimeout(resolve, 100));
      column.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: transfer }));
      column.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: transfer }));
      return true;
    });
    assert.equal(moved, true, 'a pipeline card and target column should be available');
    await pause(300);
    const newLeadColumnHasCard = await page.evaluate(() => {
      const heading = [...document.querySelectorAll('h3')].find(
        (element) => element.textContent?.trim() === 'New Lead',
      );
      return heading?.parentElement?.parentElement?.parentElement?.textContent?.includes(
        'Northstar Heating & Air',
      );
    });
    assert.equal(newLeadColumnHasCard, true, 'dragged card should appear in New Lead');
    await page.screenshot({ path: path.join(outputDirectory, 'pipeline.png'), fullPage: true });
  });

  await test('report generation modal and settings controls work', async () => {
    await go('/reports');
    await clickText('Generate');
    await waitForText('Market report is ready');
    await clickText('Close');
    await go('/settings');
    const range = await page.$('input[type="range"]');
    assert.ok(range, 'scoring range input should exist');
    await range.evaluate((element) => {
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set;
      valueSetter?.call(element, '19');
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await waitForText('99/100');
    await clickText('Save changes');
    await waitForText('Saved');
  });

  await test('authenticated mobile navigation opens', async () => {
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await go('/dashboard');
    await page.click('button[aria-label="Open navigation"]');
    const closeButton = await page.$('button[aria-label="Close navigation"]');
    assert.ok(closeButton, 'mobile navigation should open');
    await page.waitForFunction(() => {
      const drawer = document.querySelector('aside');
      if (!(drawer instanceof HTMLElement)) return false;
      const bounds = drawer.getBoundingClientRect();
      return Math.abs(bounds.left) < 1 && bounds.width >= 230;
    });
    await page.screenshot({ path: path.join(outputDirectory, 'mobile-navigation.png'), fullPage: true });
  });

  assert.deepEqual(browserErrors, [], `Browser errors detected:\n${browserErrors.join('\n')}`);
  assert.ok(existsSync(path.join(outputDirectory, 'dashboard.png')));
  console.log('All browser interaction checks passed.');
} finally {
  await browser.close();
}
