import chai, { expect } from "chai";
import { mkdirsSync, readFileSync, writeFileSync } from "fs-extra";
import gm from "gm";
import path from 'path';
import rimraf from "rimraf";
import { fromBase64, fromBuffer, fromPath } from "../src/index";
import { Graphics } from "../src/graphics";
import { ToBase64Response, WriteImageResponse } from "../src/types/convertResponse";
import { Options } from "../src/types/options";

describe("PDF2Pic Core", () => {
  const baseOptions = {
    quality: 100,
    format: "jpg",
    width: 768,
    height: 512,
    savePath: "./dump/fromfiletest"
  };

  const expectInfoToBeValid = (info: gm.ImageInfo, options) => {
    expect(info).to.haveOwnProperty('format');
    if (options.format) {
      expect(info.format).to.be.equal(options.format.toUpperCase());
    } else {
      expect(info.format).to.be.equal('PNG');
    }
    expect(info).to.haveOwnProperty('size');
    expect(info.size).to.haveOwnProperty('width');
    if (options.width) {
      expect(info.size.width).to.be.equal(options.width);
    }
    expect(info.size).to.haveOwnProperty('height');
    if (options.height) {
      expect(info.size.height).to.be.equal(options.height);
    }
  }

  const expectImageResponseToBeValid = (response: WriteImageResponse, options: Options) => {
    expect(response).to.haveOwnProperty('name');
    expect(response.name).to.be.a('string');
    expect(response).to.haveOwnProperty('size');
    expect(response.size).to.be.a('string');
    expect(response).to.haveOwnProperty('fileSize');
    expect(response.fileSize).to.be.a('number');
    expect(response).to.haveOwnProperty('path');
    expect(response.path).to.equal(`${options.savePath}/${response.name}`);
    expect(response).to.haveOwnProperty('page');
    expect(response.page).to.be.a('number');
  }

  const expectBase64ResponseToBeValid = (response: ToBase64Response) => {
    expect(response).to.haveOwnProperty('base64');
    expect(response.base64).to.be.a('string');
    expect(response).to.haveOwnProperty('size');
    expect(response.size).to.be.a('string');
    expect(response).to.haveOwnProperty('page');
    expect(response.page).to.be.a('number');
  }

  before(() => {
    rimraf.sync("./dump/fromfiletest");
    rimraf.sync("./dump/frombuffertest");
    rimraf.sync("./dump/frombase64test");

    mkdirsSync("./dump/fromfiletest");
  });

  it('should use default options', async () => {
    
  });

  it("should convert pdf to pic (file input, first page)", async () => {
    const gm = new Graphics();
    const options = {
      ...baseOptions,
      format: "png",
      saveFilename: "test-1"
    }

    const convert = fromPath("./test/data/pdf1.pdf", options);
    const imageResponse = await convert();

    expectImageResponseToBeValid(imageResponse, options);
    const info = await gm.identify("./dump/fromfiletest/test-1.1.png") as gm.ImageInfo;
    expectInfoToBeValid(info, options)
  });

  it("should convert pdf to pic (buffer input, first page)", async () => {
    const gm = new Graphics();
    const options = {
      ...baseOptions,
      format: "png",
      saveFilename: "test-1"
    }
    const buffer = readFileSync("./test/data/pdf1.pdf");

    const convert = fromBuffer(buffer, options);
    const imageResponse = await convert();

    expectImageResponseToBeValid(imageResponse, options);
    const info = await gm.identify("./dump/fromfiletest/test-1.1.png") as gm.ImageInfo;
    expectInfoToBeValid(info, options)
  });

  it("should convert pdf to pic (base64 input, first page)", async () => {
    const gm = new Graphics();
    const options = {
      ...baseOptions,
      format: "png",
      saveFilename: "test-1"
    }
    const b64 = readFileSync("./test/data/pdf1.pdf", "base64");

    const convert = fromBase64(b64, options);
    const imageResponse = await convert();

    expectImageResponseToBeValid(imageResponse, options);
    const info = await gm.identify("./dump/fromfiletest/test-1.1.png") as gm.ImageInfo;
    expectInfoToBeValid(info, options)
  });

  it("should convert pdf to pic (file input, second page, base64 output)", async () => {
    const gm = new Graphics();
    const options = {
      ...baseOptions,
      format: "png",
      saveFilename: "test-2"
    }

    const convert = fromPath("./test/data/pdf1.pdf", options);
    const base64Response = await convert(2, true);

    expectBase64ResponseToBeValid(base64Response)
    writeFileSync("./dump/fromfiletest/frombase64.png", Buffer.from(base64Response.base64, "base64"));
    const info = await gm.identify("./dump/fromfiletest/frombase64.png") as gm.ImageInfo;
    expectInfoToBeValid(info, options)
  });

  it("should convert pdf to pic (buffer input, second page, base64 output)", async () => {
    const gm = new Graphics();
    const options = {
      ...baseOptions,
      format: "png",
      saveFilename: "test-2"
    }

    const buffer = readFileSync("./test/data/pdf1.pdf");

    const convert = fromBuffer(buffer, options);
    const base64Response = await convert(2, { responseType: 'base64' });

    expectBase64ResponseToBeValid(base64Response)
    writeFileSync("./dump/fromfiletest/frombase64.png", Buffer.from(base64Response.base64, "base64"));
    const info = await gm.identify("./dump/fromfiletest/frombase64.png") as gm.ImageInfo;
    expectInfoToBeValid(info, options)
  });

  it("should convert pdf to pic (base64 input, second page, base64 output)", async () => {
    const gm = new Graphics();
    const options = {
      ...baseOptions,
      format: "png",
      saveFilename: "test-2"
    }

    const b64 = readFileSync("./test/data/pdf1.pdf", "base64");

    const convert = fromBase64(b64, options);
    const base64Response = await convert(2, { responseType: 'base64' });

    expectBase64ResponseToBeValid(base64Response)
    writeFileSync("./dump/fromfiletest/frombase64.png", Buffer.from(base64Response.base64, "base64"));
    const info = await gm.identify("./dump/fromfiletest/frombase64.png") as gm.ImageInfo;
    expectInfoToBeValid(info, options)
  });

  it("should convert pdf to pic (file input, bulk 2 pages)", async () => {
    const gm = new Graphics();
    const options = {
      ...baseOptions,
      format: "png",
      width: 768,
      height: 512,
      saveFilename: "test-3"
    }

    const convert = fromPath("./test/data/pdf1.pdf", options);
    const imageResponse = await convert.bulk([1, 2], { responseType: 'image' });

    expect(imageResponse).to.be.an('array').that.has.lengthOf(2)
    for (let i = 0; i < imageResponse.length; i++) {
      expectImageResponseToBeValid(imageResponse[i], options)
      const info = await gm.identify(`./dump/fromfiletest/test-3.${i + 1}.png`) as gm.ImageInfo;
      expectInfoToBeValid(info, options)
    }
  }).timeout(7000);

  it("should convert pdf to pic (file input, bulk all pages)", async () => {
    const gm = new Graphics();
    const options = {
      ...baseOptions,
      format: "png",
      width: 768,
      height: 512,
      saveFilename: "test-3"
    }

    const convert = fromPath("./test/data/pdf1.pdf", options);
    const imageResponse = await convert.bulk(-1, { responseType: 'image' });

    expect(imageResponse).to.be.an('array').that.has.lengthOf(9)
    for (let i = 0; i < imageResponse.length; i++) {
      expectImageResponseToBeValid(imageResponse[i], options)
      const info = await gm.identify(`./dump/fromfiletest/test-3.${i + 1}.png`) as gm.ImageInfo;
      expectInfoToBeValid(info, options)
    }
  }).timeout(7000);

  it("should convert pdf to pic (buffer input, bulk all pages)", async () => {
    const gm = new Graphics();
    const options = {
      ...baseOptions,
      format: "png",
      width: 768,
      height: 512,
      saveFilename: "test-3"
    }

    const buffer = readFileSync("./test/data/pdf1.pdf");

    const convert = fromBuffer(buffer, options);
    const imageResponse = await convert.bulk(-1);

    expect(imageResponse).to.be.an('array').that.has.lengthOf(9)
    for (let i = 0; i < imageResponse.length; i++) {
      expectImageResponseToBeValid(imageResponse[i], options)
      const info = await gm.identify(`./dump/fromfiletest/test-3.${i + 1}.png`) as gm.ImageInfo;
      expectInfoToBeValid(info, options)
    }
  }).timeout(7000);

  it("should convert pdf to pic (base64 input, bulk all pages)", async () => {
    const gm = new Graphics();
    const options = {
      ...baseOptions,
      format: "png",
      width: 768,
      height: 512,
      saveFilename: "test-3"
    }

    const b64 = readFileSync("./test/data/pdf1.pdf", "base64");

    const convert = fromBase64(b64, options);
    const base64Responses = await convert.bulk(-1, { responseType: 'base64' });

    expect(base64Responses).to.be.an('array').that.has.lengthOf(9)
    for (let i = 0; i < base64Responses.length; i++) {
      expectBase64ResponseToBeValid(base64Responses[i])
      const filename = `./dump/fromfiletest/test-3.b64.${i + 1}.png`
      writeFileSync(filename, Buffer.from(base64Responses[i].base64, 'base64'))
      const info = await gm.identify(filename) as gm.ImageInfo;
      expectInfoToBeValid(info, options)
    }
  }).timeout(7000);
});
