const Lambda = require('../main.js');

async function tools() {
    //const content = `What's the weather like today, I'm in Glasgow, Scotland.`
    //const content = `create password with 5 length`
    const content = `kerjakan task di bawah ini :
                        - buatkan contoh Diagram sequence
                        - buatkan password random text dengan panjang password 8
                    `
    //const content = `kamu siapa?`
    //const content = `buatkan contoh Diagram sequence`
    const lambda = new Lambda(__dirname, 'lambdas');
    const res = await lambda.inference([{ "role": "user", content }],{ stream: true });

    for await(const r of res) {
        console.log("inference response : ", JSON.stringify(r),'\n\n');
    }
}

tools()