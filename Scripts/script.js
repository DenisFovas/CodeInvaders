(function(){
	$(document).ready(function(){
   
      var bulletSpawn = 1;
      var enemyBulletDamage = 10;
      var level = 1;
      var canShoot = true;


      var game = {};
		
			game.width = 800;
			game.height = 600;

			game.stars = [];

			game.enemies = [];
			game.numarInamiciPeLinie = 6;
			game.numarInamiciPeColoana = 4;
			game.contorInamici = ((game.width / 8) / 2);
			game.contorTimpMaximInamici = (game.width / 8);
			game.deplasareInamicStanga = true;
			game.enemySpeed = 1;
			game.contorTragere = 0;

      /**
       * Player object.
       *
       */
      game.player = {};
			// imagini
			game.images = [];
			game.imaginiNecesare = 0;
			game.imaginiIncarcate = 0;

			// Key
			game.keys = [];

         // Scorul utilizatorului
         game.score = 10;
         
         game.proiectilInamici = [];
         /*==============================
          *     Context Work            =
          *============================*/

        game.ctxBackground = document.getElementById("background").getContext("2d");
        game.ctxAction	   = document.getElementById("action").getContext("2d");
        game.ctxInamici    = document.getElementById("inamici").getContext("2d");
        game.ctxBullet     = document.getElementById("bullet").getContext("2d");
        game.ctxText       = document.getElementById("text").getContext("2d");
        game.ctxEnemyBullet = document.getElementById("enemyBullet").getContext("2d");


			/*=================================
			=            Proiectil player     =
			=================================*/
			game.proiectilPlayer = [];
			game.contorFinalProiectil = 10;
			game.contorInitialProiectil = game.contorFinalProiectil;
		

		/*=========================================
		=            Functii auxiliare            =
		=========================================*/
		

		function formeazaFundalInitial() {
			game.ctxBackground.fillStyle = "#100";
			game.ctxBackground.fillRect(0, 0, game.width, game.height);			
		}

		
		function renderLoadingScreen() {
			game.ctxBackground.font = "bold 50px Arial";
			game.ctxBackground.fillStyle = "white";
			game.ctxBackground.fillText("Loading", 100, 200);
		}

		
		function formareStele (numar) {
			for (var i = 0; i < numar; i++) {
				game.stars.push({
					x: Math.floor(Math.random() * game.width),
					y: 0,
					size: Math.random() * 3
				});
			};
		}

		
		function formareSteleInitial(numar) {
			for (var i = 0; i < numar; i++) {
				game.stars.push({
					x: Math.floor(Math.random() * game.width),
					y: Math.floor(Math.random() * game.height),
					size: Math.random() * 3
				});
			};
		}

    function formeazaPlayer() {

        var width = game.width * 0.08;
        var height = width;
        
        var x = game.width * 0.5 - width / 2;
        var y = game.height * 0.80;
        var speed = 4;
        var hp = 10;
        var player = {
                x,
                y,
                width,
                height,
                speed,
                hp: 10,
                miscare: false,
        };
        return player;
    }
		/**
		 * Functie care formeaza datele inamicilor afisati pe ecran.
		 */
		function updateDataEnemies() {
			var enemies = [];
			for(var i = 1; i <= game.numarInamiciPeLinie; i++){
				for (var j = 1; j <= game.numarInamiciPeColoana; j++) {
                var enemy = {
                        x: 50 + i * 100, 
                        y: j * 65,
                        width: 50,
                        height: 50,
                        speed: 5,
                        image: 4,
                        mort: false,
                        timpMoarte: 0,
                        tip: Math.round(Math.random() * 3),
                        hp: 0,
                        hpmax: 0,
                        sansa: 0,
                        movement: 1,
                }
                switch(enemy.tip){
                    case 0: enemy.hp=10,enemy.hpmax=10,enemy.sansa=0.1; break;
                    case 1: enemy.hp=20,enemy.hpmax=20,enemy.sansa=0.2; break;
                    case 2: enemy.hp=50,enemy.hpmax=50,enemy.sansa=0.5; break;
                    case 3: enemy.hp=30,enemy.hpmax=30,enemy.sansa=0.3; break;
                }
                if(level == 2){
                	enemy.x = Math.round(Math.random() * (game.width-50));
                	enemy.y = 50 + Math.round(Math.random() * (game.height/2));
                	enemy.movement = 2;
                }
                if(level == 3){
                	enemy.x = Math.round(Math.random() * (game.width-50));
                	enemy.y = 50 + Math.round(Math.random() * (game.height/2));
                	if(Math.random() * 1 <= 0.5) enemy.movement = 1;
                	else enemy.movement = 2;
                }
			    enemies.push(enemy);
				}
			};
         return enemies;
		}

        function displayScore() { 
            game.ctxText.fillStyle = "white";
            game.ctxText.font = "25px bold Arial";
            game.ctxText.clearRect(0, 0, game.width, 30);
            game.ctxText.fillText("Bugs: " + game.score, game.width-140, 30);
            game.ctxText.fillText("Level: " + level, 20, 30)

      }

      function restartGame(){
      	canShoot = false;
      	setTimeout(function(){
      		location.reload();
      	}, 5 * 1000);
      }

      function gameIsWon() {
		    var gameWon = false;
		    if (game.enemies.length <= 0) {
		            gameWon = true;
		    } else {
		            gameWon = false;
		    }
		    return gameWon;
      }

      function finnishLevel() {
		  	if(level < 5) level++;
		  	if(level == 1){
		  		game.enemies = updateDataEnemies();
		  	}
		  	if(level == 2){
		  		game.numarInamiciPeLinie = 4;
		  		enemyBulletDamage = 20;
		  		game.enemies = updateDataEnemies();
		  	}
		  	if(level == 3){
		  		game.numarInamiciPeLinie = 4;
		  		enemyBulletDamage = 30;
		  		game.enemies = updateDataEnemies();
		  	}
		  	if(level == 4){
		  		game.enemies = [];
		  		console.log(game.enemies.length)
		  		var boss = {
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
		                    movement: 1,
		            }
		        game.enemies.push(boss);
		        game.ctxInamici.clearRect(0, 0, game.width, game.height);
		  		game.ctxInamici.drawImage(game.images[3], boss.x , boss.y , boss.width, boss.height);
		  	}
		    if(level == 5){
		    	game.ctxText.clearRect(0,0,game.width,game.height);
		    	game.ctxInamici.clearRect(0,0,game.width,game.height);
		    	game.ctxText.fillStyle = "100px Arial white";
		    	game.ctxText.fillText("Ai castigat!", game.width/2-100,game.height/2);
		    	setTimeout(restartGame(),5000);
		    }
      }

		function coliziune(obiectUnu, obiectDoi) {
			return (obiectUnu.x < obiectDoi.x + obiectDoi.width &&
   					obiectUnu.x + obiectUnu.width > obiectDoi.x &&
   					obiectUnu.y < obiectDoi.y + obiectDoi.height &&
   					obiectUnu.height + obiectUnu.y > obiectDoi.y);
		}		

		$(document).keydown(function(e) {
			game.keys[e.keyCode ? e.keyCode : e.which] = true;
		});

		$(document).keyup(function(e) {
			delete game.keys[e.keyCode ? e.keyCode : e.which];
		});



		// functie care va incarca imaginile necesare pentru joc
		function incarcareImagini(paths) {
			game.imaginiNecesare = paths.length;

			for (var i = 0; i < paths.length; i++) {
				var imagine = new Image();

				imagine.src = paths[i];
				game.images[i] = imagine;
				game.images[i].onload =  function(){
                game.imaginiIncarcate++;
				}
			};
		}

		function initializare() {
			formeazaFundalInitial();
			formareSteleInitial(600);
			renderLoadingScreen();
      		game.player = formeazaPlayer();
			game.enemies = updateDataEnemies();
      		game.ctxAction.drawImage(game.images[0], game.player.x, game.player.y, game.player.width, game.player.height);
		}

		function inamicTrage(xx,yy,sansa){
			var proiectil = {
		        x: xx + game.enemies[0].width/2,
		        y: yy + game.enemies[0].height - 5,
		        width: 10,
		        height: 10,
		        speed: 2,
		        imagine: 9, // 10-Math.round(Math.random()*2),
		    }
		    if(Math.random() * 1 <= sansa){
		    	proiectil.imagine = 10;
		    }
		    else {
		    	if(Math.random() * 1 <= 0.5) proiectil.imagine = 8;
		    }
		    game.proiectilInamici.push(proiectil);
		}

		function updateData() {
			formareStele(1);
			// Stars
			for (var i in game.stars) {
				game.stars[i].y++;
				if (game.stars[i].y > game.height + 10) {
					game.stars.splice(i, 1);
				};
			};

			if (game.keys[37] || game.keys[65]) { 
				if(game.player.x > 0) {
					game.player.x -= game.player.speed;
					game.player.miscare = true;
				}
			};

			if (game.keys[39] || game.keys[68]) { 
				if(game.player.x < (game.width - game.player.width)){
					game.player.x += game.player.speed;
					game.player.miscare = true;
				}
			};

			if (game.contorInitialProiectil > 0) {
				game.contorInitialProiectil--;
			};

			if (game.keys[32] && game.contorInitialProiectil <= 0 && canShoot == true) {
				game.proiectilPlayer.push({
					x: (game.player.x + (game.player.width / 2) - 5),
					y: (game.player.y + 10),
					width: 10,
					height: 10,
					speed: 9,
					image: 1
				});
				game.contorInitialProiectil = game.contorFinalProiectil;
			};

      		game.contorInamici++;
      		if (game.contorInamici % game.contorTimpMaximInamici == 0) {
            	   // Pun opusul directiei de mers
            	   game.deplasareInamicStanga = !game.deplasareInamicStanga;
        		};

      		if(level == 2){
				for(var i in game.enemies){
						if (game.deplasareInamicStanga) {
						game.enemies[i].y -= game.enemySpeed; 
						} 
						else
						{	
							game.enemies[i].y += game.enemySpeed;
						};
				}
			}
			if(level == 3){
        		for(var i in game.enemies){
        			if(game.enemies[i].movement == 1){
						if (game.deplasareInamicStanga) {
							game.enemies[i].y -= game.enemySpeed; 
						} 
						else
						{	
							game.enemies[i].y += game.enemySpeed;
						};
					}
					else {
						if (game.deplasareInamicStanga) {
							game.enemies[i].x -= game.enemySpeed; 
						} 
						else
						{	
							game.enemies[i].x += game.enemySpeed;
						};
					}
				}
			}

			for (var i in game.proiectilPlayer) { 
				game.proiectilPlayer[i].y -= game.proiectilPlayer[i].speed;
				if (game.proiectilPlayer[i].y < -(game.proiectilPlayer[i].size + game.height/100)) {
					game.proiectilPlayer.splice(i, 1);
				};
			};

		    for (var i in game.proiectilInamici) {
		        var proiectilCurent = game.proiectilInamici[i];
		       	proiectilCurent.y += proiectilCurent.speed;
		            if (proiectilCurent.y + proiectilCurent.height >= game.height + 10) {
		                game.proiectilInamici.splice(i, 1);
		            } 
		  	}	
		  	for(var i in game.proiectilInamici){
		  		var proiectil = game.proiectilInamici[i];
        		if(coliziune(proiectil, game.player)){
        			if(proiectil.imagine == 10) {
        				if(game.score >= 10) 
        					game.score -= 10;
        			}
        			else{
        				game.score += enemyBulletDamage;
        			}
        			game.proiectilInamici.splice(i, 1);
        			continue;
        		}
        		if(game.score >= 100){
        			game.ctxText.fillStyle = "100px Arial white";
        			game.ctxText.fillText("Ai pierdut!", game.width/2-100,game.height/2);
        			restartGame();
        			return;
        		}
        	}

			for (var contorInamic in game.enemies){
					for (contorProiectil  in game.proiectilPlayer){
						if (coliziune(game.enemies[contorInamic], game.proiectilPlayer[contorProiectil])) {
							game.enemies[contorInamic].hp -= 10;
							if(game.enemies[contorInamic].hp == 0){
								game.enemies[contorInamic].mort = true;
							}
							game.ctxBullet.clearRect(game.proiectilPlayer[contorProiectil].x, game.proiectilPlayer[contorProiectil].y, game.proiectilPlayer[contorProiectil].width + 5, game.proiectilPlayer[contorProiectil].height + 10)
							game.proiectilPlayer.splice(contorProiectil, 1);
         		 	 		continue;
						}
			}
			}
				game.contorTragere++;
				for (var i in game.enemies){
					if(level != 4){
						if(Math.random() * 1 >= 0.8){
							if(level == 1){
								if(game.contorTragere % 180 == 0 && canShoot == true){
			   		 				inamicTrage(game.enemies[i].x,game.enemies[i].y,game.enemies[i].sansa);
			   		 				game.contorTragere = 0;
			    				}
			    			}
							if(level == 2){
								if(game.contorTragere % 60 == 0 && canShoot == true){
			   		 				inamicTrage(game.enemies[i].x,game.enemies[i].y,game.enemies[i].sansa);
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
		    		}
		    		else {
			    		if(game.contorTragere % 15 == 0 && canShoot == true){
			   		 		inamicTrage(Math.round(Math.random()*game.enemies[i].width),game.enemies[i].y,game.enemies[i].sansa);
			   		 		game.contorTragere = 0;
			    		}
			    		
		    		}
					if (game.enemies[i].mort === true) {
						game.enemies[i].timpMoarte--;
					};
					if (game.enemies[i].mort === true && game.enemies[i].timpMoarte <= 0 ) {
						game.ctxInamici.clearRect(game.enemies[i].x, game.enemies[i].y, game.enemies[i].width, game.enemies[i].height);
						game.enemies.splice(i, 1);
					}
					}
	    			if (gameIsWon() === true) {
	       		    	finnishLevel(); 
	    			}


		}	


		// Functie care afiseaza stelele pe ecran
	function renderScreen() {

			// stars
			game.ctxBackground.fillStyle = "black";
			game.ctxBackground.fillRect(0, 0, game.width, game.height);
			game.ctxBackground.fillStyle = "white";
			for (var i = 0; i < game.stars.length; i++) {
				var stea = game.stars[i];
				game.ctxBackground.fillRect(stea.x, stea.y, stea.size, stea.size);
			}
 
			// player
			if (game.player.miscare === true) {
				game.ctxAction.clearRect(game.player.x, game.player.y, game.player.width, game.player.height);
				game.ctxAction.drawImage(game.images[0], game.player.x, game.player.y, game.player.width, game.player.height);

				game.player.miscare = false;
			}


			// inamici
			if(level < 4){
				game.ctxInamici.clearRect(0, 0, game.width, game.height);
				for (var i in game.enemies) {
					var inamic = game.enemies[i];
					game.ctxInamici.drawImage(game.images[inamic.tip + 4], inamic.x, inamic.y, inamic.width, inamic.height);
					game.ctxInamici.save();
					game.ctxInamici.fillStyle = "red";
					game.ctxInamici.fillRect(inamic.x,inamic.y + inamic.height + 5, inamic.width * (inamic.hp/inamic.hpmax), 5);
					game.ctxInamici.restore();
				}
			}
			if(level === 4){
				game.ctxInamici.fillStyle = "red";
				game.ctxInamici.clearRect(game.enemies[0].x,game.enemies[0].y + game.enemies[0].height + 5, game.enemies[0].width, 5)
				game.ctxInamici.fillRect(game.enemies[0].x,game.enemies[0].y + game.enemies[0].height + 5, game.enemies[0].width * (game.enemies[0].hp/game.enemies[0].hpmax), 5);
			}


			// Proiectil Player 
			for(var i in game.proiectilPlayer) {
				var bullet = game.proiectilPlayer[i];
				game.ctxBullet.clearRect(bullet.x, bullet.y, game.width, game.height);
				game.ctxBullet.drawImage(game.images[bullet.image], bullet.x, bullet.y, bullet.width, bullet.height);
			}
      		game.ctxEnemyBullet.clearRect(0, 0, game.width, game.height);
      		for (var i in game.proiectilInamici) {
      			var proiectilCurent = game.proiectilInamici[i];
		       	proiectilCurent.y += proiectilCurent.speed;
		        if (proiectilCurent.y + proiectilCurent.height >= game.height + 10) {
		           game.proiectilInamici.splice(i, 1);
		        }
  				else
  					game.ctxEnemyBullet.drawImage(game.images[proiectilCurent.imagine], proiectilCurent.x, proiectilCurent.y, proiectilCurent.width + 20, proiectilCurent.height +20);

     		 }
      
         	displayScore();
			}

	function showScreen() {
			requestAnimFrame(function(){
				updateData();
				renderScreen();
				showScreen();
			});
	}


	function animareFundal() {
       initializare();
		// porneste animatia continua
		showScreen();
	}
		
	function startGame() {
		if (game.imaginiIncarcate >= game.imaginiNecesare) {
			// Pornesc animatiile de fundal
			animareFundal();
		} else {
				setTimeout(function(){
					startGame();
				}, 60);
		};

	}
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

		startGame();
	});	
})();


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
