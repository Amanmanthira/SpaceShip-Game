const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let spaceshipImage = new Image();
spaceshipImage.src = './images/spaceship.svg'; // Path to your spaceship image

let asteroidImage = new Image();
asteroidImage.src = './images/astroids.svg'; // Path to your asteroid image

let spaceship = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  dx: 0,
  speed: 6,
  laserColor: '#ff0000',
  lasers: [],
  laserSound: new Audio('./sound/laser.mp3'), // Add a laser sound effect
};

let asteroids = [];
let explosions = [];
let score = 0;
let level = 1;
let asteroidSpeed = 2;
let gameInterval;
let asteroidInterval;
let gameOverAlpha = 0; // For fade-in effect

// Handle spaceship movement
function keyDownHandler(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') spaceship.dx = -spaceship.speed;
  if (e.key === 'ArrowRight' || e.key === 'd') spaceship.dx = spaceship.speed;
  if (e.key === ' ') shootLaser(); // Spacebar to shoot
}

function keyUpHandler(e) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'a' || e.key === 'd') {
    spaceship.dx = 0;
  }
}

// Start the game
function startGame() {
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  gameInterval = setInterval(update, 1000 / 60); 
  asteroidInterval = setInterval(generateAsteroids, 2000); 
}

// Move the spaceship
function moveSpaceship() {
  spaceship.x += spaceship.dx;
  if (spaceship.x < 0) spaceship.x = 0;
  if (spaceship.x + spaceship.width > canvas.width) spaceship.x = canvas.width - spaceship.width;
}

// Draw the spaceship (using image)
function drawSpaceship() {
  ctx.drawImage(spaceshipImage, spaceship.x, spaceship.y, spaceship.width, spaceship.height);
}

// Shoot a laser
function shootLaser() {
  spaceship.lasers.push({ x: spaceship.x + spaceship.width / 2 - 5, y: spaceship.y, width: 10, height: 20 });
  spaceship.laserSound.play();  // Play the laser sound when shooting
}

// Move lasers
function moveLasers() {
  for (let i = 0; i < spaceship.lasers.length; i++) {
    spaceship.lasers[i].y -= 7; 
    if (spaceship.lasers[i].y < 0) spaceship.lasers.splice(i, 1); 
  }
}

// Draw lasers
function drawLasers() {
  ctx.fillStyle = spaceship.laserColor;
  for (let i = 0; i < spaceship.lasers.length; i++) {
    ctx.fillRect(spaceship.lasers[i].x, spaceship.lasers[i].y, spaceship.lasers[i].width, spaceship.lasers[i].height);
  }
}

// Generate asteroids
function generateAsteroids() {
  const size = Math.random() * 30 + 20;  // Randomize the size
  const xPos = Math.random() * (canvas.width - size);  // Random x position
  asteroids.push({ x: xPos, y: -size, width: size, height: size, speed: asteroidSpeed });
}

// Move asteroids
function moveAsteroids() {
  for (let i = 0; i < asteroids.length; i++) {
    asteroids[i].y += asteroids[i].speed;

    // Check for collision with spaceship
    if (spaceship.x < asteroids[i].x + asteroids[i].width &&
        spaceship.x + spaceship.width > asteroids[i].x &&
        spaceship.y < asteroids[i].y + asteroids[i].height &&
        spaceship.y + spaceship.height > asteroids[i].y) {
      endGame(); // If spaceship collides with asteroid, end game
    }
    
    if (asteroids[i].y > canvas.height) asteroids.splice(i, 1);  // Remove asteroid if it goes off-screen
  }
}

// Detect laser-asteroid collision
function detectLaserCollision() {
  for (let i = 0; i < spaceship.lasers.length; i++) {
    for (let j = 0; j < asteroids.length; j++) {
      // Collision detection
      if (
        spaceship.lasers[i].x < asteroids[j].x + asteroids[j].width &&
        spaceship.lasers[i].x + spaceship.lasers[i].width > asteroids[j].x &&
        spaceship.lasers[i].y < asteroids[j].y + asteroids[j].height &&
        spaceship.lasers[i].y + spaceship.lasers[i].height > asteroids[j].y
      ) {
        // Add explosion effect
        explosions.push({ x: asteroids[j].x, y: asteroids[j].y, size: asteroids[j].width });
        
        // Remove asteroid and laser on collision
        asteroids.splice(j, 1);
        spaceship.lasers.splice(i, 1);
        
        // Update the score
        score += 100;
      }
    }
  }
}

// Draw asteroids (using image)
function drawAsteroids() {
  for (let i = 0; i < asteroids.length; i++) {
    ctx.drawImage(asteroidImage, asteroids[i].x, asteroids[i].y, asteroids[i].width, asteroids[i].height);
  }
}

// Draw explosions
function drawExplosions() {
  for (let i = 0; i < explosions.length; i++) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(explosions[i].x, explosions[i].y, explosions[i].size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Remove explosion effect after it has appeared
  if (explosions.length > 0) {
    explosions.shift(); 
  }
}

// Draw Score and Level on the Canvas
function drawScoreAndLevel() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);
  ctx.fillText(`Level: ${level}`, canvas.width - 100, 30);
}

// Draw Game Over Screen with modern effects
function drawGameOver() {
  // Add a gradient background for the game over screen
  const gradient = ctx.createLinearGradient(0, canvas.height / 3, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0.7)');  // Dark semi-transparent start
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');  // Darker towards the bottom
  ctx.fillStyle = gradient;
  ctx.fillRect(0, canvas.height / 3, canvas.width, 100);  // Game over background

  // Text styling
  ctx.fillStyle = 'white';
  ctx.font = '50px "Roboto", sans-serif'; // Use a modern font (you can link a custom font if needed)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw "Game Over" with a fade-in effect
  ctx.globalAlpha = gameOverAlpha;
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20);

  // Draw Final Score with a fade-in effect
  ctx.font = '30px "Roboto", sans-serif';
  ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);

  // Gradual fade-in effect for the game over text
  if (gameOverAlpha < 1) {
    gameOverAlpha += 0.02;  // Increase the alpha value gradually to create fade-in
  }

  ctx.globalAlpha = 1;  // Reset the alpha value
}

// Update the game state every frame
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear canvas for next frame

  if (score < 0) {
    score = 0;  // Prevent negative scores
  }

  moveSpaceship();
  moveAsteroids();
  moveLasers();
  detectLaserCollision();  // Detect if lasers hit asteroids

  drawSpaceship();
  drawAsteroids();
  drawLasers();
  drawExplosions(); // Draw explosions when asteroids are hit
  drawScoreAndLevel(); // Draw the score and level
  
  if (gameOverScreen.classList.contains('hidden') === false) {
    drawGameOver(); // Draw the modern game over screen with fade-in
  }

  requestAnimationFrame(update);  // Update the game state at a consistent rate
}

// End the game
function endGame() {
  gameOverScreen.classList.remove('hidden');
  clearInterval(gameInterval);
  clearInterval(asteroidInterval);
  gameOverAlpha = 0;  // Reset the fade effect for the next game over
}

// Restart the game
function restartGame() {
  score = 0;
  level = 1;
  asteroidSpeed = 2;
  asteroids = [];
  spaceship = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    dx: 0,
    speed: 6,
    color: '#00ff00',
    laserColor: '#ff0000',
    lasers: [],
    laserSound: new Audio('laser.mp3'),
  };
  gameOverScreen.classList.add('hidden');
  startGame();  // Restart the game loop
}

// Start the game when the page loads
window.onload = function () {
  startGame();
};
