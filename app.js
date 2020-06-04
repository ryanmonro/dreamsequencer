var LOWESTNOTE = 20; // Hz
var OCTAVES = 8;

var Dream = {
  touch: document.querySelector('#touch'),
  notes: [],
  addNote: function(x, y){
    this.notes.push(new Note(x / this.x, 1 - y / this.y));
  },
  init: function(){
    this.x = 400;
    this.y = 400;
    this.ctx = this.touch.getContext("2d");
  },
  play: function(time){
    for(note of this.notes){
      note.play(time);
    }
  },
  draw: function(time){
    this.ctx.clearRect(0, 0, this.touch.width, this.touch.height);
    for(note of this.notes){
      var x = Math.floor(note.xFloat * this.touch.width);
      var y = Math.floor((1 - note.yFloat) * this.touch.height);
      this.ctx.strokeStyle = "rgba(0,255,0," + note.fade(time) + ")";
      this.ctx.lineWidth = 1;
      console.log(x,y)
      this.ctx.strokeRect(x - 2, y - 2, 5, 5);
    }
  }
}

Dream.touch.addEventListener('click', function(e){
  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;
  console.log(x, y);
  Dream.addNote(x, y);
})

Dream.init();

class Note {
  constructor(x, y){
    this.xFloat = x;
    this.yFloat = y;
    this.note = LOWESTNOTE * Math.pow(2, y * OCTAVES);
    this.interval = Math.floor(Math.pow(60, x * 6 * 0.75));
    this.nextPlayTime = 0;
    this.player = new Tone.Synth().toMaster();
    this.player.set("envelope", {decay: 0.2, sustain: 0.3, release: 1});
    console.log(this.interval, this.note);
  }
  play(time){
    if (this.nextPlayTime == 0) {
      this.nextPlayTime = time;
    }
    if (time >= this.nextPlayTime) {
      this.player.triggerAttackRelease(this.note, "16n", time);
      this.nextPlayTime += this.interval;
    }
  }
  fade(time){
    var f = (this.nextPlayTime - time) / this.interval;
    console.log(f)
    return f;
  }
}

var loop = new Tone.Sequence(function(time, step){
  Dream.play(time);
  Tone.Draw.schedule(function(){
    Dream.draw(time);
  }, time);
}, [0], 0.25).start(0);

Tone.Transport.start();

