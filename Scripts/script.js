/**
 * Functie auto-apelativa. o functie de forma (function(){})() se va
 * autoapela, astfel ca jocul va fi afisat in mod automat, in momentul in care
 * se intra pe pagina.
 * @return {function}
 */
(function () {
	/**
	 * Sintaxa de tip JQuery pentru a afisa jocul, doar in momentul in care
	 * toate elementele din pagina sa fie distribuite si afisate. In caz
	 * contrar, script-ul va astepta ca toate elementele sa fie incarcate.
	 */
	$(document).ready(function(){
		/**
		 * Setari constante pe durata jocului. Acestea raman ca si valori
		 * universale, pentru a putea trece la nivelele urmatoare sau pentru a
		 * stabili anumite valori (exemplu: viteza cu care inamicii trag).
		 * @type {Number}
		 */
		var bulletSpawn = 1;
		var enemyBulletDamage = 10;
		var level = 1;
		var canShoot = true;

		/**
		 * Obiect in care salvam mare parte din valorile jocului.
		 * @type {Object}
		 */
		var game = {};
		/**
		 * Dimensiunile 'ecranului' (dimensiunile stabiliti ale canvas-urilor).
		 * @type {Number}
		 */
		game.width = 800;
		game.height = 600;

		/**
		 * In aceasta variabila stocam informatiile stelelor.
		 * @type {Array}
		 */
		game.stars = [];
		
		/**
		 * Vector pentru a stoca informatiile de la inamicii afisati pe ecran.
		 * @type {Array}
		 */
		game.enemies = [];

		/**
		 * Setari pentru a forma inamicii. Aceste setari se modifica la fiecare nivel in parte.
		 * @type {Number}
		 */
		game.numarInamiciPeLinie = 6;
		game.numarInamiciPeColoana = 4;
		/**
		 * Presetari pentru miscarea inamicilor. Aceste valori sunt
		 * necesare pentru algoritmul de a misca inamicii, deoarece ei se
		 * v-or misca dupa un contor improvizat.
		 */
		game.contorInamici = ((game.width / 8) / 2);
		game.contorTimpMaximInamici = (game.width / 8);
		game.deplasareInamicStanga = true;
		
		/**
		 * Viteza cu care se misca inamicii.
		 * @type {Number}
		 */
		game.enemySpeed = 1;
		game.contorTragere = 0;

	  	/**
	    	* Player object. In aceast varibila stocam informatiile entitatii de
	    	* tip 'player'. Aceasta este deocamdata lipsita de proprietati, dar
	    	* urmeaza ca in functia 'formeazaPlayer' sa capete toate proprietatile
	    	* necesare.
	   	*/
	    game.player = {};
				
		// imagini
		game.images = [];
		game.imaginiNecesare = 0;
		game.imaginiIncarcate = 0;

		// Keys In acest vector, toate tastele sunt inregistrate si este
		// utilizat pentru aputea misca nava, respectiv pentru a putea
		// trage.
		game.keys = [];

		// Scorul utilizatorului
		game.score = 0;
	         
	    game.proiectilInamici = [];
		/*==============================
		*     Context Work            =
		*============================*/

		/**
		 * Preluam contextele fiecarui canvas.
		 * @type {canvas context}
		 */
		game.ctxBackground 	= document.getElementById("background").getContext("2d");
		game.ctxAction = document.getElementById("action").getContext("2d");
		game.ctxInamici = document.getElementById("inamici").getContext("2d");
		game.ctxBullet = document.getElementById("bullet").getContext("2d");
		game.ctxEnemyBullet = document.getElementById("enemyBullet").getContext("2d");
		game.ctxText = document.getElementById("text").getContext("2d");

	    /**
	     * Informatii pentru proiectilele trase de utilizator. 
	     * @type {Array}
	     */
		game.proiectilPlayer = [];
		/**
		 * Folosim un mic contor pentru a nu permite jucatorilor sa traga prea des, astfel ca jocul va fi prea usor.
		 * @type {Number}
		 */
		game.contorFinalProiectil = 10;
		game.contorInitialProiectil = game.contorFinalProiectil;


		/*=========================================
		=            Functii auxiliare            =
		=========================================*/
		
		/**
		 * Functia va forma fundalul, astfel ca pentru canvas-ul destinat
		 * background-ului o sa aiba culoarea '#100'
		 */
		function formeazaFundal() {
			// Curatam fundalul anterior
			game.ctxBackground.clearRect(0, 0, game.width, game.height);
			// Il redesenam.
			game.ctxBackground.fillStyle = "black";
			game.ctxBackground.fillRect(0, 0, game.width, game.height);			
		}

		/**
		 * Pe durata incarcarii imaginilor, se va afisa un mesaj 'Loading...'
		 */
		function renderLoadingScreen() {
			// Predefinirea stilului de text.
			game.ctxBackground.font = "bold 50px Arial";
			game.ctxBackground.fillStyle = "white";
			// Scrierea textului.
			game.ctxBackground.fillText("Loading...", 100, 200);
		}

		/**
		 * Formarea stelelor pentru durata jocului.
		 * @param  {array} numar -> Numarul de stele care o sa fie adaugat la fiecare cadru
		 */
		function formareStele (numar) {
			for (var i = 0; i < numar; i++) {
				// In vectorul de stocare al stelelor, introducem pe rand cate o
				// stea, cu informatiile necesare ale ei.
				game.stars.push({
					// Punem o coordonata de tip 'x' random
					x: Math.floor(Math.random() * game.width),
					// Punem o coordonata de tip 'y' predefinta cu 0. Astfel o sa
					// para ca stelele apar din susul ecranului si se deplaseaza
					// in jos, creeand astfel iluzia ca nava se misca in sus.
					y: 0,
					// Dimensiune random de pana la maxim 3 pixeli.
					size: Math.random() * 3
				});
			};
		}

		/**
		 * Pentru a incepe jocul, este nevoie de a forma fundalul anterior. Functia aceasta formeaza stelele pentru background, formand astfel o iluzie asupra fundalului, de parca ar fi deja in spatiu.
		 * @param  {integer} numar -> va stibili numarul de stele care va
		 *     aparea la inceputul jocului
		 */
		function formareSteleInitial(numar) {
			for (var i = 0; i < numar; i++) {
				// In vectorul de stocare al stelelor, introducem pe rand cate o
				// stea, cu informatiile necesare ale ei.
				game.stars.push({ 
					// Punem pe coorodnata x random
					x: Math.floor(Math.random() * game.width),	
					// Punem pe coorodnata y random
					y: Math.floor(Math.random() * game.height),
					// Avem o dimensiune random, de pana la maxim 3 pixeli.
					size: Math.random() * 3
				});
			};
		}

		/**
		 * Functia care introduce valorile necesare pentru a forma 'player-ul' cu
		 * proprietatile necesare pentru a putea fi folosit.
		 * @return {object}
		 */
	    function formeazaPlayer() {
	    	//	In caz ca redimensionam ecranul, jucatorul va avea o dimensiune
	    	//	'fixa', fiind complet proportional cu ecranul.
	        var width = game.width * 0.08;
	        var height = width; // Setam latimea sa fie efala cu lungimea.
	        /**
	         * Setam proprietatea 'x' sa fie cat se paote de centrat pe ecran.
	         */
	        var x = game.width * 0.5 - width / 2;
	        //	Valoarea 'y' va fi proportionala pe ecran.
	        var y = game.height * 0.80;
	        var speed = 4; // viteza navei
	        var hp = 10; // viata jucatorului
	        // Introducem toate datele in variabila.
	        var player = {
	                x,
	                y,
	                width,
	                height,
	                speed,
	                hp: 10,
	                miscare: false,
	        };
	        // Returnam obiectul 'player'
	        return player;
	    }
		/**
		 * Functie care formeaza datele inamicilor afisati pe ecran.
		 */
		function updateDataEnemies() {
			var enemies = []; // Avem un vector gol deocamda
			/**
			 * Pentru fiecare linie, pentru fiecare coloana, o sa punem datele
			 * pentru fiecare inamic in parte.
			 */
			for(var i = 1; i <= game.numarInamiciPeLinie; i++){
				for (var j = 1; j <= game.numarInamiciPeColoana; j++) {
		            // Obiectul de tip enemy. Acesta este definit temporal, urmand sa fie pus intr-un alt mod de a fi 
		            var enemy = {
		                    x: 50 + i * 100, // Coordonatele te tip x
		                    y: j * 65,	// Coordonatele de tip y
		                    width: 50,	// Latimea inamicului
		                    height: 50,	// Latimea inamicului
		                    speed: 5,	// Viteza cu care inamicul se va misca
		                    image: 4,	// ID-ul imaginii corespunzatoare fiecarui inamic
		                    mort: false, // Mod de a verifica daca inamicul mai poate fi afisat.
		                    timpMoarte: 0,	// Proprietate de a putea afisa imaginea de explozie.
		                    // Tipul imaginii este unul random, putand avea doar
		                    // valoarea 0, 1, 2 sau 3. Acest 'tip', este necesar
		                    // pentru a putea defini anumite proprietati in plus
		                    // pentru fiecare inamic in parte.
		                    tip: Math.round(Math.random() * 3),	
		                    // Hp-ul inamicului. Este predefinit drept 0, astfel ca pe
		                    // urma sa aibe parte de o stabilire exacta in functie de
		                    // tipul fiecaruia
		                    hp: 0,
		                    //Hp-ul maxim petru fiecare inamic. Avem nevoie de aceasta
		                    //proprietate pentru a putea afisa bara de viata a
		                    //inamicilor. Este predefinita cu 0, pentru a putea fi
		                    //definita in functie de tipul inamicului.
		                    hpmax: 0,
		                    // Sansa cu care un inamic o sa poata sa traga. Deocamdata
		                    // este predefinita cu 0, pentru a putea fi predefina pe
		                    // urma in alte valori in functie de tipul inamicului.
		                    sansa: 0,
		                    // Aceasta proprietate ne va spune exact cum se va misca
		                    // fiecare inamic in parte. Aceasta proprietate se schimba
		                    // in functie de nivel.
		                    movement: 1,
		            }
		            // In functie de tipul inamicului, refacem valorile de: hp, hpmax,
		            // sansa. Fiecare inamic are parte de presetari diferite.
		            switch(enemy.tip){
		                case 0: enemy.hp=10,enemy.hpmax=10,enemy.sansa=0.1; break;
		                case 1: enemy.hp=20,enemy.hpmax=20,enemy.sansa=0.2; break;
		                case 2: enemy.hp=50,enemy.hpmax=50,enemy.sansa=0.5; break;
		                case 3: enemy.hp=30,enemy.hpmax=30,enemy.sansa=0.3; break;
		            }
		            // Daca suntem la nivelul 2, o sa punem coordonatele x si y pe
		            // valori random, dar cu o oarecare pozitionare in asa fel incat
		            // sa nu fie pe dinafara ecranului.
		            if(level == 2){
		            	enemy.x = Math.round(Math.random() * (game.width-50));
		            	enemy.y = 50 + Math.round(Math.random() * (game.height/2));
		            	// Miscarea inamicului este setata drept 2.
		            	enemy.movement = 2;
		            }
		            // Daca suntem la nivelul 3, o sa punem coordonatele x si y tot pe
		            // coordonate random, dar cu o miscare predefinita oarecum
		            // aleatore.
		            if(level == 3){
		            	enemy.x = Math.round(Math.random() * (game.width-50));
		            	enemy.y = 50 + Math.round(Math.random() * (game.height/2));
		            	// Avem o sansa de 50% ca miscarea sa fie predefinita
		            	// drept miscare de tip '1' sau de tip '2'.
		            	if(Math.random() * 1 <= 0.5) {	
		            		enemy.movement = 1;
		            	} else {
		            		enemy.movement = 2;
		            	}
					}
				    // Introducem inamicul in vector, ca sa il putem stoca.
				    enemies.push(enemy);
				}
			};

			// Returnam vectorul de inamici.
	    	return enemies;
		}

		/**
		 * Functia care formeaza proiectilele inamicilor si el incarca in vectorul
		 * dedicat acestora
		 * @param  {int} xx    Coordonata de tip x a inamicului. A fost denimita
		 *     asa pentru a nu creea confuzii pentru viitorii citiro
		 * @param  {int} yy    Coordonata de tip y a inamicului. A fost denumita
		 *     asa, cu scopul de a nu creea confuzii pentru viitorii cititori ai
		 *     codului.
		 * @param  {double} sansa Sansa cu care inamicul o sa traga un anumit tip
		 *     de proiectil
		 */
		function inamicTrage(xx,yy,sansa){
			// Informatiile proiectilului. utilizam informatiile de pe pozitia 0,
			// pentru a forma pozitiile mai exact, astfel ca acesta pozitie va fi
			// mereu folosita
			var proiectil = {
		        x: xx + game.enemies[0].width/2,
		        y: yy + game.enemies[0].height - 5,
		        width: 10,
		        height: 10,
		        speed: 2,
		        imagine: 9
		    }
		    // Daca avem sansa de a oferi un "cadou",
		    if(Math.random() * 1 <= sansa){
		    	// Punem imaginea drept cadou.
		    	proiectil.imagine = 10;
		    } else {
		    	// Altfel Putem pune oricare dintre cele 2 imagini destinate
		    	// oferirii de bug-uri Fiind o sansa de 50% - 50% pentru fiecare
		    	// imagine in sine, ambele avand aceleasi proprietati, putem sa le
		    	// punem cu aceasta proprietate. Daca cumva nu avem parte de
		    	// indeplinirea sanse, atunci o sa ramana valoarea prestabilita a
		    	// proiectilului, adica indicele 9
		    	if(Math.random() * 1 <= 0.5) {
		    		proiectil.imagine = 8;
		    	}
		    }
		    // Incarcam proiectilul in vectorul destinat acestora.
		    game.proiectilInamici.push(proiectil);
		}

		/**
		 * Fucntie care formeaza textul care afiseaza informatiile legate de scor si de nivel
		 */
	    function displayScore() { 
	    	// Avem nevoie de un scris alb.
	        game.ctxText.fillStyle = "white";
	        // Predefinim proprietatile font-ului.
	        game.ctxText.font = "25px bold Arial";
	        // Curatam canvas-ul de textul anterior.
	        game.ctxText.clearRect(0, 0, game.width, 30);
	        // Afisam textul in locatiile destinate acestora.
	        game.ctxText.fillText("Bugs: " + game.score, game.width-140, 30);
	        game.ctxText.fillText("Level: " + level, 20, 30)

	      }

	    /**
	     * In momentul in care se termina nivelul, fie datorita numarului prea
	     * mare de bug-uri, fie datorita eliminarii complete de inamici din nivel,
	     * se continua nivelului
	    */
		function restartGame(){
			// Nu lasam player-ul sa traga in momentul in care a terminat jocul.
			canShoot = false;
			// Dupa un timp de 5 secunde (5000 milisecunde), se reporneste automat jocul.
			setTimeout(function(){
				// location.reload() ofera ocazia de a reincarca pagina, in mod automat.
				location.reload();
			}, 5 * 1000);
		}

		/**
		 * Verificam starea in care se afla nivelul. Daca cumva numarul de inamici
		 * este nul, atunci inseamna ca jocul a fost terminat.
		 * @return {Boolean} 
		 */
		function gameIsWon() {
			// Valoarea cu care definim daca nivelul este terminat.
			var gameWon = false;
			// Daca nu avem inamici ramasi,
			if (game.enemies.length <= 0) {
			    // Valoarea este pozitiva.
			    gameWon = true;
			} else {
				// Altfel, valoarea este negativa.
		        gameWon = false;	
			}
			// Returnam rezultatul.
			return gameWon;
		}

		/**
		 * In caz ca se termina nivelul, incarcam informatiile necesare pentru
		 * fiecare nivel in parte, astfel ca se pot modifica aceste informatii
		 * intr-un mod potrivit pentru fiecare eprsoana in parte.
		 */
	  	function finnishLevel() {
	  		// Daca ne aflam la un nivel la care putem avansa, atunci avansam.
		  	if(level <= 4) level++;
		  	// Daca ne aflam la nivelul 1
		  	if(level == 1){
		  		// Inamicii se definesc valorile proprii din functie.
		  		game.enemies = updateDataEnemies();
		  	}
		  	// Daca ne aflam la nivelul 2, o sa avem parte de inamici cu damage
		  	// (bug-uri) mai puternice si mai multi inamici.
		  	if(level == 2){
		  		game.numarInamiciPeLinie = 4;
		  		enemyBulletDamage = 20;
		  		// Adaugam inamicii.
		  		game.enemies = updateDataEnemies();
		  	}
		  	// Daca ne aflam la nivelul 3, crestem damage-ul si totodata si numarul de inamici.
		  	if(level == 3){
		  		game.numarInamiciPeLinie = 5;
		  		enemyBulletDamage = 30;
		  		// Readaugam inamici.
		  		game.enemies = updateDataEnemies();
		  	}
		  	// Daca ne aflam la nivelul 4, inseamna ca avem parte de nivelul cu boss.
		  	if(level == 4){
		  		// Vectorul de inamici va fi definit drept un vector gol. Astfel
		  		// scapam de anumite bug-uri in care apar inamici intr-un mod
		  		// aleatoriu.
		  		game.enemies = [];
		  		// Avem parte de un boss, cu proprietatile sale proprii:
		  		var boss = {
		  			// Coordonate proportionale cu dimensiunile canvas-ului.
	                // Pozitionat relativ fix.
	                x: game.width/2 - 200, 
	                y: game.height/10,
	                width: 400,
	                height: 200,
	                speed: 5,
	                image: 3,
	                mort: false,
	                timpMoarte: 0,
	                tip: -1,
	                hp: 500,
	                hpmax: 500,
	                sansa: 0,
	                // Avem parte de un boss "lenes", care nu se misca.
	                movement: 1, 	
		        }
		        // Il introducem in vector.
		        game.enemies.push(boss);
		        // Stergem urmele de la restul inamicilor care existau,
		        game.ctxInamici.clearRect(0, 0, game.width, game.height);
		        // Si desenam imaginea aferenta pentru acesta.
		  		game.ctxInamici.drawImage(game.images[3], boss.x , boss.y , boss.width, boss.height);
		  	}
		  	// Daca nivelul este 5, atunci o sa afisam mesajul prin care
		  	// utilizatorul a terminat nivelul.
		    if(level == 5){
		    	// Curatam tot canvas-ul de urme de text ramase de la celelalte nivele.
		    	game.ctxText.clearRect(0, 0, game.width, game.height);
		    	// La fel si canvas-ul pentru inamici.
		    	game.ctxInamici.clearRect(0,0,game.width,game.height);
		    	// Predefinirea textului.
		    	game.ctxText.fillStyle = "100px Arial white";
		    	// Scrierea textului pentru finalul nivelului.
		    	game.ctxText.fillText("Ai castigat!", game.width/2-100,game.height/2);
		    	// Deoarece jocul s-a terminat, lasam utilizatorul sa reinceapa
		    	// jocul, prin simpla reincarcare a paginii prin intermediul
		    	// functiei restartGame() dupa trecerea a unui timp de 5 secunde.
		    	setTimeout(restartGame(),5000);
		    }
	  	}

	  	/**
	  	 * Functia de coliziune se bazeaza pe obtinerea coordonatelor ale unor
	  	 * obiecte. Verificam daca coliziunea se intampla in unul dintre cele 4
	  	 * cazuri
	  	 * @param  {object} obiectUnu Primul obiect care contine proprietatile de
	  	 *     tip: x, y, width, height
	  	 * @param  {Object} obiectDoi Al doilea obiect care contine proprietatile
	  	 *     de tip: x, y, width, height
	  	 * @return {Boolean}           Ne spune daca avem parte de o coliziune
	  	 */
		function coliziune(obiectUnu, obiectDoi) {
			return ( // Returnam direct valoarea expresiei in caz ca avem o coliziune.
				obiectUnu.x < obiectDoi.x + obiectDoi.width 	&& 
				obiectUnu.x + obiectUnu.width > obiectDoi.x 	&&
				obiectUnu.y < obiectDoi.y + obiectDoi.height 	&&
				obiectUnu.height + obiectUnu.y > obiectDoi.y
			);
		}		

		// Functiile JQuery ne ajjuta pentru a gasi exact care tasta este apasata.
		// Functie pentru apasarea tastei
		$(document).keydown(function(e) {
			game.keys[e.keyCode ? e.keyCode : e.which] = true;
		});

		// Functie pentru eliberarea tastei.
		$(document).keyup(function(e) {
			delete game.keys[e.keyCode ? e.keyCode : e.which];
		});

		// functie care va incarca imaginile necesare pentru joc
		function incarcareImagini(paths) {
			// Retinem lungimea numarului de imagini.
			game.imaginiNecesare = paths.length;
			// Pentur fiecare imagine, o sa folosim algoritmul de initializare si
			// de predefinire a unor imagini in JS.
			for (var i = 0; i < paths.length; i++) {
				var imagine = new Image();
				imagine.src = paths[i];
				game.images[i] = imagine;
				// Daca imaginea curenta s-a incarcat, atunci o sa crestem
				// contorul care ne arata acest lucru.F
				game.images[i].onload =  function(){
	            	game.imaginiIncarcate++;
				}
			};
		}

		/*=========================================
		=           Functiile principale          =
		=========================================*/

		/**
		 * Functia care o sa predefineasca datele esentiale pentru joc.
		 */
		function initializare() {
			// Formam background-ul intunecat.
			formeazaFundal();
			// Formam primele stele, intr-un mod random, pentru a creea iluzia ca ne aflam in spatiu.
			formareSteleInitial(600);
			// Creeam player-ul si datele esentiale pentru player.	
			game.player = formeazaPlayer();
			// Cream primii inamici, pentru nivelul 1.
			game.enemies = updateDataEnemies();
			// Afisam player-ul. Prin afisarea acestuia, inlaturam un mic bug, in
			// care jocul randa player-ul la inceput de mai multe ori, astfel ca
			// se consuma din procesor.
			game.ctxAction.drawImage(game.images[0], game.player.x, game.player.y, game.player.width, game.player.height);
		}	

		// Modificam datele pe durata jocului.
		function updateData() {
			// La fiecare cadru, se va adauga cate o stea.
			formareStele(1);
			// Pentru fiecare stea in parte,
			for (var i in game.stars) {
				// Modificam coordonata de tip y, astfel ca apare impresia de
				// miscare a stelei.
				game.stars[i].y++;
				// Daca steaua se afla inafara ecranului, cu mult
				if (game.stars[i].y > game.height + 10) {
					// O stergem din datele jocului. Astfel salvam memorie.
					game.stars.splice(i, 1);
				};
			};

			/**
			 * Modificam miscarea player-ului in functie de tastele apasate.
			 */
			// Daca cumva am apasat tasta spre stanga, sau tasta 'a',		
			if (game.keys[37] || game.keys[65]) {
				// Si daca cumva nu iesim inafara ecranului, 
				if(game.player.x > 0) {
					// Modificam coordonata 'x' a jucatorului.
					game.player.x -= game.player.speed;
					// Modificam proprietatea de tip 'miscare' pentru a putea
					// afisa player-ul.
					game.player.miscare = true;
				}
			};

			//	Daca cumva am apasat tasta spre dreapta, sau tasta 'd', 
			if (game.keys[39] || game.keys[68]) {
				// Si daca cumva nu iesim inafara ecranului cu imaginea,
				if(game.player.x < (game.width - game.player.width)){
					// Modificam coordonata te tip 'x' a player-ului.
					game.player.x += game.player.speed;
					// Si modificam proprietatea de tip 'miscare' pentru a putea
					// afisa player-ul.
					game.player.miscare = true;
				}
			};
			// In momentul in care apasam tasta 'space', si putem trage,
			if (game.keys[32] && game.contorInitialProiectil <= 0 && canShoot == true) {
				// Incarcam un nou proiectil
				game.proiectilPlayer.push({
					// Coordonata 'x' va incepe din mijlocul player-ului
					x: (game.player.x + (game.player.width / 2) - 5),
					// Coordonata 'y' incepe din varful imaginii, mai exact din
					// zona 'de tun' a imaginii
					y: (game.player.y + 10),
					// Latimea si lungimea imaginii le pun identice, pentru a
					// putea definii o imagine patrata.
					width: 10,
					height: 10,
					// Viteza proiectilului
					speed: 9,
					// ID-ul imaginii
					image: 1
				});
				// Resetam contorul de tragere.
				game.contorInitialProiectil = game.contorFinalProiectil;
			};

			// Pentru a putea trage, avem un contor care nu ne lasa sa tragem
			// decat in mommentul in care a trecut o parte de din cadre. La
			// fiecare cadru se scade cu unu contorul.
			if (game.contorInitialProiectil > 0) {
				game.contorInitialProiectil--;
			};

			// Pentru fiecare proiectil in parte,
			for (var i in game.proiectilPlayer) {
				// Modificam coordonata 'y'. 
				game.proiectilPlayer[i].y -= game.proiectilPlayer[i].speed;
				// Daca cumva proiectilul este inafara ecranului, 
				if (game.proiectilPlayer[i].y < -(game.proiectilPlayer[i].size + game.height/100)) {
					// Eliminam proiectilul din joc.
					game.proiectilPlayer.splice(i, 1);
				};
			};

			// Crestem contorul de miscare al inamicilor.
			game.contorInamici++;
			// Daca a trecut un oarecare timp de miscare,
			if (game.contorInamici % game.contorTimpMaximInamici == 0) {
	    	   // Punen opusul directiei de mers
	    	   game.deplasareInamicStanga = !game.deplasareInamicStanga;
			};

			// Daca ne aflam in cadrul nivelului 2, miscarea va fi de tip sus/jos,
			// astfel ca modificam coordonata de tip 'y'
			if(level == 2){
				// Pentru fiecare inamic existent,
				for(var i in game.enemies){
					// Daca contorul de deplasare este pozitiv, 
					if (game.deplasareInamicStanga) {
						// Scadem din coordonata 'y' viteza de miscare
						game.enemies[i].y -= game.enemySpeed; 
					} else {	// In mod contrar
						// Crestem din coordonata 'y' viteza de miscare
						game.enemies[i].y += game.enemySpeed;
					};
				}
			}

			// Daca ne aflam la nivelul 3, miscarea este oarecum aleatorie. Pentru
			// aceasta, avem nevoie de tipul miscarii inamicului.
			if(level == 3){
				// Pentru fiecare inamic,
				for(var i in game.enemies){
					// Verificam de miscare. 
					// Daca inamicul are un tip de miscare '1'
					if(game.enemies[i].movement == 1){
						// Modificam coordonata 'y'
						if (game.deplasareInamicStanga) {
							game.enemies[i].y -= game.enemySpeed; 
						} else {	
							game.enemies[i].y += game.enemySpeed;
						};
					} else {	// Altfel modificam coordonta de tip 'x'
						if (game.deplasareInamicStanga) {
							game.enemies[i].x -= game.enemySpeed; 
						} else {	
							game.enemies[i].x += game.enemySpeed;
						};
					}
				}
			}

			// Pentru fiecare proiectil al inamicilor in parte,
		    for (var i in game.proiectilInamici) {
		    	// Variabila de stocare temporala a proiectilului curent
		        var proiectilCurent = game.proiectilInamici[i]; 
		        // Modificam coordonata de tip 'y' a proiectilului, 
	       		proiectilCurent.y += proiectilCurent.speed;
	            // Daca este inafara ecranului,
	            if (proiectilCurent.y + proiectilCurent.height >= game.height + 10) {
	                // Eliminam proiectilul din vector.
	                game.proiectilInamici.splice(i, 1);
	            } 
		  	}

		  	// Verificam coliziunea dintre proiectilul de inamici si player
		  	// Pentru fiecare proiectil,
		  	for(var i in game.proiectilInamici){
		  		// Variabila de stocare a proiectilului
		  		var proiectil = game.proiectilInamici[i];
				// Daca avem o coliziune, 
				if(coliziune(proiectil, game.player)){
					// Verificam tipul de proiectil al inamicilor
					// Daca este unul care elimina bug-ri
					if(proiectil.imagine == 10) {
						// Daca mai putem elimna bug-uri
						if(game.score >= 10) {
							// Scadem numarul de bug-uri cu 10.
							game.score -= 10;
						}
					} else { // Altfel
						// Crestem numarul de bug-uri in functie de damage-ul ce
						// il ofera inamicii la nivelul actual.
						game.score += enemyBulletDamage;
					}
					// Cum avem coliziune, eliminam proiectilul curent.
					game.proiectilInamici.splice(i, 1);
					// Continuam.
					continue;
				}
				// Daca 'scorul' este peste 100,
				if(game.score >= 100){
					// Afisam mesajul 'Ai pierdut!' pe ecran.
					game.ctxText.fillStyle = "100px Arial white";
					game.ctxText.fillText("Ai pierdut!", game.width/2-100,game.height/2);
					// Dupa, repornim jocul.
					restartGame();
					// Incheiem functia.
					return;
				}
			}

			// Pentru fiecare inamic,
			for (var contorInamic in game.enemies){ 
				// Pentru fiecare proiectil,
				for (contorProiectil  in game.proiectilPlayer){
					// Daca exista o coliziune intre proiectilul curent si player
					if (coliziune(game.enemies[contorInamic], game.proiectilPlayer[contorProiectil])) {
						// Scadem viata inamicului cu 10 (damage-ul proiectilului de la player)
						game.enemies[contorInamic].hp -= 10;
						// Daca cumva viata este 0,
						if(game.enemies[contorInamic].hp == 0){
							// Punem proprietatea inmicului '.mort' drept true.
							game.enemies[contorInamic].mort = true;
						}
						// Stergem inamicul curent de pe ecran distrus.
						game.ctxBullet.clearRect(game.proiectilPlayer[contorProiectil].x, game.proiectilPlayer[contorProiectil].y, game.proiectilPlayer[contorProiectil].width + 5, game.proiectilPlayer[contorProiectil].height + 10)
						// Il eliminam din vectorul de inamici.
						game.proiectilPlayer.splice(contorProiectil, 1);
	 		 	 		// Continuam cu algoritmul.
	 		 	 		continue;
					}
				}
			}

			// Pentru a putea face inamicii sa traga, folosim un contor
			// improvizat. Acest contor este asemanator celui de la player, astfel
			// ca de fiecare data cand acest contor ajunge intr-un punct divizibil
			// cul niveului, inamicul are voie sa traga.
			game.contorTragere++;
			// Pentru fiecare inamic in parte,
			for (var i in game.enemies){
				// Verificam daca suntem la unul cu nivelele cu mai multi inamici
				if(level != 4){
					// Daca inamicul curent are sansa de 20% sa traga. Daca reuseste,
					if(Math.random() * 1 >= 0.8){
						// Verificam nivelul.
						// Daca suntem la nivelul 1, 
						if(level == 1){
							// Avem un contor de 180 de cadre. La cadrul 180
							// (adica dupa 3 secunde), inamicul curent cu sansa
							// potrivita, va incerca sa traga doar daca are
							// posibilitatea
							if(game.contorTragere % 180 == 0 && canShoot == true){
								// Daca are posibilitatea, acesta trage.
		   		 				inamicTrage(game.enemies[i].x,game.enemies[i].y,game.enemies[i].sansa);
		   		 				// Resetam contorul.
		   		 				game.contorTragere = 0;
		    				}
		    			}
		    			// In cadrul nivelului 2 avem un timp mai mic de cadre
		    			// necesare pentru a oferii inamiclui o sansa de a trage.
		    			// Astfel ca la 60 de cadre (adica o secunda), inamicul va
		    			// avea sansa de a trage.
						if(level == 2){
							// Daca inamicul actual are sansa, 
							if(game.contorTragere % 60 == 0 && canShoot == true){
								// Acesta va trage.
		   		 				inamicTrage(game.enemies[i].x,game.enemies[i].y,game.enemies[i].sansa);
		   		 				// Resetam contorul.
		   		 				game.contorTragere = 0;
		    				}
		    			}
		    			if(level == 3){
		    				if(game.contorTragere % 30 == 0 && canShoot == true){
		   		 				inamicTrage(game.enemies[i].x,game.enemies[i].y,game.enemies[i].sansa);
		   		 				game.contorTragere = 0;
		    				}
		    			}
		    		}
	    		} else {
	    			// Altfel, daca suntem la nivelul 4, atunci avem un 'boss',
	    			// care va trage complet random, la 15 cadre(adica un sfert de
	    			// secunda). Acest inamic va trage pe axa 'x' intr-un fel
	    			// relativ aleatoriu, dar va avea parte de axa 'y' constanta.
		    		if(game.contorTragere % 15 == 0 && canShoot == true){
		   		 		inamicTrage(Math.round(Math.random()*game.enemies[i].width),game.enemies[i].y,game.enemies[i].sansa);
		   		 		game.contorTragere = 0;
		    		}	
	    		}
	    		// Daca cumva inamicul curent este 'mort', scadem timerul dedicat pentru aceasta.
				if (game.enemies[i].mort === true) {
					game.enemies[i].timpMoarte--;
				};
				// Daca cumva a tracut timpul 'mort', iar inamicul este 'mort',
				// atunci o sa eliminam inamicul actual din joc, urmand apoi sa
				// stergem si urmele acestuia de pe ecran.
				if (game.enemies[i].mort === true && game.enemies[i].timpMoarte <= 0 ) {
					// Stergerea inamicului distrus de pe ecran.
					game.ctxInamici.clearRect(game.enemies[i].x, game.enemies[i].y, game.enemies[i].width, game.enemies[i].height);
					// Eliminarea acestuia din joc.
					game.enemies.splice(i, 1);
				}
			}
			// Verificam daca utilizatorul a trecut nivelul, prin verificarea
			// numarului de inamici ramasi in joc. Daca numai sunt inamici,
			// functia returneaza "true", astfel ca se trece mai departe.
			if (gameIsWon() === true) {
				// Daca numai avem inamici, atunci terminal nivelul.
			    finnishLevel(); 
			}
		}	
		
		/**
		 * Aceasta functie afiseaza toate informatiile necesare pentru utilizator,
		 * 'desenand' pe canvas fiecare detaliu necesar functiei.
		 */
		function renderScreen() {
			// Refacem fundalul initial.
			formeazaFundal();
			// Pregatim culoarea pentru stele.
			game.ctxBackground.fillStyle = "white";
			// Pentru fiecare stea in parte
			for (var i = 0; i < game.stars.length; i++) {
				// Variabila de stocara a informatiei.
				var stea = game.stars[i];
				// Desenam steaua care o avem in acest moment.
				game.ctxBackground.fillRect(stea.x, stea.y, stea.size, stea.size);
			}

			// Desenam player-ul, dar doar daca acesta este desenat. In acest fel,
			// putem usura treaba procesorului, fara ca sa mai trebuiasca sa fie
			// desenat la fiecare cadru, nemodificandu-i pozitia.
			if (game.player.miscare === true) {
				game.ctxAction.clearRect(game.player.x, game.player.y, game.player.width, game.player.height);
				game.ctxAction.drawImage(game.images[0], game.player.x, game.player.y, game.player.width, game.player.height);
				// Dupa ce a fost miscat si desenat, miscarea, pe moment are
				// valoarea true. Ca sa nu fie redesenat, punem proprietatea
				// 'miscare' drept false.
				game.player.miscare = false;
			}

			// Desenarea inamicilor.
			// Daca nu suntem la nivelul 4
			if(level < 4){
				// Desenam toti inamicii ramasi in joc.
				// Intai, curatam canvas-ul
				game.ctxInamici.clearRect(0, 0, game.width, game.height);
				// Apoi, pentru fiecare inamic ramas in viata, urmeaza sa il desenam.
				for (var i in game.enemies) {
					// Variabila de stocare a informatiilor inamicului.
					var inamic = game.enemies[i];
					// Desenam inamicul.
					game.ctxInamici.drawImage(game.images[inamic.tip + 4], inamic.x, inamic.y, inamic.width, inamic.height);
					// Salvam ultimele desene ale inamicilor cu informatiile
					// necesare, deoarece urmeaza sa pune 'hp-bar' la fiecare
					// inamic.
					game.ctxInamici.save();
					// Hp-bar-ul o sa fie de culoare rosie, asa ca ii punem
					// proprietatea de culoare necesara.
					game.ctxInamici.fillStyle = "red";
					// Desenam hp-bar
					game.ctxInamici.fillRect(inamic.x,inamic.y + inamic.height + 5, inamic.width * (inamic.hp/inamic.hpmax), 5);
					// Restituim proprietatile salvate anterior.
					game.ctxInamici.restore();
				}
			}
			// Daca suntem la nivelul 4,
			if(level === 4){
				// O sa desenam doar hp-bar-ul boss-ului. Nu redesenam boss-ul
				// deoarece acesta, deocamdata nu se misca ramane static. Astfel,
				// singurul lucru modificat legat de acesta in timpul jocului este
				// viata reprezentata de hp-bar.
				game.ctxInamici.fillStyle = "red";
				game.ctxInamici.clearRect(game.enemies[0].x,game.enemies[0].y + game.enemies[0].height + 5, game.enemies[0].width, 5)
				game.ctxInamici.fillRect(game.enemies[0].x,game.enemies[0].y + game.enemies[0].height + 5, game.enemies[0].width * (game.enemies[0].hp/game.enemies[0].hpmax), 5);
			}


			// Desenam proiectilele jucatorului.
			// Pentru fiecare proiectil existent, curatam "urma acestuia", apoi il redesenam.
			for(var i in game.proiectilPlayer) {
				// Variabila temporala, care stocheaza informatiile proiectilului.
				var bullet = game.proiectilPlayer[i];
				// Desenarea proiectilului
				game.ctxBullet.clearRect(bullet.x, bullet.y, game.width, game.height);
				game.ctxBullet.drawImage(game.images[bullet.image], bullet.x, bullet.y, bullet.width, bullet.height);
			}
			// Curatam contextul proiectilelor de la inamici
	  		game.ctxEnemyBullet.clearRect(0, 0, game.width, game.height);
	  		// Pentru fiecare proiectil al inamicilor existent,
	  		for (var i in game.proiectilInamici) {
	  			// Variabila de stocare a proiectilului curent.
	  			var proiectilCurent = game.proiectilInamici[i];
	  			// Modificam coordonata de tip 'y' a proiectilului
		       	proiectilCurent.y += proiectilCurent.speed;
		       	// Daca proiectilul se afla inafara ecranului,
		        if (proiectilCurent.y + proiectilCurent.height >= game.height + 10) {
		           // Il stergem din vector.
		           game.proiectilInamici.splice(i, 1);
		        } else {
		        	// Altfel, il desenam.
					game.ctxEnemyBullet.drawImage(game.images[proiectilCurent.imagine], proiectilCurent.x, proiectilCurent.y, proiectilCurent.width + 20, proiectilCurent.height +20);
				}
	 		 }
	  		// Afisam scorul si nivelul.
	     	displayScore();
		}

		/**
		 * O functie care va oferi continuitatea jocului, astfel ca nu se va oprii
		 * jocul, pana in momentul in care jucatorul va dori acest lucru.
		 */
		function showScreen() {
			// Functie predefinita. *Vezi la finalul fisierului*
			requestAnimFrame(function(){
				updateData(); // Modificam datele in eprioada jocului.
				renderScreen();	// Afisam lucrurile pe ecran.
				showScreen();	// Reapelam functia in momentul in care s-au terminat toate calculele.
			});
		}

		// Incepem jocul prin initializare, apoi prin creeare unui loop numit
		// "showScreen".
		function animareFundal() {
			//	Apelam functia de initializare.
	       	initializare();
	       	// Dupa initializari, incepem loop-ul jocului.
			showScreen();
		}
		
		/**
		 * Functie care verifica daca putem incepe jocul. Unele imagini pot fi de
		 * dimensiuni mari, si nu pot fi incarcate prea repede, astfel ca inainte
		 * de a incepe jocul, asteptam sa se incarce imaginile.
		 */
		function startGame() {
			// Daca am incarcat suficiente imagini
			if (game.imaginiIncarcate >= game.imaginiNecesare) {
				// Pornim animatiile pe canvas.
				animareFundal();
			} else {	
				// In caz contrar, revenim dupa un anumit timp in aceasi functie, printr-o autoapelare.
				setTimeout(function(){
					// Pana in momentul inceperii functiei, afisam mesajul 'Loading'
					renderLoadingScreen();
					startGame();	// Autoapelul functiei
				}, 60/* Timpul de asteptare exprimat in milisecunde. */);
			};
		}
		
		/*=========================================
		=      Apelarea functiilor necesare       =
		=========================================*/

		// Apelul functiei care incepe sa incarce imaginile in program. Incarcam
		// fiecare imagine in parte.
		incarcareImagini([
			"Images/player/Nava1.png", 
			"Images/player/Glont.png",
			"Images/inamici/Inamic-Explozie.png",
			"Images/inamici/big-data.png",
			"Images/inamici/cplusplus.png",
			"Images/inamici/csharp.png",
			"Images/inamici/Java.png",
			"Images/inamici/php.png",
			"Images/proiectileInamici/code.png",
			"Images/proiectileInamici/code_ok.png",
			"Images/proiectileInamici/code_bun.png"
		]);
		// Apelul functiei care incepe programul in sine.
		startGame();
	});	
})();

/**
 * Functie predefinita in browser. Totusi, daca exista sansa ca browser-ul sa
 * nu includa aceasta functie, atunci o predefinim.
 */
window.requestAnimFrame = (function() {
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          function( callback ){
          	// 1000 milisecunde = 1 secunde si "1000 / x" <=> xfps
            window.setTimeout(callback, 1000 / 60); 
          };
})();