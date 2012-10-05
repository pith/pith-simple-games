// Constantes
var PAGE_COURANTE = "index";
var WEBSOCKET = "newGame";
var GAME_PATH = "connect4/connect4";
var TEXT_CREER_NOUVELLE_PARTIE = "Create new game";
var TEXT_REJOINDRE_NOUVELLE_PARTIE = "Rejoindre la partie";

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

// My chat
var textHasJoined = 'has joined!';
var room = {
	// Création du websocket
    join:function (name) {
        this._username = name;
        var location = document.location.toString()
                .replace('http://', 'ws://')
                .replace('https://', 'wss://')
                .replace('8080','9090')
                .replace(PAGE_COURANTE + '.html',WEBSOCKET);
        this._ws = new WebSocket(location);
        this._ws.onopen = this._onopen;
        this._ws.onmessage = this._onmessage;
        this._ws.onclose = this._onclose;
    },
    // Ouverture du websocket
    _onopen:function () {
        $('join').className = 'hidden';
        $('joined').className = '';
        $('phrase').focus();
        room._send(room._username, textHasJoined);
    },
    // Envoie du pseudo
    _send:function (user, message) {
        user = user.replace(':', '_');
        if (this._ws) {
            this._ws.send(user + ':' + message);
        }
    },
    // Envoie d'un message
    chat:function (text) {
        if (text != null && text.length > 0)
            room._send(room._username, text);
    },
	// Fonction de réception d'un message
    _onmessage:function (m) {
        if (m.data) {
        	// On découpe le message
            var c = m.data.indexOf(':');
            // On évite les faille XSS
            var from = m.data.substring(0, c).replace('<', '&lt;').replace('>', '&gt;');
            var text = m.data.substring(c + 1).replace('<', '&lt;').replace('>', '&gt;');

            // On affiche le message dans la div "chat"
            var chat = $('chat');
            var spanFrom = document.createElement('span');
            spanFrom.className = 'from';
            spanFrom.innerHTML = from + ':&nbsp;';
            var spanText = document.createElement('span');
            // Si c'est une nouvelle partie qui est crée on affiche le lien sinon le text
            if (text == textHasJoined) {
            	spanText.innerHTML = text;
            } else {
            	// On crée le lien vers la partie
            	spanText.innerHTML = TEXT_CREER_NOUVELLE_PARTIE + ' <a target="_blank" title="' + TEXT_REJOINDRE_NOUVELLE_PARTIE + '" href="'
            	+ getPath(text,'1') + '">' + text + '</a>';
            }
            var lineBreak = document.createElement('br');
            // On ajoute les éléments au DOM
            chat.appendChild(spanFrom);
            chat.appendChild(spanText);
            chat.appendChild(lineBreak);
            chat.scrollTop = chat.scrollHeight - chat.clientHeight;
        }
    },
    // Fermeture du websocket
    _onclose:function (m) {
        this._ws = null;
        $('join').className = '';
        $('joined').className = 'hidden';
        $('username').focus();
        $('chat').innerHTML = '';
    }

};

// Initialise les évènements de la fenêtre
window.onload = function() {
	$('username').setAttribute('autocomplete', 'OFF');
	// Appuie de la touche "Entrée" après la saisie d'un username
	$('username').onkeyup = function (ev) {
	    var keyc = getKeyCode(ev);
	    if (keyc == 13 || keyc == 10) {
	        room.join($F('username'));
	        return false;
	    }
	    return true;
	};
	// Appuie sur le bouton join pour envoyer un pseudo
	$('joinB').onclick = function (event) {
	    room.join($F('username'));
	    return false;
	};
	$('phrase').setAttribute('autocomplete', 'OFF');
	// Appuie de la touche "Entrée" après la saisie d'un message
	$('phrase').onkeyup = function (ev) {
	    var keyc = getKeyCode(ev);
	    if (keyc == 13 || keyc == 10) {
	    	room.chat($F('phrase'));
	    	document.location = getPath($F('phrase'),'0');
	        return true;
	    }
	    return true;
	};
	// Appuie sur le bouton send pour envoyer un message
	$('sendB').onclick = function (event) {
	    room.chat($F('phrase'));
	    document.location = getPath($F('phrase'),'0');
	    return true;
	};
}

/**
 * Retourne l'url d'une partie.
 * @param partie nom de la partie
 * @param indiceJoueur indice du joueur 0 ou 1
 */ 
function getPath(partie, indiceJoueur) {
	return document.location.toString().replace(PAGE_COURANTE, GAME_PATH)+ '#' + partie + '+' + indiceJoueur;
}
