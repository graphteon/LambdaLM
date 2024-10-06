const Lambda = require('../main');

async function tools() {
    const { lambda, tools, lambdaList } = new Lambda(__dirname, 'lambdas');
    console.log("Lambda : ",lambda)
    console.log("List Tools : ",tools)
    console.log("List Lambda : ",lambdaList)
}

tools()