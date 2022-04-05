from http.server import BaseHTTPRequestHandler, HTTPServer
import ctypes
import mmap

PORT = 7232
lastTick = 0


class Link(ctypes.Structure):
    _fields_ = [
        ("uiVersion", ctypes.c_uint32),  # 4 bytes
        ("uiTick", ctypes.c_ulong),  # 4 bytes
        ("fAvatarPosition", ctypes.c_float * 3),  # 3*4 bytes
        ("fAvatarFront", ctypes.c_float * 3),  # 3*4 bytes
        ("fAvatarTop", ctypes.c_float * 3),  # 3*4 bytes
        ("name", ctypes.c_wchar * 256),  # 512 bytes
        ("fCameraPosition", ctypes.c_float * 3),  # 3*4 bytes
        ("fCameraFront", ctypes.c_float * 3),  # 3*4 bytes
        ("fCameraTop", ctypes.c_float * 3),  # 3*4 bytes
        ("identity", ctypes.c_wchar * 256),  # 512 bytes
        ("context_len", ctypes.c_uint32),  # 4 bytes
        ("context", ctypes.c_ubyte * 256),      # 256 bytes, see below
        ("description", ctypes.c_wchar * 2048), # 4096 bytes, always empty
    ]


class MumbleLink:
    data = Link

    def __init__(self):
        self.fname = "MumbleLink"
        self.size_link = ctypes.sizeof(Link)
        self.memfile = mmap.mmap(0, self.size_link, self.fname)

    def read(self):
        self.memfile.seek(0)
        self.data = self.unpack(Link, self.memfile.read(self.size_link))

    def close(self):
        self.memfile.close()

    @staticmethod
    def unpack(ctype, buf):
        cstring = ctypes.create_string_buffer(buf)
        ctype_instance = ctypes.cast(ctypes.pointer(cstring), ctypes.POINTER(ctype)).contents
        return ctype_instance


class Server(BaseHTTPRequestHandler):

    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

    def log_message(self, f, *args):
        return

    # GET sends back a Hello world message
    def do_GET(self):
        global lastTick

        ml = MumbleLink()
        ml.read()

        status = 'offline'
        if ml.data.uiTick > lastTick:
            status = 'online'

        identity = 'null'
        if ml.data.identity is not None and status == 'online' and ml.data.name == 'Guild Wars 2':
            identity = ml.data.identity

        lastTick = ml.data.uiTick

        self._set_headers()
        message = "{\"status\": \""+status+"\", \"identity\": "+identity+"}"
        self.wfile.write(bytes(message, "utf8"))

        ml.close()


def run(server_class=HTTPServer, handler_class=Server, port=PORT):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)

    print('Starting httpd on port %d...' % port)
    httpd.serve_forever()


if __name__ == "__main__":
    run(port=PORT)
