function getId(id) {return document.getElementById(id)}

function loading(){
    let load = document.querySelector(".loading-screen")
    load.style.display="flex"
    let img = load.querySelector("img").src=`https://img.pikbest.com/png-images/20190918/cartoon-snail-loading-loading-gif-animation_2734139.png!bw700`
}

function hload(status){
    const res = {
        yes:`https://media0.giphy.com/media/v1.Y2lkPTZjMDliOTUyMnluMXRsMGlrbThnbGI5YzczbmNnN3Rwcno1ODF0bWlsYWR4bWpkYyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/S00sIdupYky9PDbkaJ/source.gif`,
        no:`https://cdn.dribbble.com/userupload/42295887/file/original-2e27796737e975dc1e453c3b72df2a3d.gif`
    }
    let load = document.querySelector(".loading-screen")
    let img = load.querySelector("img")
    img.src=(status == "accept") ? res.yes:res.no
    setTimeout(()=>{
        load.style.display = "none"
    },2000)


}


async function some(url, dat=null){
    loading()
    console.log(dat)
    let res =(dat) ? await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dat)
    }):await fetch(url)
    
    let data = await res.json()
    hload(data.status)
    return data;

}


function randomHex() {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
}

