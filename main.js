const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");
const { finished } = require('stream/promises');

const moduleDir = path.join(__dirname, 'lambdas');

const listDir = (directoryPath) => {
    try {
        let files = fs.readdirSync(directoryPath)
            .map(p => `${directoryPath}/${p}`)
            .filter(file => {
                const stats = fs.statSync(file);
                return stats.isDirectory()
            });
        files = files.concat(fs.readdirSync(moduleDir)
            .map(p => `${moduleDir}/${p}`)
            .filter(file => {
                const stats = fs.statSync(file);
                return stats.isDirectory()
            }));
        return files
    } catch (err) {
        console.error('Unable to scan directory: ' + err);
    }
}

const readSpec = (dir) => {
    const manifestFile = path.join(dir, 'spec.json');
    if (!fs.existsSync(manifestFile)) {
        return false
    }
    return {
        type: 'function',
        function: require(manifestFile)
    }
}

const readConfig = (dir) => {
    const name = path.basename(dir);
    const config = path.join(dir, 'config.json');
    if (!fs.existsSync(config)) {
        return false
    }
    const userConfig = {};
    userConfig[name] = require(config);
    return userConfig
}

const callLambda = (dir) => {
    const lambdaName = path.basename(dir);
    const funcFile = path.join(dir, 'index.js');
    const isFuncFileExist = fs.existsSync(funcFile);

    if (!isFuncFileExist) return null

    const func = {};
    func[lambdaName] = require(funcFile);
    return func
}

async function* returnStream(response) {
    for await (const chunk of response) {
        const message = chunk.choices[0]?.delta;
        const isFinish = chunk.choices[0]?.finish_reason ? true : false;
        if(isFinish){
            yield {
                ...message,
                finished: true
            }
        }
        else{
            yield {
                ...message,
                finished: false
            }
        }
    }
}

async function* returnSpawn(tools, lambda, userConfig) {
    for await (const tool of tools.tool_calls) {
        const f = tool.function;
        const args = JSON.parse(f.arguments);
        const isAsync = lambda[f.name].constructor.name === "AsyncFunction";
        const exec = isAsync ? await lambda[f.name](args, userConfig[f.name]?.config) : lambda[f.name](args, userConfig[f.name]?.config);
        yield {
            type: tool.type,
            name: f.name,
            args,
            response: exec
        }
    }
}

module.exports = class LambdaLM {
    constructor(...directoryPath) {
        const dirPath = path.join(...directoryPath);
        this.lambda = Object.assign(
            {}, ...listDir(dirPath)
                .map(dir => callLambda(dir))
                .filter(f => f)
        );
        this.tools = listDir(dirPath)
            .map(dir => {
                return readSpec(dir)
            })
            .filter(f => f);
        
        // New LambdaLM().userConfig = {
        //      "LambdaName" : {
        //             "config" : {
        //                  "apiKey" : "sssss-----fake-taxy"
        //             }
        //      }
        // }
        this.userConfig = {};

        const toolsObj = Object.assign({}, ...this.tools.map(t => {
            const toolObj = {};
            toolObj[t.function.name] = t;
            return toolObj
        }));

        const userConfig = Object.assign(
            {}, ...listDir(dirPath)
                .map(dir => readConfig(dir))
                .filter(f => f)
        );

        this.lambdaList = Object.keys(this.lambda).map(name => {
            return {
                name,
                spec: toolsObj[name],
                config: userConfig[name] || null
            }
        })
    }

    async spawn(tools = this.inferenceResult) {
        return returnSpawn(tools, this.lambda, this.userConfig)
    }

    async inference(
        content,
        params = {},
        model = {}
    ) {
        const options = {
            ...params,
            tools: this.tools
        }
        if (!options.model) options.model = 'gpt-4o-2024-08-06';
        const llm = new OpenAI(model);
        options['messages'] = [{ "role": "system", "content": "Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous." }];
        options.messages = options.messages.concat(content);
        const res = await llm.chat.completions.create(options);

        this.options = options;
        // Check if stream
        if (options.stream) {
            return returnStream(res)
        }

        const lambda = {
            ...res.choices[0].message,
            finished: true
        }
        this.inferenceResult = lambda;
        return lambda
    }
}