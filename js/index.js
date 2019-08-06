// JavaScript Document
//-----------------------tools-----------------
;(function(){
	var Tools = {
	getRandom: function(min,max){
		return Math.floor(Math.random()*(max - min + 1)) + min;
	}
}
	window.Tools = Tools;
})()

//-------------------food-------------
;(function (){
	var elements = [];//记录上一次删除的食物，为删除做准备
	function Food(options){
		options = options || {};
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.width = options.width || 20;
		this.height = options.height || 20;
		this.color = options.color || 'green';
	}
	//渲染
	Food.prototype.render = function(map){
		//删除之前创建的食物
		remove();
		//随机设置x和y的值
		this.x = Tools.getRandom(0,map.clientWidth / this.width - 1)*this.width;
		this.y = Tools.getRandom(0,map.clientHeight / this.height - 1)*this.height;
		//动态创建div，页面上显示的食物
		var div = document.createElement('div');
		map.appendChild(div);
		elements.push(div);
		//设置div样式
		div.style.left = this.x + 'px';
		div.style.top = this.y + 'px';
		div.style.position = 'absolute';
		div.style.width = this.width + 'px';
		div.style.height = this.height + 'px';
		div.style.backgroundColor = this.color;
	}
	function remove(){
		for (var i=elements.length - 1;i>=0;i--){
			//删除div
			elements[i].parentNode.removeChild(elements[i]);
			//删除数组中的元素
			elements.splice(i,1);
		}
	}
	//把Food构造函数外部可以访问
	window.Food = Food;
})()

//----------------------snake-----------------
;(function (){
	
	var elements = [];//记录之前创建的蛇
	function Snake(options) {
		options = options || {};
		//蛇节大小
		this.width = options.width || 20;
		this.height = options.height || 20;
		//蛇移动的方向
		this.direction = options.direction || 'right';
		//蛇的身体（蛇节）第一个元素是蛇头
		this.body = [
			{x:3,y:2,color:'red'},
			{x:2,y:2,color:'blue'},
			{x:1,y:2,color:'blue'}
		];
		this.score = 0; //初始化分数是0
	}
	Snake.prototype.render = function(map){
		//删除之前创建的蛇
		remove();
		//把每一个蛇节渲染到地图上
		for(var i = 0,len = this.body.length;i<len;i++){
			//蛇节
			var object = this.body[i];
			var div = document.createElement('div');
			map.appendChild(div);
			//记录当前蛇
			elements.push(div);
			//设置样式
			div.style.position = 'absolute';
			div.style.width = this.width + 'px';
			div.style.height = this.height + 'px';
			div.style.left = object.x*this.width + 'px';
			div.style.top = object.y*this.height + 'px';
			div.style.backgroundColor = object.color;
		}
	}
	function remove(){
		for(var i =elements.length - 1;i>=0;i--){
			//删除div
			elements[i].parentNode.removeChild(elements[i]);
			//删除数组中的元素
			elements.splice(i,1);
		}
	}
	//控制蛇移动的方法
	Snake.prototype.move = function(food,map){
		//控制蛇的身体（当前蛇节到上一个蛇节的位子）
		for(var i = this.body.length-1;i>0;i--){
			this.body[i].x = this.body[i-1].x;
			this.body[i].y = this.body[i-1].y;
		}
		//控制蛇头的移动
		//判断蛇移动的方向
		var head = this.body[0];
		switch(this.direction) {
			case 'right': 
				head.x += 1;
				break;
			case 'left':
				head.x -= 1;
				break;
			case 'top':
				head.y -= 1;
				break;
			case 'bottom':
				head.y += 1;
				break;
		}
		var headX = head.x * this.width;
		var headY = head.y * this.height;
		if(headX === food.x && headY === food.y){
			//让蛇增加一节
			var last = this.body[this.body.length - 1];
			this.body.push({
				x:last.x,
				y:last.y,
				color:last.color
			})
			this.score++; //分数加一
			//随机在地图上重新生成食物
			food.render(map);
		}
	}
	window.Snake = Snake;//暴露构造函数给外部
})()
//--------------------game-------------------
;(function (){
	var that;
	function Game(map){
		this.food = new Food();
		this.snake = new Snake();
		this.map = map;
		that = this;
	}
	
	Game.prototype.start = function() {
		//把蛇和食物对象渲染到地图
		this.food.render(this.map);
		this.snake.render(this.map);
		//开始游戏逻辑
		//让蛇移动
		//当蛇遇到边界或吃到自己游戏结束
		runSnake();
		//通过键盘控制蛇
		bindkey();
		
	};
	function runSnake(){
		var timeId = setInterval(function(){
			//让蛇走一格
			that.snake.move(that.food,that.map);
			that.snake.render(that.map);
			//判断游戏结束
			var maxX = that.map.clientWidth / that.snake.width;
			var maxY = that.map.clientHeight / that.snake.height;
			var headX = that.snake.body[0].x;
			var headY = that.snake.body[0].y;
			if(headX < 0 || headX >= maxX){
				alert('game over,你的分数是：' + that.snake.score + '分');
				clearInterval(timeId);
			}
			if(headY < 0 || headY >= maxY){
				alert('game over,你的分数是：' + that.snake.score + '分');
				clearInterval(timeId);
			}
			//吃到自己的身体，游戏结束，因为不可能吃到前4节所以从第5节开始
			for(var i = 4;i<that.snake.body.length;i++){
				if(that.snake.body[0].x === that.snake.body[i].x && that.snake.body[0].y === that.snake.body[i].y){
					alert('game over,你的分数是：' + that.snake.score + '分');
					clearInterval(timeId);
				}
			}
		},150);
	}
	function bindkey(){
		document.addEventListener('keydown',function(e){
			switch(e.keyCode){
				case 37:
					if(that.snake.direction !== 'right'){ //不允许直接180度返回
						that.snake.direction = 'left';
					}
					break;
				case 38:
					if(that.snake.direction !== 'bottom'){
						that.snake.direction = 'top';
					}
					break;
				case 39:
					if(that.snake.direction !== 'left'){
						that.snake.direction = 'right';
					}
					break;
				case 40:
					if(that.snake.direction !== 'top'){
						that.snake.direction = 'bottom';
					}
					break;
			}
		},false);
	}
	window.Game = Game;
})()

//------------------------调用-------------------
;(function(){
	var map = document.getElementById('map');
	var game = new Game(map);
	game.start();
})();
