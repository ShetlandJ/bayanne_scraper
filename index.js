const puppeteer = require('puppeteer');
require('dotenv').config()

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: 'results.csv',
    header: [
        { id: 'index', title: 'Index' },
        { id: 'personName', title: 'Name' },
        { id: 'birthDateString', title: 'Birth date' },
        { id: 'birthLocation', title: 'Birth location' },
        { id: 'deathDateString', title: 'Death date' },
        { id: 'deathLocation', title: 'Death location' },
    ]
});

let run = async (id = 'I210520') => {
    const browser = await puppeteer.launch({ headless: false });
    const site = `https://www.bayanne.info/Shetland/pedigree.php?personID=${id}&tree=ID1&parentset=0&display=standard&generations=8`
    const page = await browser.newPage();
    await page.goto(
        site,
        { waitUntil: 'load' }
    );
    await page.waitForSelector('.pedbox')

    await page.evaluate(async () => {
        login = document.getElementById('log-smicon');
        login.click()
    })

    await wait(1500);
    await page.waitForSelector('#tngusername', { visible: true, timeout: 3000 });

    await page.click('#tngusername');
    await page.keyboard.type(process.env.USERNAME);
    await page.click('#tngpassword');
    await page.keyboard.type(process.env.PASSWORD);

    await page.click('.loginbtn');

    await wait(3000);

    const rows = await page.evaluate(async () => {
        let allPersonnelBoxes = Array.from(document.getElementsByClassName('pedbox rounded10'));

        for (let i = 1; i <= allPersonnelBoxes.length; i++) {
            setPopup(i);
        }

        let delay = (time) => {
            return new Promise(function (resolve) {
                setTimeout(resolve, time)
            });
        }

        await delay(2000);

        let getData = (rows, typeToSearch, indexAdd = 0) => {
            let data = '';
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].innerHTML.includes(typeToSearch)) {
                    data = rows[i + indexAdd].children[1].innerHTML;
                }
            }

            return data;
        }

        const data = [];
        for (let i = 1; i <= allPersonnelBoxes.length; i++) {
            let element = document.getElementById(`popup${i}`)

            let tableRows = element.children[0].children[0].children[0].children[0].children[0].children;
            let personName = tableRows[0].children[0].children[0].innerHTML;

            let birthDateString = '';
            let birthLocation = '';
            let deathDateString = '';
            let deathLocation = ''

            if (!tableRows[1]) {
                personName = 'Unknown';
            } else {
                birthDateString = getData(tableRows, 'B:');
                birthLocation = getData(tableRows, 'B:', 1);

                marriageDateString = getData(tableRows, 'M:');
                marriageLocation = getData(tableRows, 'M:', 1);

                deathDateString = getData(tableRows, 'D:');
                deathLocation = getData(tableRows, 'D:', 1);
            }

            data.push({
                index: i,
                personName,
                birthDateString,
                birthLocation,
                deathDateString,
                deathLocation
            });
        }

        return data;
    })

    csvWriter.writeRecords(rows)
        .then(() => process.exit(1));
}

run();

let wait = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
