# coding: utf-8


import weakref
import petname
import jinja2
import aiohttp
import aiohttp_jinja2
from aiohttp import web
from aiohttp import WSCloseCode


async def on_shutdown(app):
    for ws in set(app['websockets']):
        await ws.close(code=WSCloseCode.GOING_AWAY,
                       message='Server shutdown')


async def chat_handler(request):
    context = {
        'people': (login for login in request.app['websockets']),
    }
    response = aiohttp_jinja2.render_template('chat.html',
                                              request,
                                              context)
    if not request.cookies.get('login'):
        response.cookies['login'] = petname.name()
    return response


async def ws_handler(request):

    ws = web.WebSocketResponse()
    await ws.prepare(request)

    login = request.cookies.get('login', petname.name())
    request.app['websockets'].update({login: ws})

    for _, ws_ in request.app['websockets'].items():
        await ws_.send_str(f'{login} joined to chat')

    try:
        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                for _, ws_ in request.app['websockets'].items():
                    if ws is not ws_:
                        await ws_.send_str(f'{login}: {msg.data}')
            elif msg.type == aiohttp.WSMsgType.ERROR:
                pass
    finally:
        del request.app['websockets'][login]

    return ws


if __name__ == '__main__':
    app = web.Application()
    aiohttp_jinja2.setup(app,
                         loader=jinja2.FileSystemLoader('templates/'))
    app['websockets'] = dict()
    app.add_routes([
        web.get('/ws', ws_handler),
        web.get('/chat', chat_handler),
        web.static('/static/', path='static'),
    ])
    app.on_shutdown.append(on_shutdown)
    web.run_app(app)
