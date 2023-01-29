import {
  characterParser,
  makeKleeneParser,
  makeOrParser,
  makeParenParser,
  makeSequenceParser,
  parser,
  strictCharacterParser,
} from "./parser";

test("test characterParser", () => {
  const failed = characterParser("");
  expect(failed).toBeNull();
  const result = characterParser("abc");
  if (result === null) {
    fail();
  } else {
    const [generator, rest] = result;
    expect(rest).toBe("bc");
    expect(generator()).toBe("a");
  }
  const result2 = characterParser("🐍bc");
  if (result2 === null) {
    fail();
  } else {
    const [generator, rest] = result2;
    expect(rest).toBe("bc");
    expect(generator()).toBe("🐍");
  }
});

test("test makeKleeneParser", () => {
  const kleeneParser = makeKleeneParser(characterParser);
  const failed = kleeneParser("");
  expect(failed).toBeNull();
  const result = kleeneParser("abc");
  if (result === null) {
    fail();
  } else {
    const [generator, rest] = result;
    expect(rest).toBe("bc");
    expect(generator()).toBe("a");
  }
  const result2 = kleeneParser("🐍*bc");
  if (result2 === null) {
    fail();
  } else {
    const [generator, rest] = result2;
    expect(rest).toBe("bc");
    for (let i = 0; i < 10; i++) {
      expect(generator().match(/(🐍)*/)).toBeTruthy();
    }
  }
});

test("test makeSequenceParser", () => {
  const kleeneParser = makeKleeneParser(characterParser);
  const sequenceParser = makeSequenceParser(kleeneParser);
  const result1 = sequenceParser("");
  if (result1 === null) {
    fail();
  } else {
    const [generator, rest] = result1;
    expect(rest).toBe("");
    expect(generator()).toBe("");
  }
  const result2 = sequenceParser("a");
  if (result2 === null) {
    fail();
  } else {
    const [generator, rest] = result2;
    expect(rest).toBe("");
    expect(generator()).toBe("a");
  }
  const result3 = sequenceParser("ab");
  if (result3 === null) {
    fail();
  } else {
    const [generator, rest] = result3;
    expect(rest).toBe("");
    expect(generator()).toBe("ab");
  }
  const result4 = sequenceParser("ab*");
  if (result4 === null) {
    fail();
  } else {
    const [generator, rest] = result4;
    expect(rest).toBe("");
    for (let i = 0; i < 10; i++) {
      expect(generator().match(/^ab*$/)).toBeTruthy();
    }
  }
  const result5 = sequenceParser("🐍*bc*");
  if (result5 === null) {
    fail();
  } else {
    const [generator, rest] = result5;
    expect(rest).toBe("");
    for (let i = 0; i < 10; i++) {
      expect(generator().match(/^(🐍)*bc*$/)).toBeTruthy();
    }
  }
});

test("test makeOrParser", () => {
  const orParser = makeOrParser(characterParser);
  const result = orParser("a|b");
  if (result === null) {
    fail();
  } else {
    const [generator, rest] = result;
    expect(rest).toBe("");
    for (let i = 0; i < 10; i++) {
      const generated = generator();
      console.log(generated);
      expect(generated.match(/^(a|b)$/)).toBeTruthy();
    }
  }
  const result2 = orParser("✊|✌|✋");
  if (result2 === null) {
    fail();
  } else {
    const [generator, rest] = result2;
    expect(rest).toBe("");
    for (let i = 0; i < 10; i++) {
      const generated = generator();
      console.log(generated);
      expect(generated.match(/^(✊|✌|✋)$/)).toBeTruthy();
    }
  }
  const orParser2 = makeOrParser(makeSequenceParser(strictCharacterParser));
  const result3 = orParser2("ab|cd");
  if (result3 === null) {
    fail();
  } else {
    const [generator, rest] = result3;
    expect(rest).toBe("");
    for (let i = 0; i < 10; i++) {
      const generated = generator();
      console.log(generated);
      expect(generated.match(/^(ab|cd)$/)).toBeTruthy();
    }
  }
});

test("test makeParenParser", () => {
  const parser1 = makeParenParser(characterParser);
  const result1 = parser1("(a)bc");
  if (result1 === null) {
    fail();
  } else {
    const [generator, rest] = result1;
    expect(rest).toBe("bc");
    expect(generator()).toBe("a");
  }
  
  const result2 = parser1("abc");
  expect(result2).toBeNull();

  const result3 = parser1("(abc");
  expect(result3).toBeNull();

  const parser2 = makeParenParser(makeKleeneParser(characterParser));
  const result4 = parser2("(de*)fg");
  if (result4 === null) {
    fail();
  } else {
    const [generator, rest] = result4;
    expect(rest).toBe("fg");
    for (let i = 0; i < 10; i++) {
      expect(generator().match(/^de*$/)).toBeTruthy();
    }
  }
  const result5 = parser2("(defg");
  expect(result5).toBeNull();
  const result6 = parser2(")defg");
  expect(result6).toBeNull();
});

test("parser", () => {
  const result1 = parser("a");
  if (result1 === null) {
    fail();
  } else {
    const [generator, rest] = result1;
    expect(rest).toBe("");
    for (let i = 0; i < 10; i++) {
      const generated = generator();
      console.log(generated);
      expect(generated).toBe("a");
    }
  }
  const result2 = parser("a*");
  if (result2 === null) {
    fail();
  } else {
    const [generator, rest] = result2;
    expect(rest).toBe("");
    for (let i = 0; i < 10; i++) {
      const generated = generator();
      console.log(generated);
      expect(generated.match(/^a*$/)).toBeTruthy();
    }
  }
  const result3 = parser("ab|cd");
  if (result3 === null) {
    fail();
  } else {
    const [generator, rest] = result3;
    expect(rest).toBe("");
    for (let i = 0; i < 10; i++) {
      const generated = generator();
      console.log(generated);
      expect(generated.match(/^(ab|cd)$/)).toBeTruthy();
    }
  }
  const result4 = parser("(a|b)*");
  if (result4 === null) {
    fail();
  } else {
    const [generator, rest] = result4;
    expect(rest).toBe("");
    for (let i = 0; i < 10; i++) {
      const generated = generator();
      console.log(generated);
      expect(generated.match(/^(a|b)*$/)).toBeTruthy();
    }
  }
  const result5 = parser("(a|)b*");
  if (result5 === null) {
    fail();
  } else {
    const [generator, rest] = result5;
    expect(rest).toBe("");
    for (let i = 0; i < 10; i++) {
      const generated = generator();
      console.log(generated);
      expect(generated.match(/^(a|)b*$/)).toBeTruthy();
    }
  }
  const result6 = parser("");
  if (result6 === null) {
    fail()
  } else {
    const [generator, rest] = result6;
    expect(rest).toBe("");
    expect(generator()).toBe("");
  }
  const result7 = parser("aaa(bbb");
  if (result7 === null) {
    fail()
  } else {
    const [generator, rest] = result7;
    expect(rest).toBe("(bbb");
    expect(generator()).toBe("aaa");
  }
  const result8 = parser("aaa)bbb");
  if (result8 === null) {
    fail()
  } else {
    const [generator, rest] = result8;
    expect(rest).toBe(")bbb");
    expect(generator()).toBe("aaa");
  }
});
