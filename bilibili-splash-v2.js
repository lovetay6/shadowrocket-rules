// Bilibili splash response filter v2.
// Based on app2smile/rules splash handling; restricted to splash endpoints.
// Logs contain field names and counts only, never URLs, tokens or response values.
(function () {
  var prefix = "[BiliSplash v2] ";
  try {
    var raw = $response.body;
    if (!raw) {
      console.log(prefix + "skip: empty response");
      return $done({});
    }
    var body = JSON.parse(raw);
    if (!body || typeof body !== "object" || !body.data ||
        typeof body.data !== "object" || Array.isArray(body.data)) {
      console.log(prefix + "skip: missing object data");
      return $done({});
    }
    if (body.code !== undefined && body.code !== 0) {
      console.log(prefix + "skip: nonzero API status");
      return $done({});
    }
    var fields = ["show", "list", "event_list", "brand_list"];
    var changes = [];
    fields.forEach(function (key) {
      if (Array.isArray(body.data[key])) {
        changes.push(key + ":" + body.data[key].length + "->0");
        body.data[key] = [];
      }
    });
    console.log(prefix + (changes.length ? changes.join(", ") : "no supported arrays; data keys=" + Object.keys(body.data).join(",")));
    return $done({ body: JSON.stringify(body) });
  } catch (error) {
    console.log(prefix + "skip: parse or processing error");
    return $done({});
  }
}());
