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

    await wait(1000);

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
        await delay(1500);

        let getBdmData = (rows, typeToSearch) => {
            let birthDate = '';
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].innerHTML.includes(typeToSearch)) {
                    birthDate = rows[i].children[1].innerHTML;
                }
            }

            console.log(birthDate);
            return birthDate;
        }

        let getLocationData = (rows, typeToSearch) => {
            let birthDate = '';
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].innerHTML.includes(typeToSearch)) {
                    birthDate = rows[i + 1].children[1].innerHTML;
                }
            }

            console.log(birthDate);
            return birthDate;
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
                birthDateString = '';
                birthLocation = '';
                deathDateString = '';
                deathDateString = '';
            } else {
                birthDateString = getBdmData(tableRows, 'B:');
                birthLocation = getLocationDate(tableRows, 'B:');

                marrageDateString = getBdmData(tableRows, 'B:');
                marriageLocation = getLocationDate(tableRows, 'B:');

                let marriageOrDeathRow = tableRows[3] && tableRows[3].children
                if (marriageOrDeathRow) {
                    if (marriageOrDeathRow[0].innerHTML.includes("M:")) {
                        if (i === 58) {
                            console.log(
                                tableRows[4].innerHTML,
                                tableRows[5].innerHTML
                            )
                        }
                        if (tableRows[4] && tableRows[4].children[0].innerHTML.includes('D')) {
                            deathDateString = tableRows[4].children[1].innerHTML
                            if (tableRows[5] && tableRows[5].children) {
                                deathLocation = tableRows[5].children[1].innerHTML;
                            }

                        } else if (tableRows[5] && tableRows[5].children) {
                            deathDateString = tableRows[5].children[1].innerHTML;
                            if (tableRows[6] && tableRows[6].children) {
                                deathLocation = tableRows[6].children[1].innerHTML;
                            }
                        }
                    } else if (marriageOrDeathRow[0].innerHTML.includes("D:")) {
                        deathDateString = marriageOrDeathRow[1].innerHTML
                        if (tableRows[4]) {
                            deathLocation = tableRows[4].children[1].innerHTML;
                        }
                    }
                }
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
        console.log(data);

        return data;
    })

    csvWriter.writeRecords[rows];
    process.exit(1);
}

run();

let wait = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}
