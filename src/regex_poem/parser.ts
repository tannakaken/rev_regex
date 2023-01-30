import {
  makeKleeneGenerator,
  makeSampleGenerator,
  makeSequenceGenerator,
  StringGenerator,
  stringToGenerator,
} from "./generator";

type Parser = (input: string) => [StringGenerator, string] | null;

export const strictCharacterParser: Parser = (input) => {
  const codePoint = input.codePointAt(0);
  if (codePoint === undefined) {
    return null;
  }
  const char = String.fromCodePoint(codePoint);
  switch (char) {
    case "|":
    case "(":
    case ")":
      return null;
    default:
  }
  if (char === "|") {
    return null;
  }
  if (char === "(") {
    return null;
  }
  return [stringToGenerator(char), input.substring(char.length)];
};

export const characterParser: Parser = (input) => {
  const codePoint = input.codePointAt(0);
  if (codePoint === undefined) {
    return null;
  }
  const char = String.fromCodePoint(codePoint);
  return [stringToGenerator(char), input.substring(char.length)];
};

export const escapeParser: Parser = (input) => {
  if (!input.startsWith("\\")) {
    return null;
  }
  return characterParser(input.substring(1));
};

export const makeKleeneParser = (parser: Parser): Parser => {
  return (input) => {
    const result = parser(input);
    if (result === null) {
      return null;
    }
    const [generator, rest] = result;
    if (rest.startsWith("*")) {
      return [makeKleeneGenerator(generator), rest.substring(1)];
    }
    return result;
  };
};

export const makeSequenceParser = (parser: Parser): Parser => {
  return (input) => {
    const results: StringGenerator[] = [];
    let current = input;
    while (true) {
      const result = parser(current);
      if (result === null) {
        return [makeSequenceGenerator(results), current];
      }
      const [generator, rest] = result;
      results.push(generator);
      current = rest;
    }
  };
};

export const makeOrParser = (parser: Parser): Parser => {
  return (input) => {
    const result = parser(input);
    if (result === null) {
      return null;
    }
    const results = [result[0]];
    let current = result[1];
    while (true) {
      if (!current.startsWith("|")) {
        return [makeSampleGenerator(results), current];
      }
      const result = parser(current.substring(1));
      if (result === null) {
        results.push(stringToGenerator(""));
        return [makeSampleGenerator(results), current];
      }
      results.push(result[0]);
      current = result[1];
    }
  };
};

export const makeParenParser = (parser: Parser): Parser => {
  return (input) => {
    if (!input.startsWith("(")) {
      return null;
    }
    const result = parser(input.substring(1));
    if (result === null) {
      return null;
    }
    const generators = [result[0]];
    let current = result[1];
    while (true) {
      if (current === "") {
        return null;
      }
      if (current.startsWith(")")) {
        return [makeSequenceGenerator(generators), current.substring(1)];
      }
      const result = parser(current);
      if (result === null) {
        return null;
      }
      generators.push(result[0]);
      current = result[1];
    }
  };
};

export const makeChallengeParser = (parsers: Parser[]): Parser => {
  return (input) => {
    for (const parser of parsers) {
      const result = parser(input);
      if (result !== null) {
        return result;
      }
    }
    return null;
  };
};

let rootParser: Parser = (input) => null;
export const parser: Parser = (input) => {
  return rootParser(input);
};
const parenParser = makeParenParser(parser);
const challengeParser = makeChallengeParser([parenParser, escapeParser, strictCharacterParser]);
const kleeneParser = makeKleeneParser(challengeParser);
const sequenceParser = makeSequenceParser(kleeneParser);
rootParser = makeOrParser(sequenceParser);
