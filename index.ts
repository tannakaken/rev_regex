import {parser} from "./src/regex_poem/parser";

(async () => {
    const buffers = [];
    for await (const chunk of process.stdin) buffers.push(chunk);
    const buffer = Buffer.concat(buffers);
    const regex = buffer.toString();
    const result = parser(regex);
    if (result === null) {
        console.error("unknown error!");
        process.exit(1);
    }
    
    const [generator, rest] = result;
    if (rest.length > 0) {
        if (rest[0] === "(") {
            console.error(`SyntaxError: Invalid regular expression: ${regex}: Unterminated group`);
            process.exit(1);
        }
        if (rest[1] === ")") {
            console.error(`SyntaxError: Invalid regular expression: ${regex}: Unmatched ')'`);
            process.exit(1);
        }
        console.error(`SyntaxError: Invalid regular expression: ${regex}`);
        process.exit(1);
    }
    for (let i = 0; i < 10; i++) {
        console.log(generator());
    }
  })()

