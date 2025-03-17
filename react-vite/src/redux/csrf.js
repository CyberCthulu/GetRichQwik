// src/redux/csrf.js

import Cookies from "js-cookie";

export async function csrfFetch(url, options = {}) {
  options.method = options.method || "GET";
  options.headers = options.headers || {};

  if (options.method.toUpperCase() !== "GET") {
    options.headers["Content-Type"] =
      options.headers["Content-Type"] || "application/json";
    // Attach XSRF token
    options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN") || Cookies.get("csrf-token");
  }

  options.credentials = "include";

  const res = await window.fetch(url, options);
  return res;
}
