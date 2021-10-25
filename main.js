let { writeFile } = require("fs");
let { join } = require("path");
let request = require("request");
let blend = require("@mapbox/blend");
let argv = require("minimist")(process.argv.slice(2));
let {
  textArr = ["Hello", "You", "Lovely"],
  width = 400,
  height = 500,
  color = "Pink",
  size = 100,
} = argv;

/**
 * call generic request function.
 */
bodyRequest();

/**
 * Main generic request function  .
 */
async function bodyRequest() {
  let blendData = [];
  let promiseArr = [];
  textArr.forEach(async (textElement) => {
    promiseArr.push(promiseIdentity(textElement));
  });

  Promise.all(promiseArr)
    .then((responses) => {
      responses.forEach((res, index) => {
        blendData.push({
          buffer: new Buffer.from(res, "binary"),
          x: index === 0 ? 0 : width * index,
          y: 0,
        });
      });
      if (blendData.length) {
        blendFunction(blendData);
      }
    })
    .catch((error) => {
      console.log(error.message);
      console.error(error.message);
    });
}

/**
 * @param {*} textElement
 * @returns Promise that returns data body
 */
async function promiseIdentity(textElement) {
  return new Promise((resolve, reject) => {
    request.get(makeRequest(textElement), (err, res, body) => {
      if (err) {
        reject(err);
      }
      console.log("Received response with status:" + res.statusCode);
      resolve(body);
    });
  });
}

/**
 * @param {*} textElement
 * @returns Image data items
 */
function makeRequest(textElement) {
  return {
    // url: `https://cdn2.thecatapi.com/images/2kr.jpg`, // dummy image for testing
    url: `https://cataas.com/cat/says/${textElement}?width=${width}&height=${height}&color=${color}&s=${size}`,
    encoding: "binary",
  };
}

/**
 * @param {*} blendData
 */
function blendFunction(blendData) {
  blend(
    blendData,
    {
      width: width * textArr.length,
      height: height,
      format: "jpeg",
    },
    (err, data) => {
      const fileOut = join(process.cwd(), `/cat-card.jpg`);
      writeFile(fileOut, data, "binary", (err) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log("The file was saved!");
      });
    }
  );
}
