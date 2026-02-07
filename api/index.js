const app = require("../backend/index");

module.exports = (req, res) => {
    if (req.url) {
        req.url = req.url.replace(/^\/?api(\/|$)/, "/");
        if (!req.url.startsWith("/")) {
            req.url = `/${req.url}`;
        }
        if (req.url === "/") {
            req.url = "/todos";
        }
    }
    return app(req, res);
};
