class AudioController {

    constructor() {
        this.bgMusic = new Audio("audio/creepy.mp3");
        this.flipSound = new Audio("audio/flip.wav");
        this.matchSound = new Audio("audio/match.wav");
        this.victorySound = new Audio("audio/victory.wav");
        this.gameOverSound = new Audio("audio/gameover.wav");
        this.bgMusic.volume = 0.5;
        this.bgMusic.loop = true;
    }

    startMusic() {
        this.bgMusic.play();
    }

    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    flip() {
        this.flipSound.play();
    }

    match() {
        this.matchSound.play();
    }

    victory() {
        this.victorySound.play();
    }

    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }

}

class MemoryGame {
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timer = document.getElementById("time-remaining");
        this.ticker = document.getElementById("flips");
        this.audio = new AudioController();
        this.timer.innerText = this.totalTime;
    }

    startGame() {
        this.makeCardsData(this.cardsArray);
        this.cardToCheck = null;
        this.totalClicks = 0;
        this.matchedCards = [];
        this.busy = false;
        this.timeRemaining = this.totalTime;
        this.timer.innerText = this.totalTime;
        this.ticker.innerText = this.totalClicks;
        this.shuffleCards();
        this.countDown = this.startCountDown();
    }

    makeCardsData(cards) {
        let cardInfo = 1;
        for (let i = 0; i < cards.length; i++) {
            cards[i].dataset.cardInfo = cardInfo;
            if (i % 2 !== 0) {
                cardInfo++;
            }
        }
    }

    shuffleCards() {
        this.busy = true;
        for (let i = 0; i < this.cardsArray.length; i++) {
            let randomInt = Math.floor(Math.random() * (i + 1));
            this.cardsArray[randomInt].style.order = i;
            this.cardsArray[i].style.order = randomInt;
        }
        this.busy = false;
    }

    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }

    flipCard(card) {
        if (this.canFlipCard(card)) {
            this.audio.flip();
            this.totalClicks++;
            this.ticker.innerHTML = this.totalClicks;
            card.classList.add("flipped");
            if (this.cardToCheck) {
                this.checkForCardMatch(card);
            }
            else {
                this.cardToCheck = card;
            }
        }
    }

    checkForCardMatch(card) {
        if (card.dataset.cardInfo === this.cardToCheck.dataset.cardInfo)
            this.cardMatch(card, this.cardToCheck);
        else
            this.cardMisMatch(card, this.cardToCheck);

        this.cardToCheck = null;
    }

    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        this.audio.match();
        if (this.matchedCards.length === this.cardsArray.length) {
            this.victory();
        }
    }

    cardMisMatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            this.busy = false;
        }, 1000);
    }

    startCountDown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if (this.timeRemaining === 0) {
                this.gameOver();
            }
        }, 1000);
    }

    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove("flipped");
        });
    }

    gameOver() {
        this.audio.gameOver();
        this.hideCards();
        clearInterval(this.countDown);
        document.getElementById("game-over-text").classList.add("visible");
    }

    victory() {
        this.audio.victory();
        document.getElementById("victory-text").classList.add("visible");
        setTimeout(() => {
            clearInterval(this.countDown);
            this.hideCards();
        }, 1000);
    }

}


function ready() {
    let overlays = Array.from(document.getElementsByClassName("overlay-container"));
    let cards = Array.from(document.getElementsByClassName("card"));

    let game = new MemoryGame(50, cards);

    overlays.forEach(overlay => {
        overlay.addEventListener('click', e => {
            overlay.classList.remove("visible");
            game.startGame();
        });
    });

    cards.forEach(card => {
        card.addEventListener('click', e => {
            game.flipCard(card);
        });
    });

}

if (document.readyState === "loading") {
    document.addEventListener('DOMContentloaded', ready());
} else {
    ready();
}
