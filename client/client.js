CANVAS_WIDTH = 640;
CANVAS_HEIGHT = 360;

Template.game.helpers({
	height: function() {
		return CANVAS_HEIGHT;
	},
	width: function() {
		return CANVAS_WIDTH;
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
				target.hp -= 10;
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
				target.hp -= 15;
					console.log('Bola de Fogo. Pow!!!!');
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

map = [
	[0,0,0,0,0,0,0,0,0,22,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,24],
	[0,0,0,0,0,0,0,0,0,13,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,15],
	[0,0,0,0,0,0,0,0,0,16,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,18],
	[0,0,0,0,0,0,0,0,0,16,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,18],
	[0,0,0,0,0,0,0,0,0,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21],
	// [0,0,0],
	// [0,0,0]
]

Template.game.rendered = function() {
	var canMove = true;

	canvasElement = $('canvas');
	var canvas = canvasElement.get(0).getContext("2d");
	canvasElement.appendTo('body');

	var FPS = 30;
	setInterval(function() {
		update();
		draw(canvas);
		(frame < 30) ? frame++ : frame = 0;
	}, 1000/FPS);

	var gentleImage = new Image();
	gentleImage.src = "sprites/gentle-default.png";

	var skelletonImage = new Image();
	skelletonImage.src = "sprites/skeleton-basic.png";

	var dilmaImage = new Image();
	dilmaImage.src = "sprites/dilma.png";

	var mapImage= new Image();
	mapImage.src = "sprites/map.png";

	var player = construct(canvas, gentleImage, 4, 4, 200, 30, 100);
	var skeleton = construct(canvas, skelletonImage, 192, 4, 200, 30, 100);
	var dilma = construct(canvas, dilmaImage, 200, 64, 240, 120, 100);

	var ui = {
		healthBar: function(character, innerColor, outterCollor, string) {
			canvas.fillStyle = innerColor;
			canvas.fillRect(character.x,character.y,64,12);
			canvas.fillStyle = outterCollor;
			canvas.fillRect(character.x+1,character.y+1,(character.hp*62)/100,10);
			canvas.fillStyle="#333";
			canvas.fillText(string, character.x+4, character.y+10);
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
			player.y -= 3;
			player.animation = animation.walkUp;
			lastAnim = 'up';
		} else if (keydown.right) {
			player.x += 3;
			player.animation = animation.walkRight;
			lastAnim = 'right';
		} else if (keydown.down) {
			player.y += 3;
			player.animation = animation.walkDown;
			lastAnim = 'down';
		} else if (keydown.left) {
			player.x -= 3;
			player.animation = animation.walkLeft;
			lastAnim = 'left';
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

	draw = function() {
		canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
	}

	var stop = false;
	update = function() {
		if (player.hp <= 0) {
			dead = true;	
		}
		if (dead) {
			player.death();
		} else {
			//animation handlers
			if (frame % 3 == 0) attackFrame += 3;
			if (frame % 5 == 0) ennemyFrame += 3;
			if (frame % 6 == 0) spellFrame ++;
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