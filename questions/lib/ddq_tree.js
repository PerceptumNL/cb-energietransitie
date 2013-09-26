function canvas_arrow(context, fromx, fromy, tox, toy){
    var headlen = 10;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
}

function DDQTREE(question, qEle) {
  this.question = question;
  this.qEle = qEle;
  this.result = {
    incorrect: false,
    correct: false,
    maybe: false,
    hint: false,
    selections: [],
  }
  this.$q = function(selector) {
    return $(this.qEle).find(selector);
  }
}

DDQTREE.questionType = "ddqtree";
DDQTREE.prototype = {
  result: {},
  tree: null,
  depth_ele: [],
  targets: [],
  answers: [],

  create: function() {
    var self = this;
    $(this.qEle).addClass("ddqtree");
    tree = self.question.tree[0];
    
    this.drawQuestion();
    this.drawAnswers();
  },


  drawQuestion: function() {
    var self = this;
    var depth = 0,    
        max_depth = 0;
    var depth_ele = this.depth_ele;
    var ele_id = 0;
  
    function tree_walk(ele) {
      if (depth == 0) ele.parent_id = -1;
      ele.ele_id = ele_id;
      ele_id++;
      depth_ele[depth] = depth_ele[depth] || [];
      depth_ele[depth].push(ele);
      if (depth_ele[depth].length > max_depth)
        max_depth = depth_ele[depth].length;
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
    tree_walk(tree);
    this.$q("#question").removeClass("left-col");
    this.$q("#q-text").html("");
    $t = $("<div>").attr("class","ddqt-table");
    $t.appendTo(this.$q("#q-text"));
    for (var i=0;i<depth_ele.length;i++) {
      if (i>0) {
        var $tr = $("<div>").attr("class", "ddqt-col")
          .css("width", 30/depth_ele.length + "%")
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
        .css("width", 70/depth_ele.length + "%")
        .appendTo($t);
    }

    var height = $("#q-table").height()
    for (var i=depth_ele.length-1;i>=0;i--) {
      $tr = $($(".target-col")[i]);
      var top = -1/max_depth/2.0-1/depth_ele[i].length/2;
      for (var j=0;j<depth_ele[i].length;j++) {
        var $target = $("<div>")
            .addClass("ddqt-cell")
            .css("height", (0.80*height/max_depth))
            .css("margin-bottom", (0.20*height/max_depth))
            .appendTo($tr)  
            .attr("data-ele_id", depth_ele[i][j].ele_id)
            .attr("data-parent_id", depth_ele[i][j].parent_id)
            .droppable({
              tolerance: "pointer",
              greedy: true,
              activeClass: "ui-state-hover",
              hoverClass: "ui-state-active",
              drop: function( event, ui ) {
                try {
                  console.log("Dropped");
                  $(event.target).append(ui.draggable[0]);
                  console.log(event.target);
                  console.log(ui.draggable[0]);
                  //$(event.target).css("height", "");
                  $(event.target).height($(ui.draggable[0]).height()+5);
                  ui.draggable[0].dataset.top = $(ui.draggable[0]).position().top;
                  ui.draggable[0].dataset.left = $(ui.draggable[0]).position().left;
                  $(ui.draggable[0])
                    .css("position", "absolute")
                    .css("width", "")
                    .css("top", "0px")
                    .css("left", "0px")
                    .css("right", "0px")
                    .css("bottom", "0px")
                    .css("border", "2px solid orange");
                  self.check_done();
                  self.redrawQuestions();
                } catch(e) {
                  console.error(e);
                }
              },
            });

        self.targets.push($target);
      }
    }
    setTimeout(function() {
        self.redrawQuestions();
    }, 10);
  },

  drawArrows: function(canvas, y1, y2) {

    var h = canvas.height;
    var w = canvas.width;
    var ctx= canvas.getContext("2d");

    ctx.lineWidth = 5;
    ctx.fillStyle = ctx.strokeStyle = '#999';
    var padding = 5;
    
    x1 = padding;
    x2 = w-padding;
    ctx.beginPath();
    canvas_arrow(ctx, x1, y1, x2, y2);
    ctx.stroke();
  },

  redrawQuestions: function() {
    var self = this;
    var depth_ele = this.depth_ele;
    
    var canvas = $("canvas");
    for (var i=depth_ele.length-2;i>=0;i--) {
      $(canvas[i]).attr("width",$(canvas[i]).parent().width())
      $(canvas[i]).attr("height",$(canvas[i]).parent().height())
      for (var j=0;j<depth_ele[i].length;j++) {
        $eles = $(".ddqt-cell[data-parent_id='"+depth_ele[i][j].ele_id+"']");
        var min=1000;
        var max=0;
        $eles.each(function(k,ele) {
          $ele=$(ele);
          if ($ele.position().top + $ele.height() > max)
              max = $ele.position().top + $ele.height();
          if ($ele.position().top < min)
              min = $ele.position().top;
        });
        ele = $(".ddqt-cell[data-ele_id='"+depth_ele[i][j].ele_id+"']");
        var _top = 0;
        if (j>0) {
         _top = $(".ddqt-cell[data-ele_id='"+depth_ele[i][j-1].ele_id+"']").position().top;
         _top-=$(ele).height()/2;
        }      
        var top = (max + min) / 2 - $(ele).height() / 2 - _top;
        $(ele).css("top", top + "px");

        var y1 = $(ele).position().top + $(ele).height() / 2;
        $eles.each(function(k,ele) {
          y2 = $(ele).position().top + $(ele).height() / 2
          self.drawArrows(canvas[i], y1, y2);
        });
      }
    }
  },

  drawAnswers: function() {
    var self = this;
    var depth_ele = this.depth_ele;
    self.$q(".option").html("");
    self.$q("#answer").removeClass("right-col");
    self.$q("#a-table").attr("id", "").css("margin", "20px auto");

    var concepts = [];
    for (var i=0;i<depth_ele.length;i++) {
      for (var j=0;j<depth_ele[i].length;j++) {
        ele = depth_ele[i][j];
        concepts.push(ele);
      }
    }
    concepts = shuffle(concepts);

    $.each(concepts, function(i, concept) {

      var concept_div = $("<div>")
            .text(concept.text)
            .addClass('concept')
            .attr("data-parent_id", concept.parent_id)
            .attr("data-ele_id", concept.ele_id)
            .css("text-align", "center")
            .css("display", "inline-block")
            .css("width", "150")

      if (concept.image) {
        $("<img>").attr("src", concept.image)
          .attr("width", "100")
          .css("display", "block")
          .css("margin", "auto")
          .prependTo(concept_div);
      }

      $(concept_div).draggable({ 
        start: function( event, ui ) {
            var top = event.target.dataset.top
            var left = event.target.dataset.left
            console.log(top);
            console.log(left);
            $(event.target)
            .css("text-align", "center")
            .css("display", "inline-block")
            .css("width", "150")
            .css("position", "relative")
            .css("top", top)
            .css("left", left)
        },
      });
      self.$q('.option').append(concept_div);
    });

    $('body').droppable({
      tolerance: "pointer",
      activeClass: "ui-state-hover",
      hoverClass: "ui-state-active",
      drop: function( event, ui ) {
        self.$q(".option").append(ui.draggable[0]);
        $(ui.draggable[0])
          .css("border", "2px dashed orange")
          .css("left", "0")
          .css("top", "0");
      }
    });
  
    self.$q("#send-button").hide(); 
    self.$q(".table-feedback").show();
    self.$q(".table-feedback").css("border", "none");

    self.$q("#check-button").click(function(){
      if (self.check_answer()) {
        self.$q("#check-button").hide();
        self.$q("#send-button").show();
      }
    });
  },

  draw_question: function() {
    var self = this;
    var depth = 0,    
        max_depth = 0;
    var depth_ele = this.depth_ele;
    var ele_id = 0;
  
    function tree_walk(ele) {
      if (depth == 0) ele.parent_id = -1;
      ele.ele_id = ele_id;
      ele_id++;
      depth_ele[depth] = depth_ele[depth] || [];
      depth_ele[depth].push(ele);
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
  
    tree_walk(tree);
    $t = $("<div>").attr("class","ddqt-table");
    this.$q("#q-text").html("");
    $t.appendTo(this.$q("#q-text"));
    for (var i=0;i<depth_ele.length;i++) {
      $tr = $("<div>").attr("class", "ddqt-row").css("height",(20/depth_ele.length)+"%").appendTo($t);
      
      var cells = [];
      for (var j=0;i>0 && j<depth_ele[i].length;j++) {
        var $cell = $("<div>").attr("class","ddqt-arrow-cell").css("width", (100/depth_ele[i].length)+"%").appendTo($tr);  
        cells.push($cell);
      }
      for (var j=0;j<cells.length;j++) {
        var $cell = cells[j];
        var $canvas = $("<canvas width='"+$cell.width()+"' height='"+$cell.height()+"'>").appendTo($cell)[0];
        var h = $canvas.height;
        var w = $canvas.width;
        var ctx=$canvas.getContext("2d");

        ctx.lineWidth = 5;
        ctx.fillStyle = ctx.strokeStyle = '#999';
        var padding = 5;
        if (j % 2 == 0) {
          y1 = padding;
          y2 = h-padding;
          x1 = w-padding;
          x2 = w/1.5;
        } else {
          y1 = padding;
          y2 = h-padding;
          x1 = padding;
          x2 = w/3;
        }
        ctx.beginPath();
        canvas_arrow(ctx, x1, y1, x2, y2);
        ctx.stroke();
      }
      $tr = $("<div>").attr("class", "ddqt-row").css("height", (80/depth_ele.length)+"%").appendTo($t);
      for (var j=0;j<depth_ele[i].length;j++) {
          var $target = $("<div>")
              .attr("class", "ddqt-cell")
              .css("width", (100/depth_ele[i].length)+"%")
              .appendTo($tr)  
              .attr("data-ele_id", depth_ele[i][j].ele_id)
              .attr("data-parent_id", depth_ele[i][j].parent_id)
              .droppable({
            tolerance: "pointer",
            greedy: true,
            activeClass: "ui-state-hover",
            hoverClass: "ui-state-active",
            drop: function( event, ui ) {
              //$target.answers.push(ui.draggable[0]);
              $(event.target).append(ui.draggable[0]);
              $(ui.draggable[0]).css("left", "0px");
              $(ui.draggable[0]).css("top", "0px");
              $(ui.draggable[0]).css("border", "2px solid orange");

              self.check_done();
            }
          });
          self.targets.push($target);
      }
    }
  },

  check_done: function() {
    var self = this;
    var end = true;
    for (var i=0;i<this.targets.length;i++) {
      if (this.targets[i].children().length != 1) 
        end = false;
    }

    if (!end) {
      self.$q("#check-button").hide();
      return false;
    } else {
      self.$q("#check-button").show();
      return true;
    }
  },
  
  check_answer: function() {
    var self = this;
    this.result.correct = true;
    $(".ddqt-cell").each(function(k,cell) {
      parent_cell = $(".ddqt-cell[data-ele_id='"+cell.dataset.parent_id+"']");
      parent_ans = $(parent_cell).children()[0];
      ans = $(cell).children()[0]; 
      if ((ans.dataset.parent_id == -1 && parent_ans !== undefined) ||
          (parent_ans && ans.dataset.parent_id != parent_ans.dataset.ele_id)) {
        self.result.correct = false;
        $(ans).css("border-color", "red");
      } else {
        $(ans).css("border-color", "green");
      }
    })
    return result.correct;
  }
}

Questionnaire.registerType(DDQTREE);
