// Bilibili splash response filter v2.
// Based on app2smile/rules splash handling; restricted to splash endpoints.
// Logs contain field names and counts only, never URLs, tokens or response values.
(function () {
  var prefix = "[BiliSplash v4] ";
  function report(message) {
    console.log(message);
    try {
      var key = "bili_splash_diagnostic_v4";
      var now = Date.now();
      var last = Number($persistentStore.read(key) || 0);
      if (now - last > 30000) {
        $notification.post("B站开屏诊断 v4", "脚本已执行", message);
        $persistentStore.write(String(now), key);
      }
    } catch (_) {
      // Keep filtering even if notifications or persistent storage are unavailable.
    }
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
    var fields = ["show", "list", "event_list", "brand_list"];
    var changes = [];
    fields.forEach(function (key) {
      if (Array.isArray(body.data[key])) {
        changes.push(key + ":" + body.data[key].length + "->0");
        body.data[key] = [];
      }
    });
    report(prefix + (changes.length ? changes.join(", ") : "no supported arrays; data keys=" + Object.keys(body.data).join(",")));
    return $done({ body: JSON.stringify(body) });
  } catch (error) {
    report(prefix + "skip: parse or processing error");
    return $done({});
  }
}());
