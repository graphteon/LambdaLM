const LambdaLM = require('../main');

async function lambdaCall() {
    const lambda = new LambdaLM();
    lambda.register([{
        spec: {
            "name": "Calculator",
            "description": "Calculate a math expression. For example, \"2 + 2\" or \"2 * 2\". The expression must be a valid JavaScript math expression.",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "A valid JavaScript math expression for the calculation."
                    }
                },
                "required": ["expression"]
            }
        },
        handler: (params) => {
            return eval(params.expression);
        }
    }]);

    const res = await lambda.inference([{ "role": "user", "content" : "please calculate 2*(2/3)" }]); //{"role":"assistant","content":null,"tool_calls":[{"id":"call_HrsCajKTBKdVGO2zlpnha6zw","type":"function","function":{"name":"Calculator","arguments":"{\"expression\":\"2*(2/3)\"}"}}],"refusal":null,"finished":true} 
    
    if (res.tool_calls) {
        const spawn = await lambda.spawn();
        for await (const spw of spawn) {
            console.log('SPAWN RESULT :', JSON.stringify(spw), '\n')
        }
    }
}

lambdaCall()