document.addEventListener('DOMContentLoaded', () => {
    // Game elements
    const mainMenu = document.getElementById('main-menu');
    const playerSettingsMenu = document.getElementById('player-settings-menu');
    const howToPlayMenu = document.getElementById('how-to-play-menu');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    
    // Buttons
    const startGameBtn = document.getElementById('start-game');
    const playerSettingsBtn = document.getElementById('player-settings');
    const howToPlayBtn = document.getElementById('how-to-play');
    const saveSettingsBtn = document.getElementById('save-settings');
    const playAgainBtn = document.getElementById('play-again');
    const backButtons = document.querySelectorAll('.back-button');
    
    // Player settings
    const playerNameInput = document.getElementById('player-name');
    const enemyNameInput = document.getElementById('enemy-name');
    
    // Game elements
    const player = document.getElementById('player');
    const enemy = document.getElementById('enemy');
    const ball = document.getElementById('ball');
    const playerGoal = document.getElementById('player-goal');
    const enemyGoal = document.getElementById('enemy-goal');
    const playerScoreDisplay = document.getElementById('player-score');
    const enemyScoreDisplay = document.getElementById('enemy-score');
    const winnerMessage = document.getElementById('winner-message');
    const finalScore = document.getElementById('final-score');
    
    // Joystick elements
    const joystickContainer = document.getElementById('joystick-container');
    const joystick = document.getElementById('joystick');
    
    // Game variables
    let playerScore = 0;
    let enemyScore = 0;
    let playerName = "Player 1";
    let enemyName = "Computer";
    let gameActive = false;
    
    // Player position and movement
    let playerX = 20;
    let playerY = 50;
    let playerSpeed = 0;
    let playerAngle = 0;
    
    // Enemy position and movement
    let enemyX = 80;
    let enemyY = 50;
    let enemySpeed = 0.5;
    
    // Ball position and movement
    let ballX = 50;
    let ballY = 50;
    let ballSpeedX = 0;
    let ballSpeedY = 0;
    let ballDeceleration = 0.98;
    
    // Field dimensions
    const fieldWidth = 100;
    const fieldHeight = 100;
    const goalHeight = 10;
    
    // Joystick variables
    let joystickActive = false;
    let joystickCenterX = 0;
    let joystickCenterY = 0;
    let joystickRadius = 50;
    let touchId = null;
    
    // Initialize game
    init();
    
    function init() {
        // Set up event listeners
        startGameBtn.addEventListener('click', startGame);
        playerSettingsBtn.addEventListener('click', () => showScreen(playerSettingsMenu));
        howToPlayBtn.addEventListener('click', () => showScreen(howToPlayMenu));
        saveSettingsBtn.addEventListener('click', saveSettings);
        playAgainBtn.addEventListener('click', resetGame);
        
        backButtons.forEach(button => {
            button.addEventListener('click', () => showScreen(mainMenu));
        });
        
        // Set up joystick
        setupJoystick();
        
        // Load saved settings
        loadSettings();
    }
    
    function showScreen(screen) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.add('hidden');
        });
        
        // Show the requested screen
        screen.classList.remove('hidden');
        
        // If showing game screen, start the game loop
        if (screen === gameScreen) {
            gameActive = true;
            requestAnimationFrame(gameLoop);
        } else {
            gameActive = false;
        }
    }
    
    function loadSettings() {
        const savedPlayerName = localStorage.getItem('playerName');
        const savedEnemyName = localStorage.getItem('enemyName');
        
        if (savedPlayerName) {
            playerNameInput.value = savedPlayerName;
            playerName = savedPlayerName;
        }
        
        if (savedEnemyName) {
            enemyNameInput.value = savedEnemyName;
            enemyName = savedEnemyName;
        }
    }
    
    function saveSettings() {
        playerName = playerNameInput.value || "Player 1";
        enemyName = enemyNameInput.value || "Computer";
        
        localStorage.setItem('playerName', playerName);
        localStorage.setItem('enemyName', enemyName);
        
        showScreen(mainMenu);
    }
    
    function startGame() {
        playerScore = 0;
        enemyScore = 0;
        playerScoreDisplay.textContent = "0";
        enemyScoreDisplay.textContent = "0";
        
        resetPositions();
        showScreen(gameScreen);
    }
    
    function resetGame() {
        startGame();
    }
    
    function resetPositions() {
        // Reset player position
        playerX = 20;
        playerY = 50;
        
        // Reset enemy position
        enemyX = 80;
        enemyY = 50;
        
        // Reset ball position
        ballX = 50;
        ballY = 50;
        ballSpeedX = 0;
        ballSpeedY = 0;
    }
    
    function setupJoystick() {
        // Get joystick container position
        const rect = joystickContainer.getBoundingClientRect();
        joystickCenterX = rect.left + rect.width / 2;
        joystickCenterY = rect.top + rect.height / 2;
        joystickRadius = rect.width / 2;
        
        // Touch events for mobile
        joystick.addEventListener('touchstart', handleJoystickStart, { passive: false });
        document.addEventListener('touchmove', handleJoystickMove, { passive: false });
        document.addEventListener('touchend', handleJoystickEnd, { passive: false });
        
        // Mouse events for desktop
        joystick.addEventListener('mousedown', handleJoystickStart);
        document.addEventListener('mousemove', handleJoystickMove);
        document.addEventListener('mouseup', handleJoystickEnd);
    }
    
    function handleJoystickStart(e) {
        e.preventDefault();
        joystickActive = true;
        
        if (e.type === 'touchstart') {
            touchId = e.changedTouches[0].identifier;
        }
    }
    
    function handleJoystickMove(e) {
        if (!joystickActive) return;
        e.preventDefault();
        
        let clientX, clientY;
        
        if (e.type === 'touchmove') {
            // Find the touch that started on our joystick
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    clientX = e.changedTouches[i].clientX;
                    clientY = e.changedTouches[i].clientY;
                    break;
                }
            }
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        if (clientX === undefined || clientY === undefined) return;
        
        // Calculate joystick position relative to center
        const x = clientX - joystickCenterX;
        const y = clientY - joystickCenterY;
        
        // Calculate distance from center
        const distance = Math.sqrt(x * x + y * y);
        
        // If finger is outside joystick radius, limit to radius
        const limitedDistance = Math.min(distance, joystickRadius);
        const angle = Math.atan2(y, x);
        
        const limitedX = Math.cos(angle) * limitedDistance;
        const limitedY = Math.sin(angle) * limitedDistance;
        
        // Move joystick thumb
        joystick.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
        
        // Calculate player movement
        playerSpeed = limitedDistance / joystickRadius; // Speed based on distance from center
        playerAngle = angle; // Direction based on angle
    }
    
    function handleJoystickEnd(e) {
        if (!joystickActive) return;
        
        // Check if this is the correct touch ending
        if (e.type === 'touchend') {
            let isCorrectTouch = false;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === touchId) {
                    isCorrectTouch = true;
                    break;
                }
            }
            if (!isCorrectTouch) return;
        }
        
        e.preventDefault();
        
        // Reset joystick
        joystick.style.transform = 'translate(0, 0)';
        joystickActive = false;
        playerSpeed = 0;
        touchId = null;
    }
    
    function gameLoop() {
        if (!gameActive) return;
        
        // Move player
        if (playerSpeed > 0) {
            const speed = 0.5 * playerSpeed;
            playerX += Math.cos(playerAngle) * speed;
            playerY += Math.sin(playerAngle) * speed;
            
            // Boundary checking
            playerX = Math.max(5, Math.min(fieldWidth - 5, playerX));
            playerY = Math.max(5, Math.min(fieldHeight - 5, playerY));
        }
        
        // Move enemy (AI)
        moveEnemy();
        
        // Move ball
        ballX += ballSpeedX;
        ballY += ballSpeedY;
        
        // Apply deceleration to ball
        ballSpeedX *= ballDeceleration;
        ballSpeedY *= ballDeceleration;
        
        // Stop ball if speed is very small
        if (Math.abs(ballSpeedX) < 0.01) ballSpeedX = 0;
        if (Math.abs(ballSpeedY) < 0.01) ballSpeedY = 0;
        
        // Ball boundary checking
        if (ballX < 0) ballX = 0;
        if (ballX > fieldWidth) ballX = fieldWidth;
        if (ballY < 0) ballY = 0;
        if (ballY > fieldHeight) ballY = fieldHeight;
        
        // Check for collisions with player
        checkCollision(player, playerX, playerY, true);
        
        // Check for collisions with enemy
        checkCollision(enemy, enemyX, enemyY, false);
        
        // Check for goals
        checkGoals();
        
        // Update positions on screen
        updatePositions();
        
        // Continue game loop
        requestAnimationFrame(gameLoop);
    }
    
    function moveEnemy() {
        // Simple AI: chase the ball
        const dx = ballX - enemyX;
        const dy = ballY - enemyY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            // Move toward the ball
            enemyX += (dx / distance) * enemySpeed;
            enemyY += (dy / distance) * enemySpeed;
        }
        
        // Boundary checking
        enemyX = Math.max(20, Math.min(fieldWidth - 5, enemyX));
        enemyY = Math.max(5, Math.min(fieldHeight - 5, enemyY));
    }
    
    function checkCollision(character, charX, charY, isPlayer) {
        // Calculate distance between character and ball
        const dx = ballX - charX;
        const dy = ballY - charY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Collision distance (sum of radii)
        const collisionDistance = 15 + 10; // player radius + ball radius
        
        if (distance < collisionDistance) {
            // Calculate overlap
            const overlap = collisionDistance - distance;
            
            // Push ball away
            const angle = Math.atan2(dy, dx);
            ballX += Math.cos(angle) * overlap * 0.5;
            ballY += Math.sin(angle) * overlap * 0.5;
            
            // Calculate new direction for ball
            if (isPlayer) {
                // If player is moving, use player's movement direction
                if (playerSpeed > 0) {
                    ballSpeedX = Math.cos(playerAngle) * playerSpeed * 2;
                    ballSpeedY = Math.sin(playerAngle) * playerSpeed * 2;
                } else {
                    // If player is stationary, bounce ball away
                    ballSpeedX = Math.cos(angle) * 2;
                    ballSpeedY = Math.sin(angle) * 2;
                }
            } else {
                // Enemy kicks the ball toward player's goal
                ballSpeedX = -3; // Toward player's goal
                ballSpeedY = (Math.random() - 0.5) * 2; // Some randomness
            }
        }
    }
    
    function checkGoals() {
        // Check for player goal (ball in enemy goal)
        if (ballX > fieldWidth - 1 && Math.abs(ballY - 50) < goalHeight) {
            playerScore++;
            playerScoreDisplay.textContent = playerScore;
            resetPositions();
            checkWinCondition();
        }
        
        // Check for enemy goal (ball in player goal)
        if (ballX < 1 && Math.abs(ballY - 50) < goalHeight) {
            enemyScore++;
            enemyScoreDisplay.textContent = enemyScore;
            resetPositions();
            checkWinCondition();
        }
    }
    
    function checkWinCondition() {
        if (Math.abs(playerScore - enemyScore) >= 5) {
            endGame();
        }
    }
    
    function endGame() {
        gameActive = false;
        
        // Determine winner
        let winner, message;
        if (playerScore > enemyScore) {
            winner = playerName;
            message = `${playerName} wins!`;
        } else {
            winner = enemyName;
            message = `${enemyName} wins!`;
        }
        
        // Update game over screen
        winnerMessage.textContent = message;
        finalScore.textContent = `${playerScore} - ${enemyScore}`;
        
        showScreen(gameOverScreen);
    }
    
    function updatePositions() {
        // Update player position
        player.style.left = `${playerX}%`;
        player.style.top = `${playerY}%`;
        
        // Update enemy position
        enemy.style.left = `${enemyX}%`;
        enemy.style.top = `${enemyY}%`;
        
        // Update ball position
        ball.style.left = `${ballX}%`;
        ball.style.top = `${ballY}%`;
    }
});
