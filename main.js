// Inspired by https://github.com/patchbay-pub/patchbay-simple-server/blob/master/main.go

const http = require("http");

const host = "localhost";
const port = 8000;

const writerRequests = {};
const writerResponses = {};
const readerResponses = {};

const requestListener = function (req, res) {
  console.log("DEBUG", req.method, req.url);

  const path = req.url;
  if (req.method === "GET") {
    const previousReaderResponse = readerResponses[path];
    if (previousReaderResponse) {
      console.log("Cancel reader on", path);
      previousReaderResponse.writeHead(500);
      previousReaderResponse.end("Cancelled");
    }

    readerResponses[path] = res;
  } else if (req.method === "POST") {
    const previousWriterResponse = writerResponses[path];
    if (previousWriterResponse) {
      console.log("Cancel writer on", path);
      previousWriterResponse.writeHead(500);
      previousWriterResponse.end("Cancelled");
    }

    writerRequests[path] = req;
    writerResponses[path] = res;
  } else {
    res.writeHead(500);
    res.end("HTTP method not supported");
  }

  let connectedWriter = writerRequests[path];
  if (connectedWriter && connectedWriter.destroyed) {
    writerRequests[path] = undefined;
    writerResponses[path] = undefined;
    connectedWriter = undefined;
  }

  let connectedReader = readerResponses[path];
  if (connectedReader && connectedReader.writableEnded) {
    readerResponses[path] = undefined;
    connectedReader = undefined;
  }

  if (connectedWriter && connectedReader) {
    console.log("Match on", path);
    connectedWriter.pipe(connectedReader);

    const writerResponse = writerResponses[path];
    writerResponse.writeHead(200);
    writerResponse.end();

    writerRequests[path] = undefined;
    writerResponses[path] = undefined;
    readerResponses[path] = undefined;
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
