const Lambda = require('../main');

async function tools() {
    const { lambda, tools } = new Lambda(__dirname, 'lambdas');
    console.log(lambda)
    console.log(tools)
}

tools()