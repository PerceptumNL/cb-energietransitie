
function shuffle(array) {
  var currentIndex = array.length
    , temporaryValue
    , randomIndex
    ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


function canvas_arrow(context, fromx, fromy, tox, toy){
    var headlen = 10;   // length of head in pixels
    var angle = Math.atan2(toy-fromy,tox-fromx);
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
    context.moveTo(tox, toy);
    context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
}

var DDQTREE = function(question, qEle) {
  return Trait.create(
    Object.prototype,
    Trait.compose(
      QuestionTrait,
      Trait({

        questionType: "ddqtree",
        question: question,
        result: {},
        tree: null,
        qEle: qEle,
        depth_ele: [],
        targets: [],
        answers: [],

        create_question: function() {
          tree = question.tree[0];
          console.log(tree);

          result = {
            incorrect: false,
            correct: false,
            maybe: false,
            hint: false,
          }
          
          //this.draw_question();
          this.draw_question_horizontal();
          this.draw_answers();
        },

        draw_question_horizontal: function() {
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
          $t = $("<div>").attr("class","ddqt-table");
          $q("#q-text").html("");
          $q("#question").removeClass("left-col");
          $t.appendTo($q("#q-text"));
          for (var i=0;i<depth_ele.length;i++) {

            
            var cells = [];
            if (i>0) {
              $tr = $("<div>").attr("class", "ddqt-col")
                .css("width", 20/depth_ele.length + "%")
                .css("height", "100%")
                .css("display", "inline-block")
                .appendTo($t);
              var $cell = $("<div>").attr("class","ddqt-arrow-cell")
                .css("height", "100%")
                .css("float", "left")
                .css("width", "100%")
                .appendTo($tr);  
              cells.push($cell);
            }

            for (var j=0;j<cells.length;j++) {
              var $cell = cells[j];
              var $canvas = $("<canvas>")
                .attr("width",$cell.width())
                .attr("height",$cell.height())
                .appendTo($cell)[0];

              var h = $canvas.height;
              var w = $canvas.width;
              var ctx=$canvas.getContext("2d");

              ctx.lineWidth = 5;
              ctx.fillStyle = ctx.strokeStyle = '#999';
              var padding = 5;
            
              y2 = -h/depth_ele[i].length/2
              y1 = -h/depth_ele[i-1].length/2
              for (var k=0; k<depth_ele[i-1].length; k++) {
                children = depth_ele[i-1][k].children;
                y1 += h/depth_ele[i-1].length;
                for (var z=0;z<children.length;z++) {
                  x1 = padding;
                  x2 = w-padding;
                  y2 += h/depth_ele[i].length;
                  ctx.beginPath();
                  canvas_arrow(ctx, x1, y1, x2, y2);
                  ctx.stroke();
                }
              }
            }

            $tr = $("<div>").attr("class", "ddqt-col")
                    .css("width", 80/depth_ele.length + "%")
                    .css("height", "100%")
                    .css("position", "relative")
                    .css("display", "inline-block")
                    .appendTo($t);

            var top = -1/max_depth/2.0-1/depth_ele[i].length/2;
            for (var j=0;j<depth_ele[i].length;j++) {
              var $target = $("<div>")
                  .attr("class", "ddqt-cell")
                  .css("width", "100%")
                  .css("height", (100/max_depth)+"%")
                  .css("display", "block")
                  .css("position", "absolute")
                  .appendTo($tr)  
                  .attr("data-ele_id", depth_ele[i][j].ele_id)
                  .attr("data-parent_id", depth_ele[i][j].parent_id)
                  .droppable({
                    greedy: true,
                    activeClass: "ui-state-hover",
                    hoverClass: "ui-state-active",
                    drop: function( event, ui ) {
                      $(event.target).append(ui.draggable[0]);
                      $(ui.draggable[0])
                        .css("left", "0px")
                        .css("top", "0px")
                        .css("float", "left")
                        .css("border", "2px solid orange");
                      self.check_done();
                    }
                  });

          
                top += 1/depth_ele[i].length
                console.log("top: ", top);
                $target.css("top", (100*top) + "%");
              self.targets.push($target);
            }
          }
        },

        draw_answers: function() {
          var self = this;
          var depth_ele = this.depth_ele;
          $q(".option").html("");
          $q("#answer").removeClass("right-col");
          $q("#a-table").attr("id", "").css("margin", "20px auto");
        

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
                  .css("width", "100")

            if (concept.image) {
              $("<img>").attr("src", concept.image)
                .attr("width", "100")
                .css("display", "block")
                .css("margin", "auto")
                .prependTo(concept_div);
            }

            $(concept_div).draggable();
            $q('.option').append(concept_div);
          });

          $('body').droppable({
            activeClass: "ui-state-hover",
            hoverClass: "ui-state-active",
            drop: function( event, ui ) {
              $q(".option").append(ui.draggable[0]);
              $(ui.draggable[0])
                .css("border", "2px dashed orange")
                .css("left", "0")
                .css("top", "0");
            }
          });
      
          $q("#send-button").hide(); 
          $q(".table-feedback").show();
          $q(".table-feedback").css("border", "none");

          $q("#check-button").click(function(){
            if (self.check_answer()) {
              $q("#check-button").hide();
              $q("#send-button").show();
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
          $q("#q-text").html("");
          $t.appendTo($q("#q-text"));
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
            $q("#check-button").hide();
            return false;
          } else {
            $q("#check-button").show();
            return true;
          }
        },
      
        check_answer: function() {
          result.correct = true;
          $(".ddqt-cell").each(function(k,cell) {
            parent_cell = $(".ddqt-cell[data-ele_id='"+cell.dataset.parent_id+"']");
            parent_ans = $(parent_cell).children()[0];
            ans = $(cell).children()[0]; 
            if ((ans.dataset.parent_id == -1 && parent_ans !== undefined) ||
                (parent_ans && ans.dataset.parent_id != parent_ans.dataset.ele_id)) {
              result.correct = false;
              $(ans).css("border-color", "red");
            } else {
              $(ans).css("border-color", "green");
            }
          })
          return result.correct;
        }
      })
    )
  )
}

Questionnaire.registerType(DDQTREE);
