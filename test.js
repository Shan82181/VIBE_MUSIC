// Simple in-memory rate limiter (resets on Worker restart; use a DB for persistence)
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 100;  // Adjust as needed

export default {
  async fetch(request) {
    // Basic rate limiting
    requestCount++;
    if (requestCount > MAX_REQUESTS_PER_MINUTE) {
      return new Response("Rate limit exceeded", { status: 429 });
    }

    try {
      const url = new URL(request.url);
      const target = url.searchParams.get("url");

      // Validate the URL
      if (!target || !target.includes("googlevideo.com")) {
        return new Response("Invalid or missing YouTube URL", { status: 400 });
      }

      // Handle HEAD requests for audio probing
      if (request.method === "HEAD") {
        const headRes = await fetch(target, {
          method: "HEAD",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.youtube.com",
            "Origin": "https://www.youtube.com",
            "Range": request.headers.get("Range") || "bytes=0-",
          },
        });

        const headers = {
          "Content-Type": headRes.headers.get("Content-Type") || "audio/mpeg",
          "Access-Control-Allow-Origin": "https://your-frontend-domain.com",  // Replace with your actual domain
          "Access-Control-Allow-Headers": "Range",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Expose-Headers": "Content-Length, Accept-Ranges, Content-Range",
          "Cache-Control": "no-cache",
        };

        ["Content-Length", "Accept-Ranges", "Content-Range"].forEach(h => {
          const val = headRes.headers.get(h);
          if (val) headers[h] = val;
        });

        return new Response(null, { headers, status: headRes.status });
      }

      // Fetch the audio stream
      const res = await fetch(target, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://www.youtube.com",
          "Origin": "https://www.youtube.com",
          "Range": request.headers.get("Range") || "bytes=0-",
        },
      });

      if (!res.ok) {
        return new Response(`Failed to fetch stream: ${res.status}`, { status: res.status });
      }

      // Handle redirects (optional, but prevents issues)
      if (res.status >= 300 && res.status < 400) {
        const redirectUrl = res.headers.get("Location");
        if (redirectUrl) {
          return Response.redirect(redirectUrl, res.status);
        }
      }

      // Prepare headers for streaming
      const headers = {
        "Content-Type": res.headers.get("Content-Type") || "audio/mpeg",
        "Access-Control-Allow-Origin": "https://your-frontend-domain.com",  // Secure this
        "Access-Control-Allow-Headers": "Range",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Expose-Headers": "Content-Length, Accept-Ranges, Content-Range",
        "Cache-Control": "no-cache",
      };

      ["Content-Length", "Accept-Ranges", "Content-Range"].forEach(h => {
        const val = res.headers.get(h);
        if (val) headers[h] = val;
      });

      // Return the stream
      return new Response(res.body, { headers, status: res.status });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response("Proxy error", { status: 500 });
    }
  }
};