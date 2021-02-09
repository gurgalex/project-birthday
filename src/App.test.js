//const puppeteer = require('puppeteer');
import puppeteer from "puppeteer";
import { expect } from 'chai';

// puppeteer options
const opts = {
    headless: true,
    slowMo: 0,
    args: ["--enable-low-end-device-mode"],
};

// testing local options
const base = "http://localhost:8080";
const site = {
    home: `${base}/#/`,
    settings: `${base}/#/settings`,
};

describe('App', () => {

    before(async () => {
        global.browser = await puppeteer.launch(opts);
        global.page = await browser.newPage();
        page.setDefaultTimeout(5000);
        console.log("Launch the global browser");
    });
    after(async () => {
       await page.close();
       await browser.close();
       console.log("Closed the global browser");
    });

    it("The homepage loads", async () => {
        await page.goto(site.home);
        await page.waitForSelector("#home-greeting");
    });


    it("Prompt the user to setup their birthday if they have not used the site before", async () => {
        await page.waitForSelector("#no-settings-greeting");
    });

    it('Show an edit settings button on the home page', async () => {
        await page.waitForSelector("#settings-setup-btn");
        const element = await page.$("#settings-setup-btn");
        const result = await page.evaluate(el => el.textContent, element)
        expect(result).to.equal("Setup Birthday");
    });

    it('Navigate to the Settings page when clicking the setup button', async () => {
        await page.waitForSelector("#settings-setup-btn");
        let setupSettingsBtn = await page.$("#settings-setup-btn");
        await setupSettingsBtn.click();
        await page.waitForSelector('#settings-header');
        expect(await page.url()).to.equal(site.settings);
        let element = await page.$('#settings-header');
        await expect(element).to.not.eq({});
    });

    it("Clicking on the home link from settings takes you back to the homepage", async () => {
        await page.goto(site.settings);
        await page.waitForSelector('#settings-header');
        expect(await page.url()).to.eq(site.settings);
        await page.click("#home-link");
        await page.waitForSelector("#home-greeting");
    });

    it("Clicking on the settings link from the homepage takes you to the settings page", async () => {
        await page.goto(site.home);
        await page.waitForSelector('#home-greeting');
        await page.click("#settings-link");
        await page.waitForSelector('#settings-header');
        expect(await page.url()).to.eq(site.settings);
    });


    it('Saving your birthday reminder navigates to the homepage with the new birthday', async () => {
        await page.goto(site.settings);
        await page.waitForSelector('#set-birthday');
        let setBirthdayInput = await page.$("#set-birthday");
        await setBirthdayInput.type("01/23/2022");
        await page.keyboard.press("Enter");
        await page.waitForSelector('#when-next-birthday');
        await expect(page.url()).to.eq(site.home);
        let homeWhenBirthday = await page.$("#when-next-birthday");
        let homeDateString = await homeWhenBirthday.evaluate(el => el.dataset.date);
        expect(homeDateString).to.eq("2022-01-23T00:00:00.000Z");
    });
})