const http = require("http");
const fs = require("fs").promises;

const requestListener = function (req, res, url) {
    fs.readFile(__dirname + url)
        .then((contents) => {
            res.setHeader(
                "Content-Type",
                url.includes("js") ? "text/javascript" : "text/html"
            );
            res.writeHead(200);
            res.end(contents);
        })
        .catch((err) => {
            res.writeHead(500);
            res.end(err);
            return;
        });
};

const server = http.createServer(function (req, res) {
    //create web server
    if (req.url == "/") {
        //check the URL of the current request
        requestListener(req, res, "/src/index.html");
    } else if (req.url.includes("js")) {
        requestListener(req, res, req.url);
    } else {
        res.end("Invalid Request!");
    }
});

server.listen(5000); //6 - listen for any incoming requests
