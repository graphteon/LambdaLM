const fs = require('fs');
const path = require('path');
const OpenAI = require("openai");

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

const callLambda = (dir) => {
    const lambdaName = path.basename(dir);
    const funcFile = path.join(dir, 'index.js');
    const isFuncFileExist = fs.existsSync(funcFile);

    if (!isFuncFileExist) return null

    const func = {};
    func[lambdaName] = require(funcFile);
    return func
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
    }

    async spawn(tools = this.inferenceResult) {
        const result = []
        for await (const tool of tools.tool_calls) {
            const f = tool.function;
            const args = JSON.parse(f.arguments);
            const isAsync = this.lambda[f.name].constructor.name === "AsyncFunction";
            const exec = isAsync ? await this.lambda[f.name](args) : this.lambda[f.name](args);
            result.push({
                type: tool.type,
                name: f.name,
                args,
                response: exec
            })
        }
        return result
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
        const lambda = res.choices[0].message
        this.inferenceResult = lambda;
        return lambda
    }
}