const Lambda = require('../main.js');

async function tools() {
    // const content = `kerjakan task di bawah ini :
    //                     - buatkan contoh Diagram sequence
    //                     - buatkan password random text dengan panjang password 8
    //                 `
    const content = `kamu siapa?`
    const lambda = new Lambda(__dirname, 'lambdas');
    const res = await lambda.inference([{ "role": "user", content }],{ stream: true, temperature: 0 });

    for await(const r of res) {
        console.log("inference response : ", JSON.stringify(r),'\n\n');
    }
}

tools()