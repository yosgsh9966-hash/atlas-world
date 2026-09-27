/* =========================================================
   ATLAS WORLD - FINAL VERSION
   ========================================================= */

const map = L.map("map", {
    zoomControl: true,
    minZoom: 2,
    maxZoom: 12
}).setView([20,0],2);

/* =======================
   طبقة الخريطة
======================= */

L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    { attribution:"© Esri" }
).addTo(map);

/* =======================
   الوضع الليلي
======================= */

const themeBtn=document.getElementById("themeBtn");
const STORAGE_KEY="atlas-theme";

if(localStorage.getItem(STORAGE_KEY)==="light"){
    document.body.classList.add("light");
}

themeBtn?.addEventListener("click",()=>{

    document.body.classList.toggle("light");

    localStorage.setItem(
        STORAGE_KEY,
        document.body.classList.contains("light")?"light":"dark"
    );

});

/* =======================
   لوحة المعلومات
======================= */

const panel=document.getElementById("infoPanel");
const title=document.getElementById("countryName");
const capital=document.getElementById("capital");
const continent=document.getElementById("continent");
const flag=document.getElementById("flag");

document.getElementById("closePanel")?.addEventListener("click",()=>{

    panel.classList.remove("show");

});

function openInfo(name,cap,cont,flagUrl){

    title.textContent=name;
    capital.textContent="العاصمة: "+cap;
    continent.textContent="القارة: "+cont;

    if(flagUrl){

        flag.src=flagUrl;
        flag.style.display="block";

    }else{

        flag.style.display="none";

    }

    panel.classList.add("show");

}

/* =======================
   الدول
======================= */

let countriesLayer;

fetch("maps/world.geojson")

.then(r=>r.json())

.then(data=>{

    countriesLayer=L.geoJSON(data,{

        style:()=>({

            fillColor:"#3b82f6",
            weight:1,
            color:"#ffffff",
            fillOpacity:.35

        }),

        onEachFeature:(feature,layer)=>{

            layer.on({

                mouseover(){

                    layer.setStyle({

                        fillColor:"#22d3ee",
                        fillOpacity:.65,
                        weight:2

                    });

                },

                mouseout(){

                    countriesLayer.resetStyle(layer);

                },

                click(){

                    const p=feature.properties;

                    const name=p.NAME||p.name||"دولة";

                    let cap="غير متوفر";
                    let cont=p.CONTINENT||p.continent||"";

                    if(name==="Egypt") cap="Cairo";
                    if(name==="France") cap="Paris";
                    if(name==="Japan") cap="Tokyo";
                    if(name==="Brazil") cap="Brasilia";

                    openInfo(name,cap,cont);

                    map.fitBounds(layer.getBounds());

                    if(name==="Egypt"){

                        setTimeout(()=>{
                            map.setView([26.5,30.5],6);
                        },500);

                    }

                }

            });

        }

    }).addTo(map);

});

/* =======================
   المحافظات
======================= */

fetch("maps/admin1.geojson")

.then(r=>r.json())

.then(data=>{

    L.geoJSON(data,{

        style:{

            color:"#FFD700",
            weight:2,
            fillOpacity:.05

        },

        onEachFeature:(feature,layer)=>{

            layer.bindTooltip(feature.properties.name);

        }

    }).addTo(map);

});

/* =======================
   المدن
======================= */

fetch("maps/cities.geojson")

.then(r=>r.json())

.then(data=>{

    L.geoJSON(data,{

        pointToLayer:(feature,latlng)=>{

            return L.circleMarker(latlng,{

                radius:6,
                fillColor:"#ff4d4d",
                color:"#fff",
                weight:1,
                fillOpacity:1

            });

        },

        onEachFeature:(feature,layer)=>{

            const p=feature.properties;

            layer.bindPopup(`
                <h3>${p.name}</h3>
                <b>الدولة:</b> ${p.country}<br>
                <b>النوع:</b> ${p.type}
            `);

            if(p.name==="Cairo"){

                layer.on("click",()=>{

                    map.setView([30.0444,31.2357],11);

                    setTimeout(addCairoLandmarks,300);

                });

            }

        }

    }).addTo(map);

});

/* =======================
   معالم القاهرة
======================= */

let cairoAdded=false;

function addCairoLandmarks(){

    if(cairoAdded) return;

    cairoAdded=true;

    const landmarks=[

        ["الأهرامات",29.9792,31.1342],
        ["برج القاهرة",30.0459,31.2243],
        ["المتحف المصري",30.0478,31.2336],
        ["نهر النيل",30.0500,31.2330],
        ["مدينة نصر",30.0610,31.3300],
        ["المعادي",29.9600,31.2569]

    ];

    landmarks.forEach(place=>{

        L.marker([place[1],place[2]])
        .addTo(map)
        .bindPopup(`<b>${place[0]}</b><br>القاهرة - مصر`);

    });

}

/* =======================
   البحث
======================= */

const search=document.getElementById("searchInput");

search?.addEventListener("keydown",e=>{

    if(e.key!=="Enter") return;

    const value=search.value.toLowerCase();

    const places={

        egypt:[26.5,30.5,6],
        cairo:[30.0444,31.2357,11],
        alexandria:[31.2001,29.9187,10],
        luxor:[25.6872,32.6396,10],
        aswan:[24.0889,32.8998,10],
        france:[46.2276,2.2137,6],
        paris:[48.8566,2.3522,11],
        japan:[36.2048,138.2529,5],
        tokyo:[35.6895,139.6917,11],
        brazil:[-14.235,-51.9253,4],
        "new york":[40.7128,-74.0060,10]

    };

    if(places[value]){

        const p=places[value];
        map.setView([p[0],p[1]],p[2]);

    }

});

/* =======================
   زر العودة للعالم
======================= */

document.getElementById("homeMap")?.addEventListener("click",()=>{

    map.setView([20,0],2);

});

/* =======================
   خطوط الطول ودوائر العرض
======================= */

for(let lat=-60;lat<=60;lat+=30){

    L.polyline([[lat,-180],[lat,180]],{
        color:"#888",
        weight:1,
        opacity:.3
    }).addTo(map);

}

for(let lng=-180;lng<=180;lng+=30){

    L.polyline([[-85,lng],[85,lng]],{
        color:"#888",
        weight:1,
        opacity:.3
    }).addTo(map);

}

/* =======================
   خط الاستواء
======================= */

L.polyline([[0,-180],[0,180]],{
    color:"#ff5555",
    weight:3
}).addTo(map)
.bindTooltip("خط الاستواء");