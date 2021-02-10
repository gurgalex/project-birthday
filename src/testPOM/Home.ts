import {Page} from "puppeteer";
import NavPage from "./Nav";

const baseURL = 'https://localhost:8080';
export default class HomePage {
    static route = "/"
    static query = {
        firstTimeSetupGreeting: "#no-settings-greeting",
        settingsSetupBtn: "#settings-setup-btn",
    }
    private readonly page: Page;
    public navHeader: NavPage;
    constructor(page: Page) {
        this.page = page;
        this.navHeader = new NavPage(this.page);
    }

    async go() {
        await this.page.goto(baseURL + HomePage.route);
        await this.page.waitForSelector("#home-greeting");
        return this;
    }

    async firstTimeSetupGreetingElement() {
        return await this.page.waitForSelector(HomePage.query.firstTimeSetupGreeting);
    }

    async changeSettingsBtnElement() {
        await this.page.waitForSelector(HomePage.query.settingsSetupBtn);
        return await this.page.$(HomePage.query.settingsSetupBtn);
    }

    async getBirthdayReminderISODate(): Promise<string | null> {
        await this.page.waitForSelector('#when-next-birthday');
        let homeWhenBirthday = await this.page.$("#when-next-birthday");
        // @ts-ignore
        return await homeWhenBirthday.evaluate(el => el.dataset.date);

    }
}