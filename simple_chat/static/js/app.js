window.jBus = window.jBus || {};
window.options = window.options || {};


(function ($, bus, opt) {

    bus.App = function (options) {
        for (var opt in options) {
            this[opt] = options[opt];
        }

        this.initialize = function () {
            this.initWs();
        };

        this.initWs = function () {
            let host = window.location.host;
            let socket = new WebSocket("ws://" + host + "/ws");
            console.log(socket);
            Cookies.set()
        };


    };

    (function (bus) {
        let channel_node = new bus.ChannelNode ();
        let data_storage = new bus.DataHtmlStorage();

        let app = new bus.App({
        });

        $.extend(true,
            app,
            channel_node,
            data_storage);
        app.initialize();
    })(bus);

})(window.jQuery, window.jBus, options);
