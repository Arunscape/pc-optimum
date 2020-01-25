import { Page, Browser } from "puppeteer";
import puppeteer = require('puppeteer');
import { getLaunchConfig } from "./launchConfig";

const getRandom = () =>  Math.floor((Math.random() * 200) + 50);

export const getPDFPath = async (username: string, password: string) => {
    // puppeteer constants
    const URL: string = "https://www.pcoptimum.ca/login";
    const EMAIL_INPUT: string = "#email";
    const PASS_INPUT: string = "#password";
    const PDF_PATH: string = `/tmp/pc-points-${username}-${(new Date()).toDateString().replace(/ /g, '-')}.pdf`;


    const browser: Browser = await puppeteer.launch(getLaunchConfig());

    let page: Page;
    try {
        console.info('opening new tab');
        page = await browser.newPage();
        await page.setCacheEnabled(false);
        await page.setViewport({ 'width': 1920, 'height': 1080 });
    }
    catch (err) {
        console.error(err);
    }

    console.info('going to url');

    await page.goto(URL, { waitUntil: 'networkidle0' });
    console.info('went to url');

    console.info('logging in to pc w/ %s', username);
    await page.focus(EMAIL_INPUT);
    await page.keyboard.type(username, {delay: getRandom()});
    console.info('typed username');

    console.info('typeing password');
    await page.focus(PASS_INPUT);
    await page.keyboard.type(password, {delay: getRandom()});
    console.info('typed password');

    await page.focus('#login > button');

    console.info('clicking submit button');
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('#login > button')
    ]);

    await page.waitFor(3000);

    console.info('getting pdf');

    await page.emulateMediaType('screen');

    await page.evaluate((username: string) => {
        const menu: HTMLCollection = document.getElementsByClassName('menu');
        const siteFooter: HTMLCollection = document.getElementsByClassName('site-footer');
        const promotedAction: HTMLCollection = document.getElementsByClassName('promoted-action');
        const offersHeaderPoints: HTMLCollection = document.getElementsByClassName('offers-header-points__value');

        const elements = document.querySelectorAll('li.invisible-offer');
        for (let i = 0; i < elements.length; i++) {
            const li = elements[i] as HTMLElement;
            li.setAttribute('tabindex', i+'');
            li.focus();
            li.click(); 
        }

        // remove uneeded items
        menu.length != 0 ? (menu.item(0) as HTMLElement).style.display = 'None' : '';
        siteFooter.length != 0 ? (siteFooter.item(0) as HTMLElement).style.display = 'None' : '';
        promotedAction.length != 0 ? (promotedAction.item(0) as HTMLElement).style.display = 'None' : '';
        offersHeaderPoints.length != 0 ? (offersHeaderPoints.item(0) as HTMLElement).innerText = username.split('@')[0] : '';
        return;
    }, username);
    console.log('getting pdf');
    await page.pdf({ path: PDF_PATH, printBackground: true, displayHeaderFooter: false });
    console.info('got pdf and closeing pdf');
    await page.close();
    await browser.close();

    return PDF_PATH;

}