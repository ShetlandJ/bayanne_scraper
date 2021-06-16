let allPersonnelBoxes = Array.from(document.getElementsByClassName('pedbox rounded10'));

let triggerPopupShow = () => {
    for (let i = 1; i <= allPersonnelBoxes.length; i++) {
        setPopup(i);
    }
}

let gatherData = () => {
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
            if (birthTableRow[0].innerHTML.includes("B: ")) {
                birthDateString = birthTableRow[1].innerHTML;
            }
            birthLocation = tableRows[2].children[1].innerHTML;

            let marriageOrDeathRow = tableRows[3] && tableRows[3].children
            if (marriageOrDeathRow) {
                if (marriageOrDeathRow[0].innerHTML.includes("M:")) {
                    if (tableRows[5]) {
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

    console.log(data);
}

let delay = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

triggerPopupShow()
await delay(2000);
gatherData();
