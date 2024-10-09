# LambdaLM

[![npm version](https://img.shields.io/npm/v/lambdalm.svg)](https://www.npmjs.com/package/@graphteon/lambda-lm)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

LambdaLM is a powerful JavaScript library that enables function calling capabilities for Language Models (LLMs). It provides a seamless interface to define, manage, and execute functions that can be called directly by language models, enhancing their ability to perform specific tasks and interact with external systems.

## Features

- 🚀 Easy function registration and management
- 🔄 Automatic parameter validation
- 📦 Type-safe function calling
- 🛠 Built-in error handling
- 🔍 Function discovery and documentation
- ⚡ Async function support

## Installation

You can install LambdaLM using npm:

```bash
npm install @graphteon/lambda-lm
```

Or using yarn:

```bash
yarn add @graphteon/lambda-lm
```

## Quick Start

Here's a simple example to get you started with LambdaLM:

```javascript

const LambdaLM = require('@graphteon/lambda-lm');

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
```

## Advanced Usage

### Async Functions

LambdaLM supports async functions out of the box:

```javascript
lambda.register({ spec : {
  name: 'FetchUserData',
  description: 'Fetch user data from an API',
  parameters: {
    userId: {
      type: 'string',
      description: 'The ID of the user to fetch'
    }
  }
},
  handler: async ({ userId }) => {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    return response.json();
  }
});
```

### Function Composition

You can compose multiple functions together:

```javascript
lambda.registerFunction({
  name: 'processOrder',
  description: 'Process a complete order',
  parameters: {
    items: {
      type: 'array',
      description: 'Array of items in the order'
    },
    userId: {
      type: 'string',
      description: 'User ID making the order'
    }
  },
  handler: async ({ items, userId }) => {
    const userData = await lambda.call('fetchUserData', { userId });
    const total = await lambda.call('calculateTotal', {
      price: items.reduce((sum, item) => sum + item.price, 0),
      taxRate: userData.taxRate
    });
    return { total, user: userData };
  }
});
```


## API Documentation

### Class: LambdaLM

#### Methods

- `register(config: FunctionConfig): void`
- `spawn(functionName: string): Promise<any>`
- `list(): FunctionInfo[]`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Citation

If you use LambdaLM in your research or project, please cite it as follows:

```bibtex
@software{lambdalm2024,
  author = {Eka Tresna Irawan},
  title = {LambdaLM: Function Calling Library for Language Models},
  year = {2024},
  publisher = {GitHub},
  url = {https://github.com/graphteon/LambdaLM}
}
```

## Acknowledgments

- Inspired by the function calling capabilities of modern language models
- Built with love for the AI and developer community
- Special thanks to all contributors and users