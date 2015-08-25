CANVAS_WIDTH = 640;
CANVAS_HEIGHT = 360;
fontFace = 'Calibri';
gameStart = false;
canClick = true;

frame = 0;
dead = false;
walkFrame = 0;
attackFrame = 2;
ennemyFrame = 2;
spellFrame = 0;
lastAnim = '';

animation = {
	walkUp: 8,
	walkLeft: 9,
	walkDown: 10,
	walkRight: 11,
	spellUp: 12,
	spellLeft: 13,
	spellDown: 14,
	spellRight: 15,
	attackUp: 22,
	attackLeft: 25,
	attackDown: 28,
	attackRight: 31,
	dead: 20
}

Template.game.helpers({
	height: function() {
		return CANVAS_HEIGHT;
	},
	width: function() {
		return CANVAS_WIDTH;
	},
	getZoom: function() {
		var width = $(window).width()-100;
		var height = $(window).height()-100;
		var zoom = 1;
		if (width > height) {
			zoom = (width/640);
		}
		return zoom;
	}
})

Template.game.events({
	
})

takeHit = function(character, position) {
	character.hp -= 10;
	if (position == 'up') {
		character.y += 6;
		character.animation = animation.walkUp;
	} else if (position == 'right') {
		character.x -= 6;
		character.animation = animation.walkRight;
	} else if (position == 'down') {
		character.y += 6;
		character.animation = animation.walkDown;
	} else if (position == 'left') {
		character.x += 6;
		character.animation = animation.walkLeft;
	}
}

colides = function(a, b) {
	return a.x < b.x + b.width &&
		a.x + a.width > b.x &&
		a.y < b.y + b.height &&
		a.y + a.height > b.y;
}

fromWhere = function(a, b) {
	var distX = Math.abs(a.x - b.x);
	var distY = Math.abs(a.y - b.y);
	if (distX > distY) {
		if (a.x < b.x) {
			return 'left';
		} else {
			return 'right';
		}
	} else {
		if (a.y < b.y) {
			return 'up';
		} else {
			return 'down';
		}
	}
}

distanceFrom = function(a, b) {
	var distX = Math.abs(a.x - b.x);
	var distY = Math.abs(a.y - b.y);
	if (distX > distY) {
		return distX;
	} else {
		return distY;
	}
}

enemyMove = function(from, character) {
	if (from == 'up') {
		character.frame = walkFrame;
		character.animation = animation.walkUp;
		character.y -= 2;
	} else if (from == 'right') {
		character.x += 2;
		character.frame = walkFrame;
		character.animation = animation.walkRight;
	} else if (from == 'down') {
		character.y += 2;
		character.frame = walkFrame;
		character.animation = animation.walkDown;
	} else if (from == 'left') {
		character.x -= 2;
		character.frame = walkFrame;
		character.animation = animation.walkLeft;
	}
}




playerBullets = [];


throwSkill = function(character, target) {

	console.log('Bola de Fogo. Pow!!!!');	

	playerBullets.push(spell({
		x: character.x,
		y: character.y,
		tx: target.x,
		ty: target.y
	}));

}




enemyFollow = function(character, target, type) {
	if (character.hp <= 0) {
		character.dead = true;
	} else {
		var from = fromWhere(target, character);
		var colide = colides(target, character);
		var distance = distanceFrom(target, character);
		if (distance < character.safe) {
			if (type == 'meele') meeleAi(from, colide, distance, character, target);
			if (type == 'mage') mageAi(from, colide, distance, character, target);
		}
	}
}

meeleAi = function(from, colide, distance, character, target) {
	if (ennemyFrame == 0) character.start = true;
	if (ennemyFrame == 15) character.finish = true;
	if (colide && distance < character.range) {
		character.frame = ennemyFrame;
		if (from == 'up') {
			character.animation = animation.attackUp;
		} else if (from == 'right') {
			character.animation = animation.attackRight;
		} else if (from == 'down') {
			character.animation = animation.attackDown;
		} else if (from == 'left') {
			character.animation = animation.attackLeft;
		}
		if (character.start && character.finish && ennemyFrame == 15) {
			if (target.hp > 0) {
				// target.hp -= 10;
			}
			character.start = false;
			character.finish = false;
		}
	} else {
		enemyMove(from, character);
	}
}

mageAi = function(from, colide, distance, character, target) {
	if (spellFrame == 0) character.start = true;
	if (spellFrame == 4) character.finish = true;
	if (distance < character.range) {
		character.frame = spellFrame;
		if (character.start && character.finish && spellFrame == 4) {
			if (from == 'up') {
				character.animation = animation.spellUp;
			} else if (from == 'right') {
				character.animation = animation.spellRight;
			} else if (from == 'down') {
				character.animation = animation.spellDown;
			} else if (from == 'left') {
				character.animation = animation.spellLeft;
			}
			if (target.hp > 0) {
				// target.hp -= 15;
					throwSkill(character, target);
			}
			character.start = false;
			character.finish = false;
		}
	} else {
		enemyMove(from, character);
	}
}

construct = function(ctx, image, x, y, safe, range, hp) {
	var sprite = {
		image: image,
		x: x,
		y: y,
		width: 64,
		height: 64,
		frame: 1,
		safe: safe,
		range: range,
		start: false,
		finish: false,
		hp: hp,
		dead: false,
		animation: animation.walkRight,
		draw: function() {
			ctx.drawImage(
				this.image,
				this.width + this.frame*this.width,
				this.animation*64,
				this.width,
				this.height,
				this.x,
				this.y,
				this.width,
				this.height
			);
		}
	}
	return sprite;
}

map = [
	[0,0,0,0,0,0,0,0,0,22,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,24],
	[0,0,0,0,0,0,0,0,0,13,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,15],
	[0,0,0,0,0,0,0,0,0,16,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,18],
	[0,0,0,0,0,0,0,0,0,16,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,18],
	[0,0,0,0,0,0,0,0,0,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21],
	// [0,0,0],
	// [0,0,0]
];

btnBehavior = function(button) {
	console.log(button);
	var key = _.chain(elements).pluck("name").indexOf(button).value(); //found on the internet
	var el = elements[key];
	var w = el.width;
	var x = el.left;
	//button animation
	var cont = 0; //animation frame controller
	var animation = setInterval(function() {
		el.width += cont*3;
		el.left -= cont*1.5;
		cont++;
		if (cont%2 == 0) {
			el.alpha -= 0.3;
		}
		if (cont == 6) {
			clearInterval(animation);
			if (button == 'play') {
				gameStart = true;				
			} else if (button == 'respawn') {
				dead = false;
			}
			canClick = true;
			el.width = w;
			el.left = x;
			el.alpha = 1;
		}
	}, 16); //33.33 == 60fps, 16.66	== 60fps
}

Template.game.rendered = function() {
	var canMove = true;

	var canvasElement = $('canvas'),
			element = canvasElement.get(0),
			canvasLeft = element.offsetLeft,
			canvasTop = element.offsetTop,
			canvas = element.getContext("2d");
	window.elements = [];
	canvasElement.appendTo('body');

	element.addEventListener('click', function(e) {
		var x = e.pageX - canvasLeft,
				y = e.pageY - canvasTop;
		elements.forEach(function(el) {
			if (y > el.top && y < el.top + el.height
					&& x > el.left && x < el.left + el.width) {
				if (canClick) {
					btnBehavior(el.name);
					canClick = false;
				}
			}
		})
	}, false);

	var FPS = 30;
	setInterval(function() {
		update();
		draw(canvas);
		(frame < 30) ? frame++ : frame = 0;
	}, 1000/FPS);
	var gentleImage = new Image();
	var skelletonImage = new Image();
	var dilmaImage = new Image();
	var mapImage = new Image();
	var dilmaBG = new Image();

	gentleImage.src = "sprites/gentle-default.png";
	skelletonImage.src = "sprites/skeleton-basic.png";
	dilmaImage.src = "sprites/dilma.png";
	mapImage.src = "sprites/map.png";
	dilmaBG.src = "bgs/dilma2.jpg";

	var player = construct(canvas, gentleImage, 4, 4, 200, 30, 100);
	var skeleton = construct(canvas, skelletonImage, 192, 4, 200, 30, 100);
	var dilma = construct(canvas, dilmaImage, 200, 64, 240, 120, 100);

	elements.push({
		name: 'play',
		rgb: '96,125,139',
		alpha: 1,
		width: 200,
		height: 40,
		left: 220,
		top: 140,
	})

	elements.push({
		name: 'respawn',
		rgb: '96,125,139',
		alpha: 1,
		width: 200,
		height: 40,
		left: 220,
		top: 200,
	})

	var ui = {
		startScreen: function() {
			canvas.drawImage(dilmaBG, 0, 0, 640, 360, 0, 0, 704, 396);
			canvas.font = '48pt '+fontFace;
			canvas.textAlign = 'center';
			canvas.fillStyle="#eee";
			canvas.fillText("DIMLA'S MADNESS", 320, 80);
		},
		button: function(name, rgb, a, x, y, w, h) {
			var color = 'rgba('+rgb+','+a+')';
			canvas.save();
			canvas.fillStyle = color;
			canvas.fillRect(x, y, w, h);
			canvas.font = '26pt '+fontFace;
			canvas.textAlign = 'center';
			canvas.fillStyle="#eee";
			canvas.fillText(name.toUpperCase(), 320, y+32);
			//shadow
			var shadow = canvas.shadowColor;
      canvas.shadowBlur = 0;
      canvas.shadowOffsetX = 1;
      canvas.shadowOffsetY = 2;
      canvas.shadowColor = 'rgba(0,0,0,0.22)';
		},
		healthBar: function(character, innerColor, outterCollor, string) {
			canvas.fillStyle = innerColor;
			canvas.fillRect(character.x,character.y,64,12);
			canvas.fillStyle = outterCollor;
			canvas.fillRect(character.x+1,character.y+1,(character.hp*62)/100,10);
			canvas.font = '10pt '+fontFace;
			canvas.textAlign = 'center';
			canvas.fillStyle="#333";
			canvas.fillText(string, character.x+32, character.y+10);
		}
	}

	player.attack = function() {
		player.animation = animation.attackRight;
		player.frame = attackFrame;
		canMove = false;
		var colide = colides(player, skeleton);
		if (colide) {
			if (attackFrame == 12) {
				if (skeleton.hp > 0 && colides(skeleton, player)) {
					takeHit(skeleton, fromWhere(player, skeleton));
				} 
				if (dilma.hp > 0 && colides(dilma, player)) {
					takeHit(dilma, fromWhere(player, dilma));
				}
			}
		}
		if (lastAnim == 'up') {
			player.animation = animation.attackUp;
		} else if (lastAnim == 'right') {
			player.animation = animation.attackRight;
		} else if (lastAnim == 'down') {
			player.animation = animation.attackDown;
		} else if (lastAnim == 'left') {
			player.animation = animation.attackLeft;
		}
	};

	player.move = function() {
		player.frame = walkFrame;
		if (keydown.up) {
			if (player.y > 0) {
				player.y -= 3;
				player.animation = animation.walkUp;
				lastAnim = 'up';
			}
		} else if (keydown.right) {
			if (player.x < CANVAS_WIDTH-64) {
				player.x += 3;
				player.animation = animation.walkRight;
				lastAnim = 'right';
			}
		} else if (keydown.down) {
			if (player.y < CANVAS_HEIGHT-64) {
				player.y += 3;
				player.animation = animation.walkDown;
				lastAnim = 'down';
			}
		} else if (keydown.left) {
			if (player.x > 0) {
					player.x -= 3;
					player.animation = animation.walkLeft;
					lastAnim = 'left';
			}
		} else {
			player.frame = 0;
		}
	}

	player.death = function() {
		player.animation = animation.dead;
		player.frame = walkFrame;
		if (walkFrame > 0 && !stop) {
			walkFrame = 0;
			stop = true;
			console.log("You're Dead");
		} else if (walkFrame < 4) {
			walkFrame +=1;
		}
	}

	spell = function(I) {
		I.xVelocity = (16+I.x-I.tx)/40;
		I.yVelocity = (16+I.y-I.ty)/25;
		I.active = true;
		I.color = "purple";
		I.width = 8;
		I.height = 8;
		I.damage = 15;
		I.inBounds = function() {
			return I.x >= 0 && I.x <= CANVAS_WIDTH &&
			I.y >= 0 && I.y <= CANVAS_HEIGHT;
		};
		I.colide = function() {
			if (I.x < player.x + player.width-20 &&
					I.x + I.width > player.x &&
					I.y < player.y + player.height-10 &&
					I.y + I.height > player.y) {
				if (I.damage > 0) {
					I.damage -= 2;
					player.hp -= 2; // 2 damage each frame
				} else {
					I.active = false;					
				}
			}
		}
		I.draw = function() {
			canvas.fillStyle = this.color;
			canvas.beginPath();
			canvas.arc(this.x+32,this.y+32,this.width,0,2*Math.PI);
			canvas.fill();
		};
		I.update = function() {
			I.x -= I.xVelocity;
			I.y -= I.yVelocity;
			I.active = I.active && I.inBounds();
			I.colide();
		};
		return I;
	}

	draw = function() {
		console.log(dead);
		if (gameStart) {
			canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);


			playerBullets.forEach(function(bullet) {
		    bullet.draw();
		  });


			renderMap(map);
			if (!skeleton.dead) {
				skeleton.draw();
				ui.healthBar(skeleton, '#eee', '#008080', 'Skeleton');
			}
			if (!dilma.dead) {
				dilma.draw();	
				ui.healthBar(dilma, '#eee', '#008080', 'Dilma');
			}
			player.draw();
			ui.healthBar(player, '#eee', '#008080', 'Player');
			if (dead) {
				elements.forEach(function(el) {
					ui.button(el.name, el.rgb, el.alpha, el.left, el.top, el.width, el.height);
				})
			}
		} else {
			ui.startScreen();
			elements.forEach(function(el) {
				ui.button(el.name, el.rgb, el.alpha, el.left, el.top, el.width, el.height);
			})
		}
	}

	var stop = false;
	update = function() {
		if (gameStart) {
			if (player.hp <= 0) {
				dead = true;
				player.hp = 100;
			}
			if (dead) {
				player.death();
			} else {


				playerBullets.forEach(function(bullet) {
			    bullet.update();
			  });
			  playerBullets = playerBullets.filter(function(bullet) {
			    return bullet.active;
			  });


				//animation handlers
				if (frame % 3 == 0) attackFrame += 3;
				if (frame % 5 == 0) ennemyFrame += 3;
				if (frame % 10 == 0) spellFrame ++;
				if (attackFrame > 15) attackFrame = 3;
				if (ennemyFrame > 15) ennemyFrame = 3;
				if (spellFrame > 4) spellFrame = 0;
				(walkFrame < 7) ? walkFrame+=1 :  walkFrame = 0;
				enemyFollow(skeleton, player, 'meele');
				enemyFollow(dilma, player, 'mage');

				//key events
				if (keydown.a) {
					player.attack();
				} else {
					player.frame = 0;
					canMove = true;
				}
				if (canMove) {
					player.move();
				}
			}
		}
	}

	renderTile = function(x, y, lx, ly) {
		canvas.drawImage(mapImage, lx, ly, 16, 16, x, y, 16, 16);
	}
};

renderMap = function(map) {
	var y = 0;
	map.forEach(function(map) {
		var x = 0;
		map.forEach(function(tile) {
			switch (tile) {
				case 11: renderTile(x*16,y*16, 128, 0); break;
				case 12: renderTile(x*16,y*16, 16, 192); break;
				case 13: renderTile(x*16,y*16, 208, 32); break;
				case 14: renderTile(x*16,y*16, 224, 32); break;
				case 15: renderTile(x*16,y*16, 240, 32); break;
				case 16: renderTile(x*16,y*16, 208, 48); break;
				case 17: renderTile(x*16,y*16, 224, 48); break;
				case 18: renderTile(x*16,y*16, 240, 48); break;
				case 19: renderTile(x*16,y*16, 208, 64); break;
				case 20: renderTile(x*16,y*16, 224, 64); break;
				case 21: renderTile(x*16,y*16, 240, 64); break;
				case 22: renderTile(x*16,y*16, 208, 16); break;
				case 24: renderTile(x*16,y*16, 240, 16); break;
			}
			x++;
		})
		y++;
	})
}