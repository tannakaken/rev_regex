import {
  makeKleeneGenerator,
  makeRepititionGenerator,
  makeSampleGenerator,
  makeSequenceGenerator,
  makeBetweenRepititionGenerator,
  stringToGenerator,
  makePlusGenerator,
} from "./generator";

test("test stringToGenerator", () => {
  const generator1 = stringToGenerator("a");
  expect(generator1()).toBe("a");
  const generator2 = stringToGenerator("b");
  expect(generator2()).toBe("b");
});

test("test makeSampleGenerator", () => {
  const generator1 = stringToGenerator("a");
  const generator2 = stringToGenerator("b");
  const sampleGenerator = makeSampleGenerator([generator1, generator2]);
  for (let i = 0; i < 10; i++) {
    const generated = sampleGenerator();
    console.log(generated);
    expect(generated.match("a|b")).toBeTruthy();
  }
});

test("test makeSequenceGenerator", () => {
  const generator1 = stringToGenerator("a");
  const generator2 = stringToGenerator("b");
  const sequenceGenerator = makeSequenceGenerator([generator1, generator2]);
  expect(sequenceGenerator()).toBe("ab");
});

test("test makeKleeneGenerator", () => {
  const generator1 = stringToGenerator("a");
  const kleeneGenerator1 = makeKleeneGenerator(generator1);
  for (let i = 0; i < 10; i++) {
    const generated = kleeneGenerator1();
    console.log(generated);
    expect(generated.match(/^a*$/)).toBeTruthy();
  }
  const generator2 = stringToGenerator("b");
  const sequenceGenerator = makeSequenceGenerator([generator1, generator2]);
  const kleeneGenerator2 = makeKleeneGenerator(sequenceGenerator);
  for (let i = 0; i < 10; i++) {
    const generated = kleeneGenerator2();
    console.log(generated);
    expect(generated.match(/^(ab)*$/)).toBeTruthy();
  }
});

test("test makeRepititionGenerator", () => {
  const generator1 = stringToGenerator("a");
  const repetitionGenerator1 = makeRepititionGenerator(generator1, 6);
  expect(repetitionGenerator1()).toBe("aaaaaa");
  const generator2 = stringToGenerator("b");
  const sequenceGenerator = makeSequenceGenerator([generator1, generator2]);
  const repetitionGenerator2 = makeRepititionGenerator(sequenceGenerator, 5);
  expect(repetitionGenerator2()).toBe("ababababab");
  const sampleGenerator = makeSampleGenerator([generator1, generator2]);
  const repetitionGenerator3 = makeRepititionGenerator(sampleGenerator, 3);
  for (let i = 0; i < 10; i++) {
    const generated = repetitionGenerator3();
    console.log(generated);
    expect(generated.match(/^(a|b){3}$/)).toBeTruthy();
  }
});

test("test makeBetweenRepititionGenerator", () => {
  const generator1 = stringToGenerator("a");
  const repetitionGenerator1 = makeBetweenRepititionGenerator(generator1, 2, 6);
  for (let i = 0; i < 10; i++) {
    const generated = repetitionGenerator1();
    console.log(generated);
    expect(generated.match(/^a{2,6}$/)).toBeTruthy();
  }
  const generator2 = stringToGenerator("b");
  const sequenceGenerator = makeSequenceGenerator([generator1, generator2]);
  const repetitionGenerator2 = makeBetweenRepititionGenerator(
    sequenceGenerator,
    1,
    5
  );
  for (let i = 0; i < 10; i++) {
    const generated = repetitionGenerator2();
    console.log(generated);
    expect(generated.match(/^(ab){1,5}$/)).toBeTruthy();
  }
  const sampleGenerator = makeSampleGenerator([generator1, generator2]);
  const repetitionGenerator3 = makeBetweenRepititionGenerator(
    sampleGenerator,
    3,
    4
  );
  for (let i = 0; i < 10; i++) {
    const generated = repetitionGenerator3();
    console.log(generated);
    expect(generated.match(/^(a|b){3,4}$/)).toBeTruthy();
  }
});

test("test makePlusGenerator", () => {
  const generator1 = stringToGenerator("a");
  const repetitionGenerator1 = makePlusGenerator(generator1);
  for (let i = 0; i < 10; i++) {
    const generated = repetitionGenerator1();
    console.log(generated);
    expect(generated.match(/^a+$/)).toBeTruthy();
  }
  const generator2 = stringToGenerator("b");
  const sequenceGenerator = makeSequenceGenerator([generator1, generator2]);
  const repetitionGenerator2 = makePlusGenerator(sequenceGenerator, 2);
  for (let i = 0; i < 10; i++) {
    const generated = repetitionGenerator2();
    console.log(generated);
    expect(generated.match(/^(ab){2,}$/)).toBeTruthy();
  }
  const sampleGenerator = makeSampleGenerator([generator1, generator2]);
  const repetitionGenerator3 = makePlusGenerator(sampleGenerator, 3);
  for (let i = 0; i < 10; i++) {
    const generated = repetitionGenerator3();
    console.log(generated);
    expect(generated.match(/^(a|b){3,}$/)).toBeTruthy();
  }
});
