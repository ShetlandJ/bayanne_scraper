const puppeteer = require('puppeteer');
require('dotenv').config()

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

    await wait(1500);
    // await page.evaluate(async () => {
    //     username = document.getElementById('tngusername');
    //     pw = document.getElementById('tngpassword');
    //     console.log(username, pw);
    //     username.type('James');
    //     username.value = 'James';
    //     pw.type('Showbiz4');
    //     pw.value = 'Showbiz4'
    // })


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
                let birthTableRow = tableRows[1].children
                if (birthTableRow[0].innerHTML.includes("B:")) {
                    birthDateString = birthTableRow[1].innerHTML;
                }
                birthLocation = tableRows[2].children[1].innerHTML;

                let marriageOrDeathRow = tableRows[3] && tableRows[3].children
                if (marriageOrDeathRow) {
                    if (marriageOrDeathRow[0].innerHTML.includes("M:")) {
                        if (i === 58) {
                            console.log(
                                tableRows[4].innerHTML,
                                tableRows[5].innerHTML
                            )
                        }
                        if (tableRows[4].children[0].innerHTML.includes('D')) {
                            deathDateString = tableRows[4].children[1].innerHTML
                            if (tableRows[5]) {
                                deathLocation = tableRows[5].children[1].innerHTML;
                            }

                        } else if (tableRows[5]) {
                            deathDateString = tableRows[5].children[1].innerHTML;
                            if (tableRows[6]) {
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

        return data;
    })

    console.log(rows);
}

run();

let wait = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

// triggerPopupShow()
// await delay(2000);
// gatherData();
