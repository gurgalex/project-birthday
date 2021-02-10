import {Page} from "puppeteer";

const baseURL = 'https://localhost:8080';
export default class HomePage {
    static route = "/"
    private page: any;
    constructor(page: Page) {
        this.page = page;
    }

    async go() {
        await this.page.goto(baseURL + HomePage.route);
        await this.page.waitForSelector("#home-greeting");
        return this;
    }
}