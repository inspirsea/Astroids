/**
 * Playing Asteroids while learning JavaScript object model.
 */

/** 
 * Shim layer, polyfill, for requestAnimationFrame with setTimeout fallback.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */ 
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();



/**
 * Shim layer, polyfill, for cancelAnimationFrame with setTimeout fallback.
 */
window.cancelRequestAnimFrame = (function(){
  return  window.cancelRequestAnimationFrame || 
          window.webkitCancelRequestAnimationFrame || 
          window.mozCancelRequestAnimationFrame    || 
          window.oCancelRequestAnimationFrame      || 
          window.msCancelRequestAnimationFrame     || 
          window.clearTimeout;
})();



/**
 * Trace the keys pressed
 * http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
 */
window.Key = {
  pressed: {},

  LEFT:   37,
  UP:     38,
  RIGHT:  39,
  DOWN:   40,
  SPACE:  32,
  A:      65,
  S:      83,
  D:      68,
  w:      87,
  
  isDown: function(keyCode, keyCode1) {
    return this.pressed[keyCode] || this.pressed[keyCode1];
  },
  
  onKeydown: function(event) {
    this.pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this.pressed[event.keyCode];
  }
};
window.addEventListener('keyup',   function(event) { Key.onKeyup(event); },   false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);



/**
 * All objects are Vectors
 */
function Vector(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Vector.prototype = {
  muls:  function (scalar) { return new Vector( this.x * scalar, this.y * scalar); }, // Multiply with scalar
  imuls: function (scalar) { this.x *= scalar; this.y *= scalar; return this; },      // Multiply itself with scalar
  adds:  function (scalar) { return new Vector( this.x + scalar, this.y + scalar); }, // Multiply with scalar
  iadd:  function (vector) { this.x += vector.x; this.y += vector.y; return this; }   // Add itself with Vector
}



/**
 * A Player as an object.
 */
function Player(width, height, position, velocity, speed, direction, rotation) {
  this.height     = height    || 32;
  this.width      = width     || 32;
  this.position   = new Vector(Math.round(position.x), Math.round(position.y))  || new Vector();
  this.velocity   = velocity  || new Vector();
  this.speed      = speed     || new Vector();
  this.direction  = direction || 0;
  this.rotation  = rotation || 0;
  
}

Player.prototype = {

  draw: function(ct) {
    var x = this.width/2, y = this.height/2;

    ct.save();
    ct.translate(this.position.x, this.position.y);
    ct.rotate(this.rotation+Math.PI/2)
    ct.beginPath();
    ct.moveTo(0, -y);
    ct.lineTo(x, y);
    ct.lineTo(0, 0.8*y);
    ct.lineTo(-x, y);
    ct.lineTo(0, -y);

    if (Key.isDown(Key.UP, Key.W)) {
      ct.moveTo(0, y);
      ct.lineTo(-2, y+10);
      ct.lineTo(0, y+8);
      ct.lineTo(2, y+10);
      ct.lineTo(0, y);
    } 
    
    

    ct.stroke();
    ct.restore();
    
    
  },


  moveForward: function() {
    this.position.x += this.speed.x * td;
    this.position.y += this.speed.y * td;
  },

  rotateLeft:  function() { this.rotation -= Math.PI/40; },
  rotateRight: function() { this.rotation += Math.PI/40; },

  throttle: function(td)  {
  //calculate the length of the vector and declare a constant for the ship max speed
  var MAX_SPEED = 500,
  ACCELERATION = 5,
  speedx2 = this.speed.x * this.speed.x,
  speedy2 = this.speed.y * this.speed.y,
  vectorlength = Math.sqrt(speedx2 + speedy2);
  this.speed.x += ACCELERATION * Math.cos(this.rotation);
  this.speed.y += ACCELERATION * Math.sin(this.rotation);
  //if the length of the vector is more than the max speed constant normalize the vector and multiply it with the max speed making the speed = max speed but without changing the direction.
  if(vectorlength > MAX_SPEED)
  {
      this.speed.x = this.speed.x / vectorlength;
      this.speed.y = this.speed.y / vectorlength;
      
      this.speed.x *= MAX_SPEED;
      this.speed.y *= MAX_SPEED;
  }
  
  },
  

  update: function(td, width, height) {
    if (Key.isDown(Key.UP, Key.W))     this.throttle(td);
    if (Key.isDown(Key.LEFT, Key.A))   this.rotateLeft();
    if (Key.isDown(Key.RIGHT, Key.D))  this.rotateRight();
    if (Key.isDown(Key.SPACE))  Asteroids.shoot();
    this.moveForward(td);
    this.stayInArea(width, height);
  },

  stayInArea: function(width, height) {
    if(this.position.y < -this.height)  this.position.y = height;
    if(this.position.y > height)        this.position.y = -this.height;
    if(this.position.x > width)         this.position.x = -this.width;
    if(this.position.x < -this.width)   this.position.x = width;
  }
}

function Shoot(position, rotation) {
  this.position   = new Vector(Math.round(position.x), Math.round(position.y))  || new Vector();
  this.rotation      = rotation     || 0
  this.shotspeed = new Vector(Math.round(200 * Math.cos(this.rotation)), Math.round(200 * Math.sin(this.rotation)));
}

Shoot.prototype = {
    
    draw: function(ct) {
    ct.save();
    ct.beginPath();
    ct.arc(this.position.x, this.position.y, 2, 2, Math.PI*2, true);
    ct.closePath();
    ct.fill();
    ct.stroke();
    ct.restore(); 
  },
    
    move: function(td){
        this.position.x += this.shotspeed.x * td;
        this.position.y += this.shotspeed.y * td;
    },
    
    update: function(td){
        this.move(td);
    }
    
}

function ShootArr() {
  this.container = [];
}

ShootArr.prototype = {
    
    newShoot: function(position, rotation){
        this.container.push(new Shoot(position, rotation));
    },
    
    draw: function(ct){
        for(var i = 0; i < this.container.length; i++)
        {
            this.container[i].draw(ct);
        }
    },
    
    move: function(td){
        for(var i = 0; i < this.container.length; i++)
        {
            this.container[i].update(td);
            if(this.container[i].position.x > 900 || this.container[i].position.x < 0 || this.container[i].position.y > 400 || this.container[i].position.y < 0)
            {
               this.container.splice(i, 1); 
            }
        }
    },
    
    update: function(td){
        this.move(td);
    }
    
}

function Asteroid(width, height, position, speed, rotation) {
  this.height     = height    || 32;
  this.width      = width     || 32;
  this.rotation   = rotation  || 0;
  this.position   = new Vector(Math.round(position.x), Math.round(position.y))  || new Vector();
  this.speed      = new Vector(Math.round(speed.x), Math.round(speed.y))     || new Vector();
}

Asteroid.prototype = {

  draw: function(ct) {
    var x = this.width/2, y = this.height/2;
    
    /*ct.save();
    ct.translate(this.position.x, this.position.y);
    ct.rotate(this.rotation+Math.PI/2)
    ct.beginPath();
    ct.moveTo(0, -y);
    ct.lineTo(x, y);
    ct.lineTo(0, 0.8*y);
    ct.lineTo(-x, y);
    ct.lineTo(0, -y);
    */
    
    ct.save();
    ct.translate(this.position.x, this.position.y);
    ct.rotate(this.rotation)
    ct.beginPath();
    ct.moveTo(x,0);
    ct.lineTo(1.5 * x, 0.7 * y);
    ct.lineTo(2 * x, y);
    ct.lineTo(2 * x, 1.5 * y);
    ct.lineTo(x, 2 * y);
    ct.lineTo(0, 1.7 * y);
    ct.lineTo(0, y);
    ct.lineTo(0.5 * x, y);
    ct.lineTo(0, 0.6 * y);
    ct.lineTo(x, 0);
    ct.stroke();
    ct.restore();
  
  },

  moveForward: function() {
    this.position.x += this.speed.x * td;
    this.position.y += this.speed.y * td;
  },  

  update: function(td, width, height) {
    this.moveForward(td);
    this.stayInArea(width, height);
  },

  stayInArea: function(width, height) {
    if(this.position.y < -this.height)  this.position.y = height;
    if(this.position.y > height)        this.position.y = -this.height;
    if(this.position.x > width)         this.position.x = -this.width;
    if(this.position.x < -this.width)   this.position.x = width;
  }
}

function AsteroidArr() {
  this.container = [];
}

AsteroidArr.prototype = {
    
    newAsteroid: function(level){
        for(var i = 0; i < level; i++)
        {
            var width = Math.floor((Math.random()*5)+1) * 10,
            height = width,
            position = new Vector(Math.floor((Math.random()*900)), 0),
            speed = new Vector(Math.floor((Math.random()*200)-100), Math.floor((Math.random()*200)-100)),
            rotation = 0//Math.random();
            Math.floor((Math.random()*10)+1);
            this.container.push(new Asteroid(width, height, position, speed, rotation));
        }
    },
    
    draw: function(ct){
        for(var i = 0; i < this.container.length; i++)
        {
            this.container[i].draw(ct);
        }
    },
    
    move: function(td, width, height){
        for(var i = 0; i < this.container.length; i++)
        {
            this.container[i].update(td, width, height);
        }
    },
    
    update: function(td, width, height){
        this.move(td, width, height);
    }
    
}

function Particle(position, speed) {
  this.position   = new Vector(Math.round(position.x), Math.round(position.y))  || new Vector();
  this.speed      = speed     || new Vector();
}

Particle.prototype = {
  
  draw: function(ct) {
    ct.save();
    ct.beginPath();
    ct.arc(this.position.x, this.position.y, 1, 1, Math.PI*2, true);
    ct.closePath();
    ct.fill();
    ct.stroke();
    ct.restore(); 
    
  },

  moveForward: function(td) {
    this.position.x += this.speed.x * td;
    this.position.y += this.speed.y * td;
  },  

  update: function(td) {
    this.moveForward(td);
  }
}

function ParticleArr() {
  this.container = [];
  this.nrofupdates = 0;
}

ParticleArr.prototype = {
    
    newParticle: function(position){
        for(var i = 0; i < 50; i++)
        {
            var speed = new Vector((Math.random() * 2) -1, (Math.random() * 2) -1),
            speedx2 = speed.x * speed.x,
            speedy2 = speed.y * speed.y,
            vectorlength = Math.sqrt(speedx2 + speedy2);
            speed.x = speed.x/vectorlength;
            speed.y = speed.y/vectorlength;
            speedRand = (Math.floor(Math.random() * 200))
            speed.x *= speedRand;
            speed.y *= speedRand;
            
            this.container[i] = new Particle(new Vector(position.x, position.y), speed);
        }
    },
    
    draw: function(ct){
        for(var i = 0; i < this.container.length; i++)
        {
            this.container[i].draw(ct);
        }
    },
    
    move: function(td){
        this.nrofupdates++;
        for(var i = 0; i < this.container.length; i++)
        {
            this.container[i].update(td);
        }
    },
    
    update: function(td){
        this.move(td);
    }
    
}
/**
 * Asteroids, the Game
 */
window.Asteroids = (function(){
  var canvas, ct, ship, lastGameTick, level = 1;

  var init = function(canvas) {
    canvas = document.getElementById(canvas);
    ct = canvas.getContext('2d');
    width = canvas.width,
    height = canvas.height,
    ct.lineWidth = 1;
    ct.strokeStyle = 'hsla(0,0%,100%,1)',
    ship = new Player(10, 20, new Vector(width/2, height/2)),
    shipShoots = new ShootArr(),
    shotcooldown = 0,
    AsteroidArray = new AsteroidArr(),
    levelf(level),
    points = 0,
    animationArr = [],
    nrOfAnimetions = 0;
    gameover = false;
    console.log('Init the game');
  };
  
  var levelf = function(level) {
    AsteroidArray.newAsteroid(level);
  }
  
  var shoot = function() {
      if(shotcooldown === 0)
      {
        shotcooldown++;
        var position = new Vector(ship.position.x, ship.position.y),
        rotation = ship.rotation;
        shipShoots.newShoot(position, rotation);
      }
    };
  
  var update = function(td) {
    if(!gameover)
    {
    if(shotcooldown > 0)
    {
        shotcooldown++;
        if(shotcooldown > 20)
        {
            shotcooldown = 0
        }
    }
    ship.update(td, width, height);
    shipShoots.update(td);
    AsteroidArray.update(td, width, height);
    for(var i = 0; i < nrOfAnimetions; i++)
    {
        animationArr[i].update(td);
        if(animationArr[i].nrofupdates > 100)
        {
            animationArr.splice(i,1);
            nrOfAnimetions--;
        }
    }
    }  
    };

  var render = function() {
    ct.clearRect(0,0,width,height);
    ship.draw(ct);
    shipShoots.draw(ct);
    AsteroidArray.draw(ct);
    ct.fillStyle = "white";
    ct.font = "bold 16px Arial";
    ct.fillText("Points: " + points, 10, 20);
    for(var i = 0; i < nrOfAnimetions; i++)
    {
        animationArr[i].draw(ct);
    }
  };
  
  var rect_collision = function(x1, y1, size1, x2, y2, size2) {
  var bottom1, bottom2, left1, left2, right1, right2, top1, top2;
  left1 = x1 - size1;
  right1 = x1 + size1;
  top1 = y1 - size1;
  bottom1 = y1 + size1;
  left2 = x2 - size2;
  right2 = x2 + size2;
  top2 = y2 - size2;
  bottom2 = y2 + size2;
  return !(left1 > right2 || left2 > right1 || top1 > bottom2 || top2 > bottom1);
  };
  
  var animation = function(position) {
      animationArr[nrOfAnimetions] = new ParticleArr();
      animationArr[nrOfAnimetions].newParticle(position);
      nrOfAnimetions++;
  };
  
  var collisions = function() {
      //console.log(ship.position.x);
      for(var i = 0; i < AsteroidArray.container.length; i++)
      {
          var xA = AsteroidArray.container[i].position.x + (AsteroidArray.container[i].width/2),
          yA = AsteroidArray.container[i].position.y + (AsteroidArray.container[i].height/2),
          sA = (AsteroidArray.container[i].width/2),
          xS = ship.position.x + (ship.width/2),
          yS = ship.position.y + (ship.width/2),
          sS = ship.width/2;

          if(rect_collision(xA, yA, sA, xS, yS, sS))
          {
              gameover = true;
              ct.fillStyle = "white";
              ct.font = "bold 48px Arial";
              ct.fillText("GAME OVER", 300, 200);
          }
          
          for(var shoot = 0; shoot < shipShoots.container.length; shoot++)
          {
            var xS2 = shipShoots.container[shoot].position.x,
            yS2 = shipShoots.container[shoot].position.y,
            sS2 = 1;
            
            if(rect_collision(xA, yA, sA, xS2, yS2, sS2))
            {
                animation(new Vector(AsteroidArray.container[i].position.x + (AsteroidArray.container[i].width/2), AsteroidArray.container[i].position.y + (AsteroidArray.container[i].height/2)));
                AsteroidArray.container.splice(i, 1);
                shipShoots.container.splice(shoot, 1);
                points += 100;
                if(AsteroidArray.container.length === 0)
                {
                    levelf(++level);
                    points += (100 * level);
                }
            }
          }
          
      }
  }

  var gameLoop = function() {
    var now = Date.now();
    td = (now - (lastGameTick || now)) / 1000; // Timediff since last frame / gametick
    lastGameTick = now;
    requestAnimFrame(gameLoop);
    update(td);
    render();
    collisions();
  };

  return {
    'init': init,
    'gameLoop': gameLoop,
    'shoot': shoot
  }
})();



// On ready
$(function(){
  'use strict';

  Asteroids.init('canvas1');
  Asteroids.gameLoop();

  console.log('Ready to play.');  
});

