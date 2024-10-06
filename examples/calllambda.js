const Lambda = require('../main');

async function tools() {
    const { lambda } = new Lambda(__dirname, 'lambdas');
    console.log(lambda.PasswordGenerator({
        length: 5
    }))
}

tools()