const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');
const puppeteer = require("puppeteer");

class CustomPage {
    static async build() {
        const browser = await puppeteer.launch({
            headless: false,
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function (target, property) {
                // קודם נבדוק אם יש את התכונה ב־page
                if (page[property]) {
                    // נשתמש ב-bind כדי שהקשר של this יישמר (למשל ב־page.goto)
                    return typeof page[property] === 'function'
                        ? page[property].bind(page)
                        : page[property];
                }

                // אם לא ב־page, נבדוק ב־browser
                if (browser[property]) {
                    return typeof browser[property] === 'function'
                        ? browser[property].bind(browser)
                        : browser[property];
                }

                // רק אם לא קיים בשום מקום אחר — נחזיר מה־customPage
                return target[property];
            }
        });

        // return new Proxy(customPage, {
        //     get: function (target, property) {
        //         return customPage[property] || browser[property] || page[property];
        //     }
        // })
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);

        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        const cookies = await this.page.cookies();

        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitForSelector('a[href="/auth/logout"]');

    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }

    get(path) {
        return this.page.evaluate(async (_path) => {
            const res = await fetch(_path, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return res.json();
        }, path);
    }

    post(path, data) {
        return this.page.evaluate(async (_path, _data) => {
            const res = await fetch(_path, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(_data),
            });
            return res.json();
        }, path, data);
    }

    execRequests(actions){
        return Promise.all(
            actions.map(({ method, path, data }) => {
              return this[method](path, data);
        })
      );
    }
}

module.exports = CustomPage;
















