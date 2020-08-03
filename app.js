var LOWESTNOTE = 20; // Hz
var OCTAVES = 8;
var WIDTH = 400;
var HEIGHT = 400;

function pixelsForSeconds(seconds){
  return WIDTH * Math.log(seconds)/Math.log(60)/(6 * 0.75);
}

function pixelsForHz(hz){
  return HEIGHT * Math.log2(hz / LOWESTNOTE) / OCTAVES;
}

var Dream = {
  touch: document.querySelector('#touch'),
  notes: [],
  labels: {
    x: {
      "second": 1,
      "minute": pixelsForSeconds(60),
      "hour": pixelsForSeconds(3600),
      "day": pixelsForSeconds(3600 * 24),
      // "week": pixelsForSeconds(3600 * 24 * 7),
      "month": pixelsForSeconds(3600 * 24 * 30),
      "year": pixelsForSeconds(3600 * 24 * 365),
    },
    y: {
      "31": pixelsForHz(31),
      "63": pixelsForHz(63),
      "125": pixelsForHz(125),
      "250": pixelsForHz(250),
      "500": pixelsForHz(500),
      "1k": pixelsForHz(1000),
      "2k": pixelsForHz(2000),
      "4k": pixelsForHz(4000),
    }
  },
  addNote: function(x, y){
    this.notes.push(new Note(x / WIDTH, 1 - y / HEIGHT));
  },
  init: function(){
    this.touch.addEventListener('click', function(e){
      var rect = e.target.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      Dream.addNote(x, y);
    })
    this.ctx = this.touch.getContext("2d");
    this.drawLabels();
  },
  drawLabels: function(){
    var xlabels = document.querySelector('.xlabels');
    var ylabels = document.querySelector('.ylabels');
    for(label of Object.keys(this.labels.x)){
      var div = document.createElement("div");
      div.className = "label";
      div.style.left = this.labels.x[label] + "px";
      div.textContent = label;
      xlabels.append(div);
    }
    for(label of Object.keys(this.labels.y)){
      var div = document.createElement("div");
      div.className = "label y";
      div.style.bottom = this.labels.y[label] + "px";
      div.textContent = label;
      ylabels.append(div);
    }
  },
  play: function(time){
    for(note of this.notes){
      note.play(time);
    }
  },
  draw: function(time){
    this.ctx.clearRect(0, 0, this.touch.width, this.touch.height);
    this.ctx.strokeStyle = "#00FF00";
    this.ctx.lineWidth = 1;
    // line at bottom
    this.ctx.moveTo(0, HEIGHT - 1);
    this.ctx.lineTo(WIDTH, HEIGHT - 1);
    this.ctx.stroke();
    // graph lines
    for(index in this.labels.x){
      var x = this.labels.x[index];
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, HEIGHT);
      this.ctx.stroke();
    }
    for(index in this.labels.y){
      var y = HEIGHT - this.labels.y[index];
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(WIDTH, y);
      this.ctx.stroke();
    }
    // draw notes
    for(note of this.notes){
      note.play(time);
      note.draw(time, this.touch);
    }
  }
}

class Note {
  constructor(x, y){
    this.xFloat = x;
    this.yFloat = y;
    this.pitch = LOWESTNOTE * Math.pow(2, y * OCTAVES);
    this.interval = Math.pow(60, x * 6 * 0.75) * 1000;
    this.nextPlayTime = 0;
    this.player = new Tone.Synth().toMaster();
    this.player.set("envelope", {decay: 0.2, sustain: 0.3, release: 1});
    this.player.set("volume", -12);
  }
  play(time){
    if (this.nextPlayTime == 0) {
      this.nextPlayTime = time;
    }
    if (time >= this.nextPlayTime) {
      this.player.triggerAttackRelease(this.pitch, "16n");
      this.nextPlayTime += this.interval;
    }
  }
  draw(time, touch){
    var ctx = touch.getContext("2d");
    var x = Math.floor(this.xFloat * touch.width);
    var y = Math.floor((1 - this.yFloat) * touch.height);
    var f = (this.nextPlayTime - time) / this.interval;
    f = f * f * f; // easing
    ctx.strokeStyle = "rgba(0,255,0," + f + ")";
    ctx.strokeRect(x - 2, y - 2, 5, 5);
  }
}

Dream.init();

function draw(time){
  Dream.draw(time);
  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);

Tone.Transport.start();