var particleSystem = function(cfg) {
  this.initCFG(cfg);

  this.canvas = document.getElementById(this.canvas_id);
  this.ctx = this.canvas.getContext("2d");

  this.canvas.width = this.width;
  this.canvas.height = this.height;

  this.initMessage();

  // Inicializar el estado del fondo
  this.darkMode = false;

  // Crear las partículas del corazón
  for (var i = 0; i < this.area.length; i += 256) {
    this.particles.push(new particle({
      x: this.area[i][0],
      y: this.area[i][1],
      vx: Math.floor((Math.random() * 2) - 1),
      vy: Math.floor((Math.random() * 2) - 1)
    }, this.ctx));
  }

  // Crear el array para los fuegos artificiales
  this.fireworks = [];

  // Añadir evento de clic
  var that = this;
  this.canvas.addEventListener('click', function() {
    that.toggleBackground();
    var heartCenter = that.getHeartCenter();
    that.createFireworks(heartCenter.x, that.height); // Crear fuegos artificiales desde la parte inferior
  });
};

particleSystem.prototype.initCFG = function(cfg) {
  cfg = cfg || {};

  this.fps = cfg.fps || 30;
  this.now;
  this.dist;
  this.then = Date.now();
  this.interval = 1000 / this.fps;
  this.delta;
  this.canvas_id = cfg.canvas_id || "canvas";
  this.min_dist = cfg.min_dist || 20;
  this.particles = [];
  this.width = cfg.width || window.innerWidth;
  this.height = cfg.height || window.innerHeight;
};

particleSystem.prototype.initMessage = function() {
  this.str = "2764";
  this.fontStr = "400pt Helvetica Arial, sans-serif";

  this.ctx.beginPath();
  this.ctx.font = this.fontStr;
  this.ctx.textAlign = "center";
  this.ctx.fillStyle = "#ffffff";
  this.ctx.fillText(String.fromCharCode(parseInt(this.str, 16)), this.width / 2, this.height - 50);
  this.ctx.closePath();

  this.mask = this.ctx.getImageData(0, 0, this.width, this.height);
  this.area = [];

  for (var i = 0; i < this.mask.data.length; i += 4) {
    if (this.mask.data[i] == 255 && this.mask.data[i + 1] == 255 && this.mask.data[i + 2] == 255 && this.mask.data[i + 3] == 255) {
      this.area.push([this.toPosX(i, this.mask.width), this.toPosY(i, this.mask.width)]);
    }
  }

  this.repaint();
};

particleSystem.prototype.update = function() {
  // Actualizar partículas del corazón
  for (var i = 0; i < this.particles.length; i++) {
    if (this.isBlackPixelX(this.particles[i])) {
      this.particles[i].vx *= -1;
    }

    if (this.isBlackPixelY(this.particles[i])) {
      this.particles[i].vy *= -1;
    }

    this.particles[i].x += this.particles[i].vx;
    this.particles[i].y += this.particles[i].vy;

    for (var j = 0; j < this.particles.length; j++) {
      if (this.areClose(this.particles[i], this.particles[j])) {
        this.drawConnectionLine(this.particles[i], this.particles[j]);
      }
    }
  }

  // Actualizar partículas de fuegos artificiales
  for (var i = 0; i < this.fireworks.length; i++) {
    var fw = this.fireworks[i];
    
    if (!fw.exploded) {
      fw.y -= fw.vy; // Movimiento hacia arriba

      if (fw.y <= fw.explosionHeight) { // Si alcanza la altura de explosión
        fw.explode(); // Explota
        fw.exploded = true; // Marcar como explotado
      }
    } else {
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += 0.1; // Gravedad

      if (fw.y > this.height) {
        this.fireworks.splice(i, 1);
        i--;
      }
    }
  }
};

particleSystem.prototype.drawConnectionLine = function(p1, p2) {
  this.ctx.beginPath();
  this.ctx.strokeStyle = "rgba(247,66,126," + (1 - (Math.sqrt(this.getDistX(p1, p2) + this.getDistY(p1, p2)) / this.min_dist)) + ")";
  this.ctx.moveTo(p1.x, p1.y);
  this.ctx.lineTo(p2.x, p2.y);
  this.ctx.stroke();
  this.ctx.closePath();
};

particleSystem.prototype.start = function(e) {
  requestAnimFrame(delegate(this, this.start));

  this.now = Date.now();
  this.delta = this.now - this.then;

  if (this.delta > this.interval) {
    this.then = this.now - (this.delta % this.interval);
    this.draw();
  }
};

particleSystem.prototype.draw = function() {
  this.repaint();

  for (var k = 0, m = this.particles.length; k < m; k++) {
    this.particles[k].draw();
  }

  for (var k = 0, m = this.fireworks.length; k < m; k++) {
    this.fireworks[k].draw();
  }

  this.update();
};

particleSystem.prototype.isBlackPixelY = function(p) {
  return this.mask.data[this.posToArea(p.x, p.y + p.vy, this.mask.width)] != 255;
};

particleSystem.prototype.isBlackPixelX = function(p) {
  return this.mask.data[this.posToArea(p.x + p.vx, p.y, this.mask.width)] != 255;
};

particleSystem.prototype.areClose = function(p1, p2) {
  return Math.sqrt(this.getDistX(p1, p2) + this.getDistY(p1, p2)) < this.min_dist;
};

particleSystem.prototype.getDistX = function(p1, p2) {
  return Math.pow((p1.x - p2.x), 2);
};

particleSystem.prototype.getDistY = function(p1, p2) {
  return Math.pow((p1.y - p2.y), 2);
};

particleSystem.prototype.posToArea = function(x, y, w) {
  return ((this.mask.width * y) + x) * 4;
};

particleSystem.prototype.toPosX = function(i, w) {
  return (i % (4 * w)) / 4;
};

particleSystem.prototype.toPosY = function(i, w) {
  return Math.floor(i / (4 * w));
};

particleSystem.prototype.repaint = function() {
  var img = new Image();
  img.src = this.darkMode ? "URL_DARK_BACKGROUND" : "https://th.bing.com/th/id/R.bffec0d722afdbfe2208db4f83ce3163?rik=GVHUWC5dS8gnUw&pid=ImgRaw&r=0";

  var that = this;
  img.onload = function() {
    that.ctx.drawImage(img, 0, 0, that.width, that.height);
    that.drawParticles();
  };
};

particleSystem.prototype.drawParticles = function() {
  for (var k = 0, m = this.particles.length; k < m; k++) {
    this.particles[k].draw();
  }
};

particleSystem.prototype.createFireworks = function(x, y) {
  var colors = ["#FFC0CB", "#FFFFFF"]; // Rosa y blanco
  var explosionHeight = y - 150; // Altura en la que explotarán los fuegos artificiales
  
  for (var i = 0; i < 100; i++) {
    this.fireworks.push(new particle({
      x: x + (Math.random() - 0.5) * 20, // Distribuir en la parte inferior
      y: y,
      vx: (Math.random() - 0.5) * 5,
      vy: -Math.random() * 5, // Movimiento inicial hacia arriba
      radius: 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      explosionHeight: explosionHeight,
      exploded: false
    }, this.ctx));
  }
};

particleSystem.prototype.getHeartCenter = function() {
  var totalX = 0, totalY = 0, count = this.particles.length;
  for (var i = 0; i < count; i++) {
    totalX += this.particles[i].x;
    totalY += this.particles[i].y;
  }
  return { x: totalX / count, y: totalY / count };
};

particleSystem.prototype.toggleBackground = function() {
  this.darkMode = !this.darkMode;
  this.repaint();
};

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

window.delegate = function(ctx, func) {
  return function() {
    return func.apply(ctx, arguments);
  };
};
