const childProcess = require('child_process');
const PromisePool = require('@supercharge/promise-pool');
const iconv = require('iconv-lite');
const fs = require("fs");

const exec = (str) => (iconv.decode(childProcess.execSync("chcp 437 &&" + str), "Shift_JIS"));

(async () => {
    let result;
    try {
        result = exec("net user /domain")
            .replace(/.*-{10,}(\r\n|\n|\r)/s, "") //Remove Header
            .replace(/(\r\n|\n|\r)The command completed successfully.*/s, "") //Remove Footer
            .split(/\s+/);
    } catch (e) {
        console.log(e.toString());
        return;
    }
    console.log(result);
    console.log("Running...");
    let counter = 0;
    const data = result.map(studentCode => {
        if (counter % 10 == 0) {
            console.log(`${(counter * 100 / result.length).toFixed(1)}%  (${counter} / ${result.length})`);
        }
        const userStr = exec(`net user ${studentCode} /domain`)
            .replace(/.*\nThe request will be processed at a domain controller for domain (.*?)(\r\n|\n|\r){2,2}/s, "")
            .replace(/(\r\n|\n|\r)The command completed successfully.*/s, "") //Remove Footer
        let userData = {}
        userStr.split(/\r\n|\n|\r/).forEach(item => {
            userData[item.split(/\s{4,}/)[0]] = item.split(/\s{4,}/)[1];
        });
        counter += 1;
        return userData;
    })
    console.log(data);
    fs.writeFileSync("dump.json", JSON.stringify(data, 2, null));
})();
