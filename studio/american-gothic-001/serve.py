# Local preview with Cloudflare Pages-style clean URLs: /projects → projects.html.
import http.server, os, sys

port, root = int(sys.argv[1]), sys.argv[2]

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=root, **k)

    def send_head(self):
        path = self.path.split('?', 1)[0].split('#', 1)[0]
        local = os.path.join(root, path.lstrip('/'))
        if path != '/' and not os.path.exists(local) and os.path.exists(local + '.html'):
            self.path = path + '.html' + self.path[len(path):]
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
