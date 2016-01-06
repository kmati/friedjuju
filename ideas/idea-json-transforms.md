# Things you can do with JSON

1. Transform JSON to UI code (i.e. HTML, SVG or other markup)
2. Transform JSON to other JSON
3. Bind functions to specific object paths within JSON and then process JSON documents (e.g. pretty print a portion of the JSON)


Extra Idea: App tier generation
-------------------------------

[The following ideas are simply for generating portions of applications. They are for one-time code-generation.]
[This can be done for various environments, nodejs, ExpressJS, Koa, ASP.NET Web Api, ASP.NET Mvc, PHP, RoR, etc.]

Given JSON living in a database (e.g. mongodb or couchbase) and an intermediate JSON for the server-side, you can generate the CRUD DAL code.

Given JSON format for web service responses, you can also generate the web services code for those services.

Given JSON format for client-side retrievals from web services, you can generate the web service request code. This is essentially a proxy layer of the web services on the client side.
