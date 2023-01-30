import {
  makeBetweenRepetitionGenerator,
  makeKleeneGenerator,
  makePlusGenerator,
  makeRepetitionGenerator,
  makeSampleGenerator,
  makeSequenceGenerator,
  StringGenerator,
  stringToGenerator,
} from "./generator";

type Parser<T> = (input: string) => [T, string] | null;

export const strictCharacterParser: Parser<StringGenerator> = (input) => {
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
      return [stringToGenerator(char), input.substring(char.length)];
  }
};

export const characterParser: Parser<StringGenerator> = (input) => {
  const codePoint = input.codePointAt(0);
  if (codePoint === undefined) {
    return null;
  }
  const char = String.fromCodePoint(codePoint);
  return [stringToGenerator(char), input.substring(char.length)];
};

export const escapeParser: Parser<StringGenerator> = (input) => {
  if (!input.startsWith("\\")) {
    return null;
  }
  return characterParser(input.substring(1));
};

type Singleton<T> = [T];
type Pair<T> = [T, T];

type Repetition = Singleton<number> | Pair<number>;

const isSingleton = <T>(list: T[]): list is Singleton<T> => {
  return list.length === 1;
}
const isPair = <T>(list: T[]): list is Pair<T> => {
  return list.length === 2;
}
/**
 * 整数をテストする正規表現
 */
const positiveIntegerRegex = /^[1-9][0-9]*/;
export const integerParser: Parser<number> = (input) => {
  const matchResult = input.match(positiveIntegerRegex);
  if (matchResult === null) {
    return null;
  }
  const resultString = matchResult[0];
  const rest = input.substring(resultString.length);
  const result = parseInt(resultString, 10);
  return [result, rest];
}

export const repetitionNumberParser: Parser<Repetition> = (
  input
) => {
  if (!input.startsWith("{")) {
    return null;
  }
  const tryParseInteger1 = integerParser(input.substring(1));
  if (tryParseInteger1 === null) {
    return null;
  }
  const [firstInteger, rest1] = tryParseInteger1;
  if (rest1.startsWith("}")) {
    return [[firstInteger], rest1.substring(1)];
  }
  if (!rest1.startsWith(",")) {
    return null;
  }
  const tryParseInteger2 = integerParser(rest1.substring(1));
  if (tryParseInteger2 === null) {
    return null;
  }
  const [secondInteger, rest2] = tryParseInteger2;
  if (rest2.startsWith("}")) {
    return [[firstInteger, secondInteger], rest2.substring(1)];
  }
  return null;
};

export const makeRepetitionParser = (parser: Parser<StringGenerator>): Parser<StringGenerator> => {
  return (input) => {
    const result = parser(input);
    if (result === null) {
      return null;
    }
    const [generator, rest] = result;
    if (rest.startsWith("*")) {
      return [makeKleeneGenerator(generator), rest.substring(1)];
    }
    if (rest.startsWith("+")) {
      return [makePlusGenerator(generator), rest.substring(1)];
    }
    if (rest.startsWith("?")) {
      return [
        makeBetweenRepetitionGenerator(generator, 0, 1),
        rest.substring(1),
      ];
    }
    const tryParseRepetition = repetitionNumberParser(rest);
    if (tryParseRepetition === null) {
      return result;
    }
    const [repetiion, rest2] = tryParseRepetition;
    if (isSingleton(repetiion)) {
      return [
        makeRepetitionGenerator(generator, repetiion[0]),
        rest2
      ];
    }
    const [first,second] = repetiion;
    return [
      makeBetweenRepetitionGenerator(generator, first, second),
      rest2
    ];
  };
};

export const makeSequenceParser = (parser: Parser<StringGenerator>): Parser<StringGenerator> => {
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

export const makeOrParser = (parser: Parser<StringGenerator>): Parser<StringGenerator> => {
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

export const makeParenParser = (parser: Parser<StringGenerator>): Parser<StringGenerator> => {
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

export const makeChallengeParser = <T>(parsers: Parser<T>[]): Parser<T> => {
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

let rootParser: Parser<StringGenerator> = () => null;
export const parser: Parser<StringGenerator> = (input) => {
  return rootParser(input);
};
const parenParser = makeParenParser(parser);
const challengeParser = makeChallengeParser([
  parenParser,
  escapeParser,
  strictCharacterParser,
]);
const repetitionParser = makeRepetitionParser(challengeParser);
const sequenceParser = makeSequenceParser(repetitionParser);
rootParser = makeOrParser(sequenceParser);
