# coding: utf-8


from aiohttp import web


async def hello(request):
    return web.Response(body=b'Hello, world')


def create_app(loop):
    app = web.Application(loop=loop)
    app.router.add_route('GET', '/', hello)
    return app


async def test_hello(test_client):
    client = await test_client(create_app)
    resp = await client.get('/')
    assert resp.status == 200
    text = await resp.text()
    assert 'Hello, world' in text
