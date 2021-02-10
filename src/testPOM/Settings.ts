import {Page} from "puppeteer";
import NavPage from "./Nav";
import {expect} from "chai";
import HomePage from "./Home";

export class SettingsPage {
    private page: Page;
    private navHeader: NavPage;

    constructor(page: Page) {
        this.page = page;
        this.navHeader = new NavPage(this.page);
    }

    async go() {
        await this.page.waitForSelector('#settings-header');
    }

    async fillInBirthDay(date: Date) {
        await this.page.waitForSelector('#set-birthday');
        let setBirthdayInput = await this.page.$("#set-birthday");
        if (setBirthdayInput == null) {
            throw Error("The form with id '#set-birthday' is missing");
        }
        let dateOnly = date.toISOString().split("T")[0];
        let [year, month, day] = dateOnly.split("-");
        // @ts-ignore
        await page.$eval('#set-birthday', (el, value) => el.value = value, dateOnly);
    }

    async submitBirthDay(): Promise<HomePage> {
        let setBirthdayInput = await this.page.$("#set-birthday");
        if (setBirthdayInput == null) {
            throw Error("The form with id '#set-birthday' is missing");
        }
        await setBirthdayInput.focus();
        await this.page.keyboard.press("Enter");
        return new HomePage(this.page);
    }
}