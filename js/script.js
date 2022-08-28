class AudioController {

    // konstruktor deklarisemo pomocu kljucne rijeci constructor
    constructor() {
        // pomocu kljucne rijeci this deklarisemo polja klase
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
        // nesto ne valja ovde sa muzikom
        this.gameOverSound.play();
    }

}

class MemoryGame {
    // kreira igru sa inicijalnim podesavanjima
    constructor(totalTime, cards) {
        this.cardsArray = cards;
        this.totalTime = totalTime;
        this.timer = document.getElementById("time-remaining");
        this.ticker = document.getElementById("flips");
        this.audio = new AudioController();
        this.timer.innerText = this.totalTime;
    }


    // startuje igru sa nekim inicijalnim podesavanjima
    // metod start koristicemo i na restart i na game over...
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

    // init cards
    // pomocni utility metod
    // metod koji postavlja neki data na kartice, nemam slike sad
    makeCardsData(cards) {
        let cardInfo = 1;
        for (let i = 0; i < cards.length; i++) {
            cards[i].dataset.cardInfo = cardInfo;
            if (i % 2 !== 0) {
                cardInfo++;
            }
        }
    }

    // metod koji treba da izmjesa sve karte 
    shuffleCards() {
        this.busy = true;
        for (let i = 0; i < this.cardsArray.length; i++) {
            let randomInt = Math.floor(Math.random() * (i + 1));
            this.cardsArray[randomInt].style.order = i;
            this.cardsArray[i].style.order = randomInt;
        }
        this.busy = false;
    }

    // provjerava da li moze okrenuti kartu
    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }

    // okrece kartu ako zadovoljava uslove odredjene
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

    // provjerava da li se kate poklapaju
    checkForCardMatch(card) {
        if (card.dataset.cardInfo === this.cardToCheck.dataset.cardInfo)
            this.cardMatch(card, this.cardToCheck);
        else
            this.cardMisMatch(card, this.cardToCheck);

        this.cardToCheck = null;
    }

    // ukoliko se karte poklapaju uradi sledece
    cardMatch(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        this.audio.match();
        if (this.matchedCards.length === this.cardsArray.length) {
            this.victory();
        }
    }

    // ukoliko se karte ne poklapaju uradi sledece
    cardMisMatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            this.busy = false;
        }, 1000);
    }

    // metod koji vraca tajmer mozda
    startCountDown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if (this.timeRemaining === 0) {
                this.gameOver();
            }
        }, 1000);
    }

    // metod koji sakriva sve karte
    hideCards() {
        this.cardsArray.forEach(card => {
            card.classList.remove("flipped");
            // card.classList.remove("matched");
        });
    }

    // kada je isteklo vrijeme resetujem tajmer, pustam zvuk, sakrivam karte i izbacujem poruku
    gameOver() {
        this.audio.gameOver();
        this.hideCards();
        clearInterval(this.countDown);
        document.getElementById("game-over-text").classList.add("visible");
    }

    // kada je korisnik pobjedio isto kao i za game over samo druga poruka
    victory() {
        this.audio.victory();
        document.getElementById("victory-text").classList.add("visible");
        setTimeout(() => {
            clearInterval(this.countDown);
            this.hideCards();
        }, 1000);
    }

}


// metoda ready postavlja event listenere na overlay kontejnere i sve karete u igrici
function ready() {
    let overlays = Array.from(document.getElementsByClassName("overlay-container"));
    let cards = Array.from(document.getElementsByClassName("card"));

    let game = new MemoryGame(50, cards);

    // dodaje event listenere za svaki overlay 
    overlays.forEach(overlay => {
        overlay.addEventListener('click', e => {
            overlay.classList.remove("visible");
            // ukoliko pritisnemo overlay svaki put pocinjemo novu igru
            game.startGame();
        });
    });

    // dodaje event listnere na svaku kartu
    cards.forEach(card => {
        card.addEventListener('click', e => {
            // card.classList.toggle("flipped");
            game.flipCard(card);
        });
    });

}

// ukoliko se dokument nije ucitao, stavlja event listener, pa kada se ucita pokrece metodu ready, a ukoliko se ucitao odma pokrece metodu ready
if (document.readyState === "loading") {
    document.addEventListener('DOMContentloaded', ready());
} else {
    ready();
}
