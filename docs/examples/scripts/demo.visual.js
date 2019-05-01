window.onload = function() {
   function poblarSelectores() {
      const selectEstilo = document.querySelector("select[name='estilo']");
      const selectEsp = document.querySelector("select[name='especialidad']");

      selectEstilo.addEventListener("change", e => g.cambiarIcono(e.target.value));

      selectEsp.addEventListener("change", function(e) {
         g.cluster.clearLayers();
         g.Centro.reset();
         L.utils.load({
            url: this.value,
            callback: function(xhr) {
               const centros = JSON.parse(xhr.responseText);
               g.agregarCentros(selectEstilo.value, centros);
            }
         });
      });
   }

   const g = new MapaAdjOfer("map", {
      path: "../../dist",
      light: true,
      // TODO: Crear mi propia clave.
      ors: "5b3ce3597851110001cf6248941d2588ac8848c79f7128dd6b3c267a"
   });
   // Los filtros se conservan al cargar nuevos datos
   // así que podemos fijarlos de inicio.
   g.Centro.filter("adj", {min: 1});
   g.Centro.filter("oferta", {min: 1});

   // Acciones que se desencadenan al seleccionar/deseleccionar un centro
   g.cluster.on("markerselect", function(e) {
      if(e.newval) console.log("Se ha seleccionado el centro " + e.newval.getData().id.nom);
      else console.log("Se ha deseleccionado el centro " + e.oldval.getData().id.nom);
   });

   console.log("DEBUG", `Centro añadidos por ahora: ${g.Centro.store.length}`);

   g.lanzarTrasDatos(function() {
      console.log("Se han acabado de cargar los centros");
      g.Centro.correct("bilingue", {bil: ["Inglés"]});
      g.Centro.correct("adjpue", {puesto: ["00590059"]});
      g.Centro.correct("vt+", {});
      g.Centro.invoke("refresh");
      /* No se hace en la interfaz, porque MapAdjOfer se creó con light=true.
      // Al pulsar click sobre una marca, se selecciona el centro.	
      g.Centro.invoke("on", "click", function(e) {
         g.cluster.seleccionado = g.cluster.seleccionado === this?null:this;
      });
      */
   });

   // A efectos de depuración
   g.cluster.on("layeradd", function(e) {
      const marca = e.layer;
      marca.on("click", function(e) {
         const icon = e.target.options.icon;
         console.log("DEBUG - ident", e.target.getData().id.nom);
         console.log("DEBUG - marca", e.target);
         console.log("DEBUG - datos", e.target.getData());
         console.log("DEBUG - filtrado", e.target.filtered);
         console.log("DEBUG - oferta", Array.from(e.target.getData().oferta));
         console.log("DEBUG - adj", Array.from(e.target.getData().adj));
      });
   });

   poblarSelectores();
   document.querySelector("select[name='especialidad']").dispatchEvent(new Event("change"));

   x = g;
}
