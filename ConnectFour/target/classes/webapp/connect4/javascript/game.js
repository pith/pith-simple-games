var canvas;
var posCanvas;
var context;
var origine = 2;
var tailleCellule = 100;
var nbCelluleHauteur = 6;
var nbCelluleLargeur = 7;
var largeur = tailleCellule * nbCelluleLargeur;
var hauteur = tailleCellule * nbCelluleHauteur;
var coupJoues = new Array(nbCelluleLargeur);
var clickEnable; 

window.onload = function() {
	// Initialise le chat
	room.join(color1);
	$('username').setAttribute('autocomplete', 'OFF');
	$('username').onkeyup = function (ev) {
	    var keyc = getKeyCode(ev);
	    if (keyc == 13 || keyc == 10) {
		    room.chat($F('username'));
		    $('username').value = '';
	        return false;
	    }
	    return true;
	};
	$('sendB').onclick = function (event) {
	    room.chat($F('username'));
	    $('username').value = '';
	    return true;
	};
	// Initialise le jeu
	var hashTab = getHash().toString().split("+");
    var username = hashTab[1];
	var location = document.location.toString().replace('http://', 'ws://').replace('https://', 'wss://').replace('8080','9090')
	    .replace('connect4/connect4','connect4');
	var location = location.substring(0,location.lastIndexOf('.')).concat(hashTab[0]);
	websocket.join(location, username);
	setClickable(websocket._username == 1); // le joueur 1 (invité) commence (hé oui, on est poli)
	
    /*****************************
     *   Initialise le canvas
     *****************************/
     
    var canvas = document.getElementById('canvas');
    if(!canvas){alert("Impossible de r�cup�rer le canvas");return;}
    context = canvas.getContext('2d');
    if(!context){alert("Impossible de r�cup�rer le context du canvas");return;}
    posCanvas = findPos(canvas); // set la position du canvas
	
	for (var i = 0; i < nbCelluleLargeur; i++) {
		coupJoues[i] = new Array(nbCelluleHauteur);
		for (var j = 0; j < nbCelluleHauteur; j++) {
			coupJoues[i][j] = -1;
		}
	}
	
    dessineJeu();               //dessine le cadre
    document.getElementById('plateau').addEventListener('click', myClickEvent, false) //register event
}

function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

/***********************/
/*   Dessin du jeu   */
/***********************/
function dessineJeu() {
	context.strokeRect(origine, origine, largeur, hauteur); // On dessine le cadre
	dessineTraitsHorizontaux();
	dessineTraitsVerticaux();
}

var lineColor = "black";

function dessineTrait(xo, yo, x1, y2) {
    context.strokeStyle = lineColor;
    context.lineWidth = .5;
    context.beginPath();                 // On commence le trait
	context.moveTo(xo,yo); 
    context.lineTo(x1, y2);
    context.stroke();
    context.closePath();
}

function dessineTraitsHorizontaux() {
	for (var h = origine; h <= hauteur; h += tailleCellule) {
		dessineTrait(origine, h, largeur, h);
	}
}

function dessineTraitsVerticaux() {
	for (var l = origine; l <= hauteur; l += tailleCellule) {
		dessineTrait(l, origine, l, hauteur);
	}
}

/***********************/
/*  Fonctions de jeu   */
/***********************/

var tab = [0,0,0,0,0,0,0];
var nbCoupsJoues = 0;
var color1 = 'yellow';
var color2 = 'red';
var border = 0
var radius = tailleCellule / 2 - border;

function dessineBoule(colorId, x) {
	// Calcul des coordonn�es
	var col = Math.floor(x / tailleCellule);
	// S'il reste de la place dans la colonne
	if (tab[col] < nbCelluleHauteur) {
		var centerX = col * tailleCellule + tailleCellule / 2; // On place le centre du cercle � la moiti� de la colonne
		var centerY = hauteur - (tab[col] * tailleCellule + tailleCellule / 2); // On place la nouvelle boule au dessus de la pr�c�dente
		tab[col]++; // On met � jour le nombre de boule dans la colonne
		coupJoues[col][tab[col]-1] = colorId;
		nbCoupsJoues++; // On augmente le nombre de coups jou�s.
		// Dessin de la boule
		context.beginPath();
		context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		context.fillStyle = (colorId == 0) ? color1 : color2; // Si le nombre de coups jou�s est pair la boule sera de couleur color1;
		context.fill();
		context.lineWidth = border;
		context.strokeStyle = '#003300';
		context.stroke();
		if (colorId == websocket._username) {
			setClickable(false);
		} else {
			setClickable(true);
		}
		isWinner();
	}
}

function myClickEvent(e) {
	if (clickEnable) {
		var x = e.pageX - posCanvas.x;
		//dessineBoule(nbCoupsJoues%2, x);
		websocket.post(x);
		clickEnable = false;
	}
}

function setClickable(bool) {
	if (bool) {
		clickEnable = true;
	    $('message').innerHTML = "It's your turn to play";
	} else {
		clickEnable = false;
	    $('message').innerHTML = 'Wait for the other player ...';
	}
}

var currentPlayer;
var nbBoule;

function isWinner() {
	// Parcour les colonnes
	for (var i = 0; i < nbCelluleLargeur; i++) {
		currentPlayer = coupJoues[i][0];
		nbBoule = 0;
		for (var j = 0; j < nbCelluleHauteur; j++) {
			checkLigneColonne(i, j);
		}
	}

	// Parcour les ligne
	for (var i = 0; i < nbCelluleHauteur; i++) {
		currentPlayer = coupJoues[i][0];
		nbBoule = 0;
		for (var j = 0; j < nbCelluleLargeur; j++) {
			checkLigneColonne(j, i);
		}
	}

	// Diagonnales
	for (var i = 0; i < nbCelluleLargeur; i++) {
		currentPlayer = coupJoues[i][0];
		nbBoule = 0;
		for (var j = 0; i+j < nbCelluleLargeur; j++) {
			checkLigneColonne(i+j, j);
		}
	}

	for (var i = 1; i < nbCelluleHauteur; i++) {
		currentPlayer = coupJoues[i][0];
		nbBoule = 0;
		for (var j = 0; i+j < nbCelluleHauteur; j++) {
			checkLigneColonne(j, i+j);
		}
	}

	for (var i = nbCelluleLargeur-1; i >= 0; i--) {
		currentPlayer = coupJoues[i][0];
		nbBoule = 0;
		for (var j = 0; i-j >= 0; j++) {
			checkLigneColonne(i-j, j);
		}
	}

	for (var i = 0; i < nbCelluleLargeur; i++) {
		currentPlayer = coupJoues[i][0];
		nbBoule = 0;
		for (var j = 0; i+j < nbCelluleHauteur; j++) {
			checkLigneColonne(i+j, nbCelluleHauteur-j);
		}
	}
}

function checkLigneColonne(i, j) {
	// Si la boule appartient au m�me joueur que celle d'avant on incremente le nombre de boule align�
	if (coupJoues[i][j] != -1 && coupJoues[i][j] == currentPlayer) {
		nbBoule++;
		if (nbBoule >= 4) {
			alert("The " + ((websocket._username == 0) ? color1 : color2) + " player win !");
		}
	} else { // Sinon on remet le compteur � 1
		nbBoule = 1;
	} // On sauvegarde le joueur courant
	currentPlayer = coupJoues[i][j];
}