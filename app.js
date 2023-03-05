window.addEventListener('load',()=>{
    const canvas =document.getElementById('canvas1')
    const ctx =canvas.getContext('2d')
    canvas.width=1500
    canvas.height=500

    // opp classes
    class InputHandler{
        constructor(game){
            this.game=game
            window.addEventListener('keydown',(e)=>{
                if((e.key==='ArrowUp' ||
                (e.key==='ArrowDown'))
                && this.game.keys.indexOf(e.key)===-1){
                    this.game.keys.push(e.key)
                }else if(e.key===' '){
                    this.game.player.shootTop()
                }else if(e.key==='d'){
                    this.game.debug=!this.game.debug
                }
            })
            window.addEventListener('keyup',(e)=>{
                if(this.game.keys.indexOf(e.key)>-1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key),1)
                }
            })
        }
    }
    class Projectile{
        constructor(game,x,y){
            this.game=game
            this.x=x
            this.y=y
            this.width=10
            this.height=3
            this.speed=4
            this.markedForDeletion=false
            this.image=document.getElementById('projectile')
        }
        update(){
            this.x+=this.speed
            if(this.x>this.game.width*0.8){
                this.markedForDeletion=true
            }
        }
        draw(context){
            context.drawImage(this.image,this.x,this.y)
        }
    }
    class Particle{
        constructor(game,x,y){
            this.game=game
            this.x=x
            this.y=y
            this.image=document.getElementById('gears')
            this.frameX=Math.floor(Math.random()*3)
            this.frameY=Math.floor(Math.random()*3)
            this.spriteSize=50
            this.sizeModifier=(Math.random()*0.5+0.5).toFixed(1)
            this.size=this.spriteSize*this.sizeModifier
            this.speedX=Math.random()* 6 -3
            this.speedY=Math.random()* -15
            this.gravity=0.5
            this.markedForDeletion=false
            this.angle=0
            this.va =Math.random()* 0.2 - 0.1
            this.bounced = 0
            this.bottomBounceBoundary=Math.random()* 100 + 60

        }
        update(){
            this.angle+=this.va
            this.speedY+=this.gravity
            this.x-=this.speedX+this.game.speed
            this.y+=this.speedY
            if(this.y>this.game.height+this.size ||
                this.x<0-this.size){
                    this.markedForDeletion=true 
                }
            if(this.y>this.game.height-this.bottomBounceBoundary
                && this.bounced <5){
                    this.bounced=true
                    this.speedY*=-0.5
                }    
        }
        draw(context){
            context.save()
            context.translate(this.x,this.y)
            context.rotate(this.angle)
            context.drawImage(this.image,this.frameX*this.spriteSize
                ,this.frameY*this.spriteSize,this.spriteSize
                ,this.spriteSize,this.size*-0.5,this.size*-0.5,this.size,this.size)
            context.restore()
        }
    }
    class Player{
        constructor(game){
            this.game=game
            this.width=120
            this.height=190
            this.y=100
            this.x=20
            this.frameX=0
            this.frameY=0
            this.maxFrame=37
            this.speedY=0
            this.maxSpeed=3
            this.projectiles=[]
            this.image=document.getElementById('player')
            this.powerUp=false
            this.powerTime=0
            this.powerLimit=10000

        }
        update(deltaTime){
            if(this.game.keys.includes('ArrowUp')){
                this.speedY=-this.maxSpeed
            }else if(this.game.keys.includes('ArrowDown')){
                this.speedY=this.maxSpeed
            }else this.speedY=0
            this.y+=this.speedY
            // handle verticle move
            if (this.y>this.game.height-this.height*0.5){
                this.y=this.game.height-this.height*0.5
            }else if(this.y<-this.height*0.5){
                this.y=-this.height*0.5
            }
            // handle projectiles
            this.projectiles.forEach(projectile =>{
                projectile.update()
            })
            this.projectiles=this.projectiles.filter(projectile=>!projectile.markedForDeletion)
            //sprite animation 
            if(this.frameX<this.maxFrame) this.frameX++
            else this.frameX=0
            //pwer up
            if(this.powerUp){
                if(this.powerTime>this.powerLimit){
                    this.powerTime=0
                    this.powerUp=false
                    this.frameY=0
                    this.game.ammo=this.game.ammoMax
                }else{
                    this.powerTime+=deltaTime
                    this.frameY=1
                    this.game.ammo+=0.1
                }
            }
        }
        draw(context){
            if(this.game.debug) {
                context.strokeRect(this.x ,this.y ,this.width ,this.height)
            }
            this.projectiles.forEach(projectile =>{
                projectile.draw(context)
            })
            context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height
                ,this.width,this.height
                ,this.x,this.y,this.width,this.height)
        }
        shootTop(){
            if(this.game.ammo>0){
                this.projectiles.push(new Projectile(this.game,this.x+80,this.y+30))
                this.game.ammo--
            }
            if(this.powerUp)this.shootBottom()
        }
        shootBottom(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game,this.x+80,this.y+175))
            }
            
        }
        enterPowerUp(){
            this.powerTime=0
            this.powerUp=true
            if(this.game.ammo<this.game.ammoMax)this.game.ammo=this.game.ammoMax
        }
    }
    class Enemy{
        constructor(game){
            this.game=game
            this.x=this.game.width
            this.speedX=Math.random() * -1.5 -1
            this.markedForDeletion=false
            this.frameX=0
            this.frameY=0
            this.maxFrame=37
        }
        update(){
            this.x+=this.speedX -this.game.speed
            if (this.x+this.width<0) {
                this.markedForDeletion=true
            }
            //sprite animation
            if (this.frameX< this.maxFrame){
                this.frameX++
            }else {
                this.frameX=0
            }
        }
        draw(context){
            if(this.game.debug)context.strokeRect(this.x,this.y,this.width,this.height)
            context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,this.x,this.y,this.width,this.height)
            if (this.game.debug){
                context.font='20px Bangers'
                context.fillText(this.lives,this.x,this.y)
            }
            
        }
    }
    class Angler1 extends Enemy{
        constructor(game){
            super(game)
            this.width=228
            this.height=169
            this.y=Math.random()*(this.game.height*0.95-this.height)
            this.image=document.getElementById('angler1')
            this.frameY=Math.floor(Math.random()*3)
            this.lives=2
            this.score=this.lives
        }
    }
    class Angler2 extends Enemy{
        constructor(game){
            super(game)
            this.width=213     
            this.height=165       
            this.y=Math.random()*(this.game.height*0.9-this.height)
            this.image=document.getElementById('angler2')
            this.frameY=Math.floor(Math.random()*2)
            this.lives=3
            this.score=this.lives
        }
    }
    class LuckyFish extends Enemy{
        constructor(game){
            super(game)
            this.width=99     
            this.height=95
            this.y=Math.random()*(this.game.height*0.95-this.height)
            this.image=document.getElementById('lucky')
            this.frameY=Math.floor(Math.random()*2)
            this.lives=3
            this.score=15
            this.type='lucky'
        }
    }
    class HiveWhale extends Enemy{
        constructor(game){
            super(game)
            this.width=400     
            this.height=227
            this.y=Math.random()*(this.game.height*0.95-this.height)
            this.image=document.getElementById('hivewhale')
            this.frameY=0
            this.lives=15
            this.score=this.lives
            this.type='hive'
            this.speedX=Math.random()*-1.2-0.2
        }
    }
    class Drone extends Enemy{
        constructor(game,x,y){
            super(game)
            this.width=115  
            this.height=99
            this.x=x
            this.y=y
            this.image=document.getElementById('drone')
            this.frameY=Math.floor(Math.random()*2)
            this.lives=4
            this.score=this.lives
            this.type='drone'
            this.speedX=Math.random()*-4.2-0.5
        }
    }
    class Layer{
        constructor(game,image,speedModifier){
            this.game=game
            this.image=image
            this.speedModifier=speedModifier
            this.width=1768
            this.height=500
            this.x=0
            this.y=0
        }
        update(){
            if(this.x<=-this.width) this.x=0
            else this.x-=this.game.speed*this.speedModifier
        }
        draw(context){
            context.drawImage(this.image,this.x,this.y)
            context.drawImage(this.image,this.x +this.width,this.y)
        }
    }
    class Explosion{
        constructor(game,x,y){
            this.game=game
            this.frameX=0
            this.spriteHeight=200
            this.timer=0
            this.fbs=15
            this.interval=1000/this.fbs
            this.markedForDeletion=false
            this.maxFrame=8
        }
        update(deltaTime){
            if(this.timer>this.interval){
                this.frameX++
                this.timer=0
            }else{
                this.timer+=deltaTime
            }
            
            if(this.frameX>this.maxFrame){
                this.markedForDeletion=true
            }
        }
        draw(context){
            context.drawImage(this.image,this.frameX*this.spriteWidth
                ,0,this.spriteWidth,this.spriteHeight,this.x,this.y,this.width,this.height)
        }
    }
    class SmokeExplosion extends Explosion{
        constructor(game,x,y){
            super(game,x,y)
            this.image=document.getElementById('smoke')
            this.spriteWidth=200
            this.width=this.spriteWidth
            this.height=this.spriteHeight
            this.x=x-this.width*0.5
            this.y=y-this.height*0.5
        }
    }
    class FireExplosion extends Explosion{
        constructor(game,x,y){
            super(game,x,y)
            this.image=document.getElementById('fire')
            this.spriteWidth=200
            this.width=this.spriteWidth
            this.height=this.spriteHeight
            this.x=x-this.width*0.5
            this.y=y-this.height*0.5
        }
    }
    class Background{
        constructor(game){
            this.game=game
            this.image1=document.getElementById('layer_1')
            this.image2=document.getElementById('layer_2')
            this.image3=document.getElementById('layer_3')
            this.image4=document.getElementById('layer_4')

            this.layer1=new Layer(this.game,this.image1,0.2)
            this.layer2=new Layer(this.game,this.image2,0.4)
            this.layer3=new Layer(this.game,this.image3,1)
            this.layer4=new Layer(this.game,this.image4,1.5)
            this.layers=[this.layer1,this.layer2,this.layer3]
            
        }
        update(){
            this.layers.forEach(layer=>{
                layer.update()
            })
        }
        draw(context){
            this.layers.forEach(layer=>{
                layer.draw(context)
            })
        }
    }
    class UI{
        constructor(game){
            this.game=game
            this.fillStyle='white'
            this.image=document.getElementById('projectile')
        }
        draw(context){
            context.save()
            context.shadowOffsetX=1
            context.shadowOffsetY=1
            context.shadowColor='black'
            context.font='25px Bangers'
            //score
            context.font=this.fontSize+'px'+this.fontFamily
            context.fillText('Score : '+this.game.score,20,40)
            //Timer
            let formatedTime = (this.game.gameTime * 0.001).toFixed(1)
            context.fillText('Timer: ' + formatedTime,20,95)
            //game over massage
            if(this.game.gameOver===true){
                context.textAlign='center'
                let massage1,massage2
                if(this.game.score >=this.game.winningScore){
                    massage1='Most Wondrous :)'
                    massage2='Good Job'
                }else{
                    massage1='Blazes'
                    massage2='You Better Than That'
                }
                context.font='50px Bangers'
                context.fillText(massage1,this.game.width*0.5,this.game.height*0.5-20)
                context.font='25px  Bangers'
                context.fillText(massage2,this.game.width*0.5,this.game.height*0.5+20)
            }
            //ammo
            if(this.game.player.powerUp) context.fillStyle='#ffffbd'
            for(let i=0; i<this.game.ammo ;i++){
                context.drawImage(this.image ,20 + 5*i,50,3,20)
            }
            context.restore()
        }
    }
    class Game {
        constructor(width,height){
            this.width=width
            this.height=height
            this.background=new Background(this)
            this.player=new Player(this)
            this.input =new InputHandler(this)
            this.ui =new UI(this)
            this.keys =[]
            this.enemies=[]
            this.particles=[]
            this.explosions=[]
            this.ammo=20
            this.ammoMax =50
            this.ammoTimer=0
            this.ammInterval=500
            this.enemyTimer=0
            this.enemyInterval=1000
            this.gameOver=false
            this.debug=false
            this.score=0
            this.winningScore=200
            this.gameTime=0
            this.timeLimit=50000
            this.speed=0.5


        }
        update(deltaTime){
            if(!this.gameOver)this.gameTime+=deltaTime
            if(this.gameTime>this.timeLimit) this.gameOver=true
            this.background.update()
            this.background.layer4.update()
            this.player.update(deltaTime)
            if(this.ammoTimer>this.ammInterval){
                if (this.ammo<this.ammoMax) {
                    this.ammo++
                    this.ammoTimer=0
                }
            }else {
                this.ammoTimer+=deltaTime
            }
            this.particles.forEach(particle=>{
                particle.update()
            })
            this.explosions.forEach(explosion=>{
                explosion.update(deltaTime)
            })
            this.particles=this.particles.filter(particle=>!particle.markedForDeletion)
            this.enemies.forEach(enemy=>{
                enemy.update()
                if(this.checkColision(this.player,enemy)){
                    enemy.markedForDeletion=true
                    this.addExplosion(enemy)
                    for(let i=0; i<enemy.score ;i++){
                        this.particles.push(new Particle(this
                            ,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5))
                    }
                    if(enemy.type==='lucky') {
                        this.player.enterPowerUp()
                    }else if(!this.gameOver){
                        this.score=this.score-10
                    }
                }
                this.player.projectiles.forEach(projectile=>{
                    if(this.checkColision(projectile,enemy)){
                        enemy.lives--
                        projectile.markedForDeletion=true
                        this.particles.push(new Particle(this,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5))
                        if(enemy.lives<=0){
                            for(let i=0; i<enemy.score ;i++){
                                this.particles.push(new Particle(this
                                    ,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5))
                            }
                            enemy.markedForDeletion=true
                            this.addExplosion(enemy)
                            if(enemy.type==='hive'){
                                for(let i=0;i<5;i++){
                                    this.enemies.push(new Drone(this,enemy.x + Math.random()*enemy.width
                                    ,enemy.y + Math.random()*enemy.height*0.5))    
                                }
                                this.enemies.push(new Drone(this,enemy.x,enemy.y))
                            }
                            if(!this.gameOver)this.score+=enemy.score
                            if(this.score===this.winningScore){
                                this.gameOver=true 
                            }
                        }
                    }
                })
            })
            this.enemies=this.enemies.filter(enemy=> !enemy.markedForDeletion)
            if(this.enemyTimer>this.enemyInterval && !this.gameOver){
                this.addEnemy()
                this.enemyTimer=0
            }else{
                this.enemyTimer+=deltaTime
            }
        }
        draw(context){
            this.background.draw(context)
            this.player.draw(context)
            this.ui.draw(context)
            this.enemies.forEach(enemy=>{
                enemy.draw(context)
            })
            this.particles.forEach(particle=>{
                particle.draw(context)
            })
            this.explosions.forEach(explosion=>{
                explosion.draw(context)
            })

            this.background.layer4.draw(context)
            
        }
        addEnemy(){
            const randomize=Math.random()
            if(randomize<0.3) this.enemies.push( new Angler1(this))
            else if(randomize<0.6) this.enemies.push( new Angler2(this))
            else if(randomize<0.8) this.enemies.push( new HiveWhale(this))
            else this.enemies.push( new LuckyFish(this))
        }
        addExplosion(enemy){
            const randomize=Math.random()
            if(randomize<0.5){
                this.explosions.push(new SmokeExplosion(this 
                ,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5))
            }else{
                this.explosions.push(new FireExplosion(this 
                    ,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5))
            }
        }
        checkColision(rect1,rect2){
            return(
                rect1.x<rect2.x+rect2.width
                &&
                rect1.x+rect1.width>rect2.x
                &&
                rect1.y<rect2.y+rect2.height
                &&
                rect1.y+rect1.height>rect2.y
                
            )
        }
    }
    const game =new Game(canvas.width,canvas.height)
    let lastTime=0
    // animation loop
    function animate(timeStamp){
        const deltaTime =timeStamp-lastTime
        lastTime =timeStamp
        ctx.clearRect(0 , 0 , canvas.width , canvas.height)
        game.draw(ctx)
        game.update(deltaTime)
        requestAnimationFrame(animate)
    }
    animate(0)
})