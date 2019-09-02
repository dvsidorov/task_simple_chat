# coding: utf-8


import json
import os
import datetime
import petname
import jinja2
import aiohttp
import aiohttp_jinja2
from aiohttp import web
from aiohttp import WSCloseCode


async def on_shutdown(app):
    for _, ws in app['websockets'].items():
        await ws.close(code=WSCloseCode.GOING_AWAY,
                       message='Server shutdown')


async def chat_handler(request):
    login = request.cookies.get('login', petname.name())
    context = {
        'people': set([login for login in request.app['websockets']] + [login]),
        'notify': f'{login} joined to chat',
    }
    response = aiohttp_jinja2.render_template('chat.html',
                                              request,
                                              context)
    response.cookies['login'] = login
    return response


async def ws_handler(request):

    ws = web.WebSocketResponse()
    await ws.prepare(request)

    login = request.cookies.get('login', petname.name())
    request.app['websockets'].update({login: ws})

    for _, ws_ in request.app['websockets'].items():
        if ws is not ws_:
            await ws_.send_str(json.dumps({
                'people_list': aiohttp_jinja2.render_string('people_list.html',
                                                            request,
                                                            {'people_list': [login for login in request.app['websockets']]}),
                'notify': aiohttp_jinja2.render_string('notify.html',
                                                       request,
                                                       {'notify': f'{login} joined to chat'}),
            }))

    try:
        async for msg in ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                for _, ws_ in request.app['websockets'].items():
                    await ws_.send_str(json.dumps({
                        'message': aiohttp_jinja2.render_string(
                            'message.html',
                            request,
                            {
                                'login': login,
                                'message': msg.data,
                                'time': str(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
                            }
                        )
                    }))
            elif msg.type == aiohttp.WSMsgType.ERROR:
                pass
    finally:
        del request.app['websockets'][login]
        await ws_.send_str(json.dumps({
            'people_list': aiohttp_jinja2.render_string('people_list.html',
                                                        request,
                                                        {'people_list': [login for login in request.app['websockets']]}),
            'notify': aiohttp_jinja2.render_string('notify.html',
                                                   request,
                                                   {'notify': f'{login} lived this chat'}),
        }))

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
    web.run_app(app, port=os.getenv('PORT', 5000))
