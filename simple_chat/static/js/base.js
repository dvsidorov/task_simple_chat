window.jBus = window.jBus || {};
window.options = window.options || {};


(function ($, class_bus) {

    "use strict";

    /**
     * Class of interface message
     * */
    class_bus = class_bus || {};
    class_bus.ChannelNode = function () {

        this.bindMsg = function (receivers, msg, callback, prevent, data) {
            var obj = this;
            $(function () {
                if (!(receivers instanceof Array))
                    receivers = [receivers];
                for (var i in receivers) {
                    $(receivers[i]).on(
                        msg,
                        data,
                        function (event) {
                            if (prevent)
                                event.preventDefault();

                            var params = null;
                            if (arguments)
                                params = arguments;
                            callback.call(obj, event, this, params);
                        }
                    );
                }
            });
        };

        this.unbindMsg = function (receivers, msg, callback, prevent, data) {
            var obj = this;
            $(function () {
                if (!(receivers instanceof Array))
                    receivers = [receivers];
                for (var i in receivers) {
                    $(receivers[i]).off(
                        msg,
                        data,
                        function (event) {
                            if (prevent)
                                event.preventDefault();

                            var params = null;
                            if (arguments)
                                params = arguments;
                            callback.call(obj, event, this, params);
                        }
                    );
                }
            });
        };

        this.publishMsg = function (listeners, msg, params) {
            $(function () {
                if (!(listeners instanceof Array))
                    listeners = [listeners];
                for (var i in listeners) {
                    $(listeners[i]).trigger(msg, params);
                }
            });
        };

        this.setTimeout = function (callback, timeout_id, time, params) {
            var obj = this;

            if (obj[timeout_id]) {
              clearTimeout(obj[timeout_id]);
            }

            obj[timeout_id] = setTimeout(
              function(){
                callback.call(obj, params);
                obj[timeout_id] = null;
              }, time
            );
        };
    };

    /**
    * Class of storage node.
    * */
    class_bus.DataHtmlStorage = function () {

        /**
         * Push value in storage.
         *
         * @param key {string} key pushed
         * @param value {string} value pushed
         *
         * @return {null} null
         * */
        this.htmlStorageSet = function (key, value) {
            $(this.storage_block).each(
                function (index, object) {
                    $.data(object, key, value);
                }
            );
        };

        /**
         * Get value from storage.
         *
         * @param key {string} key pushed
         *
         * @return value {string}
         * */
        this.htmlStorageGet = function (key) {
            var value = null;
            $(this.storage_block).each(
                function (index, object) {
                    value = $.data(object, key);
                }
            );
            return value;
        };
    };

    /**
    * Class of storage node.
    * */
    class_bus.LocalStorage = function () {

        /**
         * Push value in storage.
         *
         * @param key {string} key pushed
         * @param value {string} value pushed
         *
         * @return {null} null
         * */
        this.localStorageSet = function (key, value) {

        };

        /**
         * Get value from storage.
         *
         * @param key {string} key pushed
         *
         * @return value {string}
         * */
        this.localStorageGet = function (key) {

        };
    }

})(window.jQuery, window.jBus, options);
