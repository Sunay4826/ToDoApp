const app = require("../backend/index");

module.exports = (req, res) => {
    if (req.url.startsWith("/api")) {
        req.url = req.url.replace(/^\/api(\/|$)/, "/");
        if (!req.url) req.url = "/";
    }
    return app(req, res);
};
