// My chat
var textHasJoined = 'has joined!';
var room = {
    join:function (name) {
        this._username = name;
        var location = document.location.toString()
                .replace('http://', 'ws://')
                .replace('https://', 'wss://')
                .replace('8080','9090')
                .replace('connect4/connect4','chat');
        var location = location.substring(0,location.lastIndexOf('.'));
        this._ws = new WebSocket(location);
        this._ws.onopen = this._onopen;
        this._ws.onmessage = this._onmessage;
        this._ws.onclose = this._onclose;
    },

    _onopen:function () {
        $('username').focus();
        room._send(room._username, textHasJoined);
    },

    _send:function (user, message) {
        user = user.replace(':', '_');
        if (this._ws) {
            this._ws.send(user + ':' + message);
        }
    },

    chat:function (text) {
        if (text != null && text.length > 0)
            room._send(room._username, text);
    },

    _onmessage:function (m) {
        if (m.data) {
            var c = m.data.indexOf(':');
            var from = m.data.substring(0, c).replace('<', '&lt;').replace('>', '&gt;');
            var text = m.data.substring(c + 1).replace('<', '&lt;').replace('>', '&gt;');

            var chat = $('chat');
            var spanFrom = document.createElement('span');
            spanFrom.className = 'from';
            spanFrom.innerHTML = from + ':&nbsp;';
            var spanText = document.createElement('span');
            spanText.innerHTML = text;
            var lineBreak = document.createElement('br');
            chat.appendChild(spanFrom);
            chat.appendChild(spanText);
            chat.appendChild(lineBreak);
            chat.scrollTop = chat.scrollHeight - chat.clientHeight;
        }
    },

    _onclose:function (m) {
        this._ws = null;
        $('username').focus();
        $('chat').innerHTML = '';
    }

};
