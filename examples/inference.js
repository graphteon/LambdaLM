const Lambda = require('../main.js');

async function tools() {
    //const content = `What's the weather like today, I'm in Glasgow, Scotland.`
    //const content = `create password with 5 length`
    const content = `buatkan password random text dengan panjang password 8`
    //const content = `buatkan contoh Diagram sequence`
    const lambda = new Lambda(__dirname, 'lambdas');
    const res = await lambda.inference([{ "role": "user", content }]);
    console.log("inference response : ", JSON.stringify(res),'\n\n');
    if(res.tool_calls){
        // [{"type":"function","name":"PasswordGenerator","args":{"length":5},"response":"oWDq^"}]
        const spawn = await lambda.spawn();
        console.log('SPAWN RESULT :',JSON.stringify(spawn))
    }
}

tools()