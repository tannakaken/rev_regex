import {parser} from "./src/regex_poem/parser";

if (process.argv.length !== 3) {
    console.warn("input regex");
    process.exit(1);
}
const regex = process.argv[2];

const result = parser(regex);

if (result === null) {
    console.error("error!");
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