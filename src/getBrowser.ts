import puppeteer, { Browser } from "puppeteer-core";
import localPuppeteer, { Browser as LocalBrowser } from "puppeteer";
import chromium from "@sparticuz/chromium";

export default async () => {
  let browser: Browser | LocalBrowser;

  if (process.env.NODE_ENV === "production") {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
  } else {
    browser = await localPuppeteer.launch();
  }

  return browser;
};
