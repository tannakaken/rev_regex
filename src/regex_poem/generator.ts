export type StringGenerator = () => string;

export const stringToGenerator = (str: string): StringGenerator => {
  return () => {
    return str;
  };
};

const randomIntUnder = (max: number): number => {
  return Math.floor(Math.random() * max);
};

const randomIntBetween = (min: number, max: number): number => {
  return randomIntUnder(max - min) + min;
};

const randomSampling = <T>(list: T[]): T => {
  return list[Math.floor(Math.random() * list.length)];
};

export const makeSampleGenerator = (
  generators: StringGenerator[]
): StringGenerator => {
  return () => {
    const generator = randomSampling(generators);
    return generator();
  };
};

export const makeSequenceGenerator = (
  generators: StringGenerator[]
): StringGenerator => {
  return () => {
    return generators.reduce((acc, generator) => acc + generator(), "");
  };
};

const stopProbability = 1 / 6;

export const makeKleeneGenerator = (
  generator: StringGenerator
): StringGenerator => {
  const kleeneGenerator = (acc = ""): string => {
    const r = Math.random();
    if (r < stopProbability) {
      return acc;
    }
    const next = generator();
    return kleeneGenerator(acc + next);
  };
  return kleeneGenerator;
};

const generateRepetition = (
  generator: StringGenerator,
  repetition: number
): string => {
  let result = "";
  for (let i = 0; i < repetition; i++) {
    result += generator();
  }
  return result;
};

export const makeRepetitionGenerator = (
  generator: StringGenerator,
  repetition: number
): StringGenerator => {
  return () => generateRepetition(generator, repetition);
};

export const makeBetweenRepetitionGenerator = (
  generator: StringGenerator,
  min: number,
  max: number
): StringGenerator => {
  return () => {
    const repetition = randomIntBetween(min, max + 1);
    return generateRepetition(generator, repetition);
  };
};

export const makePlusGenerator = (
  generator: StringGenerator,
  min = 1
): StringGenerator => {
  return makeSequenceGenerator([
    makeRepetitionGenerator(generator, min),
    makeKleeneGenerator(generator),
  ]);
};
