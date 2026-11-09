// Bilibili splash response filter v2.
// Based on app2smile/rules splash handling; restricted to splash endpoints.
// Logs contain field names and counts only, never URLs, tokens or response values.
(function () {
  var prefix = "[BiliSplash v6] ";
  var endpoint = ($request.url.split("?")[0].split("/x/v2/splash/")[1] || "unknown");
  var shape = "";
  function report(message) {
    console.log(endpoint + " " + message);
  }
  try {
    var raw = $response.body;
    if (!raw) {
      report(prefix + "skip: empty response");
      return $done({});
    }
    var body = JSON.parse(raw);
    if (!body || typeof body !== "object" || !body.data ||
        typeof body.data !== "object" || Array.isArray(body.data)) {
      report(prefix + "skip: missing object data");
      return $done({});
    }
    if (body.code !== undefined && body.code !== 0) {
      report(prefix + "skip: nonzero API status");
      return $done({});
    }
    shape = "data字段: " + Object.keys(body.data).slice(0, 40).map(function (key) {
      var value = body.data[key];
      return key + "=" + (Array.isArray(value) ? "array(" + value.length + ")" :
        value === null ? "null" : typeof value === "object" ?
        "object{" + Object.keys(value).slice(0, 15).join(",") + "}" : typeof value);
    }).join("; ");
    var fields = ["show", "list", "event_list", "brand_list", "keep_ids"];
    var changes = [];
    fields.forEach(function (key) {
      if (Array.isArray(body.data[key])) {
        changes.push(key + ":" + body.data[key].length + "->0");
        body.data[key] = [];
      }
    });
    if (typeof body.data.max_time === "number") {
      changes.push("max_time:" + body.data.max_time + "->0");
      body.data.max_time = 0;
    }
    report(prefix + (changes.length ? changes.join(", ") : "no supported arrays; data keys=" + Object.keys(body.data).join(",")));
    return $done({ body: JSON.stringify(body) });
  } catch (error) {
    report(prefix + "skip: parse or processing error");
    return $done({});
  }
}());
