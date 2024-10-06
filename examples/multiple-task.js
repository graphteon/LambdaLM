const Lambda = require('../main.js');

async function tools() {
    const lambda = new Lambda(__dirname, 'lambdas');
    const res = await lambda.inference([
        { "role": "user", "content": "kerjakan task di bawah ini :" },
        { "role": "user", "content": "buatkan contoh Diagram sequence" },
        { "role": "assistant", "content": "![diagram](https://www.plantuml.com/plantuml/img/FOv12iCm30JlUeN8FH_e8UJG1vIOF40uEXWIs_KgXVm-5YqzQcPtqGoJPkUnaqGhZLTeezfHYgbADXx21TDZO0478lSyJXmUlEZxL9WNqqTCkmu_zMebAk1t1zxnE6h9qF_45pyJwYuNpPgt_iOD)" },
        { "role": "user", "content": "buatkan password random text dengan panjang password 8" }
    ]);
    console.log("inference response : ", JSON.stringify(res), '\n\n');
    if (res.tool_calls) {
        // [{"type":"function","name":"PasswordGenerator","args":{"length":5},"response":"oWDq^"}]
        const spawn = await lambda.spawn();
        for await(const spw of spawn){
            console.log('SPAWN RESULT :', JSON.stringify(spw),'\n')
        }
    }
}

tools()