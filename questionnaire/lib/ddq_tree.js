var drawHead=function(ctx,x0,y0,x1,y1,x2,y2,style)
{
  'use strict';
  x0=parseInt(x0);
  y0=parseInt(y0);
  x1=parseInt(x1);
  y1=parseInt(y1);
  x1=parseInt(x1);
  y2=parseInt(y2);
  var radius=3;
  var twoPI=2*Math.PI;

  // all cases do this.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0,y0);
  ctx.lineTo(x1,y1);
  ctx.lineTo(x2,y2);
  switch(style){
    case 0:
      // curved filled, add the bottom as an arcTo curve and fill
      var backdist=Math.sqrt(((x2-x0)*(x2-x0))+((y2-y0)*(y2-y0)));
      ctx.arcTo(x1,y1,x0,y0,.55*backdist);
      ctx.fill();
      break;
    case 1:
      // straight filled, add the bottom as a line and fill.
      ctx.beginPath();
      ctx.moveTo(x0,y0);
      ctx.lineTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.lineTo(x0,y0);
      ctx.fill();
      break;
    case 2:
      // unfilled head, just stroke.
      ctx.stroke();
      break;
    case 3:
      //filled head, add the bottom as a quadraticCurveTo curve and fill
      var cpx=(x0+x1+x2)/3;
      var cpy=(y0+y1+y2)/3;
      ctx.quadraticCurveTo(cpx,cpy,x0,y0);
      ctx.fill();
      break;
    case 4:
      //filled head, add the bottom as a bezierCurveTo curve and fill
      var cp1x, cp1y, cp2x, cp2y,backdist;
      var shiftamt=5;
      if(x2==x0){
    // Avoid a divide by zero if x2==x0
    backdist=y2-y0;
    cp1x=(x1+x0)/2;
    cp2x=(x1+x0)/2;
    cp1y=y1+backdist/shiftamt;
    cp2y=y1-backdist/shiftamt;
      }else{
    backdist=Math.sqrt(((x2-x0)*(x2-x0))+((y2-y0)*(y2-y0)));
    var xback=(x0+x2)/2;
    var yback=(y0+y2)/2;
    var xmid=(xback+x1)/2;
    var ymid=(yback+y1)/2;

    var m=(y2-y0)/(x2-x0);
    var dx=(backdist/(2*Math.sqrt(m*m+1)))/shiftamt;
    var dy=m*dx;
    cp1x=xmid-dx;
    cp1y=ymid-dy;
    cp2x=xmid+dx;
    cp2y=ymid+dy;
      }

      ctx.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x0,y0);
      ctx.fill();
      break;
  }
  ctx.restore();
};

var drawArrow=function(ctx,x1,y1,x2,y2,style,which,angle,d)
{
  'use strict';
  // Ceason pointed to a problem when x1 or y1 were a string, and concatenation
  // would happen instead of addition
  if(typeof(x1)=='string') x1=parseInt(x1);
  if(typeof(y1)=='string') y1=parseInt(y1);
  if(typeof(x2)=='string') x2=parseInt(x2);
  if(typeof(y2)=='string') y2=parseInt(y2);
  style=typeof(style)!='undefined'? style:3;
  which=typeof(which)!='undefined'? which:1; // end point gets arrow
  angle=typeof(angle)!='undefined'? angle:Math.PI/8;
  d    =typeof(d)    !='undefined'? d    :10;
  // default to using drawHead to draw the head, but if the style
  // argument is a function, use it instead
  var toDrawHead=typeof(style)!='function'?drawHead:style;

  // For ends with arrow we actually want to stop before we get to the arrow
  // so that wide lines won't put a flat end on the arrow.
  //
  var dist=Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
  var ratio=(dist-d/3)/dist;
  var tox, toy,fromx,fromy;
  if(which&1){
    tox=Math.round(x1+(x2-x1)*ratio);
    toy=Math.round(y1+(y2-y1)*ratio);
  }else{
    tox=x2;
    toy=y2;
  }
  if(which&2){
    fromx=x1+(x2-x1)*(1-ratio);
    fromy=y1+(y2-y1)*(1-ratio);
  }else{
    fromx=x1;
    fromy=y1;
  }

  // Draw the shaft of the arrow
  ctx.beginPath();
  ctx.moveTo(fromx,fromy);
  ctx.lineTo(tox,toy);
  ctx.stroke();

  // calculate the angle of the line
  var lineangle=Math.atan2(y2-y1,x2-x1);
  // h is the line length of a side of the arrow head
  var h=Math.abs(d/Math.cos(angle));

  if(which&1){  // handle far end arrow head
    var angle1=lineangle+Math.PI+angle;
    var topx=x2+Math.cos(angle1)*h;
    var topy=y2+Math.sin(angle1)*h;
    var angle2=lineangle+Math.PI-angle;
    var botx=x2+Math.cos(angle2)*h;
    var boty=y2+Math.sin(angle2)*h;
    toDrawHead(ctx,topx,topy,x2,y2,botx,boty,style);
  }
  if(which&2){ // handle near end arrow head
    var angle1=lineangle+angle;
    var topx=x1+Math.cos(angle1)*h;
    var topy=y1+Math.sin(angle1)*h;
    var angle2=lineangle-angle;
    var botx=x1+Math.cos(angle2)*h;
    var boty=y1+Math.sin(angle2)*h;
    toDrawHead(ctx,topx,topy,x1,y1,botx,boty,style);
  }
}

function DDQTREE(question, qEle, savedQuestion) {
  this.question = question;
  this.qEle = qEle;
  this.savedQuestion = savedQuestion;

  if (savedQuestion && "result" in savedQuestion) {
    this.result = savedQuestion.result;
  } else {
    this.result = {
      incorrect: false,
      correct: false,
      maybe: false,
      hint: false,
      selections: [],
    }
  }
  this.lastAnswerHeight = 0;
  this.$q = function(selector) {
    return $(this.qEle).find(selector);
  }
  this.tree = null;
  this.depth_ele = [];
  this.max_depth = 0;
  this.targets = [];
}

DDQTREE.questionType = "ddqtree";
DDQTREE.prototype = {

  loadData: function() {
    var self = this;
    if (this.savedQuestion) { 
      self.$q(".concepts").css("visibility", "hidden");
      self.$q(".targets").css("visibility", "hidden");
      var total = this.result.selections.length, totalEnd = 0;
      $.each(this.result.selections, function(tIdx, cIdx) {
        var $concept = self.$q(".concept[data-ele_id='"+cIdx+"']");
        var $target = self.$q(".target[data-ele_id='"+tIdx+"']");
        setTimeout(function() {
            self.addConcept($concept, $target);
            totalEnd++;
            if (total == totalEnd) {
                setTimeout(function() {
                    self.checkAnswer();
                    self.$q(".concepts").css("visibility", "");
                    self.$q(".targets").css("visibility", "");
                }, 50);
            }
        }, 10);
      });
      return true;
    } 
    return false;
  },

  create: function() {
    var self = this;
    this.tree = self.question.tree[0];
    this.calcTree();
    self.drawAnswers();
    setTimeout(function() {
        self.$q('.concepts').children().each(function(idx, concept_div) {
          if ($(concept_div).height() > self.max_height) {
            self.max_height = $(concept_div).height();
          }
        });
        self.drawQuestion();
        if(!self.loadData()) {
            setTimeout(function() {
                self.redrawQuestions();
                self.$q(".concepts").css("visibility", "");
                self.$q(".targets").css("visibility", "");
            }, 10);
        }
    }, 100);
  },
 
  calcTree: function() {

    var self = this;
    var depth_ele = this.depth_ele;
  
    var depth = 0;    
    var ele_id = 0;
    function tree_walk(ele) {
      ele.depth = depth
      if (depth == 0) ele.parent_id = -1;
      ele.ele_id = ele_id;
      ele_id++;
      depth_ele[depth] = depth_ele[depth] || [];
      depth_ele[depth].push(ele);
      if (depth_ele[depth].length > self.max_depth)
        self.max_depth = depth_ele[depth].length;
      if (ele.children === undefined) {
      } else { 
        for (var i=0;i<ele.children.length; i++) {
          depth++;
          ele.children[i].parent_id = ele.ele_id;
          tree_walk(ele.children[i]);
        }
      }
      depth--;
      return;
    }
    tree_walk(this.tree);
  },

  drawQuestion: function() {
    var self = this;
    var depth_ele = this.depth_ele;
    var $t = $("<div>").attr("class","ddqt-table");
    $t.appendTo(this.$q(".targets"));

    for (var i=0;i<depth_ele.length;i++) {
      if (i>0) {
        var $tr = $("<div>").attr("class", "ddqt-col")
          .css("width", 15/depth_ele.length + "%")
          .appendTo($t);
        var $cell = $("<div>").attr("class","ddqt-arrow-cell")
          .appendTo($tr);  
        var $canvas = $("<canvas>")
          .attr("width",$cell.width())
          .attr("height",$cell.height())
          .appendTo($cell)[0];
      }

      var $tr = $("<div>")
        .addClass("ddqt-col target-col")
        .css("width", 85/depth_ele.length + "%")
        .data("depth", i)
        .appendTo($t);
    }

    this.height = this.max_depth;
    this.cell_height = this.max_height + 4;//0.80*this.height/this.max_depth;
    for (var i=depth_ele.length-1;i>=0;i--) {
      var $tr = $(self.$q(".target-col")[i]);
      var top = -1/this.max_depth/2.0-1/depth_ele[i].length/2;
      for (var j=0;j<depth_ele[i].length;j++) {
        var $target = $("<div>")
            .addClass("target")
            .css("height", this.cell_height + "px")
            .appendTo($tr)  
            .attr("data-ele_id", depth_ele[i][j].ele_id)
            .attr("data-parent_id", depth_ele[i][j].parent_id)
            .data("depth", i)
            .droppable({
              activeClass: "ui-state-hover",
              hoverClass: "ui-state-active",
              drop: function( event, ui ) {
                self.addConcept(ui.draggable[0], event.target);
                return false;
              },
            });

        self.targets.push($target);
      }
    }
    //setTimeout(function() {
    //    self.redrawQuestions();
    //}, 10);
  },

  addConcept: function(concept, target) {
    var self = this;
    //self.lastAnswerHeight = self.$q("#top-answer").height();
    if ($(target).children().length) {
      $(target).children()
          .css("position", "relative")
          .css("border", "2px dashed orange")
      $ele = $(target).children().eq(0).width(this.cell_width);
      self.$q(".concepts").append($ele);
    }
    $(target).height($(concept).height()+8);
    $(target).append(concept);
    $(concept)
      .css("border", "2px solid white")
      .css("position", "absolute")
      .css("top", "0px")
      .css("left", "0px")
      .css("right", "0px")
      .css("bottom", "0px")
      .css("z-index", "0")
      .css("width", "")
      .data("dragged", "true")
    setTimeout(function() {
      $(concept).data("dragged", "")
    },100);

    self.checkDone();
    self.redrawQuestions();
  },

  resizeHeight: function() {
    var self = this;
    this.$q(".target").each(function(k,ele) {
        if ($(ele).children().length == 0)
            $(ele).height(self.cell_height);
    });

  },

  drawArrows: function(canvas, y1, y2) {

    var h = canvas.height;
    var w = canvas.width;
    var ctx= canvas.getContext("2d");

    //ctx.lineWidth = 5;
    ctx.fillStyle = ctx.strokeStyle = '#999';
    var padding = 5;
    
    x1 = padding;
    x2 = w-padding;
    ctx.beginPath();
    drawArrow(ctx, x1, y1, x2, y2);
    ctx.stroke();
  },

  redrawQuestions: function() {
    var self = this;
    self.resizeHeight();
    var depth_ele = this.depth_ele;
    var canvas = self.$q("canvas");

    //last target boxes
    for (var j=0;j<depth_ele[depth_ele.length-1].length;j++) {
      var ele = this.$q(".target[data-ele_id='"+depth_ele[depth_ele.length-1][j].ele_id+"']");
      console.log(ele);
    }
    for (var i=depth_ele.length-2;i>=0;i--) {
      $(canvas[i]).attr("width",$(canvas[i]).parent().width())
      $(canvas[i]).attr("height",$(canvas[i]).parent().height())
      for (var j=0;j<depth_ele[i].length;j++) {
        $eles = this.$q(".target[data-parent_id='"+depth_ele[i][j].ele_id+"']");
        var ele = this.$q(".target[data-ele_id='"+depth_ele[i][j].ele_id+"']");
        var _top = 0;
        if ($eles.length) {
          var min=1000;
          var max=0;
          $eles.each(function(k,ele) {
            var $ele=$(ele);
            if ($ele.position().top + $ele.height() > max)
                max = $ele.position().top + $ele.height();
            if ($ele.position().top < min)
                min = $ele.position().top;
          });
          if (j>0) {
           _top -= this.$q(".target[data-ele_id='"+depth_ele[i][j-1].ele_id+"']").height() + 20;
          }      
          var top = (max + min) / 2 - $(ele).height() / 2 + _top ;
        } else {
          if (j>0) {
           _top -= this.$q(".target[data-ele_id='"+depth_ele[i][j-1].ele_id+"']").height() + 20;
          }      
          var top = _top  + 20;
        }
        if (top < 0) top = 0;
        $(ele).css("top", top + "px");

        var y1 = $(ele).position().top + $(ele).height() / 2 + 20;
        $eles.each(function(k,ele) {
          y2 = $(ele).position().top + $(ele).height() / 2 + 20;
          self.drawArrows(canvas[i], y1, y2);
        });
      }
    }
  },

  drawAnswers: function() {
    var self = this;
    var depth_ele = this.depth_ele;
    var concepts = [];
    for (var i=0;i<depth_ele.length;i++) {
      for (var j=0;j<depth_ele[i].length;j++) {
        concepts.push(depth_ele[i][j]);
      }
    }
    concepts = shuffle(concepts);

    this.cell_width = 85/depth_ele.length + "%";
    this.max_height = 0;

    //void 
    for (var i=0; i<concepts.length; i++) {
      var concept = concepts[i];
      var $concept_div = $("<div>").addClass('concept')
            .attr("data-parent_id", concept.parent_id)
            .attr("data-ele_id", concept.ele_id)
            .css("width", self.cell_width)
            .data("depth", concept.depth)

      if (concept.image) {
        $("<img>").attr("src", concept.image)
            .addClass("concept-image")
            .appendTo($("<span>").appendTo($concept_div));
      }
      var $concept_text = $("<span>").html(concept.text)
        .addClass('concept-text')
        .addClass(concept.image ? "": "text-only")
        .appendTo($concept_div)

      $concept_div.draggable({ 
        containment: self.qEle,
        start: function( event, ui ) {
          $(event.target)
            .css("border", "2px dashed orange")
            .css("bottom", "")
            .css("right", "")
            .css("z-index", "100")
        },
      });
      self.$q('.concepts').append($concept_div);
      if ($concept_div.height() > this.max_height) {
        this.max_height = $concept_div.height();
      }
    };

    //$(self.qEle).droppable({
    //  activeClass: "ui-state-hover",
    //  hoverClass: "ui-state-active",
    //  drop: function( event, ui ) {
    //    if ($(ui.draggable[0]).data("dragged")) {
    //      $(ui.draggable[0]).data("dragged", ""); 
    //    } else {
    //      self.$q(".concepts").append(ui.draggable[0]);
    //      $(ui.draggable[0])
    //        .css("border", "2px dashed orange")
    //        .css("position", "relative")
    //        .css("left", "0")
    //        .css("top", "0");
    //      self.redrawQuestions();
    //    }
    //  }
    //});
  
    self.$q("#send-button").hide(); 
    self.$q("#check-button").click(function(){
      self.checkAnswer();
      self.submit();
    });
  },

  checkDone: function() {
    var self = this;
    var done = true;
    for (var i=0;i<this.targets.length;i++) {
      if (this.targets[i].children().length != 1) 
        done = false;
    }

    self.$q("#check-button").toggle(done);
    //if (done && self.lastAnswerHeight > 0)
    //    self.$q("#top-answer").height(self.lastAnswerHeight);
    return done;
  },

  _checkDepth: function(ele) {
    return $(ele).parent().data("depth") == $(ele).data("depth");
  },
  
  getSelection: function() {
    var selections = [];
    this.$q(".target").each(function(tIdx, target) {
      selections[tIdx] = parseInt($(target).children()[0].dataset.ele_id);
    })
    return selections;
  },

  checkAnswer: function() {
    var self = this;
    this.result.correct = true;
    this.result.selections = this.getSelection();
    self.$q(".target").each(function(k,cell) {
      var parent_cell = self.$q(".target[data-ele_id='"+cell.dataset.parent_id+"']");
      var parent_ans = $(parent_cell).children()[0];
      var ans = $(cell).children()[0]; 
      $(ans).parent().css("border", "2px solid");
      if ((ans.dataset.parent_id == -1 && parent_ans !== undefined) ||
          (parent_ans && ans.dataset.parent_id != parent_ans.dataset.ele_id) ||
           self._checkDepth(ans) == false) {
        $(ans).parent().css("border-color", "red");
        self.result.incorrect = true;
        self.result.correct = false;
      } else {
        $(ans).parent().css("border-color", "green");
      }
      try {
        $(ans).draggable( "destroy" );
      } catch(e) { }
    })
    self.$q("#check-button").hide();
    self.$q("#send-button").show();
    return true;
  },
  
  test: function() {
    var self = this;
    setTimeout(function() {
      self.$q(".concept").each(function(i, concept) {
          var c2 = $(concept).clone(true)
          c2.appendTo(".concepts");
      });
      self.$q(".concept").each(function(i, concept) {
          var parent_id = $(concept).attr('data-ele_id')
          var $target = $(".target[data-ele_id='" + parent_id + "'");
          self.addConcept(concept, $target);
      });
    }, 500);
  },

  test_correct: function() {
    var self = this;
    setTimeout(function() {
      selt.$q(".concept").each(function(i, concept) {
          var parent_id = $(concept).attr('data-ele_id')
          var $target = self.$q(".target[data-ele_id='" + parent_id + "'");
          self.addConcept(concept, $target);
      });
    }, 1000);
  },

  loadCorrect: function() {
  }
}

Questionnaire.registerType(DDQTREE);

window.test_d1 = function(cont) {
  test( "ddqtree_1", function() {
    ok(Questionnaire, "load Questionnaire lib" );
    Questionnaire.getInstance().test();
  });
};
