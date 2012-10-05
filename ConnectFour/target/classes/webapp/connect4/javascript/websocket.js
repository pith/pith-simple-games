// Check Websocket available
if (!window.WebSocket) alert("WebSocket not supported by this browser");

// Functions utils
function $() {
    return document.getElementById(arguments[0]);
}
function $F() {
    return document.getElementById(arguments[0]).value;
}
function getKeyCode(ev) {
    if (window.event) return window.event.keyCode;
    return ev.keyCode;
}
function getHash() {
	return window.location.hash.replace('#', '');
}

// Connect4 Websocket
var websocket = {
	/**
	 * Crée une connexion websocket.
	 * @param urlWebsocket 
	 * 		url du websocket
	 * @param username 
	 * 		identifiant (de préférence unique) d'un joueur
	 */
    join:function (urlWebsocket, username) {
        this._username = username;
        this._callBack() = alert("toto");
        this._ws = new WebSocket(urlWebsocket);
        this._ws.onopen = this._onopen;
        this._ws.onmessage = this._onmessage;
        this._ws.onclose = this._onclose;
    },

    /**
     * Ouverture du websocket.
     */
    _onopen:function () {
    	alert('Game start !');
    },

    _send:function (user, message) {
        user = user.replace(':', '_');
        if (this._ws)
            this._ws.send(user + ':' + message);
    },
    
    /**
     * Envoie un message.
     * @param text
     * 		message à envoyer
     */
    post:function (text) {
    	websocket._send(websocket._username, text);
    },

    /**
     * Reception d'un message.
     */
    _onmessage:function (m) {
        if (m.data) {
            var c = m.data.indexOf(':');
            var from = m.data.substring(0, c).replace('<', '&lt;').replace('>', '&gt;');
            var col = m.data.substring(c + 1).replace('<', '&lt;').replace('>', '&gt;');
            // Action executée à la réception d'un message
            dessineBoule(from, col);
            this._callBack();
        }
    },

    /**
     * Fermeture du websocket.
     */
    _onclose:function (m) {
        alert('Connection lost...');
    }

};
