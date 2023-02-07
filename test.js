const http = require("http");

const protocol = "http:";
const hostname = "localhost";
const port = 8000;
const path = "/toto";

const send = (actorName, payload) => {
  const req = http
    .request(
      {
        protocol,
        hostname,
        port,
        path,
        method: "POST",
      },
      (res) => {
        res.on("end", () => {
          console.log(actorName, "- Ended");
        });
      }
    )
    .on("error", (err) => {
      console.log(actorName, "- Error:", err, "- Payload:", payload);
    });

  req.write(JSON.stringify(payload));
  req.end();
};

const receive = (actorName) => {
  const req = http
    .request(
      {
        protocol,
        hostname,
        port,
        path,
        method: "GET",
      },
      (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          console.log(actorName, "- Ended and Received:", data);
        });
      }
    )
    .on("error", (err) => {
      console.log(actorName, "- Error:", err);
    });

  req.end();
};

console.log("Cas nominal - envoi puis reçoit");
send("sender", "Hello world");
receive("receiver");

console.log("Cas nominal - attend puis reçoit");
receive("receiver");
send("sender", "Hello world");

console.log("Ecrasement du sender");
send("sender1", "Sender 1");
send("sender2", "Sender 2");
receive("receiver");

console.log("Ecrasement du receiver");
receive("receiver 1");
receive("receiver 2");
send("sender", "Hello world");

console.log("Coupure du sender");
send("sender", "Hello world");
// TODO stop the sender
receive("receiver");

console.log("Coupure du receiver");
receive("receiver");
// TODO stop the receiver
send("sender", "Hello world");
