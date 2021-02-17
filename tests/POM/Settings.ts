import {Page} from "puppeteer";
import NavPage from "./Nav";
import HomePage from "./Home";


export class SettingsPage {
    static route = "/#/settings";
    static headerID = "settings-header";
    static birthdayInputID = "set-birthday";
    static selector = {
        birthdayInput: `#${SettingsPage.birthdayInputID}`,
        header: `#${SettingsPage.headerID}`,
    };
    public page: Page;
    public navHeader: NavPage;

    constructor(page: Page) {
        this.page = page;
        this.navHeader = new NavPage(this.page);
    }

    async go() {
        await this.page.goto(process.env.SITE_URL + SettingsPage.route);
        await this.page.waitForSelector(SettingsPage.selector.header);

    }

    async settingsFormBirthdayElement() {
        await this.page.waitForSelector(SettingsPage.selector.birthdayInput);
        return await this.page.$(SettingsPage.selector.birthdayInput);

    }

    async fillInBirthDay(date: Date) {
        let setBirthdayInput = await this.settingsFormBirthdayElement();
        if (setBirthdayInput == null) {
            throw Error(`The form field with id ${SettingsPage.birthdayInputID} is missing`);
        }
        let dateOnly = date.toISOString().split("T")[0];
        // @ts-ignore
        await page.$eval(SettingsPage.selector.birthdayInput, (el, value) => el.value = value, dateOnly);
    }

    async submitBirthDayReminder(): Promise<HomePage> {
        let setBirthdayInput = await this.settingsFormBirthdayElement();
        if (setBirthdayInput == null) {
            throw Error(`The form field with id ${SettingsPage.birthdayInputID} is missing`);
        }
        await setBirthdayInput.focus();
        await this.page.keyboard.press("Enter");
        return new HomePage(this.page);
    }
}