import { fromPath } from '../src';

const options = {
  quality: 100,
  format: "png",
  width: 724,
  height: 1024,
  savePath: './dump/fromfiletest',
};

const convert = async (density: number) => {
  const convert = fromPath("./test/data/pdf2.pdf", {
    ...options,
    density,
    saveFilename: `density-test-${density}`
  });
  await convert.bulk(-1, false);
}

const runTests = async () => {
  await convert(72);
  await convert(150);
  await convert(200);
  await convert(250);
  await convert(300);
}
runTests()
