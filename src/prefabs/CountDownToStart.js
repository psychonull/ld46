class CountDownToStart {
  constructor({ scene, onComplete, interval = 500 }) {
    this.scene = scene;
    this.onComplete = onComplete;
    this.currentIndex = 0;
    this.messages = ['READY', 'SET', 'GO!'];
    this.timedEvent = this.scene.time.addEvent({
      delay: interval,
      callback: this.onTick,
      callbackScope: this,
      loop: true
    });
    const world = this.scene.sys.game.canvas;
    this.text = this.scene.add.text(world.width / 2, world.height / 2, '', {
      fontFamily: 'monospace',
      fontSize: 192,
      color: 'turquoise'
    });
    this.text.setOrigin(0.5);
  }
  onTick() {
    const currentMessage = this.messages[this.currentIndex];
    if (!currentMessage) {
      this.timedEvent.remove(false);
      this.text.setText('');
      return this.onComplete();
    }
    this.showMessage(currentMessage, !this.messages[this.currentIndex + 1]);
    this.currentIndex++;
  }
  showMessage(str, isLastMessage) {
    this.text.setScale(1);
    if (isLastMessage) {
      this.scene.playAudio('countdownFinal');
      this.scene.tweens.add({
        targets: this.text,
        duration: 333,
        ease: 'Quad.easeOut',
        scale: 9,
        alpha: 0,
        color: 'pink'
      });
    } else {
      this.scene.playAudio('countdown');
      this.scene.tweens.add({
        targets: this.text,
        duration: 333,
        scale: 0.5,
        color: 'pink'
      });
    }
    this.text.setText(str);
  }
}

export default CountDownToStart;
