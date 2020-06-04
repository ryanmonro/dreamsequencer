class Note {
  constructor(note=440, interval=1){
    this.note = note;
    this.interval = interval;
    this.nextPlayTime = 0;
    this.player = new Tone.Synth().toMaster();
    this.player.set("envelope", {decay: 0.2, sustain: 0.3, release: 0.4});
  }
  play(time){

    if (time >= this.nextPlayTime) {
      this.player.triggerAttackRelease(this.note, "16n", time);
      this.nextPlayTime += this.interval;
    }
  }
}

var notes = [];
notes.push(new Note());
notes.push(new Note(1000, 3));

var loop = new Tone.Sequence(function(time, step){
  for(note of notes){
    note.play(time)
  }
  Tone.Draw.schedule(function(){
    // draw things
  }, time);
}, [0], 1).start(0);

Tone.Transport.start();

