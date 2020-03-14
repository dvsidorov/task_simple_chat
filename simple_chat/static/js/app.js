window.jBus = window.jBus || {};
window.options = window.options || {};


(function ($, bus, opt) {

    bus.App = function (options) {
        for (var opt in options) {
            this[opt] = options[opt];
        }

        this.initialize = function () {
            this.initSendButton();
            this.initWs();
        };

        this.initSendButton = function () {
            this.bindMsg(this._message_button, 'click submit', this.handlerSendButton, true);
        };

        this.initWs = function () {
            let host = window.location.host;
            let obj = this;
            this.socket = new WebSocket("wss://" + host + "/ws");
            this.socket.onopen = function() {
                console.log("Соединение установлено.");
            };

            this.socket.onclose = function(event) {
                if (event.wasClean) {
                    console.log('Соединение закрыто чисто');
                } else {
                    console.log('Обрыв соединения'); // например, "убит" процесс сервера
                }
                console.log('Код: ' + event.code + ' причина: ' + event.reason);
            };

            this.socket.onmessage = function(event) {
                let data = JSON.parse(event.data);
                if (data['people_list']) {
                    $(obj._people_list).html(data['people_list']);
                }
                if (data['notify']) {
                    $(obj._message_list + ' li:last-child').after(data['notify']);
                }
                if (data['message']) {
                    $(obj._message_list + ' li:last-child').after(data['message']);
                }
            };

            this.socket.onerror = function(error) {
                console.log("Ошибка " + error.message);
            };
        };

        this.handlerSendButton = function (event, target) {
            let data = $(this._message_input).val();
            this.socket.send(data);
            $(this._message_input).val("");
        };


    };

    (function (bus) {
        let channel_node = new bus.ChannelNode ();
        let data_storage = new bus.DataHtmlStorage();

        let app = new bus.App({
            '_people_list': '.people-list ul.list-group',
            '_message_list': '.messages-list ul.list-group',
            '_message_input': '.messages-input input',
            '_message_button': '.messages-input button',
        });

        $.extend(true,
            app,
            channel_node,
            data_storage);
        app.initialize();
    })(bus);

})(window.jQuery, window.jBus, options);
