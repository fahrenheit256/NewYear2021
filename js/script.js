const elCanvas = document.getElementById("canvas")
const paintCanvas = elCanvas.getContext("2d")

/* paintCanvas.beginPath()
paintCanvas.fillStyle = "hsl(400, 100%, 50%)"
paintCanvas.arc(100, 100, 20, 0, Math.PI, false)
paintCanvas.fill() */

function Random(min, max){
    return Math.random() * (max - min - 1) + min | 0
}

function Firework(startPoint, endPoint, color, context, explotionLevel){
    //Private
    const data = {
        startPoint,
        endPoint,
        color,
        context,
        points : [startPoint],
        explotionLevel,
    }

    const _DrawIOnePoint = function(x, y){
        paintCanvas.beginPath()
        paintCanvas.fillStyle = `hsl(${data.color}, 100%, 50%)`
        paintCanvas.arc(x, y, 2, 0, Math.PI, false)
        paintCanvas.fill()
    }

    const _DrawMultiPoint = function(){

        
        for(point of data.points){
            _DrawIOnePoint(point.x, point.y)
        }
    }

    const _GetLastPoint = function(){
        const lastPointPosition = data.points.length - 1
        const lastPoint = data.points[lastPointPosition]
        return lastPoint
    }

    const _CreateNextPoint = function(){
        const lastPoint = _GetLastPoint()

        const xDiff = data.endPoint.x - lastPoint.x
        const yDiff = data.endPoint.y - lastPoint.y

        const nextPoint = {
            x : lastPoint.x + (xDiff / 20),
            y : lastPoint.y + (yDiff / 20)
        }

        data.points.push(nextPoint)
    }

    const _DeleteOldPoint = function(){
        if(data.points.length > 5) data.points.shift()
    }

    //Public
    return{
        Shooting : function(){
            _DrawMultiPoint()
            _CreateNextPoint()
            _DeleteOldPoint()
        },
        HitTheTarget : function(){
            const lastPoint = _GetLastPoint()

            const xDiff = data.endPoint.x - lastPoint.x
            const yDiff = data.endPoint.y - lastPoint.y
            return Math.abs( xDiff ) > 3 || Math.abs( yDiff ) > 3
        },
        ExploteOrNoExplote : function(){
            return ! this.HitTheTarget() && data.explotionLevel !== 0
        }
        ,
        GetNextLevelExplotion : () => { return data.explotionLevel - 1},
        ...data
    }
}

function Caynon(el, context){
    //Private
    const data = {
        el,
        context,
        fireworks : [],
        size : {width : 0, height : 0},
        shootingAreaLimit : {down : 0, up : 0},
        explotionAreaLimit : {down : 0, up : 0}
    }

    

    const _DeleteOldFireworks = function(){
        data.fireworks = data.fireworks.filter((f) => {
            return f.HitTheTarget()
        })
    }


    const _CreateExplotion = function(x, y, color, nextLevelExplotion){
        const PI = Math.PI * 2
        const radioOfTheExplotion = Random(30, 100)
        const start = radioOfTheExplotion / 8

        for(let i = 0 ; i < start; i++){
            let targetX = x + radioOfTheExplotion * Math.cos(PI * i / start) | 0
            let targetY = y + radioOfTheExplotion * Math.sin(PI * i / start) | 0

            const newFirework = new Firework(
                {x, y},
                {x : targetX, y : targetY},
                color,
                data.context,
                nextLevelExplotion
            )
            data.fireworks.push(newFirework)
        }
        
    }

    //Public
    return{
        resize: function(){
            data.size.width = window.innerWidth
            data.size.height = window.innerHeight
            
            data.el.width = data.size.width 
            data.el.height = data.size.height 

            data.shootingAreaLimit.down = data.size.width * .2
            data.shootingAreaLimit.up = data.size.width * .8

            data.explotionAreaLimit.down = data.size.height * .5
            data.explotionAreaLimit.up = data.size.height * .1
        },
        StartShooting : function(){
            data.context.globalCompositeOperation = "hard-light"
            data.context.fillStyle = 'rgba(20,20,20,0.15)'
            data.context.fillRect(0,0, data.size.width,  data.size.height)
            data.context.globalCompositeOperation = "lighter"
            
            for(firework of data.fireworks){
                firework.Shooting()
                if(firework.ExploteOrNoExplote()){
                   
                    _CreateExplotion(
                        firework.endPoint.x, 
                        firework.endPoint.y, 
                        firework.color,
                        firework.GetNextLevelExplotion())
                } 
            }
            _DeleteOldFireworks()
        },
        CreateFirework : function(){
            const startPoint = {
                x : Random(data.shootingAreaLimit.down, data.shootingAreaLimit.up), 
                y : data.size.height
            }
            const endPoint = {
                x :  Random(data.shootingAreaLimit.down, data.shootingAreaLimit.up), 
                y : Random(data.explotionAreaLimit.down, data.explotionAreaLimit.up)
            }
            
            const color = Random(300, 500)
    
            const newFirework = new Firework(
                startPoint,
                endPoint,
                color,
                data.context,
                2
            )
            data.fireworks.push(newFirework)
        }
    }
}



const cyn = new Caynon(elCanvas, paintCanvas)

cyn.resize()

window.onresize = () => cyn.resize()

let count = 0
function Update(){
    
    if(count === 15){
        count = 0
        cyn.CreateFirework()
    }else{
        count++
    }
    cyn.StartShooting()
    requestAnimationFrame(Update)
}

Update()