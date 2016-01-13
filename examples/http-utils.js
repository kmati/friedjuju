/*
 The utilities for executing HTTP requests
 */
var httpUtils = {};

[200, 201, 301, 302, 404, 500].forEach(function (errNum) {
    httpUtils['writeHead' + errNum] = function (res, headers) {
        var obj = {
            "Content-Type": "application/json"
        };
        
        if (headers) {
            for (var key in headers) {
                obj[key] = headers[key];
            }
        }
        res.writeHead(errNum, obj);
    };
});

for (var key in httpUtils) {
    exports[key] = httpUtils[key];
}
