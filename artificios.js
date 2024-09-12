var gravedad = .7;
var numFuegos = 30;
var numCohetes = 0;
var maxCohetes = 25;

window.onload = function () {
    start();
    update();
}

function update()
{
    var cohetes = document.getElementsByClassName('cohete');
    for (var c=0; c < cohetes.length; c++)
    {
        let cohete = cohetes[c];
        let velocidadY = parseFloat(cohete.getAttribute('data-velocidad-y'));
        let y = cohete.getBoundingClientRect().top;
        let altoVentana = window.innerHeight;
        velocidadY += gravedad;
        cohete.setAttribute('data-velocidad-y', velocidadY);
        y += velocidadY;
        cohete.style.top = y + "px";

        let velocidadX = parseFloat(cohete.getAttribute('data-velocidad-x'));
        let x = cohete.getBoundingClientRect().left;
        x += velocidadX;
        cohete.style.left = x + "px";

        let padre = cohete.getAttribute("data-padre");

        if (velocidadY >= 0 && padre === "true") {
            //cohete.remove();
            explotar(cohete);
        }

        if (y >= altoVentana)
        {
            cohete.remove();
        }

    }

    setTimeout(() => {
        update();
    }, 20);
}


function explotar(cohete) {

    for (var c=0; c < numFuegos; c++)
    {
        var fuego = document.createElement("div");
        fuego.className = "cohete";
        
        fuego.style.left = cohete.style.left;
        fuego.style.top = cohete.style.top;

        let velocidadY = (Math.random() * 18)  - 16;
        fuego.setAttribute("data-velocidad-y", velocidadY);
        
        let velocidadX = (Math.random() * 14) - 5;
        fuego.setAttribute("data-velocidad-x", velocidadX);

        fuego.setAttribute("data-padre", false);

        fuego.style.background = getRandomColor();

        document.body.appendChild(fuego);

    }
    
    cohete.remove();


}

function crearCohete()
{
    let cohete = document.createElement("div");
    cohete.className = "cohete";
    
    cohete.style.left = Math.random() * window.innerWidth + "px";
    cohete.style.top = window.innerHeight + "px"; 
    cohete.setAttribute("data-velocidad-x", 0);
    
    velocidadY = -15 - (Math.random() *10);
    
    cohete.setAttribute("data-velocidad-y", velocidadY);
    cohete.setAttribute("data-padre", "true");
    cohete.style.background = getRandomColor();
    
    document.body.appendChild(cohete);

    numCohetes++;

    if( numCohetes < maxCohetes){
        setTimeout(() => {
            crearCohete();
        }, 50 + Math.random() * 450);
    }

}

function start() {
    //var cohetes = document.getElementsByClassName('cohete');
    crearCohete();
    
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
