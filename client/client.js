CANVAS_WIDTH = 640;
CANVAS_HEIGHT = 360;

takeHit = function(character, position) {
	character.hp -= 10;
	if (position == 'up') {
		character.y += 6;
		character.animation = animation.walkUp;
		// setTimeout(function() {
		// 	character.y -= 3;
		// }, 300);
	} else if (position == 'right') {
		character.x -= 6;
		character.animation = animation.walkRight;
		// setTimeout(function() {
		// 	character.x += 6;
		// }, 300);
	} else if (position == 'down') {
		character.y += 6;
		character.animation = animation.walkDown;
		// setTimeout(function() {
		// 	character.y -= 3;
		// }, 300);
	} else if (position == 'left') {
		character.x += 6;
		character.animation = animation.walkLeft;
		// setTimeout(function() {
		// 	character.x -= 3;
		// }, 300);
	}
}

collides = function(a, b) {
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

start = finish = false;
dead = false;
walkFrame = 0;
attackFrame = 2;
ennemyFrame = 2;
lastAnim = '';
animation = {
	walkUp: 8,
	walkLeft: 9,
	walkDown: 10,
	walkRight: 11,
	attackUp: 22,
	attackLeft: 25,
	attackDown: 28,
	attackRight: 31,
}
map = [
	// [0,0,0,0,0,0,0,0,0,22,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,24],
	// [0,0,0,0,0,0,0,0,0,13,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,15],
	// [0,0,0,0,0,0,0,0,0,16,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,18],
	// [0,0,0,0,0,0,0,0,0,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21],
	[0,0,0],
	[0,0,0]
]

Template.game.rendered = function() {
	var frameCount = 1;
	var canMove = true;

	canvasElement = $('canvas');
	var canvas = canvasElement.get(0).getContext("2d");
	canvasElement.appendTo('body');

	var FPS = 30;
	setInterval(function() {
		update();
		draw(canvas);
	}, 1000/FPS);

	var gentleImage = new Image();
	gentleImage.src = "sprites/gentle-default.png";
	// gentleImage.src = "sprites/gentle-full.png";

	var skelletonImage = new Image();
	skelletonImage.src = "sprites/skeleton-basic.png";

	var dilmaImage = new Image();
	dilmaImage.src = "sprites/dilma.png";

	var mapImage= new Image();
	mapImage.src = "sprites/map.png";

	renderTile = function(x, y, lx, ly) {
		canvas.drawImage(
			mapImage,
			lx,
			ly,
			16,
			16,
			x,
			y,
			16,
			16
		);
	}
	
	var player = {
		image: gentleImage,
		x: 0,
		y: 0,
		width: 64,
		height: 64,
		frame: 0,
		hp: 100,
		animation: animation.attackRight,
		draw: function() {
			canvas.drawImage(
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

	var skeleton = {
		image: skelletonImage,
		x: 128,
		y: 0,
		width: 64,
		height: 64,
		frame: 0,
		range: 30,
		hp: 100,
		animation: animation.attackRight,
		draw: function() {
			canvas.drawImage(
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

	var dilma = {
		image: dilmaImage,
		x: 208,
		y: 0,
		width: 64,
		height: 64,
		frame: 0,
		range: 120,
		hp: 100,
		animation: animation.walkRight,
		draw: function() {
			canvas.drawImage(
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

	draw = function() {
		canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		var y = 0;
		map.forEach(function(map) {
			var x = 0;
			map.forEach(function(tile) {
				switch (tile) {
					case 11:
						renderTile(x*16,y*16, 128, 0);
						break;
					case 12:
						renderTile(x*16,y*16, 16, 192);
						break;
					case 13:
						renderTile(x*16,y*16, 208, 32);
						break;
					case 14:
						renderTile(x*16,y*16, 224, 32);
						break;
					case 15:
						renderTile(x*16,y*16, 240, 32);
						break;
					case 16:
						renderTile(x*16,y*16, 208, 48);
						break;
					case 17:
						renderTile(x*16,y*16, 224, 48);
						break;
					case 18:
						renderTile(x*16,y*16, 240, 48);
						break;
					case 19:
						renderTile(x*16,y*16, 208, 64);
						break;
					case 20:
						renderTile(x*16,y*16, 224, 64);
						break;
					case 21:
						renderTile(x*16,y*16, 240, 64);
						break;
					case 22:
						renderTile(x*16,y*16, 208, 16);
						break;
					case 24:
						renderTile(x*16,y*16, 240, 16);
						break;
				}
				x++;
			})
			y++;
		})
		skeleton.draw();
		canvas.fillStyle="#eee";
		canvas.fillRect(skeleton.x,skeleton.y,64,12);
		canvas.fillStyle="#008080";
		canvas.fillRect(skeleton.x+1,skeleton.y+1,(skeleton.hp*62)/100,10);
		canvas.fillStyle="#333";
		canvas.fillText("Skeleton", skeleton.x+4, skeleton.y+10);
		dilma.draw();
		canvas.fillStyle="#eee";
		canvas.fillRect(dilma.x,dilma.y,64,12);
		canvas.fillStyle="#008080";
		canvas.fillRect(dilma.x+1,dilma.y+1,(dilma.hp*62)/100,10);
		canvas.fillStyle="#333";
		canvas.fillText("Dilma", dilma.x+4, dilma.y+10);
		player.draw();
		canvas.fillStyle="#eee";
		canvas.fillRect(160,340,320,30);
		canvas.fillStyle="#008080";
		canvas.fillRect(162,342,(player.hp*316)/100,26);
		canvas.fillStyle="#333";
		canvas.fillText(player.hp+'/100', 300, 355);
	}

	player.attack = function() {
		player.frame = attackFrame;
		canMove = false;
		var colide = collides(player, skeleton);
		if (colide) {
			if (attackFrame == 12) {
				takeHit(skeleton, fromWhere(player, skeleton));
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

	skeleton.follow = function() {
		var from = fromWhere(player, skeleton);
		var colide = collides(player, skeleton);
		var distance = distanceFrom(player, skeleton);
		if (ennemyFrame == 3) start = true;
		if (ennemyFrame == 15) finish = true;
		if (distance < 200) {
			if (colide && distance < skeleton.range) {
				skeleton.frame = ennemyFrame;
				if (from == 'up') {
					skeleton.animation = animation.attackUp;
				} else if (from == 'right') {
					skeleton.animation = animation.attackRight;
				} else if (from == 'down') {
					skeleton.animation = animation.attackDown;
				} else if (from == 'left') {
					skeleton.animation = animation.attackLeft;
				}
				if (start && finish && ennemyFrame == 15) {
					if (player.hp > 1) {
						player.hp -= 20;
					} else {
						dead = true;
					}
					start = false;
					finish = false;
				}
			} else {
				if (from == 'up') {
					skeleton.frame = walkFrame;
					skeleton.animation = animation.walkUp;
					skeleton.y -= 2;
				} else if (from == 'right') {
					skeleton.x += 2;
					skeleton.frame = walkFrame;
					skeleton.animation = animation.walkRight;
				} else if (from == 'down') {
					skeleton.y += 2;
					skeleton.frame = walkFrame;
					skeleton.animation = animation.walkDown;
				} else if (from == 'left') {
					skeleton.x -= 2;
					skeleton.frame = walkFrame;
					skeleton.animation = animation.walkLeft;
				}
			}
		}
	}

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

	update = function() {
		if (dead) {
			// console.log("You're Dead");
		} else {
			//animation handlers
			if (frameCount > 4) {
				frameCount = 0;
			} else {
				frameCount += 1;
			}
			if (frameCount == 3) {
				attackFrame += 3;
			}
			if (frameCount == 4) {
				ennemyFrame += 3;
			}
			if (walkFrame < 7) {
				walkFrame+=1;
			} else {
				walkFrame = 0;
			}
			if (attackFrame > 15) {
				attackFrame = 0;
			}
			if (ennemyFrame > 15) {
				ennemyFrame = 0;
			}
			skeleton.follow();
			//key events
			if (keydown.a) {
				player.attack();
			} else {
				player.frame = 0;
				if (!canMove) {
					canMove = true;
				}
			}
			if (canMove) {
				player.move();
			}
		}
	}

};